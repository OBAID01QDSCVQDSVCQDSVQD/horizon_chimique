'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, useLoadScript, MarkerF } from '@react-google-maps/api';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import { Loader2, MapPin, Navigation, Search, Check } from 'lucide-react';

const libraries = ['places'];

const QUICK_CITIES = [
    { name: "Tunis", lat: 36.8065, lng: 10.1815 },
    { name: "Sousse", lat: 35.8256, lng: 10.6369 },
    { name: "Sfax", lat: 34.7405, lng: 10.7603 },
    { name: "Nabeul", lat: 36.4561, lng: 10.7376 },
    { name: "Bizerte", lat: 37.2744, lng: 9.8739 }
];

export default function LocationPicker({ onLocationSelect, initialLocation = null }) {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
        libraries,
    });

    const [selected, setSelected] = useState(initialLocation);
    const [address, setAddress] = useState(initialLocation?.address || '');
    const [mapCenter, setMapCenter] = useState(initialLocation || { lat: 36.8065, lng: 10.1815 });
    const [isLocating, setIsLocating] = useState(false);
    const [hasAutoLocated, setHasAutoLocated] = useState(false);
    const mapRef = useRef(null);

    const updateParent = useCallback((pos, addr) => {
        if (onLocationSelect) onLocationSelect({ ...pos, address: addr });
    }, [onLocationSelect]);

    const handleLocationChange = useCallback(async (pos, addr = null) => {
        setSelected(pos);
        setMapCenter(pos);
        if (mapRef.current) {
            mapRef.current.panTo(pos);
        }

        if (addr) {
            setAddress(addr);
            updateParent(pos, addr);
        } else if (window.google) {
            try {
                const res = await getGeocode({ location: pos });
                const newAddr = res[0]?.formatted_address || "Position choisie";
                setAddress(newAddr);
                updateParent(pos, newAddr);
            } catch (e) {
                setAddress("Position sur la carte");
                updateParent(pos, "Position sur la carte");
            }
        }
    }, [updateParent]);

    // AUTO-LOCATION LOGIC (Aggressive)
    useEffect(() => {
        if (hasAutoLocated || initialLocation) return;

        const performAutoLocation = async () => {
            setIsLocating(true);
            
            // Try Browser GPS first
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                        handleLocationChange(p);
                        setHasAutoLocated(true);
                        setIsLocating(false);
                    },
                    (err) => {
                        console.warn("GPS Denied, trying IP...");
                        detectByIp();
                    },
                    { enableHighAccuracy: true, timeout: 6000 }
                );
            } else {
                detectByIp();
            }
        };

        const detectByIp = async () => {
            try {
                const res = await fetch('https://ipapi.co/json/');
                const data = await res.json();
                if (data.latitude && data.longitude) {
                    const p = { lat: data.latitude, lng: data.longitude };
                    handleLocationChange(p, `${data.city}, ${data.region}`);
                }
            } catch (e) {
                console.error("IP backup failed");
            }
            setHasAutoLocated(true);
            setIsLocating(false);
        };

        performAutoLocation();
    }, [hasAutoLocated, initialLocation, handleLocationChange]);

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
            try {
                const results = await getGeocode({ address: desc });
                const { lat, lng } = await getLatLng(results[0]);
                handleLocationChange({ lat, lng }, desc);
            } catch (error) {
                console.error("Search Error");
            }
        };

        return (
            <div className="relative mb-3">
                <input
                    value={value || address}
                    onChange={(e) => {
                        setValue(e.target.value);
                        setAddress(e.target.value);
                    }}
                    disabled={!ready}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary shadow-sm text-sm"
                    placeholder="Chercher une adresse..."
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Search size={16} />
                </div>
                {status === "OK" && (
                    <ul className="absolute z-[110] bg-white border border-slate-200 w-full top-full mt-1 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                        {data.map(({ place_id, description }) => (
                            <li key={place_id} onClick={() => handleSelect(description)} className="px-4 py-3 hover:bg-slate-50 cursor-pointer text-sm text-slate-700 border-b border-slate-50 last:border-0">{description}</li>
                        ))}
                    </ul>
                )}
            </div>
        );
    };

    if (loadError) return <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs">Erreur Google Maps.</div>;
    if (!isLoaded) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div className="w-full space-y-4">
            <PlacesAutocomplete />
            
            <div className="relative h-64 w-full rounded-2xl overflow-hidden border border-slate-200 shadow-lg">
                <GoogleMap
                    zoom={15}
                    center={mapCenter}
                    mapContainerClassName="w-full h-full"
                    onLoad={(map) => { mapRef.current = map; }}
                    onClick={(e) => handleLocationChange({ lat: e.latLng.lat(), lng: e.latLng.lng() })}
                    options={{ disableDefaultUI: true, zoomControl: true, gestureHandling: 'greedy' }}
                >
                    {selected && <MarkerF position={selected} draggable={true} onDragEnd={(e) => handleLocationChange({ lat: e.latLng.lat(), lng: e.latLng.lng() })} />}
                </GoogleMap>

                <button
                    type="button"
                    onClick={() => { setHasAutoLocated(false); }}
                    className="absolute bottom-4 right-4 bg-primary text-white p-3 rounded-full shadow-2xl hover:bg-black transition-all active:scale-95"
                    title="Actualiser ma position"
                >
                    {isLocating ? <Loader2 className="animate-spin" size={20} /> : <Navigation size={20} />}
                </button>
            </div>

            <div className="flex flex-wrap gap-2">
                {QUICK_CITIES.map(city => (
                    <button key={city.name} type="button" onClick={() => handleLocationChange({ lat: city.lat, lng: city.lng }, city.name)} className={`text-[10px] px-3 py-1 rounded-full border transition-all ${address.includes(city.name) ? 'bg-primary text-white' : 'bg-white'}`}>{city.name}</button>
                ))}
            </div>

            {address && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-xl text-xs text-slate-700 shadow-sm">
                    <MapPin size={14} className="text-primary shrink-0" />
                    <span className="font-bold truncate">{address}</span>
                </div>
            )}
        </div>
    );
}
