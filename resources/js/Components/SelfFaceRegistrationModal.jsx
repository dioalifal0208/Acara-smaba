import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { router } from '@inertiajs/react';
import axios from 'axios';
import * as faceapi from 'face-api.js';
import { getRandomChallenge } from '@/Utils/liveness';

export default function SelfFaceRegistrationModal({ participant, onClose }) {
    const videoRef = useRef();
    const canvasRef = useRef();
    
    const [isModelsLoaded, setIsModelsLoaded] = useState(false);
    const [isStreamActive, setIsStreamActive] = useState(false);
    const [status, setStatus] = useState('Meminta akses kamera...');
    const [errorMsg, setErrorMsg] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [detectedFace, setDetectedFace] = useState(null);
    
    // Liveness challenge states
    const [challenge, setChallenge] = useState(null);
    const [challengePassed, setChallengePassed] = useState(false);
    const [timeLeft, setTimeLeft] = useState(15); // 15 seconds

    // Load Models
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

    // Start Video Stream
    useEffect(() => {
        if (!isModelsLoaded || errorMsg) return;

        let stream = null;
        const startVideo = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setIsStreamActive(true);
                    setStatus('Mencari wajah...');
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
    }, [isModelsLoaded, errorMsg]);

    // Generate Random Challenge when stream starts
    useEffect(() => {
        if (isStreamActive && !challenge && !challengePassed) {
            const initialChallenge = getRandomChallenge();
            setChallenge(initialChallenge);
            setTimeLeft(15);
        }
    }, [isStreamActive, challenge, challengePassed]);

    // Timer for challenge
    useEffect(() => {
        if (challenge && !challengePassed && timeLeft > 0 && isStreamActive) {
            const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timerId);
        } else if (timeLeft === 0 && !challengePassed) {
            setErrorMsg("Waktu verifikasi habis! Silakan coba lagi.");
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(t => t.stop());
            }
            setIsStreamActive(false);
        }
    }, [challenge, timeLeft, challengePassed, isStreamActive]);

    // Video Detection Loop
    const handleVideoPlay = () => {
        const interval = setInterval(async () => {
            if (!videoRef.current || !canvasRef.current || !isStreamActive || isProcessing || challengePassed) return;

            const video = videoRef.current;
            const canvas = canvasRef.current;
            
            if (video.paused || video.ended) return;

            const displaySize = { width: video.videoWidth, height: video.videoHeight };
            if (displaySize.width === 0) return;

            faceapi.matchDimensions(canvas, displaySize);

            try {
                const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.5 }))
                    .withFaceLandmarks()
                    .withFaceExpressions()
                    .withFaceDescriptor();

                if (detection) {
                    const resizedDetection = faceapi.resizeResults(detection, displaySize);
                    
                    const ctx = canvas.getContext('2d');
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    
                    faceapi.draw.drawDetections(canvas, resizedDetection);
                    faceapi.draw.drawFaceLandmarks(canvas, resizedDetection);

                    setDetectedFace(detection);

                    if (challenge && !challengePassed) {
                        setStatus(challenge.instruction);

                        // Validate current challenge
                        if (challenge.validate(resizedDetection, displaySize)) {
                            setChallengePassed(true);
                            setStatus("✅ Verifikasi liveness lolos! Menyimpan profil wajah...");
                            
                            // Delay slightly (350ms) to ensure a high quality frontal frame is captured
                            setTimeout(async () => {
                                try {
                                    if (videoRef.current && !videoRef.current.paused) {
                                        const cleanDetection = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.5 }))
                                            .withFaceLandmarks()
                                            .withFaceDescriptor();
                                        processRegistration(cleanDetection || detection);
                                    } else {
                                        processRegistration(detection);
                                    }
                                } catch (err) {
                                    processRegistration(detection);
                                }
                            }, 350);
                        }
                    }
                } else {
                    const ctx = canvas.getContext('2d');
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    setStatus("Posisikan wajah Anda di dalam lingkaran...");
                    setDetectedFace(null);
                }
            } catch (e) {
                // ignore
            }
        }, 200);

        return () => clearInterval(interval);
    };

    const processRegistration = async (passedDetection = null) => {
        const targetDetection = passedDetection || detectedFace;
        if (!targetDetection) return;

        setIsProcessing(true);
        setStatus("Verifikasi berhasil! Mengunggah data wajah...");

        try {
            const video = videoRef.current;
            const captureCanvas = document.createElement('canvas');
            captureCanvas.width = video.videoWidth;
            captureCanvas.height = video.videoHeight;
            const ctx = captureCanvas.getContext('2d');
            
            ctx.translate(captureCanvas.width, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);
            
            const photoDataUrl = captureCanvas.toDataURL('image/jpeg', 0.85);

            const payload = {
                descriptor: Array.from(targetDetection.descriptor),
                photo: photoDataUrl
            };

            // Stop video before sending request
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(t => t.stop());
            }

            const res = await axios.post(`/api/participants/${participant.id}/face/self`, payload);
            
            playAudio('success');
            onClose(true); // Indicate success
            
            // Reload the page data to reflect face_status changes
            router.reload({ only: ['participant'] });

        } catch (error) {
            playAudio('error');
            console.error(error);
            const msg = error.response?.data?.message || error?.message || "Terjadi kesalahan pada sistem.";
            setErrorMsg(msg);
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

    const handleClose = () => {
        // Stop stream before closing
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(t => t.stop());
        }
        onClose(false);
    };

    const modalContent = (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm" onClick={handleClose}>
            <div className="w-full max-w-sm rounded-3xl bg-white overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="bg-white px-5 py-4 border-b border-slate-100 flex items-center justify-between relative z-10">
                    <div>
                        <h2 className="text-sm font-extrabold text-slate-800">Pendaftaran Wajah</h2>
                        <p className="text-[10px] text-slate-500 font-semibold">Self-Registration (Verifikasi Liveness)</p>
                    </div>
                    <button onClick={handleClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
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
                            <button 
                                onClick={() => {
                                    setErrorMsg(null);
                                    setChallenge(getRandomChallenge(challenge?.id));
                                    setChallengePassed(false);
                                    setTimeLeft(15);
                                }} 
                                className="rounded-xl bg-white/20 px-6 py-2.5 text-sm font-bold text-white hover:bg-white/30 backdrop-blur-sm mb-2 w-full"
                            >
                                Coba Lagi
                            </button>
                        </div>
                    ) : (
                        <>
                            {!isModelsLoaded ? (
                                <div className="text-white flex flex-col items-center z-10">
                                    <svg className="animate-spin h-8 w-8 mb-3 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span className="text-xs font-semibold">Memuat Model AI...</span>
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
                                        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-[90%] animate-[fadeIn_0.2s_ease-out]">
                                            <div className="bg-indigo-600/90 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-xl text-center border border-indigo-400/30">
                                                <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mb-0.5">Tantangan Anti-Palsu</p>
                                                <p className="text-base font-extrabold flex items-center justify-center gap-1.5">
                                                    {challenge.badge}
                                                </p>
                                                {challenge.description && (
                                                    <p className="text-[11px] text-indigo-100/80 mt-0.5 font-medium">{challenge.description}</p>
                                                )}
                                            </div>
                                            <div className="mx-auto mt-2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg">
                                                <span className={`text-xs font-black ${timeLeft <= 3 ? 'text-rose-400 animate-pulse' : 'text-white'}`}>{timeLeft}s</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Processing Overlay */}
                                    {isProcessing && (
                                        <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                                            <div className="h-12 w-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mb-4"></div>
                                            <p className="text-sm font-bold animate-pulse">Mengunggah Wajah...</p>
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
        </div>
    );

    return createPortal(modalContent, document.body);
}

