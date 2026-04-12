'use client';

import { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useLoadScript, MarkerF } from '@react-google-maps/api';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import { Loader2, MapPin, Navigation, Search } from 'lucide-react';

const libraries = ['places'];

export default function LocationPicker({ onLocationSelect, initialLocation = null }) {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
        libraries,
    });

    const [selected, setSelected] = useState(initialLocation);
    const [address, setAddress] = useState(initialLocation?.address || '');
    const [mapCenter, setMapCenter] = useState(initialLocation || { lat: 36.8065, lng: 10.1815 }); // Tunis
    const [isLocating, setIsLocating] = useState(false);

    const updateParent = useCallback((pos, addr) => {
        if (onLocationSelect) onLocationSelect({ ...pos, address: addr });
    }, [onLocationSelect]);

    // 1. Auto-location on mount (GPS then IP fallback)
    useEffect(() => {
        if (!isLoaded || selected || initialLocation) return;

        const attemptAutoLocation = () => {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    async (pos) => {
                        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                        setMapCenter(p);
                        setSelected(p);
                        try {
                            const res = await getGeocode({ location: p });
                            const addr = res[0]?.formatted_address || "Ma position actuelle";
                            setAddress(addr);
                            updateParent(p, addr);
                        } catch (e) {
                            updateParent(p, "Ma position actuelle");
                        }
                    },
                    () => {
                        detectLocationByIp();
                    },
                    { enableHighAccuracy: true, timeout: 5000 }
                );
            } else {
                detectLocationByIp();
            }
        };

        const detectLocationByIp = async () => {
            try {
                const res = await fetch('https://ipapi.co/json/');
                const data = await res.json();
                if (data.latitude && data.longitude) {
                    const pos = { lat: data.latitude, lng: data.longitude };
                    const cityAddr = `${data.city}, ${data.region}`;
                    setMapCenter(pos);
                    setSelected(pos);
                    setAddress(cityAddr);
                    updateParent(pos, cityAddr);
                }
            } catch (err) {
                console.error("IP fallback failed", err);
            }
        };

        attemptAutoLocation();
    }, [isLoaded, initialLocation, selected, updateParent]);

    // 2. Search Component (Nested for convenience)
    const PlacesAutocomplete = () => {
        const {
            ready,
            value,
            setValue,
            suggestions: { status, data },
            clearSuggestions,
        } = usePlacesAutocomplete({ debounce: 300 });

        const handleSelect = async (desc) => {
            setValue(desc, false);
            clearSuggestions();
            setAddress(desc);

            try {
                const results = await getGeocode({ address: desc });
                const { lat, lng } = await getLatLng(results[0]);
                const pos = { lat, lng };
                setSelected(pos);
                setMapCenter(pos);
                updateParent(pos, desc);
            } catch (error) {
                console.error("Geocode Error: ", error);
            }
        };

        return (
            <div className="relative mb-3">
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Search size={16} />
                    </div>
                    <input
                        value={value || address}
                        onChange={(e) => {
                            setValue(e.target.value);
                            setAddress(e.target.value);
                        }}
                        disabled={!ready}
                        className="w-full pl-9 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary shadow-sm text-sm"
                        placeholder="Rechercher une ville ou un quartier..."
                    />
                </div>
                {status === "OK" && (
                    <ul className="absolute z-[110] bg-white border border-slate-200 w-full top-full mt-1 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                        {data.map(({ place_id, description }) => (
                            <li
                                key={place_id}
                                onClick={() => handleSelect(description)}
                                className="px-4 py-3 hover:bg-slate-50 cursor-pointer text-sm text-slate-700 border-b border-slate-50 last:border-0"
                            >
                                {description}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    };

    const handleGpsLocation = () => {
        if (!navigator.geolocation) return;
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setSelected(p);
                setMapCenter(p);
                try {
                    const res = await getGeocode({ location: p });
                    const addr = res[0]?.formatted_address || "Position GPS";
                    setAddress(addr);
                    updateParent(p, addr);
                } catch (e) {
                    setAddress("Position GPS");
                    updateParent(p, "Position GPS");
                }
                setIsLocating(false);
            },
            () => setIsLocating(false),
            { enableHighAccuracy: true, timeout: 8000 }
        );
    };

    const handleMarkerDragEnd = async (e) => {
        const p = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        setSelected(p);
        try {
            const res = await getGeocode({ location: p });
            const addr = res[0]?.formatted_address || "Position sélectionnée";
            setAddress(addr);
            updateParent(p, addr);
        } catch (error) {
            updateParent(p, "Position sur la carte");
        }
    };

    const handleMapClick = async (e) => {
        const p = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        setSelected(p);
        try {
            const res = await getGeocode({ location: p });
            const addr = res[0]?.formatted_address || "Position sélectionnée";
            setAddress(addr);
            updateParent(p, addr);
        } catch (error) {
            updateParent(p, "Position sur la carte");
        }
    };

    if (loadError) return (
        <div className="p-8 flex flex-col items-center gap-3 bg-red-50 rounded-2xl border border-red-100 text-center">
            <p className="text-sm text-red-600 font-bold">عذراً، الخريطة لم تفتح!</p>
            <p className="text-[10px] text-red-400 bg-white p-2 rounded border border-red-50 font-mono">
                Error Trace: {loadError.message || "Unknown API Error"}
            </p>
            <p className="text-[10px] text-slate-500 mt-2">
                يرجى التأكد من تفعيل (Maps JavaScript API) و (Places API) في لوحة تحكم جوجل.
            </p>
        </div>
    );

    if (!isLoaded) return <div className="p-12 flex flex-col items-center gap-3 bg-slate-50 rounded-2xl"><Loader2 className="animate-spin text-primary" /><p className="text-xs text-slate-400">Chargement de la carte...</p></div>;

    return (
        <div className="w-full space-y-3">
            <PlacesAutocomplete />
            
            <div className="relative h-64 w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
                <GoogleMap
                    zoom={15}
                    center={mapCenter}
                    mapContainerClassName="w-full h-full"
                    onClick={handleMapClick}
                    options={{
                        disableDefaultUI: true,
                        zoomControl: true,
                        gestureHandling: 'greedy'
                    }}
                >
                    {selected && (
                        <MarkerF 
                            position={selected} 
                            draggable={true} 
                            onDragEnd={handleMarkerDragEnd}
                            animation={window.google?.maps?.Animation?.DROP}
                        />
                    )}
                </GoogleMap>

                <button
                    type="button"
                    onClick={handleGpsLocation}
                    className="absolute bottom-4 right-4 bg-primary text-white px-4 py-2.5 rounded-full shadow-2xl hover:bg-black transition-all active:scale-90 flex items-center gap-2 font-bold text-xs z-10"
                >
                    {isLocating ? <Loader2 className="animate-spin" size={16} /> : <Navigation size={16} />}
                    {isLocating ? 'Détection...' : 'Ma Position'}
                </button>
            </div>

            {address && (
                <div className="flex items-center gap-2 p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-xs text-slate-700 shadow-sm animate-in fade-in slide-in-from-bottom-1 duration-300">
                    <MapPin size={14} className="text-primary shrink-0" />
                    <span className="font-bold truncate">{address}</span>
                </div>
            )}
        </div>
    );
}
