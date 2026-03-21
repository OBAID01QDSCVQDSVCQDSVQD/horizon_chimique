'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { GoogleMap, useLoadScript, MarkerF } from '@react-google-maps/api';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import { Loader2, MapPin, Navigation } from 'lucide-react';

const libraries = ['places'];

export default function LocationPicker({ onLocationSelect }) {
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
        libraries,
    });

    const [selected, setSelected] = useState(null); // { lat, lng }
    const [address, setAddress] = useState('');
    const [mapCenter, setMapCenter] = useState({ lat: 36.8065, lng: 10.1815 }); // Default: Tunis
    const [mode, setMode] = useState('map'); // 'map' or 'link'
    const [manualLink, setManualLink] = useState('');

    // Call onLocationSelect to expose selected location to parent
    const updateParent = useCallback((pos, addr) => {
        if (onLocationSelect) onLocationSelect({ ...pos, address: addr });
    }, [onLocationSelect]);

    // Search Component
    const PlacesAutocomplete = () => {
        const {
            ready,
            value,
            setValue,
            suggestions: { status, data },
            clearSuggestions,
        } = usePlacesAutocomplete({
            requestOptions: {
                // No country restriction to allow global search
            },
            debounce: 300,
        });

        const handleSelect = async (address) => {
            setValue(address, false);
            clearSuggestions();
            setAddress(address);

            try {
                const results = await getGeocode({ address });
                const { lat, lng } = await getLatLng(results[0]);
                const pos = { lat, lng };
                setSelected(pos);
                setMapCenter(pos);
                updateParent(pos, address);
            } catch (error) {
                console.error("Error: ", error);
            }
        };

        return (
            <div className="relative mb-2 w-full">
                <input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    disabled={!ready}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
                    placeholder="Rechercher un lieu... (Ex: Tunis, Monastir, Paris)"
                />
                {status === "OK" && (
                    <ul className="absolute z-50 bg-white border border-slate-200 w-full mt-1 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {data.map(({ place_id, description }) => (
                            <li
                                key={place_id}
                                onClick={() => handleSelect(description)}
                                className="px-4 py-2 hover:bg-slate-100 cursor-pointer text-sm text-slate-700"
                            >
                                {description}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    };

    // Current Location Logic with High Accuracy
    const handleCurrentLocation = useCallback(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    setMapCenter(pos);
                    setSelected(pos);

                    try {
                        const results = await getGeocode({ location: pos });
                        const addr = results[0]?.formatted_address || "Position GPS";
                        setAddress(addr);
                        updateParent(pos, addr);
                    } catch (e) {
                        updateParent(pos, "Position GPS");
                    }
                },
                (err) => {
                    console.log("Geolocation error or denied:", err);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        }
    }, [updateParent]);

    // Auto-trigger on load
    useEffect(() => {
        if (isLoaded) {
            handleCurrentLocation();
        }
    }, [isLoaded, handleCurrentLocation]);

    const handleUpdatePosition = async (pos) => {
        setSelected(pos);
        try {
            const results = await getGeocode({ location: pos });
            const addr = results[0]?.formatted_address || "Position sélectionnée";
            setAddress(addr);
            updateParent(pos, addr);
        } catch (error) {
            updateParent(pos, "Position sélectionnée");
        }
    };

    const handleMapClick = (e) => {
        const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        handleUpdatePosition(pos);
    };

    const handleMarkerDragEnd = (e) => {
        const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        handleUpdatePosition(pos);
    };

    if (!isLoaded) return <div className="p-4 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;

    const handleLinkChange = (e) => {
        const link = e.target.value;
        setManualLink(link);
        // Treat the link as the address, lat/lng as 0 or null
        if (link) updateParent({ lat: 0, lng: 0 }, link);
    };

    return (
        <div className="w-full">
            <div className="flex gap-4 mb-3 text-sm">
                <button
                    type="button"
                    onClick={() => setMode('map')}
                    className={`font-bold ${mode === 'map' ? 'text-primary border-b-2 border-primary' : 'text-slate-500'}`}
                >
                    Carte Interactive
                </button>
                <button
                    type="button"
                    onClick={() => setMode('link')}
                    className={`font-bold ${mode === 'link' ? 'text-primary border-b-2 border-primary' : 'text-slate-500'}`}
                >
                    Lien Google Maps
                </button>
            </div>

            {mode === 'map' ? (
                <>
                    <PlacesAutocomplete />

                    <div className="relative h-64 w-full rounded-xl overflow-hidden border border-slate-300">
                        <GoogleMap
                            zoom={15}
                            center={mapCenter}
                            mapContainerClassName="w-full h-full"
                            onClick={handleMapClick}
                            options={{
                                disableDefaultUI: false,
                                zoomControl: true,
                                streetViewControl: false,
                                mapTypeControl: false,
                            }}
                        >
                            {selected && (
                                <MarkerF
                                    position={selected}
                                    draggable={true}
                                    onDragEnd={handleMarkerDragEnd}
                                />
                            )}
                        </GoogleMap>

                        <button
                            type="button"
                            onClick={handleCurrentLocation}
                            className="absolute bottom-4 right-4 bg-white p-2 rounded-full shadow-lg text-slate-700 hover:text-primary transition-colors"
                            title="Actualiser ma position"
                        >
                            <Navigation size={20} />
                        </button>
                    </div>
                    {address && (
                        <div className="mt-2 text-xs text-slate-500 flex items-start gap-1">
                            <MapPin size={14} className="mt-0.5 shrink-0" />
                            {address}
                        </div>
                    )}
                </>
            ) : (
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <p className="text-xs text-slate-600 mb-2">
                        Si la carte ne fonctionne pas, ouvrez Google Maps, copiez le lien de votre position et collez-le ici.
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            window.open('https://www.google.com/maps', 'GoogleMaps', 'width=600,height=800,menubar=no,toolbar=no,location=no,status=no');
                        }}
                        className="inline-flex items-center gap-2 text-blue-600 font-bold text-sm mb-2 hover:underline"
                    >
                        <MapPin size={16} /> Ouvrir Google Maps (Popup)
                    </button>
                    <div className="flex gap-2">
                        <input
                            type="url"
                            value={manualLink}
                            onChange={handleLinkChange}
                            placeholder="Collez le lien ici (ex: https://maps.app.goo.gl/...)"
                            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
                        />
                        <button
                            type="button"
                            onClick={async () => {
                                try {
                                    const text = await navigator.clipboard.readText();
                                    if (text) handleLinkChange({ target: { value: text } });
                                } catch (err) {
                                    alert('Veuillez coller manuellement (la permission a été refusée).');
                                }
                            }}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-3 py-2 rounded-lg text-sm transition-colors"
                        >
                            Coller
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
