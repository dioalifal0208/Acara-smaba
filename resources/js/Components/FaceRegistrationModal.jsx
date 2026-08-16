import { useState, useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';
import { useToast } from './Toast';
import axios from 'axios';

export default function FaceRegistrationModal({ participant, onClose, onSuccess }) {
    const { toast } = useToast();
    const videoRef = useRef();
    const canvasRef = useRef();
    
    const [isModelsLoaded, setIsModelsLoaded] = useState(false);
    const [isStreamActive, setIsStreamActive] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [faceStatus, setFaceStatus] = useState('Mencari wajah...'); // status message
    const [detectedFace, setDetectedFace] = useState(null);

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
            } catch (err) {
                console.error("Failed to load models", err);
                toast.error("Gagal memuat model Face API.");
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
                }
            } catch (err) {
                console.error(err);
                toast.error("Kamera tidak dapat diakses.");
            }
        };

        startVideo();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [isModelsLoaded]);

    // Handle Video Play (Detection Loop)
    const handleVideoPlay = () => {
        const interval = setInterval(async () => {
            if (!videoRef.current || !canvasRef.current || !isStreamActive) return;

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
                    
                    // Clear previous drawings
                    const ctx = canvas.getContext('2d');
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    
                    // Draw bounding box
                    faceapi.draw.drawDetections(canvas, resizedDetection);
                    faceapi.draw.drawFaceLandmarks(canvas, resizedDetection);

                    setFaceStatus('Wajah terdeteksi. Posisikan diam.');
                    setDetectedFace(detection);
                } else {
                    const ctx = canvas.getContext('2d');
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    setFaceStatus('Tidak ada wajah terdeteksi.');
                    setDetectedFace(null);
                }
            } catch (e) {
                // Ignore detection errors during loop
            }

        }, 200);

        return () => clearInterval(interval);
    };

    const handleRegister = async () => {
        if (!detectedFace) {
            toast.error("Wajah belum terdeteksi secara sempurna.");
            return;
        }

        setIsProcessing(true);
        try {
            const descriptor = Array.from(detectedFace.descriptor);
            
            const response = await axios.post(`/api/participants/${participant.id}/face`, {
                descriptor: descriptor
            });

            toast.success(response.data.message);
            onSuccess(); // Close modal & refresh list
        } catch (error) {
            console.error(error);
            toast.error("Gagal mendaftarkan wajah.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Yakin ingin menghapus data wajah peserta ini?")) return;

        setIsProcessing(true);
        try {
            const response = await axios.delete(`/api/participants/${participant.id}/face`);
            toast.success(response.data.message);
            onSuccess();
        } catch (error) {
            toast.error("Gagal menghapus wajah.");
        } finally {
            setIsProcessing(false);
        }
    };

    const hasFace = Array.isArray(participant.face_descriptor) && participant.face_descriptor.length > 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="w-full max-w-lg animate-[fadeIn_0.2s_ease-out] rounded-3xl bg-white border border-slate-200 p-6 shadow-2xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                        <h3 className="text-xl font-extrabold text-slate-800">Detail & Registrasi Wajah</h3>
                        <p className="text-sm text-slate-500 font-semibold mt-0.5">{participant.nama} - {participant.nis_nip}</p>
                    </div>
                    <button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>

                {/* Status Section */}
                <div className="mb-4 flex items-center justify-between bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <span className="text-sm font-bold text-slate-600">Status Wajah:</span>
                    {hasFace ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Terdaftar
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200">
                            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Belum Terdaftar
                        </span>
                    )}
                </div>

                {/* Camera Section */}
                <div className="relative flex-1 bg-black rounded-2xl overflow-hidden min-h-[300px] flex items-center justify-center border-2 border-slate-200 shadow-inner">
                    {!isModelsLoaded ? (
                        <div className="text-white flex flex-col items-center">
                            <svg className="animate-spin h-8 w-8 mb-2 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="text-sm font-semibold">Memuat Model AI...</span>
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
                            
                            {/* Overlay frame guide */}
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <div className={`w-48 h-64 border-2 border-dashed rounded-full transition-colors duration-300 ${detectedFace ? 'border-emerald-400 bg-emerald-400/10' : 'border-white/50'}`}></div>
                            </div>
                        </>
                    )}
                </div>

                {/* Status Bar */}
                <div className="mt-3 text-center">
                    <p className={`text-sm font-bold ${detectedFace ? 'text-emerald-600' : 'text-slate-500'}`}>
                        {faceStatus}
                    </p>
                </div>

                {/* Actions */}
                <div className="mt-5 flex gap-3">
                    <button
                        onClick={handleRegister}
                        disabled={!detectedFace || isProcessing}
                        className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-extrabold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-700 focus:outline-none disabled:opacity-50 disabled:shadow-none"
                    >
                        {isProcessing ? 'Memproses...' : 'Ambil & Daftarkan Wajah'}
                    </button>
                    {hasFace && (
                        <button
                            onClick={handleDelete}
                            disabled={isProcessing}
                            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-extrabold text-red-600 transition-colors hover:bg-red-100 focus:outline-none disabled:opacity-50"
                        >
                            Hapus Data
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
