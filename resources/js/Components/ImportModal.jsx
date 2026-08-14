import { useState, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { useToast } from '@/Components/Toast';

export default function ImportModal({ isOpen, onClose }) {
    const { toast } = useToast();
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!isOpen) {
            setFile(null);
            setIsDragging(false);
            setIsUploading(false);
            setErrorMessage(null);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen && !isUploading) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isUploading, onClose]);

    const validateAndSetFile = (selectedFile) => {
        setErrorMessage(null);
        if (!selectedFile) return;

        const validExtensions = ['.xlsx', '.xls', '.csv'];
        const fileName = selectedFile.name.toLowerCase();
        const isValid = validExtensions.some((ext) => fileName.endsWith(ext));

        if (!isValid) {
            setErrorMessage('Format tidak didukung. Gunakan file .xlsx, .xls, atau .csv');
            return;
        }

        if (selectedFile.size > 5 * 1024 * 1024) {
            setErrorMessage('Ukuran file maksimal 5 MB.');
            return;
        }

        setFile(selectedFile);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const handleUpload = () => {
        if (!file) {
            setErrorMessage('Pilih file Excel terlebih dahulu.');
            return;
        }

        setIsUploading(true);
        setErrorMessage(null);

        const formData = new FormData();
        formData.append('file', file);

        router.post(route('participants.import'), formData, {
            forceFormData: true,
            onSuccess: () => {
                setIsUploading(false);
                onClose();
            },
            onError: (errors) => {
                setIsUploading(false);
                setErrorMessage(errors.file || 'Gagal mengimpor data peserta.');
                toast.error(errors.file || 'Gagal mengimpor file.');
            },
        });
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/50 backdrop-blur-sm transition-opacity"
            onClick={() => !isUploading && onClose()}
        >
            <div
                className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden transform transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-bold text-slate-900">Impor Data Peserta</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Unggah file Excel untuk menambah atau memperbarui peserta</p>
                    </div>
                    <button
                        type="button"
                        disabled={isUploading}
                        onClick={onClose}
                        className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors text-lg"
                        aria-label="Tutup"
                    >
                        &times;
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-6 space-y-4">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    {/* Drag & Drop Box */}
                    {!file ? (
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`cursor-pointer rounded-xl border border-dashed p-6 text-center transition-colors flex flex-col items-center justify-center gap-2 ${
                                isDragging
                                    ? 'border-indigo-600 bg-indigo-50/40'
                                    : 'border-slate-300 bg-slate-50/50 hover:border-indigo-400 hover:bg-slate-50'
                            }`}
                        >
                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-indigo-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-800">
                                    Tarik file ke sini atau <span className="text-indigo-600 hover:underline">Pilih File</span>
                                </p>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                    Mendukung .XLSX, .XLS, atau .CSV (Maks. 5 MB)
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3.5 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-900 truncate">{file.name}</p>
                                    <p className="text-[11px] text-emerald-700 font-medium">{formatFileSize(file.size)}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                disabled={isUploading}
                                onClick={() => setFile(null)}
                                className="shrink-0 text-xs font-semibold text-slate-500 hover:text-red-600 px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:border-red-200 transition-colors"
                            >
                                Ganti
                            </button>
                        </div>
                    )}

                    {/* Error message */}
                    {errorMessage && (
                        <p className="text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg p-2.5 flex items-center gap-2">
                            <span>⚠</span> {errorMessage}
                        </p>
                    )}

                    {/* Format Guideline Card (Simple & Seamless) */}
                    <div className="rounded-xl bg-slate-50 border border-slate-100 p-3.5 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-700">Format Kolom Excel:</span>
                            <a
                                href={route('participants.template')}
                                className="font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 hover:underline text-[11px]"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Unduh Template (.xlsx)
                            </a>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                            <div className="bg-white border border-slate-200/80 rounded-lg py-1.5 px-2">
                                <p className="font-bold text-slate-800">Nama</p>
                                <p className="text-[10px] text-red-500">Wajib</p>
                            </div>
                            <div className="bg-white border border-slate-200/80 rounded-lg py-1.5 px-2">
                                <p className="font-bold text-slate-800">NIP</p>
                                <p className="text-[10px] text-red-500">Wajib &amp; Unik</p>
                            </div>
                            <div className="bg-white border border-slate-200/80 rounded-lg py-1.5 px-2">
                                <p className="font-bold text-slate-800">Keterangan</p>
                                <p className="text-[10px] text-slate-400">Opsional</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
                    <button
                        type="button"
                        disabled={isUploading}
                        onClick={onClose}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        disabled={!file || isUploading}
                        onClick={handleUpload}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2 text-xs font-bold text-white shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isUploading ? (
                            <>
                                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                                <span>Mengimpor...</span>
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                <span>Mulai Impor</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
