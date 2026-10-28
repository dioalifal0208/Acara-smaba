import { Button, Dialog, Segmented, StatusPill, cx, useToast } from '@/ui';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { AlertCircle, ArrowLeft, ArrowRight, Download, FileSpreadsheet, Upload } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

const COLUMNS = [
    { name: 'Nama', rule: 'Wajib' },
    { name: 'NIP', rule: 'Wajib dan unik. GTT/PTT diisi "-"' },
    { name: 'Status', rule: 'PNS, PPPK, PPPK Paruh Waktu, GTT, atau PTT' },
    { name: 'Tanggal Lahir', rule: 'Wajib untuk GTT/PTT (untuk ID pengganti NIP)' },
    { name: 'Jenis Kelamin', rule: 'Wajib untuk GTT/PTT: L atau P' },
];

const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${parseFloat((bytes / 1024 ** i).toFixed(1))} ${['B', 'KB', 'MB'][i]}`;
};

// Perbedaan per kolom antara data di sistem dan data di Excel.
const getFieldDiffs = (existing, incoming) => {
    const norm = (v) => (v || '').trim();
    const pairs = [
        ['Nama', norm(existing?.nama), norm(incoming?.nama), (a, b) => a.toLowerCase().replace(/\s+/g, ' ') !== b.toLowerCase().replace(/\s+/g, ' ')],
        ['NIP', norm(existing?.nis_nip), norm(incoming?.nis_nip), (a, b) => a !== b],
        ['Status', norm(existing?.status) || '-', norm(incoming?.status) || '-', (a, b) => a.toLowerCase() !== b.toLowerCase()],
    ];
    const diffs = pairs.filter(([, a, b, differs]) => differs(a, b)).map(([field, a, b]) => ({ field, oldVal: a || '-', newVal: b || '-' }));
    return { diffs, hasDiff: diffs.length > 0 };
};

/**
 * Impor peserta dari Excel, dua langkah: (1) unggah file → server memeriksa; bila ada baris yang
 * cocok dengan data sistem, (2) admin memilih Perbarui/Lewati per baris lalu menyelesaikan impor.
 */
export default function ImportModal({ isOpen, onClose }) {
    const { toast } = useToast();
    const [step, setStep] = useState('upload'); // 'upload' | 'review'
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [previewData, setPreviewData] = useState(null); // { conflicts: [], clean_data: [], total_rows: 0 }
    const [resolutions, setResolutions] = useState({}); // { [index]: 'update' | 'skip' }
    const [filterTab, setFilterTab] = useState('all'); // 'all' | 'changed' | 'identical'
    const fileInputRef = useRef(null);
    const busy = isUploading || isConfirming;

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

    const validateAndSetFile = (selectedFile) => {
        setErrorMessage(null);
        if (!selectedFile) return;

        const fileName = selectedFile.name.toLowerCase();
        if (!['.xlsx', '.xls', '.csv'].some((ext) => fileName.endsWith(ext))) {
            setErrorMessage('Format file tidak didukung. Pakai file .xlsx, .xls, atau .csv.');
            return;
        }
        if (selectedFile.size > 5 * 1024 * 1024) {
            setErrorMessage('Ukuran file lebih dari 5 MB. Pecah datanya menjadi beberapa file.');
            return;
        }
        setFile(selectedFile);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files?.length > 0) validateAndSetFile(e.dataTransfer.files[0]);
    };

    // Langkah 1: unggah & periksa
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
                const initial = {};
                (response.data.conflicts || []).forEach((c, idx) => {
                    initial[idx] = c.default_resolution || 'update';
                });
                setResolutions(initial);
                setPreviewData(response.data);
                setStep('review');
                setFilterTab('all');
            }
        } catch (error) {
            setIsUploading(false);
            setErrorMessage(error.response?.data?.error || error.response?.data?.message || 'File gagal diproses. Periksa formatnya dengan template, lalu coba lagi.');
        }
    };

    // Langkah 2: terapkan keputusan
    const handleConfirmImport = () => {
        if (!previewData) return;
        setIsConfirming(true);

        router.post(route('participants.import.confirm'), {
            clean_data: previewData.clean_data,
            resolved_conflicts: previewData.conflicts.map((c, idx) => ({ ...c, resolution: resolutions[idx] || 'skip' })),
        }, {
            onSuccess: () => {
                setIsConfirming(false);
                onClose();
            },
            onError: () => {
                setIsConfirming(false);
                toast.error('Impor gagal diselesaikan. Coba lagi.');
            },
        });
    };

    const setAll = (value) => setResolutions(Object.fromEntries((previewData?.conflicts || []).map((_, idx) => [idx, value])));

    const conflicts = useMemo(
        () => (previewData?.conflicts || []).map((c, originalIndex) => ({ ...c, originalIndex, ...getFieldDiffs(c.existing, c.new) })),
        [previewData],
    );
    const changedCount = conflicts.filter((c) => c.hasDiff).length;
    const identicalCount = conflicts.length - changedCount;
    const shown = filterTab === 'changed' ? conflicts.filter((c) => c.hasDiff) : filterTab === 'identical' ? conflicts.filter((c) => !c.hasDiff) : conflicts;
    const updateCount = Object.values(resolutions).filter((r) => r === 'update').length;
    const review = step === 'review' && previewData;

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            dismissible={!busy}
            title={review ? 'Periksa data yang sudah ada' : 'Impor peserta dari Excel'}
            description={review
                ? `${previewData.clean_data?.length || 0} peserta baru siap disimpan. ${conflicts.length} baris cocok dengan data di sistem: pilih perbarui atau lewati.`
                : 'Tambah atau perbarui banyak peserta sekaligus. Akun login dibuat otomatis.'}
            size={review ? '4xl' : 'lg'}
            footer={review ? (
                <>
                    <Button icon={ArrowLeft} onClick={() => setStep('upload')} disabled={isConfirming} className="sm:mr-auto">Pilih file lain</Button>
                    <Button onClick={onClose} disabled={isConfirming}>Batal</Button>
                    <Button variant="primary" onClick={handleConfirmImport} loading={isConfirming}>
                        Selesaikan impor ({(previewData.clean_data?.length || 0) + updateCount} data)
                    </Button>
                </>
            ) : (
                <>
                    <Button onClick={onClose} disabled={isUploading}>Batal</Button>
                    <Button variant="primary" icon={Upload} onClick={handleUpload} disabled={!file} loading={isUploading}>
                        {isUploading ? 'Memeriksa file…' : 'Periksa & impor'}
                    </Button>
                </>
            )}
        >
            {!review ? (
                <div className="space-y-4">
                    <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={(e) => validateAndSetFile(e.target.files?.[0])} className="sr-only" tabIndex={-1} />

                    {!file ? (
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            className={cx(
                                'flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors',
                                isDragging ? 'border-accent bg-accent-soft' : 'border-line-strong hover:bg-surface-2/60',
                            )}
                        >
                            <FileSpreadsheet className="h-8 w-8 text-ink-2" strokeWidth={1.5} aria-hidden="true" />
                            <span className="text-sm font-medium text-ink">Pilih file atau tarik ke sini</span>
                            <span className="text-sm text-ink-2">.xlsx, .xls, atau .csv, maksimal 5 MB</span>
                        </button>
                    ) : (
                        <div className="flex items-center gap-3 rounded-xl border border-line p-4">
                            <FileSpreadsheet className="h-6 w-6 shrink-0 text-status-hadir" aria-hidden="true" />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-ink">{file.name}</p>
                                <p className="text-xs text-ink-2">{formatFileSize(file.size)}</p>
                            </div>
                            <Button size="sm" variant="ghost" onClick={() => setFile(null)} disabled={isUploading}>Ganti</Button>
                        </div>
                    )}

                    {errorMessage && (
                        <p className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger-soft p-3 text-sm text-ink" role="alert">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden="true" />
                            {errorMessage}
                        </p>
                    )}

                    <section aria-labelledby="import-format">
                        <div className="mb-2 flex items-center justify-between gap-3">
                            <h3 id="import-format" className="text-sm font-medium text-ink">Kolom di file Excel</h3>
                            <Button size="sm" variant="ghost" icon={Download} href={route('participants.template')} external className="-mr-3">Unduh template</Button>
                        </div>
                        <dl className="divide-y divide-line rounded-xl border border-line text-sm">
                            {COLUMNS.map((col) => (
                                <div key={col.name} className="flex gap-3 px-4 py-2.5">
                                    <dt className="w-32 shrink-0 font-medium text-ink">{col.name}</dt>
                                    <dd className="text-ink-2">{col.rule}</dd>
                                </div>
                            ))}
                        </dl>
                    </section>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <Segmented
                            label="Tampilkan baris"
                            value={filterTab}
                            onChange={setFilterTab}
                            options={[
                                { value: 'all', label: 'Semua', count: conflicts.length },
                                { value: 'changed', label: 'Ada perubahan', count: changedCount },
                                { value: 'identical', label: 'Sama persis', count: identicalCount },
                            ]}
                        />
                        <div className="flex gap-2">
                            <Button size="sm" onClick={() => setAll('update')}>Perbarui semua</Button>
                            <Button size="sm" onClick={() => setAll('skip')}>Lewati semua</Button>
                        </div>
                    </div>

                    {shown.length === 0 ? (
                        <p className="rounded-xl border border-line py-10 text-center text-sm text-ink-2">Tidak ada baris di kategori ini.</p>
                    ) : (
                        <ul className="max-h-[50vh] divide-y divide-line overflow-y-auto rounded-xl border border-line">
                            {shown.map((c) => {
                                const idx = c.originalIndex;
                                const choice = resolutions[idx] || 'skip';
                                return (
                                    <li key={idx} className={cx('flex flex-col gap-3 p-4 md:flex-row md:items-center', choice === 'skip' && 'bg-surface-2/40')}>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="font-medium text-ink">{c.new.nama || c.existing.nama}</p>
                                                {c.conflict_reason && <StatusPill tone="netral" label={c.conflict_reason} />}
                                            </div>
                                            {c.hasDiff ? (
                                                <ul className="mt-1.5 space-y-1">
                                                    {c.diffs.map((d) => (
                                                        <li key={d.field} className="flex flex-wrap items-center gap-x-2 text-sm">
                                                            <span className="w-14 shrink-0 text-ink-2">{d.field}</span>
                                                            <span className="text-ink-2 line-through">{d.oldVal}</span>
                                                            <ArrowRight className="h-3.5 w-3.5 text-ink-3" aria-label="menjadi" />
                                                            <span className="font-medium text-ink">{d.newVal}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="mt-1 text-sm text-ink-2">Sama persis dengan data di sistem ({c.existing.nis_nip || 'tanpa NIP'} · {c.existing.status || '-'}).</p>
                                            )}
                                        </div>
                                        <Segmented
                                            label={`Tindakan untuk ${c.new.nama || c.existing.nama}`}
                                            value={choice}
                                            onChange={(value) => setResolutions((prev) => ({ ...prev, [idx]: value }))}
                                            options={[{ value: 'skip', label: 'Lewati' }, { value: 'update', label: 'Perbarui' }]}
                                            className="shrink-0 self-start md:self-center"
                                        />
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            )}
        </Dialog>
    );
}
