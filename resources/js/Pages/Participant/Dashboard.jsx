import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import LeaveRequestModal from '@/Components/LeaveRequestModal';
import SelfFaceRegistrationModal from '@/Components/SelfFaceRegistrationModal';
import { Button, Card, Dialog, PageHeader, cx } from '@/ui';
import { Head, Link, usePage } from '@inertiajs/react';
import { AlertTriangle, CalendarClock, CheckCircle2, ChevronRight, Download, FileClock, FilePlus2, Hourglass, QrCode, ScanFace, XCircle } from 'lucide-react';
import { useState } from 'react';

/** Isi kartu wajah per status: ikon, warna ikon, judul, penjelasan, dan tombol (bila perlu). */
const FACE = {
    approved: { icon: CheckCircle2, tone: 'text-status-hadir', title: 'Wajah terdaftar', body: 'Presensi wajah lewat aplikasi PRESENSI SMABA di HP Anda, di area sekolah.' },
    pending: { icon: Hourglass, tone: 'text-status-telat', title: 'Wajah menunggu persetujuan', body: 'Admin sedang memeriksa foto wajah Anda. Presensi wajah aktif setelah disetujui.' },
    rejected: { icon: XCircle, tone: 'text-status-alpha', title: 'Wajah ditolak', body: 'Foto wajah sebelumnya belum memenuhi syarat. Daftar ulang dengan wajah menghadap lurus ke kamera dan cahaya cukup.', action: 'Daftar ulang wajah' },
    none: { icon: ScanFace, tone: 'text-ink-2', title: 'Wajah belum terdaftar', body: 'Daftarkan wajah agar bisa presensi wajah lewat aplikasi Android.', action: 'Daftarkan wajah' },
};

export default function ParticipantDashboard({ activeWorkcode, participant }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const [leaveOpen, setLeaveOpen] = useState(false);
    const [faceOpen, setFaceOpen] = useState(false);
    const [qrOpen, setQrOpen] = useState(false);

    const today = new Date().toISOString().split('T')[0];
    const face = FACE[participant?.face_status] ?? FACE.none;
    const FaceIcon = face.icon;
    const name = participant?.nama || user.name;

    return (
        <AuthenticatedLayout>
            <Head title="Beranda" />

            <div className="space-y-6">
                <PageHeader
                    title={`Halo, ${name}`}
                    description={participant ? [participant.nis_nip && participant.nis_nip !== '-' ? participant.nis_nip : null, participant.status].filter(Boolean).join(' · ') : undefined}
                />

                {!participant && (
                    <p className="flex items-start gap-3 rounded-xl border border-status-telat/30 bg-status-telat-soft p-4 text-sm text-ink" role="alert">
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-status-telat" aria-hidden="true" />
                        Akun Anda belum terhubung ke data peserta. Hubungi admin sekolah.
                    </p>
                )}

                {/* Presensi hari ini */}
                <Card animate className="p-5">
                    <p className="text-sm text-ink-2">Presensi hari ini</p>
                    {activeWorkcode ? (
                        <>
                            <p className="mt-1 font-display text-xl font-semibold text-ink">{activeWorkcode.nama_workcode}</p>
                            <p className="mt-1 text-sm text-ink-2">
                                Presensi lewat aplikasi Android dengan wajah, atau pindai QR kegiatan yang ditampilkan panitia.
                            </p>
                        </>
                    ) : (
                        <p className="mt-1 flex items-center gap-2 text-base font-medium text-ink">
                            <CalendarClock className="h-5 w-5 text-ink-3" aria-hidden="true" />
                            Belum ada presensi yang dibuka
                        </p>
                    )}
                </Card>

                {/* Status wajah */}
                {participant && (
                    <Card animate className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                        <FaceIcon className={cx('h-8 w-8 shrink-0', face.tone)} strokeWidth={1.75} aria-hidden="true" />
                        <div className="min-w-0 flex-1">
                            <p className="font-semibold text-ink">{face.title}</p>
                            <p className="mt-0.5 text-sm text-ink-2">{face.body}</p>
                        </div>
                        {face.action && <Button variant="primary" icon={ScanFace} onClick={() => setFaceOpen(true)}>{face.action}</Button>}
                    </Card>
                )}

                {/* Aksi */}
                <Card as="nav" animate aria-label="Aksi peserta" className="divide-y divide-line overflow-hidden">
                    <ActionRow
                        icon={FilePlus2}
                        title="Ajukan izin"
                        description={activeWorkcode ? 'Sakit, dinas, cuti, atau berhalangan lain' : 'Bisa diajukan saat ada presensi yang dibuka'}
                        onClick={() => setLeaveOpen(true)}
                        disabled={!activeWorkcode}
                    />
                    <ActionRow icon={FileClock} title="Riwayat izin" description="Status pengajuan Anda" href={route('leave.history')} />
                    {participant && <ActionRow icon={QrCode} title="QR presensi saya" description="Ditunjukkan ke petugas scanner" onClick={() => setQrOpen(true)} />}
                </Card>
            </div>

            {activeWorkcode && (
                <LeaveRequestModal show={leaveOpen} onClose={() => setLeaveOpen(false)} workcodeId={activeWorkcode.id} tanggal={today} />
            )}

            {faceOpen && <SelfFaceRegistrationModal participant={participant} onClose={() => setFaceOpen(false)} />}

            {/* QR presensi pribadi: hanya pemilik/admin yang bisa memuat gambarnya */}
            {participant && (
                <Dialog
                    open={qrOpen}
                    onClose={() => setQrOpen(false)}
                    title="QR presensi saya"
                    description={participant.nama}
                    size="sm"
                    footer={
                        <>
                            <Button onClick={() => setQrOpen(false)}>Tutup</Button>
                            <Button variant="primary" icon={Download} href={route('participants.download.png', participant.id)} external>Unduh</Button>
                        </>
                    }
                >
                    {/* QR selalu di atas putih agar terbaca kamera di mode gelap. */}
                    <div className="mx-auto w-fit rounded-xl bg-white p-4">
                        <img src={route('participants.qr', participant.id)} alt="QR presensi" className="h-52 w-52" />
                    </div>
                    <p className="mt-4 text-sm text-ink-2">
                        Tunjukkan QR ini ke petugas scanner. <span className="font-medium text-ink">Jangan dibagikan</span>: siapa pun yang memegang QR ini bisa dipresensikan atas nama Anda.
                    </p>
                </Dialog>
            )}
        </AuthenticatedLayout>
    );
}

function ActionRow({ icon: Icon, title, description, href, onClick, disabled = false }) {
    const content = (
        <>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-2 text-ink-2">
                <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
                <span className="block font-medium text-ink">{title}</span>
                <span className="block text-sm text-ink-2">{description}</span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-ink-3" aria-hidden="true" />
        </>
    );
    const className = 'flex min-h-16 w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-surface-2/60 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent';

    return href
        ? <Link href={href} className={className}>{content}</Link>
        : <button type="button" onClick={onClick} disabled={disabled} className={className}>{content}</button>;
}
