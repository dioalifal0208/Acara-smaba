import React, { useEffect, useRef, useState } from 'react';

const GOOGLE_MAPS_SCRIPT_ID = 'google-maps-javascript-api';
const LOCATION_TIMEOUT_MS = 20000;

const AUTH_FAILURE_MESSAGE = `Google Maps menolak API key untuk alamat ${typeof window !== 'undefined' ? window.location.origin : 'situs ini'}. `
    + 'Tambahkan alamat ini ke daftar HTTP referrer key di Google Cloud Console (dan pastikan Maps JavaScript API aktif), lalu muat ulang halaman.';

let googleMapsPromise;
let authFailed = false;
const authFailureListeners = new Set();

// Google memanggil gm_authFailure saat key ditolak (referrer tidak diizinkan, API belum aktif, billing).
// Tanpa ini peta hanya menampilkan halaman galat bawaan Google yang tidak menyebut penyebabnya.
const onAuthFailure = (listener) => {
    if (authFailed) listener();
    authFailureListeners.add(listener);
    return () => authFailureListeners.delete(listener);
};

const loadGoogleMaps = () => {
    if (window.google?.maps) {
        return Promise.resolve(window.google.maps);
    }

    if (googleMapsPromise) {
        return googleMapsPromise;
    }

    const apiKey = document.querySelector('meta[name="google-maps-api-key"]')?.content;

    if (!apiKey) {
        return Promise.reject(new Error('GOOGLE_MAPS_API_KEY belum dikonfigurasi.'));
    }

    googleMapsPromise = new Promise((resolve, reject) => {
        const existingScript = document.getElementById(GOOGLE_MAPS_SCRIPT_ID);

        if (existingScript) {
            existingScript.addEventListener('load', () => resolve(window.google.maps), { once: true });
            existingScript.addEventListener('error', () => reject(new Error('Google Maps JavaScript API gagal dimuat.')), { once: true });
            return;
        }

        window.gm_authFailure = () => {
            authFailed = true;
            authFailureListeners.forEach((listener) => listener());
        };

        const script = document.createElement('script');
        script.id = GOOGLE_MAPS_SCRIPT_ID;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly&language=id&region=ID`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve(window.google.maps);
        script.onerror = () => {
            googleMapsPromise = undefined;
            reject(new Error('Google Maps JavaScript API gagal dimuat. Periksa API key dan koneksi internet.'));
        };
        document.head.appendChild(script);
    });

    return googleMapsPromise;
};

const isValidCoordinate = (position) => (
    Number.isFinite(position?.lat)
    && Number.isFinite(position?.lng)
    && position.lat >= -90
    && position.lat <= 90
    && position.lng >= -180
    && position.lng <= 180
);

const getZoomForRadius = (radiusMeters) => {
    const zoom = 19 - Math.log2(Math.max(Number(radiusMeters) || 100, 20) / 50);
    return Math.min(19, Math.max(14, Math.round(zoom)));
};

export default function GoogleMap({
    position,
    radius = 100,
    interactive = false,
    onPositionChange,
    onLocationStatusChange,
    zoom = 17,
    className = '',
}) {
    const containerRef = useRef(null);
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const circleRef = useRef(null);
    const rippleCirclesRef = useRef([]);
    const rippleAnimationRef = useRef(null);
    const radiusRef = useRef(Number(radius) || 100);
    const listenersRef = useRef([]);
    const onPositionChangeRef = useRef(onPositionChange);
    const onLocationStatusChangeRef = useRef(onLocationStatusChange);
    const [loadError, setLoadError] = useState('');
    const [locationState, setLocationState] = useState('idle');
    const [mapReady, setMapReady] = useState(false);

    useEffect(() => onAuthFailure(() => setLoadError(AUTH_FAILURE_MESSAGE)), []);

    onPositionChangeRef.current = onPositionChange;
    onLocationStatusChangeRef.current = onLocationStatusChange;
    radiusRef.current = Number(radius) || 100;

    const stopRadiusAnimation = () => {
        if (rippleAnimationRef.current !== null) {
            cancelAnimationFrame(rippleAnimationRef.current);
            rippleAnimationRef.current = null;
        }

        rippleCirclesRef.current.forEach((ripple) => ripple.setMap(null));
        rippleCirclesRef.current = [];
    };

    const startRadiusAnimation = (maps, map) => {
        stopRadiusAnimation();

        rippleCirclesRef.current = [0, 0.5].map(() => new maps.Circle({
            center: markerRef.current?.getPosition(),
            radius: 1,
            map,
            fillColor: '#4db855',
            fillOpacity: 0,
            strokeColor: '#2f9338',
            strokeOpacity: 0,
            strokeWeight: 2,
            clickable: false,
            zIndex: 1,
        }));

        const startedAt = performance.now();
        const duration = 2400;

        const animate = (timestamp) => {
            const markerPosition = markerRef.current?.getPosition();

            if (!markerPosition || rippleCirclesRef.current.length === 0) return;

            const elapsed = (timestamp - startedAt) / duration;
            const maxRadius = Math.max(radiusRef.current, 10);

            rippleCirclesRef.current.forEach((ripple, index) => {
                const phase = (elapsed + (index * 0.5)) % 1;
                ripple.setCenter(markerPosition);
                ripple.setRadius(maxRadius * (0.12 + (phase * 0.88)));
                ripple.setOptions({
                    strokeOpacity: 0.7 * (1 - phase),
                    fillOpacity: 0.12 * (1 - phase),
                });
            });

            rippleAnimationRef.current = requestAnimationFrame(animate);
        };

        rippleAnimationRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        let cancelled = false;

        loadGoogleMaps()
            .then((maps) => {
                if (cancelled || !containerRef.current || !isValidCoordinate(position)) return;

                const map = new maps.Map(containerRef.current, {
                    center: position,
                    zoom,
                    mapTypeId: maps.MapTypeId.ROADMAP,
                    disableDefaultUI: true,
                    zoomControl: false,
                    keyboardShortcuts: false,
                    clickableIcons: false,
                    gestureHandling: 'greedy',
                });

                const marker = new maps.Marker({
                    position,
                    map,
                    draggable: interactive,
                    title: interactive ? 'Geser untuk memilih titik lokasi' : 'Titik lokasi workcode',
                });

                const circle = new maps.Circle({
                    center: position,
                    radius: Number(radius) || 100,
                    map,
                    fillColor: '#4db855',
                    fillOpacity: 0.25,
                    strokeColor: '#2f9338',
                    strokeOpacity: 0.95,
                    strokeWeight: 2.5,
                    clickable: false,
                    zIndex: 2,
                });

                mapRef.current = map;
                markerRef.current = marker;
                circleRef.current = circle;
                setMapReady(true);
                startRadiusAnimation(maps, map);

                if (interactive) {
                    const applyManualPosition = (latLng, message) => {
                        const nextPosition = { lat: latLng.lat(), lng: latLng.lng() };
                        marker.setPosition(nextPosition);
                        circle.setCenter(nextPosition);
                        onPositionChangeRef.current?.(nextPosition);
                        onLocationStatusChangeRef.current?.({ type: 'manual', message });
                    };

                    listenersRef.current.push(
                        map.addListener('click', (event) => {
                            applyManualPosition(event.latLng, 'Titik lokasi dipilih secara manual pada Google Maps.');
                        }),
                        marker.addListener('dragend', (event) => {
                            applyManualPosition(event.latLng, 'Titik marker digeser ke lokasi baru.');
                        }),
                    );
                }
            })
            .catch((error) => {
                if (!cancelled) setLoadError(error.message);
            });

        return () => {
            cancelled = true;
            listenersRef.current.forEach((listener) => listener.remove());
            listenersRef.current = [];
            stopRadiusAnimation();
            markerRef.current?.setMap(null);
            circleRef.current?.setMap(null);
            markerRef.current = null;
            circleRef.current = null;
            mapRef.current = null;
            setMapReady(false);
        };
    }, [interactive, zoom]);

    useEffect(() => {
        if (!isValidCoordinate(position)) return;

        markerRef.current?.setPosition(position);
        circleRef.current?.setCenter(position);
        rippleCirclesRef.current.forEach((ripple) => ripple.setCenter(position));

        if (mapRef.current) {
            mapRef.current.panTo(position);
        }
    }, [position?.lat, position?.lng]);

    useEffect(() => {
        circleRef.current?.setRadius(Number(radius) || 100);
    }, [radius]);

    const locateUser = () => {
        if (!navigator.geolocation) {
            onLocationStatusChangeRef.current?.({ type: 'error', message: 'Browser ini tidak mendukung deteksi lokasi.' });
            return;
        }

        setLocationState('loading');
        onLocationStatusChangeRef.current?.({ type: 'locating', message: 'Mencari lokasi GPS Anda...' });

        navigator.geolocation.getCurrentPosition(
            (result) => {
                const nextPosition = {
                    lat: Number(result.coords.latitude),
                    lng: Number(result.coords.longitude),
                };

                if (!isValidCoordinate(nextPosition)) {
                    setLocationState('error');
                    onLocationStatusChangeRef.current?.({ type: 'error', message: 'Koordinat GPS yang diterima tidak valid.' });
                    return;
                }

                markerRef.current?.setPosition(nextPosition);
                circleRef.current?.setCenter(nextPosition);
                mapRef.current?.panTo(nextPosition);
                mapRef.current?.setZoom(getZoomForRadius(radius));
                onPositionChangeRef.current?.(nextPosition);
                setLocationState('success');
                onLocationStatusChangeRef.current?.({
                    type: 'success',
                    message: `Lokasi ditemukan (akurasi ${Math.round(result.coords.accuracy)} m).`,
                });
                window.setTimeout(() => setLocationState('idle'), 2500);
            },
            (error) => {
                const messages = {
                    1: 'Akses lokasi ditolak. Izinkan akses lokasi di browser, lalu coba lagi.',
                    2: 'Posisi tidak dapat ditentukan. Pastikan GPS/lokasi perangkat aktif.',
                    3: 'Pencarian lokasi terlalu lama. Silakan coba lagi.',
                };
                setLocationState('error');
                onLocationStatusChangeRef.current?.({
                    type: 'error',
                    message: messages[error.code] || 'Lokasi tidak dapat diperoleh.',
                });
                window.setTimeout(() => setLocationState('idle'), 2500);
            },
            { enableHighAccuracy: true, maximumAge: 0, timeout: LOCATION_TIMEOUT_MS },
        );
    };

    const changeZoom = (amount) => {
        const map = mapRef.current;
        if (!map) return;

        const currentZoom = Number(map.getZoom()) || zoom;
        map.setZoom(Math.min(22, Math.max(3, currentZoom + amount)));
    };

    if (loadError) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-danger-soft p-4 text-center text-sm text-danger">
                {loadError}
            </div>
        );
    }

    return (
        <div className={`relative h-full w-full ${className}`}>
            <div ref={containerRef} className="h-full w-full" aria-label="Google Maps" />
            <div className="absolute right-3 top-3 z-10 flex flex-col items-end gap-2">
                {interactive && (
                    <button
                        type="button"
                        onClick={locateUser}
                        disabled={!mapReady || locationState === 'loading'}
                        title="Gunakan lokasi saya saat ini"
                        aria-label="Gunakan lokasi saya saat ini"
                        aria-busy={locationState === 'loading'}
                        className={`flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface shadow-lg transition hover:bg-surface-2 disabled:cursor-wait disabled:opacity-60 ${
                            locationState === 'success'
                                ? 'text-status-hadir ring-4 ring-status-hadir/25'
                                : locationState === 'error'
                                    ? 'text-danger ring-4 ring-danger/25'
                                    : 'text-accent'
                        }`}
                    >
                        {locationState === 'loading' ? (
                            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" />
                                <path className="opacity-90" fill="currentColor" d="M21 12a9 9 0 00-9-9v3a6 6 0 016 6h3z" />
                            </svg>
                        ) : (
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="3" />
                                <path strokeLinecap="round" d="M12 2v3m0 14v3M2 12h3m14 0h3" />
                                <circle cx="12" cy="12" r="7" />
                            </svg>
                        )}
                    </button>
                )}

                <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-lg">
                    <button
                        type="button"
                        onClick={() => changeZoom(1)}
                        disabled={!mapReady}
                        title="Perbesar peta"
                        aria-label="Perbesar peta"
                        className="flex h-10 w-10 items-center justify-center border-b border-line text-xl font-semibold leading-none text-ink transition hover:bg-surface-2 disabled:opacity-60"
                    >
                        +
                    </button>
                    <button
                        type="button"
                        onClick={() => changeZoom(-1)}
                        disabled={!mapReady}
                        title="Perkecil peta"
                        aria-label="Perkecil peta"
                        className="flex h-10 w-10 items-center justify-center text-2xl font-normal leading-none text-ink transition hover:bg-surface-2 disabled:opacity-60"
                    >
                        −
                    </button>
                </div>
            </div>
        </div>
    );
}
