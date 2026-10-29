import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import LeaveRequestModal from '@/Components/LeaveRequestModal';
import MyQrDialog from '@/Components/MyQrDialog';
import SelfFaceRegistrationModal from '@/Components/SelfFaceRegistrationModal';
import { Button, Card, PageHeader, StatusPill, cx } from '@/ui';
import { Head, Link, usePage } from '@inertiajs/react';
import { AlertTriangle, CalendarClock, CheckCircle2, ChevronRight, FileClock, FilePlus2, Hourglass, QrCode, ScanFace, XCircle } from 'lucide-react';
import { useState } from 'react';

/** Isi kartu wajah per status: ikon, warna ikon, judul, penjelasan, dan tombol (bila perlu). */
const FACE = {
    approved: { icon: CheckCircle2, tone: 'text-status-hadir', title: 'Wajah terdaftar', body: 'Presensi wajah lewat aplikasi PRESENSI SMABA di HP Anda, di area sekolah.' },
    pending: { icon: Hourglass, tone: 'text-status-telat', title: 'Wajah menunggu persetujuan', body: 'Admin sedang memeriksa foto wajah Anda. Presensi wajah aktif setelah disetujui.' },
    rejected: { icon: XCircle, tone: 'text-status-alpha', title: 'Wajah ditolak', body: 'Foto wajah sebelumnya belum memenuhi syarat. Daftar ulang dengan wajah menghadap lurus ke kamera dan cahaya cukup.', action: 'Daftar ulang wajah' },
    none: { icon: ScanFace, tone: 'text-ink-2', title: 'Wajah belum terdaftar', body: 'Daftarkan wajah agar bisa presensi wajah lewat aplikasi Android.', action: 'Daftarkan wajah' },
};

export default function ParticipantDashboard({ activeWorkcode, participant, today, todayAttendances = [], schedule, leaveWorkcodes = [] }) {
    const { auth } = usePage().props;
    const user = auth.user;
    // ?izin=1 (tombol "Ajukan lagi" di Riwayat izin) langsung membuka formulir izin.
    const [leaveOpen, setLeaveOpen] = useState(() => typeof window !== 'undefined'
        && new URLSearchParams(window.location.search).get('izin') === '1' && leaveWorkcodes.length > 0);
    const [faceOpen, setFaceOpen] = useState(false);
    const [qrOpen, setQrOpen] = useState(false);

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

                <TodayCard today={today} schedule={schedule} attendances={todayAttendances} activeWorkcode={activeWorkcode} />

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
                        description={leaveWorkcodes.length ? 'Sakit, dinas, cuti, atau berhalangan lain' : 'Belum ada presensi yang bisa diajukan izin'}
                        onClick={() => setLeaveOpen(true)}
                        disabled={!leaveWorkcodes.length}
                    />
                    <ActionRow icon={FileClock} title="Riwayat izin" description="Status pengajuan Anda" href={route('leave.history')} />
                    {participant && <ActionRow icon={QrCode} title="QR presensi saya" description="Ditunjukkan ke petugas scanner" onClick={() => setQrOpen(true)} />}
                </Card>
            </div>

            {leaveWorkcodes.length > 0 && (
                <LeaveRequestModal show={leaveOpen} onClose={() => setLeaveOpen(false)} workcodes={leaveWorkcodes} tanggal={today} />
            )}

            {faceOpen && <SelfFaceRegistrationModal participant={participant} onClose={() => setFaceOpen(false)} />}

            {participant && <MyQrDialog open={qrOpen} onClose={() => setQrOpen(false)} participantId={participant.id} name={participant.nama} />}
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

const dayLabel = (date) => new Date(`${date}T00:00:00`).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });

/**
 * Kartu utama beranda: menjawab "apakah saya sudah tercatat hari ini?". Presensi harian tampil
 * sebagai dua kotak Datang/Pulang beserta batas jamnya; presensi kegiatan hari ini di bawahnya.
 */
function TodayCard({ today, schedule, attendances, activeWorkcode }) {
    const daily = attendances.find((attendance) => attendance.harian);
    const events = attendances.filter((attendance) => !attendance.harian);
    const leave = daily && ['izin', 'sakit'].includes(daily.status);

    return (
        <Card animate className="p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <h2 className="font-display text-xl font-semibold text-ink">Hari ini</h2>
                {today && <p className="text-sm text-ink-2">{dayLabel(today)}</p>}
            </div>

            {schedule ? (
                <>
                    <p className="mt-1 text-sm text-ink-2">{schedule.nama}</p>
                    {leave ? (
                        <div className="mt-4 flex items-center gap-3 rounded-xl bg-status-izin-soft p-4">
                            <StatusPill status={daily.status} />
                            <p className="text-sm text-ink">Izin Anda hari ini sudah disetujui. Tidak perlu presensi.</p>
                        </div>
                    ) : (
                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <TimeTile
                                label="Datang"
                                time={daily?.datang}
                                done={Boolean(daily?.datang)}
                                late={daily?.terlambat}
                                hint={schedule.datang_selesai && `Tepat waktu s.d. ${schedule.datang_selesai}${schedule.ditutup ? ` · tutup ${schedule.ditutup}` : ''}`}
                            />
                            <TimeTile
                                label="Pulang"
                                time={daily?.pulang}
                                done={Boolean(daily?.pulang)}
                                hint={schedule.pulang_mulai && `Mulai ${schedule.pulang_mulai}`}
                            />
                        </div>
                    )}
                </>
            ) : (
                <p className="mt-3 flex items-center gap-2 text-sm text-ink-2">
                    <CalendarClock className="h-5 w-5 shrink-0 text-ink-3" aria-hidden="true" />
                    Tidak ada jadwal presensi Work From Office hari ini.
                </p>
            )}

            {events.length > 0 && (
                <ul className="mt-4 divide-y divide-line border-t border-line">
                    {events.map((event) => (
                        <li key={event.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                            <span className="min-w-0 truncate text-ink">{event.workcode}</span>
                            <span className="flex shrink-0 items-center gap-2">
                                {event.datang && <span className="tabular-nums text-ink-2">{event.datang}</span>}
                                <StatusPill status={event.status} />
                            </span>
                        </li>
                    ))}
                </ul>
            )}

            {activeWorkcode && activeWorkcode.kategori !== 'harian' && !events.some((event) => event.workcode === activeWorkcode.nama_workcode) && (
                <p className="mt-4 rounded-xl border border-line p-3 text-sm text-ink-2">
                    <span className="font-medium text-ink">{activeWorkcode.nama_workcode}</span> sedang dibuka. Presensi lewat aplikasi Android, atau pindai QR acara dari panitia.
                </p>
            )}
        </Card>
    );
}

/** Satu kotak jam (Datang/Pulang): jam tercatat, atau "Belum" beserta batas waktunya. */
function TimeTile({ label, time, done, late = 0, hint }) {
    return (
        <div className={cx('rounded-xl p-4', done ? (late > 0 ? 'bg-status-telat-soft' : 'bg-status-hadir-soft') : 'border border-dashed border-line-strong')}>
            <p className="text-sm text-ink-2">{label}</p>
            <p className={cx('mt-0.5 font-display text-2xl font-semibold tabular-nums', done ? 'text-ink' : 'text-ink-3')}>{done ? time : 'Belum'}</p>
            {done && late > 0 ? (
                <p className="mt-1 text-sm font-medium text-status-telat">Terlambat {late} menit</p>
            ) : done ? (
                <p className="mt-1 flex items-center gap-1 text-sm font-medium text-status-hadir"><CheckCircle2 className="h-4 w-4" aria-hidden="true" />Tercatat</p>
            ) : (
                hint && <p className="mt-1 text-sm text-ink-2">{hint}</p>
            )}
        </div>
    );
}
