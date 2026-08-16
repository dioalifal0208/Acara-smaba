import { Head } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import axios from 'axios';

// Simple Device ID Generator
function getOrCreateDeviceId() {
    const KEY = 'smaba_device_uid';
    let uid = localStorage.getItem(KEY);
    if (!uid) {
        uid = 'dev-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
        localStorage.setItem(KEY, uid);
    }
    return uid;
}

export default function FaceScanner({ activeEvent, participant }) {
    const videoRef = useRef();
    const canvasRef = useRef();
    
    const [isModelsLoaded, setIsModelsLoaded] = useState(false);
    const [isStreamActive, setIsStreamActive] = useState(false);
    const [status, setStatus] = useState('Meminta akses kamera & lokasi...');
    const [errorMsg, setErrorMsg] = useState(null);
    const [gpsData, setGpsData] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Liveness states
    const [challenge, setChallenge] = useState(null); // 'smile' | 'mouth'
    const [challengePassed, setChallengePassed] = useState(false);
    const [timeLeft, setTimeLeft] = useState(10); // 10 seconds for challenge
    
    // Result
    const [result, setResult] = useState(null);

    // 1. Get GPS Location
    useEffect(() => {
        if (!navigator.geolocation) {
            setErrorMsg('Browser Anda tidak mendukung deteksi lokasi.');
            return;
        }

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude, accuracy } = position.coords;
                const deviceTimestamp = position.timestamp || Date.now();
                setGpsData({ latitude, longitude, accuracy, device_timestamp: deviceTimestamp });
            },
            (err) => {
                console.error(err);
                if (!gpsData) {
                    setErrorMsg('Akses lokasi diperlukan untuk presensi.');
                }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    // 2. Load Models
    useEffect(() => {
        const loadModels = async () => {
            try {
                const MODEL_URL = '/models';
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
                    faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
                ]);
                setIsModelsLoaded(true);
            } catch (err) {
                console.error(err);
                setErrorMsg("Gagal memuat model AI Wajah. Pastikan koneksi internet stabil.");
            }
        };
        loadModels();
    }, []);

    // 3. Start Video Stream (only after GPS & Models are ready)
    useEffect(() => {
        if (!isModelsLoaded || !gpsData || errorMsg || result) return;

        let stream = null;
        const startVideo = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setIsStreamActive(true);
                    setStatus('Mendeteksi wajah...');
                }
            } catch (err) {
                console.error(err);
                setErrorMsg("Kamera tidak dapat diakses.");
            }
        };

        startVideo();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [isModelsLoaded, gpsData, errorMsg, result]);

    // 4. Generate Random Challenge
    useEffect(() => {
        if (isStreamActive && !challenge && !result) {
            const challenges = ['smile', 'mouth'];
            setChallenge(challenges[Math.floor(Math.random() * challenges.length)]);
            setTimeLeft(10);
        }
    }, [isStreamActive, result]);

    // Timer for challenge
    useEffect(() => {
        if (challenge && !challengePassed && timeLeft > 0 && !result) {
            const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timerId);
        } else if (timeLeft === 0 && !challengePassed) {
            setErrorMsg("Waktu habis! Segarkan halaman untuk mencoba lagi.");
            setIsStreamActive(false);
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(t => t.stop());
            }
        }
    }, [challenge, timeLeft, challengePassed, result]);

    // 5. Video Detection Loop
    const handleVideoPlay = () => {
        const interval = setInterval(async () => {
            if (!videoRef.current || !canvasRef.current || !isStreamActive || challengePassed || isProcessing || result) return;

            const video = videoRef.current;
            const canvas = canvasRef.current;
            
            if (video.paused || video.ended) return;

            const displaySize = { width: video.videoWidth, height: video.videoHeight };
            if (displaySize.width === 0) return;

            faceapi.matchDimensions(canvas, displaySize);

            try {
                const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
                    .withFaceLandmarks()
                    .withFaceExpressions()
                    .withFaceDescriptor();

                if (detection) {
                    const resizedDetection = faceapi.resizeResults(detection, displaySize);
                    
                    const ctx = canvas.getContext('2d');
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    
                    faceapi.draw.drawDetections(canvas, resizedDetection);
                    faceapi.draw.drawFaceLandmarks(canvas, resizedDetection);

                    // Liveness Validation
                    if (challenge === 'smile') {
                        setStatus("Tantangan Liveness: TERSENYUM LEBAR 😊");
                        if (detection.expressions.happy > 0.8) {
                            setChallengePassed(true);
                            processAttendance(detection.descriptor);
                        }
                    } else if (challenge === 'mouth') {
                        setStatus("Tantangan Liveness: BUKA MULUT LEBAR 😲");
                        const landmarks = detection.landmarks;
                        const topLip = landmarks.positions[62];
                        const bottomLip = landmarks.positions[66];
                        const distance = Math.abs(topLip.y - bottomLip.y);
                        
                        if (distance > 20) { // Threshold for open mouth
                            setChallengePassed(true);
                            processAttendance(detection.descriptor);
                        }
                    }
                } else {
                    const ctx = canvas.getContext('2d');
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    setStatus("Posisikan wajah Anda di depan kamera...");
                }
            } catch (e) {
                // ignore
            }
        }, 200);

        return () => clearInterval(interval);
    };

    const processAttendance = async (descriptor) => {
        setIsProcessing(true);
        setStatus("Liveness lolos. Mencocokkan wajah & lokasi...");

        // Stop video
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(t => t.stop());
        }

        try {
            const payload = {
                descriptor: Array.from(descriptor),
                latitude: gpsData.latitude,
                longitude: gpsData.longitude,
                accuracy: gpsData.accuracy,
                device_timestamp: gpsData.device_timestamp,
                device_id: getOrCreateDeviceId(),
                participant_token: participant?.qr_token, // Pass the participant token if known, or it will just match globally
            };

            const res = await axios.post('/api/face/match', payload);
            setResult(res.data);
            playAudio('success');
        } catch (error) {
            playAudio('error');
            if (error.response?.data?.message) {
                setErrorMsg(error.response.data.message);
            } else {
                setErrorMsg("Gagal menghubungi server.");
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const playAudio = useCallback((type) => {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            gain.gain.setValueAtTime(0.20, ctx.currentTime);
            if (type === 'success') {
                osc.frequency.setValueAtTime(523, ctx.currentTime);
                osc.frequency.setValueAtTime(659, ctx.currentTime + 0.08);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.25);
            } else {
                osc.frequency.setValueAtTime(220, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.3);
            }
        } catch (e) {}
    }, []);

    // ── Render ──

    if (result) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                <Head title="Presensi Wajah Berhasil" />
                <div className="w-full max-w-sm rounded-3xl bg-white border border-emerald-200 shadow-xl p-7">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30">
                        <svg className="h-9 w-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-lg font-extrabold text-emerald-800 mb-1">{result.status === 'already' ? 'Sudah Absen' : 'Presensi Berhasil!'}</h2>
                    <p className="text-xs text-slate-500 font-semibold mb-4">{activeEvent?.nama_event || 'Event Aktif'}</p>
                    
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-4">
                        <p className="text-base font-extrabold text-slate-900 leading-tight">{result.participant?.nama}</p>
                        <p className="text-xs text-emerald-700 font-bold mt-0.5">{result.participant?.nis_nip}</p>
                        {result.timestamp && (
                            <p className="text-xs text-slate-500 mt-2 font-semibold">Tercatat pukul: <span className="font-extrabold text-slate-700">{result.timestamp}</span></p>
                        )}
                        {result.is_late && (
                            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2 py-0.5 border border-amber-200 text-[10px] font-bold text-amber-800 uppercase tracking-wide">
                                ⏱ TELAT: {result.late_formatted}
                            </div>
                        )}
                    </div>
                    <button onClick={() => window.location.href = route('participant.dashboard')} className="w-full rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-600 transition-all hover:bg-slate-200">
                        Kembali ke Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
            <Head title="Presensi Wajah" />
            
            <div className="w-full max-w-sm w-full rounded-3xl bg-white overflow-hidden shadow-2xl relative">
                {/* Header */}
                <div className="bg-white px-5 py-4 border-b border-slate-100 text-center relative z-10">
                    <img src="/images/logo.png" alt="Logo" className="h-10 w-10 mx-auto object-contain mb-2" />
                    <h2 className="text-sm font-extrabold text-slate-800">Presensi Wajah</h2>
                    <p className="text-[10px] text-slate-500 font-semibold">{activeEvent?.nama_event}</p>
                </div>

                {/* Main Camera Area */}
                <div className="relative bg-black w-full aspect-[3/4] flex flex-col items-center justify-center">
                    {errorMsg ? (
                        <div className="px-6 text-center z-10">
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
                                <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <p className="text-sm font-bold text-white mb-4">{errorMsg}</p>
                            <button onClick={() => window.location.reload()} className="rounded-xl bg-white/20 px-6 py-2.5 text-sm font-bold text-white hover:bg-white/30 backdrop-blur-sm mb-2 w-full">
                                Coba Lagi
                            </button>
                            <a href={route('participant.dashboard')} className="block rounded-xl bg-slate-800 px-6 py-2.5 text-sm font-bold text-white hover:bg-slate-700">
                                Kembali ke Dashboard
                            </a>
                        </div>
                    ) : (
                        <>
                            {!isModelsLoaded || !gpsData ? (
                                <div className="text-white flex flex-col items-center z-10">
                                    <svg className="animate-spin h-8 w-8 mb-3 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span className="text-xs font-semibold">{!gpsData ? 'Mencari Lokasi GPS...' : 'Memuat Model AI...'}</span>
                                </div>
                            ) : (
                                <>
                                    <video 
                                        ref={videoRef} 
                                        autoPlay 
                                        muted 
                                        playsInline
                                        onPlay={handleVideoPlay}
                                        className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
                                    />
                                    <canvas 
                                        ref={canvasRef} 
                                        className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
                                    />
                                    
                                    {/* Overlay Frame */}
                                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                                        <div className={`w-full h-72 border-[3px] border-dashed rounded-full transition-colors duration-300 ${challengePassed ? 'border-emerald-400 bg-emerald-400/20' : 'border-white/50'}`}></div>
                                    </div>

                                    {/* Challenge Badge */}
                                    {challenge && !challengePassed && !isProcessing && (
                                        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-[90%]">
                                            <div className="bg-indigo-600/90 backdrop-blur text-white px-4 py-3 rounded-2xl shadow-xl text-center border border-indigo-400/30">
                                                <p className="text-[11px] font-semibold text-indigo-200 uppercase tracking-wider mb-1">Tantangan Anti-Palsu</p>
                                                <p className="text-base font-extrabold">
                                                    {challenge === 'smile' ? '😁 Tersenyum Lebar!' : '😲 Buka Mulut Lebar!'}
                                                </p>
                                            </div>
                                            <div className="mx-auto mt-2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10">
                                                <span className={`text-sm font-extrabold ${timeLeft <= 3 ? 'text-red-400 animate-pulse' : 'text-white'}`}>{timeLeft}s</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Processing Overlay */}
                                    {isProcessing && (
                                        <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                                            <div className="h-12 w-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mb-4"></div>
                                            <p className="text-sm font-bold animate-pulse">Memvalidasi Wajah & Lokasi...</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>

                {/* Footer Status */}
                <div className="bg-slate-900 text-white px-4 py-3 text-center border-t border-slate-800">
                    <p className="text-[11px] font-medium text-slate-400 flex items-center justify-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${isStreamActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></span>
                        {status}
                    </p>
                </div>
            </div>
            
            <a href={route('participant.dashboard')} className="mt-6 text-xs text-white/50 hover:text-white font-semibold transition-colors underline underline-offset-4">
                Kembali ke Dashboard
            </a>
        </div>
    );
}
