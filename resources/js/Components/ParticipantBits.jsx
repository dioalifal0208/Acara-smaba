import { StatusPill, cx } from '@/ui';
import { Check } from 'lucide-react';
import { useState } from 'react';

export const EMPLOYMENT_STATUSES = ['PNS', 'PPPK', 'PPPK Paruh Waktu', 'GTT', 'PTT'];

/**
 * GTT/PTT tidak punya NIP. Server membuat ID pengganti NIP 18 digit dari tanggal lahir, TMT 2026,
 * bulan didaftarkan, dan jenis kelamin (App\Models\Participant::generateStaffId); isian NIP-nya
 * hanya-baca dan nilai yang dikirim diabaikan server.
 */
export const isNonPermanentStatus = (status) => ['GTT', 'PTT'].includes(status);

/** Label nomor induk: NIP untuk pegawai tetap, ID pengganti NIP untuk GTT/PTT. */
export const nipLabel = (status) => (isNonPermanentStatus(status) ? 'ID pengganti NIP' : 'NIP');

export const STAFF_ID_HINT = 'Dibuat otomatis saat disimpan dari tanggal lahir, TMT 2026, bulan didaftarkan, dan jenis kelamin. Dipakai sebagai username dan kata sandi awal.';

/** Nilai NIP yang tampil di form: "-" (tanpa NIP/ID) ditampilkan kosong. */
export const formNip = (value) => (value && value !== '-' ? value : '');

export const needsReview = (participant) => Boolean(participant.pending_photo_change_request) || participant.face_status === 'pending';

/**
 * Status wajah/foto peserta. Bawaan: StatusPill penuh. `quiet` (untuk daftar panjang): hanya yang
 * perlu tindakan (menunggu/ditolak) yang berupa kapsul berwarna, sisanya teks abu.
 */
export function FaceStatus({ participant, quiet = false, className }) {
    const pendingPhoto = Boolean(participant.pending_photo_change_request);
    const [status, label] = pendingPhoto
        ? ['pending', 'Foto baru menunggu']
        : {
            approved: ['approved', 'Wajah disetujui'],
            pending: ['pending', 'Wajah menunggu'],
            rejected: ['rejected', 'Wajah ditolak'],
        }[participant.face_status] ?? ['belum', 'Wajah belum terdaftar'];

    if (quiet && status === 'approved') return <QuietText icon={Check} tone="text-ink-2" className={className}>Terdaftar</QuietText>;
    if (quiet && status === 'belum') return <QuietText className={className} srLabel="Wajah belum terdaftar">Belum</QuietText>;

    return <StatusPill status={status} label={quiet && !pendingPhoto && status === 'pending' ? 'Menunggu verifikasi' : label} className={className} />;
}

function QuietText({ icon: Icon, srLabel, tone = 'text-ink-3', className, children }) {
    return (
        <span className={cx('inline-flex items-center gap-1 text-sm', tone, className)}>
            {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
            <span aria-hidden={srLabel ? 'true' : undefined}>{children}</span>
            {srLabel && <span className="sr-only">{srLabel}</span>}
        </span>
    );
}

/** Foto peserta, atau inisial bila tidak ada / gagal dimuat. */
export function ParticipantAvatar({ participant, size = 'md' }) {
    const [failed, setFailed] = useState(false);
    const box = { md: 'h-10 w-10 text-sm', lg: 'h-16 w-16 text-xl' }[size];

    return participant.photo_url && !failed ? (
        <img src={participant.photo_url} alt="" loading="lazy" decoding="async" className={cx('shrink-0 rounded-full object-cover', box)} onError={() => setFailed(true)} />
    ) : (
        <span className={cx('flex shrink-0 items-center justify-center rounded-full bg-surface-2 font-semibold text-ink-2', box)} aria-hidden="true">
            {participant.nama.charAt(0).toUpperCase()}
        </span>
    );
}
