import { useState, useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';
import axios from 'axios';

export default function AdminFaceScanner({ activeEvent, gpsData, onScanResult }) {
    const videoRef = useRef();
    const canvasRef = useRef();
    
    const [isModelsLoaded, setIsModelsLoaded] = useState(false);
    const [isStreamActive, setIsStreamActive] = useState(false);
    const [status, setStatus] = useState('Memuat Model AI...');
    const [errorMsg, setErrorMsg] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Load Models
    useEffect(() => {
        const loadModels = async () => {
            try {
                const MODEL_URL = '/models';
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
                ]);
                setIsModelsLoaded(true);
                setStatus('Memulai kamera...');
            } catch (err) {
                console.error(err);
                setErrorMsg("Gagal memuat model AI Wajah.");
            }
        };
        loadModels();
    }, []);

    // Start Video Stream
    useEffect(() => {
        if (!isModelsLoaded) return;

        let stream = null;
        const startVideo = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setIsStreamActive(true);
                    setStatus('Mencari Wajah...');
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
            setIsStreamActive(false);
        };
    }, [isModelsLoaded]);

    // Handle Video Play
    const handleVideoPlay = () => {
        const interval = setInterval(async () => {
            if (!videoRef.current || !canvasRef.current || !isStreamActive || isProcessing) return;

            const video = videoRef.current;
            const canvas = canvasRef.current;
            
            if (video.paused || video.ended) return;

            const displaySize = { width: video.videoWidth, height: video.videoHeight };
            if (displaySize.width === 0) return;

            faceapi.matchDimensions(canvas, displaySize);

            try {
                const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
                    .withFaceLandmarks()
                    .withFaceDescriptor();

                if (detection) {
                    const resizedDetection = faceapi.resizeResults(detection, displaySize);
                    
                    const ctx = canvas.getContext('2d');
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    
                    // Draw bounding box
                    faceapi.draw.drawDetections(canvas, resizedDetection);
                    
                    // Process the face
                    processFace(detection.descriptor);
                } else {
                    const ctx = canvas.getContext('2d');
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    setStatus("Arahkan wajah peserta ke kamera...");
                }
            } catch (e) {
                // ignore
            }
        }, 500); // Check every 500ms to reduce load and prevent spam

        return () => clearInterval(interval);
    };

    const processFace = async (descriptor) => {
        if (!activeEvent) return;
        setIsProcessing(true);
        setStatus("Mencocokkan Wajah...");

        try {
            let payload = {
                descriptor: Array.from(descriptor),
            };

            if (activeEvent.latitude && activeEvent.longitude && gpsData) {
                payload = { ...payload, ...gpsData };
            }

            const response = await axios.post('/api/face/match', payload);
            
            // Pass the data back to parent
            onScanResult(response.data);

            // Cooldown before scanning next face
            setStatus("Berhasil! Menunggu 3 detik...");
            setTimeout(() => {
                setIsProcessing(false);
                setStatus("Mencari Wajah...");
            }, 3000);

        } catch (error) {
            console.error(error);
            const errorData = error.response?.data || { status: 'error', message: 'Gagal menghubungi server.' };
            onScanResult(errorData);

            // Shorter cooldown on error
            setStatus("Wajah tidak dikenali...");
            setTimeout(() => {
                setIsProcessing(false);
                setStatus("Mencari Wajah...");
            }, 1500);
        }
    };

    return (
        <div className="w-full relative overflow-hidden rounded-3xl bg-black border border-slate-200 shadow-inner flex flex-col h-[60vh] min-h-[400px]">
            {errorMsg ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 bg-black/80">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
                        <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <p className="text-sm font-bold text-white mb-4">{errorMsg}</p>
                </div>
            ) : (
                <>
                    {!isModelsLoaded ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black text-white">
                            <svg className="animate-spin h-8 w-8 mb-3 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="text-xs font-semibold">{status}</span>
                        </div>
                    ) : (
                        <div className="relative flex-1 flex items-center justify-center">
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
                            
                            {/* Overlay Frame Guide */}
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                                <div className={`w-64 h-80 border-2 border-dashed rounded-[3rem] transition-colors duration-300 ${isProcessing ? 'border-indigo-400 bg-indigo-400/20' : 'border-white/50'}`}></div>
                            </div>

                            {/* Processing Overlay */}
                            {isProcessing && (
                                <div className="absolute inset-0 z-30 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                                    <div className="h-10 w-10 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin mb-3"></div>
                                    <p className="text-sm font-bold animate-pulse">Memvalidasi Wajah...</p>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Status Bar */}
            <div className="bg-slate-900/90 backdrop-blur text-white px-4 py-3 text-center border-t border-slate-800 z-20">
                <p className="text-[11px] font-bold text-slate-300 flex items-center justify-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isStreamActive && !isProcessing ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></span>
                    {status}
                </p>
            </div>
        </div>
    );
}
