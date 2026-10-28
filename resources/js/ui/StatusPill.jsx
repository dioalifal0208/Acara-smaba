import { AlarmClock, Ban, CalendarOff, Check, CircleDashed, Clock, FileText, HeartPulse, Hourglass, X } from 'lucide-react';
import { cx } from './cx';

const tones = {
    hadir: 'bg-status-hadir-soft text-status-hadir',
    telat: 'bg-status-telat-soft text-status-telat',
    izin: 'bg-status-izin-soft text-status-izin',
    alpha: 'bg-status-alpha-soft text-status-alpha',
    netral: 'bg-surface-2 text-ink-2',
};

/**
 * Status presensi & verifikasi. Setiap status punya warna, ikon, dan teks sekaligus, sehingga
 * tidak bergantung pada warna saja.
 */
export const STATUS = {
    hadir: { tone: 'hadir', icon: Check, label: 'Hadir' },
    terlambat: { tone: 'telat', icon: Clock, label: 'Terlambat' },
    izin: { tone: 'izin', icon: FileText, label: 'Izin' },
    sakit: { tone: 'izin', icon: HeartPulse, label: 'Sakit' },
    alpha: { tone: 'alpha', icon: X, label: 'Alpha' },
    lupa_absen: { tone: 'telat', icon: AlarmClock, label: 'Lupa absen' },
    libur: { tone: 'netral', icon: CalendarOff, label: 'Libur' },
    belum: { tone: 'netral', icon: CircleDashed, label: 'Belum hadir' },
    pending: { tone: 'telat', icon: Hourglass, label: 'Menunggu' },
    approved: { tone: 'hadir', icon: Check, label: 'Disetujui' },
    rejected: { tone: 'alpha', icon: Ban, label: 'Ditolak' },
};

export default function StatusPill({ status, label, tone, icon, className }) {
    const preset = STATUS[status] ?? { tone: 'netral', icon: null, label: status };
    const Icon = icon ?? preset.icon;

    return (
        <span className={cx('inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium', tones[tone ?? preset.tone], className)}>
            {Icon && <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
            {label ?? preset.label}
        </span>
    );
}

/** Badge angka kecil (misal jumlah menunggu di menu). */
export function CountBadge({ count, className }) {
    if (!count) return null;

    return (
        <span className={cx('min-w-5 rounded-full bg-danger px-1.5 text-center text-xs font-semibold leading-5 text-surface', className)}>
            {count > 99 ? '99+' : count}
        </span>
    );
}
