import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { useToast } from '@/Components/Toast';
import { useConfirm } from '@/Components/ConfirmDialog';
import FaceRegistrationModal from '@/Components/FaceRegistrationModal';
import ApproveFaceModal from '@/Components/ApproveFaceModal';
import ApprovePhotoChangeRequestModal from '@/Components/ApprovePhotoChangeRequestModal';
import FaceHistoryPanel from '@/Components/FaceHistoryPanel';

const EMPLOYMENT_STATUSES = ['PNS', 'PPPK', 'PPPK Paruh Waktu', 'GTT', 'PTT'];
const NON_PERMANENT_STATUSES = ['GTT', 'PTT'];

const isNonPermanentStatus = (status) => NON_PERMANENT_STATUSES.includes(status);

const normalizeStatus = (status) => EMPLOYMENT_STATUSES.find((s) => s.toLowerCase() === (status || '').trim().toLowerCase()) ?? (status || '');

const faceStatusInfo = (participant) => participant.pending_photo_change_request
    ? ['bg-amber-500', 'Foto baru menunggu verifikasi']
    : participant.face_status === 'approved'
        ? ['bg-emerald-500', 'Wajah disetujui']
        : participant.face_status === 'pending'
            ? ['bg-amber-500', 'Wajah menunggu persetujuan']
            : participant.face_status === 'rejected'
                ? ['bg-rose-500', 'Wajah ditolak']
                : ['bg-neutral-300', 'Wajah belum terdaftar'];

export default function ParticipantShow({ participant }) {
    const { props: { flash }, url: pageUrl } = usePage();
    const { toast } = useToast();
    const confirm = useConfirm();
    const [faceRegistrationOpen, setFaceRegistrationOpen] = useState(false);
    const [approveFaceOpen, setApproveFaceOpen] = useState(false);
    const [approvePhotoOpen, setApprovePhotoOpen] = useState(false);
    const [historyKey, setHistoryKey] = useState(0);

    const form = useForm({
        nama: participant.nama,
        nis_nip: participant.nis_nip,
        status: normalizeStatus(participant.status),
    });

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        } else if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // Tautan dari notifikasi admin: ?review=photo|face langsung membuka modal verifikasi.
    useEffect(() => {
        const review = new URLSearchParams(pageUrl.split('?')[1] ?? '').get('review');
        if (review === 'photo' && participant.pending_photo_change_request) {
            setApprovePhotoOpen(true);
        } else if (review === 'face' && participant.face_status === 'pending') {
            setApproveFaceOpen(true);
        } else if (review === 'photo' || review === 'face') {
            toast.info(`Pengajuan ${participant.nama} sudah diproses.`);
        }
    }, []);

    const reloadParticipant = () => {
        router.reload({ only: ['participant'] });
        setHistoryKey((key) => key + 1);
    };

    const handleStatusChange = (status) => {
        form.setData({
            ...form.data,
            status,
            nis_nip: isNonPermanentStatus(status)
                ? '-'
                : form.data.nis_nip === '-' ? '' : form.data.nis_nip,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        form.put(route('participants.update', participant.id), {
            preserveScroll: true,
            onSuccess: () => form.setDefaults(),
        });
    };

    const handleResetQr = async () => {
        const confirmed = await confirm({
            title: 'Reset QR Peserta',
            message: `QR lama milik "${participant.nama}" tidak akan berlaku lagi di scanner. Gunakan bila QR diduga dipakai orang lain. Lanjutkan?`,
            type: 'danger',
            confirmText: 'Ya, Reset QR',
            cancelText: 'Batal',
        });
        if (confirmed) {
            router.post(route('participants.qr.regenerate', participant.id), {}, { preserveScroll: true });
        }
    };

    const handleDelete = async () => {
        const confirmed = await confirm({
            title: 'Hapus Peserta',
            message: `Apakah Anda yakin ingin menghapus peserta "${participant.nama}"? Data yang dihapus tidak dapat dikembalikan.`,
            type: 'danger',
            confirmText: 'Ya, Hapus',
            cancelText: 'Batal',
        });
        if (confirmed) {
            router.delete(route('participants.destroy', participant.id));
        }
    };

    const handlePrintQr = () => {
        const printWindow = window.open('', '_blank', 'width=500,height=600');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>QR Code - ${participant.nama}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #fff; }
                    .card { text-align: center; padding: 40px; border: 2px solid #e5e7eb; border-radius: 16px; max-width: 400px; }
                    .card h2 { font-size: 20px; color: #1e1b4b; margin-bottom: 4px; }
                    .card p { font-size: 14px; color: #2f9338; margin-bottom: 20px; font-weight: 600; }
                    .card img { width: 280px; height: 280px; margin: 0 auto 16px; display: block; }
                    .card .school { font-size: 11px; color: #9ca3af; margin-top: 12px; }
                    @media print {
                        body { background: #fff; }
                        .card { border: none; }
                    }
                </style>
            </head>
            <body>
                <div class="card">
                    <h2>${participant.nama}</h2>
                    <p>${participant.nis_nip}</p>
                    <img src="${route('participants.qr', participant.id)}" alt="QR Code" />
                    <div class="school">E-Presensi SMABA</div>
                </div>
                <script>
                    window.onload = function() {
                        setTimeout(function() { window.close(); }, 1500);
                        window.print();
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    const [faceTone, faceLabel] = faceStatusInfo(participant);
    const needsReview = Boolean(participant.pending_photo_change_request) || participant.face_status === 'pending';
    const inputClass = 'w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20';

    return (
        <AuthenticatedLayout>
            <Head title={`Detail Peserta - ${participant.nama}`} />

            <div className="flex w-full flex-col px-4 py-2 pb-8 sm:px-6">
                {/* Judul halaman */}
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between" data-aos="fade-up">
                    <div className="min-w-0">
                        <Link href={route('participants.index')} className="inline-flex items-center gap-1 text-xs font-medium text-neutral-500 transition-colors hover:text-brand-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                            Data Peserta
                        </Link>
                        <h3 className="mt-1 truncate text-xl font-bold text-neutral-800">Detail Peserta</h3>
                        <p className="mt-0.5 text-sm text-neutral-500">Kelola data, QR presensi, dan wajah peserta.</p>
                    </div>
                </div>

                {needsReview && (
                    <div className="mb-4 flex flex-col gap-3 rounded-lg bg-gradient-to-b from-amber-400 to-orange-500 p-4 text-sm text-white shadow-soft sm:flex-row sm:items-center sm:justify-between" role="status" data-aos="fade-up">
                        <p>
                            {participant.pending_photo_change_request
                                ? <><strong className="font-semibold">Foto wajah baru</strong> menunggu verifikasi.</>
                                : <><strong className="font-semibold">Pendaftaran wajah</strong> menunggu persetujuan.</>}
                        </p>
                        <div className="flex gap-2">
                            {participant.pending_photo_change_request && (
                                <button type="button" onClick={() => setApprovePhotoOpen(true)} className="rounded-md border border-white/70 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white hover:text-orange-600">
                                    Verifikasi foto
                                </button>
                            )}
                            {participant.face_status === 'pending' && (
                                <button type="button" onClick={() => setApproveFaceOpen(true)} className="rounded-md border border-white/70 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white hover:text-orange-600">
                                    Tinjau wajah
                                </button>
                            )}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    {/* Kolom kiri: profil & QR */}
                    <div className="space-y-4">
                        <section className="card-soft p-5" data-aos="fade-up">
                            <div className="flex items-center gap-4">
                                <Avatar participant={participant} />
                                <div className="min-w-0">
                                    <p className="text-base font-bold text-neutral-800">{participant.nama}</p>
                                    <p className="mt-0.5 text-xs font-medium text-neutral-500">{participant.nis_nip}</p>
                                    {participant.status && (
                                        <span className="mt-1.5 inline-flex rounded-md bg-gradient-to-b from-neutral-500 to-neutral-700 px-2 py-0.5 text-[10px] font-bold uppercase leading-4 text-white">
                                            {participant.status}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <dl className="mt-5 space-y-2.5 border-t border-neutral-100 pt-4 text-sm">
                                <InfoRow label="Status wajah">
                                    <span className="inline-flex items-center gap-1.5">
                                        <span className={`h-1.5 w-1.5 rounded-full ${faceTone}`} />
                                        {faceLabel}
                                    </span>
                                </InfoRow>
                                <InfoRow label="Total presensi">{participant.attendances_count} kali</InfoRow>
                                <InfoRow label="Akun login">{participant.account?.username ?? 'Tidak ada'}</InfoRow>
                                <InfoRow label="Perangkat">{participant.account?.device_model ?? 'Belum terkunci'}</InfoRow>
                                <InfoRow label="Didaftarkan">{participant.created_at}</InfoRow>
                            </dl>
                        </section>

                        <section className="card-soft p-5" data-aos="fade-up" data-aos-delay="50">
                            <h6 className="text-base font-semibold text-neutral-800">QR Code Presensi</h6>
                            <p className="mt-0.5 text-xs text-neutral-500">Dipakai untuk presensi scan QR.</p>
                            <img
                                src={`${route('participants.qr', participant.id)}?v=${encodeURIComponent(participant.qr_token ?? '')}`}
                                alt={`QR Code - ${participant.nama}`}
                                className="mx-auto mt-4 h-44 w-44 rounded-md border border-neutral-200 bg-white p-2"
                            />
                            <div className="mt-4 flex gap-2">
                                <button type="button" onClick={() => window.open(route('participants.download.svg', participant.id), '_blank')} className="btn-soft flex-1 justify-center">
                                    Download
                                </button>
                                <button type="button" onClick={handlePrintQr} className="btn-brand flex-1 justify-center">
                                    Cetak
                                </button>
                            </div>
                            <button type="button" onClick={handleResetQr} className="mt-2 w-full rounded-md border border-rose-200 bg-white px-2 py-2 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50">
                                Reset QR (QR lama tidak berlaku)
                            </button>
                        </section>
                    </div>

                    {/* Kolom kanan: edit, wajah, riwayat, hapus */}
                    <div className="space-y-4 lg:col-span-2">
                        <section className="card-soft p-5" data-aos="fade-up" data-aos-delay="50">
                            <h6 className="text-base font-semibold text-neutral-800">Edit Data Peserta</h6>
                            <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label htmlFor="nama" className="mb-1 block text-sm font-bold text-slate-600">Nama Lengkap</label>
                                    <input id="nama" type="text" value={form.data.nama} onChange={(e) => form.setData('nama', e.target.value)} className={inputClass} placeholder="Masukkan nama lengkap" required />
                                    {form.errors.nama && <p className="mt-1 text-xs font-bold text-red-600">{form.errors.nama}</p>}
                                </div>
                                <div>
                                    <label htmlFor="nis_nip" className="mb-1 block text-sm font-bold text-slate-600">NIP</label>
                                    <input
                                        id="nis_nip"
                                        type="text"
                                        value={form.data.nis_nip}
                                        onChange={(e) => form.setData('nis_nip', e.target.value)}
                                        readOnly={isNonPermanentStatus(form.data.status)}
                                        className={`${inputClass} ${isNonPermanentStatus(form.data.status) ? 'cursor-not-allowed !bg-slate-100' : ''}`}
                                        placeholder="Masukkan NIP"
                                        required={!isNonPermanentStatus(form.data.status)}
                                    />
                                    {form.errors.nis_nip && <p className="mt-1 text-xs font-bold text-red-600">{form.errors.nis_nip}</p>}
                                    {isNonPermanentStatus(form.data.status) && (
                                        <p className="mt-1 text-[11px] font-semibold text-slate-500">NIP otomatis diisi "-" untuk GTT/PTT.</p>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="status" className="mb-1 block text-sm font-bold text-slate-600">Status Pegawai</label>
                                    <select id="status" value={form.data.status} onChange={(e) => handleStatusChange(e.target.value)} className={inputClass}>
                                        <option value="">-- Pilih Status --</option>
                                        {EMPLOYMENT_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                                    </select>
                                    {form.errors.status && <p className="mt-1 text-xs font-bold text-red-600">{form.errors.status}</p>}
                                </div>
                                <div className="flex justify-end gap-2 sm:col-span-2">
                                    <button type="button" disabled={!form.isDirty || form.processing} onClick={() => { form.reset(); form.clearErrors(); }} className="btn-soft disabled:opacity-50">
                                        Batalkan
                                    </button>
                                    <button type="submit" disabled={!form.isDirty || form.processing} className="btn-brand disabled:opacity-50">
                                        {form.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                    </button>
                                </div>
                            </form>
                        </section>

                        <section className="card-soft p-5" data-aos="fade-up" data-aos-delay="100">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <h6 className="text-base font-semibold text-neutral-800">Wajah Peserta</h6>
                                    <p className="mt-0.5 text-xs text-neutral-500">Riwayat wajah yang pernah disetujui admin, terbaru di atas.</p>
                                </div>
                                {participant.face_status !== 'pending' && (
                                    <button type="button" onClick={() => setFaceRegistrationOpen(true)} className="btn-soft shrink-0">
                                        {participant.face_status === 'approved' ? 'Perbarui Wajah' : 'Registrasi Wajah'}
                                    </button>
                                )}
                            </div>
                            <div className="mt-4 max-h-[420px] overflow-y-auto border-t border-neutral-100 pt-4">
                                <FaceHistoryPanel participant={participant} reloadKey={historyKey} />
                            </div>
                        </section>

                        <section className="card-soft border border-rose-100 p-5" data-aos="fade-up" data-aos-delay="150">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h6 className="text-base font-semibold text-rose-600">Hapus Peserta</h6>
                                    <p className="mt-0.5 text-xs text-neutral-500">Data peserta dan akun login-nya dihapus permanen, tidak dapat dikembalikan.</p>
                                </div>
                                <button type="button" onClick={handleDelete} className="shrink-0 rounded-md bg-gradient-to-b from-rose-400 to-rose-600 px-4 py-2 text-sm font-medium text-white shadow-dark-sm transition-shadow hover:shadow-dark-hover">
                                    Hapus Peserta
                                </button>
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            {faceRegistrationOpen && (
                <FaceRegistrationModal
                    participant={participant}
                    onClose={() => setFaceRegistrationOpen(false)}
                    onSuccess={() => {
                        setFaceRegistrationOpen(false);
                        reloadParticipant();
                    }}
                />
            )}

            {approveFaceOpen && (
                <ApproveFaceModal
                    participant={participant}
                    onClose={() => setApproveFaceOpen(false)}
                    onSuccess={() => {
                        setApproveFaceOpen(false);
                        reloadParticipant();
                    }}
                />
            )}

            {approvePhotoOpen && participant.pending_photo_change_request && (
                <ApprovePhotoChangeRequestModal
                    participant={participant}
                    onClose={() => setApprovePhotoOpen(false)}
                    onSuccess={() => {
                        setApprovePhotoOpen(false);
                        reloadParticipant();
                    }}
                />
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </AuthenticatedLayout>
    );
}

function InfoRow({ label, children }) {
    return (
        <div className="flex items-start justify-between gap-3">
            <dt className="shrink-0 text-neutral-500">{label}</dt>
            <dd className="min-w-0 text-right font-medium text-neutral-800">{children}</dd>
        </div>
    );
}

function Avatar({ participant }) {
    const [failed, setFailed] = useState(false);

    return participant.photo_url && !failed ? (
        <img src={participant.photo_url} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" onError={() => setFailed(true)} />
    ) : (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-brand-gradient text-xl font-semibold text-white">
            {participant.nama.charAt(0).toUpperCase()}
        </div>
    );
}
