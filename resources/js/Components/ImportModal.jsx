import { useState, useRef, useEffect, useMemo } from 'react';
import { router } from '@inertiajs/react';
import { useToast } from '@/Components/Toast';
import axios from 'axios';

export default function ImportModal({ isOpen, onClose }) {
    const { toast } = useToast();
    const [step, setStep] = useState('upload'); // 'upload' | 'conflict_resolution'
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [previewData, setPreviewData] = useState(null); // { conflicts: [], clean_data: [], total_rows: 0 }
    const [resolutions, setResolutions] = useState({}); // { [index]: 'update' | 'skip' }
    const [filterTab, setFilterTab] = useState('all'); // 'all' | 'changed' | 'identical'
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!isOpen) {
            setStep('upload');
            setFile(null);
            setIsDragging(false);
            setIsUploading(false);
            setIsConfirming(false);
            setErrorMessage(null);
            setPreviewData(null);
            setResolutions({});
            setFilterTab('all');
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen && !isUploading && !isConfirming) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isUploading, isConfirming, onClose]);

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

    // Step 1: Upload and Preview
    const handleUpload = async () => {
        if (!file) {
            setErrorMessage('Pilih file Excel terlebih dahulu.');
            return;
        }

        setIsUploading(true);
        setErrorMessage(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(route('participants.import.preview'), formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setIsUploading(false);

            if (response.data.status === 'success') {
                toast.success(response.data.message || 'Data peserta berhasil diimpor.');
                onClose();
                router.reload({ only: ['participants'] });
            } else if (response.data.status === 'conflict') {
                const initialRes = {};
                (response.data.conflicts || []).forEach((c, idx) => {
                    initialRes[idx] = c.default_resolution || 'update';
                });
                setResolutions(initialRes);
                setPreviewData(response.data);
                setStep('conflict_resolution');
                setFilterTab('all');
            }
        } catch (error) {
            setIsUploading(false);
            const msg = error.response?.data?.error || error.response?.data?.message || 'Gagal memproses file Excel.';
            setErrorMessage(msg);
            toast.error(msg);
        }
    };

    // Step 2: Confirm Resolution
    const handleConfirmImport = () => {
        if (!previewData) return;

        setIsConfirming(true);

        const resolvedConflicts = previewData.conflicts.map((c, idx) => ({
            ...c,
            resolution: resolutions[idx] || 'skip',
        }));

        router.post(route('participants.import.confirm'), {
            clean_data: previewData.clean_data,
            resolved_conflicts: resolvedConflicts,
        }, {
            onSuccess: () => {
                setIsConfirming(false);
                onClose();
            },
            onError: () => {
                setIsConfirming(false);
                toast.error('Gagal menyelesaikan impor data.');
            },
        });
    };

    const setAllResolutions = (res) => {
        const updated = {};
        (previewData?.conflicts || []).forEach((_, idx) => {
            updated[idx] = res;
        });
        setResolutions(updated);
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    // Helper to calculate exact field differences between Existing and New data
    const getFieldDiffs = (existing, newData) => {
        const diffs = [];

        const existingNama = (existing?.nama || '').trim();
        const newNama = (newData?.nama || '').trim();
        const isNamaDiff = existingNama.toLowerCase().replace(/\s+/g, ' ') !== newNama.toLowerCase().replace(/\s+/g, ' ');

        const existingNip = (existing?.nis_nip || '').trim();
        const newNip = (newData?.nis_nip || '').trim();
        const isNipDiff = existingNip !== newNip;

        const existingStatus = (existing?.status || '-').trim();
        const newStatus = (newData?.status || '-').trim();
        const isStatusDiff = existingStatus.toLowerCase() !== newStatus.toLowerCase();

        if (isNamaDiff) {
            diffs.push({
                field: 'Nama',
                oldVal: existingNama || '-',
                newVal: newNama || '-',
            });
        }

        if (isNipDiff) {
            diffs.push({
                field: 'NIP',
                oldVal: existingNip || '-',
                newVal: newNip || '-',
            });
        }

        if (isStatusDiff) {
            diffs.push({
                field: 'Status',
                oldVal: existingStatus || '-',
                newVal: newStatus || '-',
            });
        }

        return {
            diffs,
            hasDiff: diffs.length > 0,
            isNamaDiff,
            isNipDiff,
            isStatusDiff,
        };
    };

    // Enhanced conflict list with computed diffs
    const conflictsWithDiffs = useMemo(() => {
        if (!previewData?.conflicts) return [];
        return previewData.conflicts.map((c, originalIndex) => {
            const diffInfo = getFieldDiffs(c.existing, c.new);
            return {
                ...c,
                originalIndex,
                ...diffInfo,
            };
        });
    }, [previewData]);

    const changedCount = useMemo(() => {
        return conflictsWithDiffs.filter(c => c.hasDiff).length;
    }, [conflictsWithDiffs]);

    const identicalCount = useMemo(() => {
        return conflictsWithDiffs.filter(c => !c.hasDiff).length;
    }, [conflictsWithDiffs]);

    const filteredConflicts = useMemo(() => {
        if (filterTab === 'changed') {
            return conflictsWithDiffs.filter(c => c.hasDiff);
        }
        if (filterTab === 'identical') {
            return conflictsWithDiffs.filter(c => !c.hasDiff);
        }
        return conflictsWithDiffs;
    }, [conflictsWithDiffs, filterTab]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/50 backdrop-blur-sm transition-opacity"
            onClick={() => !isUploading && !isConfirming && onClose()}
        >
            <div
                className={`relative w-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all ${
                    step === 'conflict_resolution' ? 'max-w-6xl' : 'max-w-lg'
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                            {step === 'conflict_resolution' ? (
                                <>
                                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-100 text-amber-600 text-xs">
                                        ⚠
                                    </span>
                                    Konfirmasi Data Duplikat &amp; Perbedaan Data
                                </>
                            ) : (
                                'Impor Data Peserta'
                            )}
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">
                            {step === 'conflict_resolution'
                                ? `Ditemukan ${previewData?.conflicts?.length || 0} data yang cocok dengan data sistem. Periksa kolom perbedaan sebelum melanjutkan.`
                                : 'Unggah file Excel untuk menambah atau memperbarui data peserta'}
                        </p>
                    </div>
                    <button
                        type="button"
                        disabled={isUploading || isConfirming}
                        onClick={onClose}
                        className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors text-lg"
                        aria-label="Tutup"
                    >
                        &times;
                    </button>
                </div>

                {/* Body Content: Step 1 Upload */}
                {step === 'upload' && (
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
                                    <p className="text-sm font-bold text-slate-800">
                                        Tarik file ke sini atau <span className="text-indigo-600 hover:underline">Pilih File</span>
                                    </p>
                                    <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                                        Mendukung .XLSX, .XLS, atau .CSV (Maks. 5 MB)
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3.5 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-slate-900 truncate">{file.name}</p>
                                        <p className="text-[11px] text-emerald-700 font-semibold">{formatFileSize(file.size)}</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    disabled={isUploading}
                                    onClick={() => setFile(null)}
                                    className="shrink-0 text-xs font-bold text-slate-500 hover:text-red-600 px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:border-red-200 transition-colors"
                                >
                                    Ganti
                                </button>
                            </div>
                        )}

                        {/* Error message */}
                        {errorMessage && (
                            <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-lg p-2.5 flex items-center gap-2">
                                <span>⚠</span> {errorMessage}
                            </p>
                        )}

                        {/* Format Guideline Card */}
                        <div className="rounded-xl bg-slate-50 border border-slate-100 p-3.5 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-slate-700">Format Kolom Excel:</span>
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
                                    <p className="text-[10px] text-red-500 font-semibold">Wajib</p>
                                </div>
                                <div className="bg-white border border-slate-200/80 rounded-lg py-1.5 px-2">
                                    <p className="font-bold text-slate-800">NIP</p>
                                    <p className="text-[10px] text-red-500 font-semibold">Wajib &amp; Unik</p>
                                </div>
                                <div className="bg-white border border-slate-200/80 rounded-lg py-1.5 px-2">
                                    <p className="font-bold text-slate-800">Status</p>
                                    <p className="text-[10px] text-slate-400 font-semibold">Opsional</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Body Content: Step 2 Conflict Resolution with Differences Column */}
                {step === 'conflict_resolution' && previewData && (
                    <div className="p-6 space-y-4">
                        {/* Summary Alert */}
                        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-amber-50 border border-amber-200 p-3.5 text-xs text-amber-900">
                            <div className="flex items-center gap-2">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-200 text-amber-800 text-xs font-black">
                                    !
                                </span>
                                <span>
                                    <strong className="font-extrabold">{previewData.clean_data?.length || 0}</strong> data baru siap disimpan, dan{' '}
                                    <strong className="font-extrabold">{previewData.conflicts?.length || 0}</strong> data cocok dengan sistem ({changedCount} ada perbedaan, {identicalCount} sama persis).
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setAllResolutions('update')}
                                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
                                >
                                    <span>Pilih Semua: Update</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAllResolutions('skip')}
                                    className="rounded-lg bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-300 transition-colors"
                                >
                                    <span>Pilih Semua: Skip</span>
                                </button>
                            </div>
                        </div>

                        {/* Filter Tabs for quick inspection */}
                        <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => setFilterTab('all')}
                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                                        filterTab === 'all'
                                            ? 'bg-slate-900 text-white shadow-xs'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    Semua Data ({conflictsWithDiffs.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFilterTab('changed')}
                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 ${
                                        filterTab === 'changed'
                                            ? 'bg-amber-600 text-white shadow-xs'
                                            : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60'
                                    }`}
                                >
                                    <span>Ada Perbedaan Data ({changedCount})</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFilterTab('identical')}
                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 ${
                                        filterTab === 'identical'
                                            ? 'bg-emerald-700 text-white shadow-xs'
                                            : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60'
                                    }`}
                                >
                                    <span>Sama Persis ({identicalCount})</span>
                                </button>
                            </div>
                            <span className="text-[11px] text-slate-400 font-medium">
                                Menampilkan {filteredConflicts.length} baris
                            </span>
                        </div>

                        {/* Comparison Table with Differences Column */}
                        <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm max-h-[360px] overflow-y-auto">
                            <table className="min-w-full divide-y divide-slate-200 text-xs">
                                <thead className="bg-slate-100/80 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-3 py-2.5 text-left font-extrabold text-slate-600 w-10">No</th>
                                        <th className="px-3 py-2.5 text-left font-extrabold text-slate-600 w-52">Data Lama di Database</th>
                                        <th className="px-3 py-2.5 text-left font-extrabold text-slate-600 w-52">Data Baru di Excel</th>
                                        <th className="px-3 py-2.5 text-left font-extrabold text-slate-600">Perbedaan Data</th>
                                        <th className="px-3 py-2.5 text-left font-extrabold text-slate-600 w-36">Status Bentrok</th>
                                        <th className="px-3 py-2.5 text-center font-extrabold text-slate-600 w-32">Tindakan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {filteredConflicts.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-8 text-center text-slate-400 font-medium">
                                                Tidak ada data dalam kategori ini.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredConflicts.map((conflict) => {
                                            const origIdx = conflict.originalIndex;
                                            const isUpdate = resolutions[origIdx] === 'update';

                                            return (
                                                <tr
                                                    key={origIdx}
                                                    className={`transition-colors ${
                                                        isUpdate ? 'bg-indigo-50/20' : 'bg-slate-50/40'
                                                    } hover:bg-slate-50`}
                                                >
                                                    <td className="px-3 py-3 text-slate-400 font-bold">{origIdx + 1}</td>

                                                    {/* Data Lama di Database */}
                                                    <td className="px-3 py-3">
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="font-bold text-slate-800">{conflict.existing.nama || '-'}</span>
                                                            <span className="text-[11px] text-slate-500 font-mono">
                                                                NIP: {conflict.existing.nis_nip || '-'}
                                                            </span>
                                                            <span className="text-[10px] text-slate-400">
                                                                Status: {conflict.existing.status || '-'}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* Data Baru di Excel */}
                                                    <td className="px-3 py-3">
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className={`font-extrabold ${conflict.isNamaDiff ? 'text-amber-700 bg-amber-50 px-1 rounded inline-block w-fit' : 'text-slate-800'}`}>
                                                                {conflict.new.nama}
                                                            </span>
                                                            <span className={`text-[11px] font-mono ${conflict.isNipDiff ? 'text-amber-700 bg-amber-50 px-1 rounded inline-block w-fit font-bold' : 'text-slate-500 font-medium'}`}>
                                                                NIP: {conflict.new.nis_nip}
                                                            </span>
                                                            <span className={`text-[10px] ${conflict.isStatusDiff ? 'text-indigo-700 bg-indigo-50 px-1 rounded inline-block w-fit font-bold' : 'text-slate-400'}`}>
                                                                Status: {conflict.new.status || '-'}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* Perbedaan Data Column */}
                                                    <td className="px-3 py-3">
                                                        {!conflict.hasDiff ? (
                                                            <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 border border-emerald-200/80 px-2 py-1 text-[10px] font-bold text-emerald-700">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                                Sama Persis (Identik)
                                                            </span>
                                                        ) : (
                                                            <div className="flex flex-col gap-1">
                                                                {conflict.diffs.map((d, dIdx) => (
                                                                    <div
                                                                        key={dIdx}
                                                                        className="flex flex-wrap items-center gap-1 text-[10px] bg-amber-50/70 border border-amber-200/60 rounded-md px-1.5 py-0.5"
                                                                    >
                                                                        <span className="font-bold text-amber-900 bg-amber-200/60 px-1 py-0.2 rounded text-[9px] uppercase tracking-wider">
                                                                            {d.field}
                                                                        </span>
                                                                        <span className="text-slate-500 line-through max-w-[120px] truncate" title={d.oldVal}>
                                                                            {d.oldVal}
                                                                        </span>
                                                                        <span className="text-amber-600 font-bold">→</span>
                                                                        <span className="font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-1 py-0.2 rounded max-w-[140px] truncate" title={d.newVal}>
                                                                            {d.newVal}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </td>

                                                    {/* Status Bentrok */}
                                                    <td className="px-3 py-3">
                                                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                                                            {conflict.conflict_reason}
                                                        </span>
                                                    </td>

                                                    {/* Tindakan */}
                                                    <td className="px-3 py-3 text-center">
                                                        <div className="flex flex-col items-center gap-1">
                                                            <div className="inline-flex rounded-lg border border-slate-300 bg-slate-100 p-1 shadow-inner">
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        setResolutions(prev => ({
                                                                            ...prev,
                                                                            [origIdx]: 'skip',
                                                                        }));
                                                                    }}
                                                                    className={`cursor-pointer px-2.5 py-1 rounded-md text-xs font-extrabold transition-all flex items-center gap-1 ${
                                                                        !isUpdate
                                                                            ? 'bg-amber-500 text-white shadow-sm ring-1 ring-amber-600'
                                                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                                                                    }`}
                                                                >
                                                                    {!isUpdate && <span>✕</span>}
                                                                    Skip
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        setResolutions(prev => ({
                                                                            ...prev,
                                                                            [origIdx]: 'update',
                                                                        }));
                                                                    }}
                                                                    className={`cursor-pointer px-2.5 py-1 rounded-md text-xs font-extrabold transition-all flex items-center gap-1 ${
                                                                        isUpdate
                                                                            ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-700'
                                                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                                                                    }`}
                                                                >
                                                                    {isUpdate && <span>✓</span>}
                                                                    Update
                                                                </button>
                                                            </div>
                                                            <span className={`text-[10px] font-bold ${isUpdate ? 'text-emerald-700' : 'text-amber-700'}`}>
                                                                {isUpdate ? 'Akan di-update' : 'Akan di-skip'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Footer Actions */}
                <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2.5">
                    {step === 'conflict_resolution' ? (
                        <>
                            <button
                                type="button"
                                disabled={isConfirming}
                                onClick={() => setStep('upload')}
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
                            >
                                ← Pilih File Lain
                            </button>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    disabled={isConfirming}
                                    onClick={onClose}
                                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    disabled={isConfirming}
                                    onClick={handleConfirmImport}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {isConfirming ? (
                                        <>
                                            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                                            <span>Menyimpan...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span>Terapkan &amp; Selesaikan Impor</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-end gap-2.5 w-full">
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
                                        <span>Memeriksa &amp; Mengimpor...</span>
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
                    )}
                </div>
            </div>
        </div>
    );
}
