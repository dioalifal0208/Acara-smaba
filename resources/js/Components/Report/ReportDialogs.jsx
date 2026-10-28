import { Button, Dialog, Field, Input, Select, StatusPill, cx } from '@/ui';
import { usePage } from '@inertiajs/react';
import { CalendarDays, ClipboardList, ImageOff, Pencil, Printer, Trash2 } from 'lucide-react';
import { useState } from 'react';

export const formatAttendanceDate = (date) => (date
    ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${date}T00:00:00`))
    : '–');

/** Status kehadiran dari server (hadir/alpha/izin/sakit/lupa_absen/libur) sebagai StatusPill. */
export function AttendanceStatus({ status, late = false }) {
    if (!status) return <span className="text-ink-3">–</span>;
    return <StatusPill status={status === 'hadir' && late ? 'terlambat' : status} />;
}

/** Detail satu presensi kegiatan: bukti (foto wajah / tanda tangan), waktu, status, metode. */
export function ProofDialog({ attendance, workcode, onClose }) {
    const isFace = Boolean(attendance?.face_capture_url);

    return (
        <Dialog open={Boolean(attendance)} onClose={onClose} title="Detail presensi" description={workcode?.nama_workcode} size="lg">
            {attendance && (
                <div className="space-y-4">
                    {(attendance.face_capture_url || attendance.signature_url) && (
                        <figure className="rounded-xl border border-line bg-surface-2 p-3 text-center">
                            <img
                                src={attendance.face_capture_url || attendance.signature_url}
                                alt={`${isFace ? 'Foto presensi wajah' : 'Tanda tangan'} ${attendance.nama}`}
                                className={cx('mx-auto max-h-56 w-full max-w-md rounded-lg border border-line bg-white', isFace ? 'object-cover' : 'object-contain p-2')}
                            />
                            <figcaption className="mt-2 text-xs text-ink-2">{isFace ? 'Foto presensi wajah' : 'Tanda tangan digital'}</figcaption>
                        </figure>
                    )}

                    <div>
                        <p className="text-base font-semibold text-ink">{attendance.nama}</p>
                        <p className="text-sm tabular-nums text-ink-2">{attendance.nis_nip || 'Tanpa NIP'} · {attendance.status_pegawai || '–'}</p>
                    </div>

                    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                        <Info label="Tanggal">{formatAttendanceDate(attendance.tanggal)}</Info>
                        <Info label="Status"><AttendanceStatus status={attendance.status} /></Info>
                        <Info label="Waktu hadir">{attendance.waktu_hadir !== '-' ? `${attendance.waktu_hadir} WIB` : '–'}</Info>
                        <Info label="Waktu pulang">{attendance.waktu_pulang && attendance.waktu_pulang !== '-' ? `${attendance.waktu_pulang} WIB` : '–'}</Info>
                        <Info label="Metode">{attendance.attendance_method || '–'}</Info>
                        {workcode?.latitude && workcode?.longitude && <Info label="Radius lokasi">{workcode.radius_meters || 100} m</Info>}
                    </dl>
                </div>
            )}
        </Dialog>
    );
}

/** Pilihan untuk satu peserta di rekap harian: kalender, log presensi, atau cetak rekap individu. */
export function ParticipantActionsDialog({ attendance, onClose, onCalendar, onLogs, onPrint }) {
    const actions = [
        { icon: CalendarDays, label: 'Kalender', desc: 'Kalender sebulan, tambah atau ubah presensi', onClick: onCalendar },
        { icon: ClipboardList, label: 'Log presensi', desc: 'Riwayat presensi dan foto wajah hasil scan', onClick: onLogs },
        { icon: Printer, label: 'Cetak rekap', desc: 'Rekap individu bulan ini, bertanda tangan', onClick: onPrint },
    ];

    return (
        <Dialog
            open={Boolean(attendance)}
            onClose={onClose}
            title={attendance?.nama ?? ''}
            description={attendance ? `${attendance.nis_nip || 'Tanpa NIP'} · ${attendance.status_pegawai || '–'}` : undefined}
            size="md"
        >
            <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line">
                {actions.map(({ icon: Icon, label, desc, onClick }) => (
                    <li key={label}>
                        <button type="button" onClick={() => onClick(attendance)} className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-2/60">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-2 text-ink-2">
                                <Icon className="h-5 w-5" aria-hidden="true" />
                            </span>
                            <span className="min-w-0">
                                <span className="block text-sm font-medium text-ink">{label}</span>
                                <span className="block text-sm text-ink-2">{desc}</span>
                            </span>
                        </button>
                    </li>
                ))}
            </ul>
        </Dialog>
    );
}

/** Ubah satu catatan presensi (tanggal, status, jam). Kegiatan sekali hanya punya satu jam. */
export function ManualEditDialog({ open, onClose, form, participantName, singleAttendance, onSubmit }) {
    const { data, setData, errors, processing } = form;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            title="Ubah presensi"
            description={participantName}
            size="md"
            footer={
                <>
                    <Button onClick={onClose}>Batal</Button>
                    <Button variant="primary" type="submit" form="manual-edit" loading={processing}>Simpan perubahan</Button>
                </>
            }
        >
            <form id="manual-edit" onSubmit={onSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Tanggal" required error={errors.tanggal}>
                        <Input type="date" value={data.tanggal} onChange={(e) => setData('tanggal', e.target.value)} />
                    </Field>
                    <Field label="Status" required error={errors.status}>
                        <Select value={data.status} onChange={(e) => setData('status', e.target.value)}>
                            <option value="hadir">Hadir</option>
                            <option value="izin">Izin</option>
                            <option value="sakit">Sakit</option>
                            <option value="lupa_absen">Lupa absen</option>
                            <option value="alpha">Alpha</option>
                        </Select>
                    </Field>
                </div>
                {data.status !== 'alpha' && (
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label={singleAttendance ? 'Jam presensi' : 'Jam datang'} error={errors.jam_masuk}>
                            <Input type="time" value={data.jam_masuk} onChange={(e) => setData('jam_masuk', e.target.value)} />
                        </Field>
                        {!singleAttendance && (
                            <Field label="Jam pulang" error={errors.jam_pulang}>
                                <Input type="time" value={data.jam_pulang} onChange={(e) => setData('jam_pulang', e.target.value)} />
                            </Field>
                        )}
                    </div>
                )}
            </form>
        </Dialog>
    );
}

/** Log presensi seorang peserta (rekap harian) dengan foto wajah datang/pulang. */
export function LogsDialog({ open, onClose, participant, loading, onOpenCalendar, onEdit, onDelete }) {
    const [preview, setPreview] = useState(null);
    const logs = participant?.attendances ?? [];
    const close = () => {
        setPreview(null);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={close}
            title={participant ? `Log presensi ${participant.nama}` : 'Log presensi'}
            description={participant ? `${participant.nis_nip || 'Tanpa NIP'} · ${participant.status_pegawai || '–'}` : undefined}
            size="4xl"
            footer={
                <>
                    <Button icon={CalendarDays} onClick={onOpenCalendar} className="sm:mr-auto">Buka kalender</Button>
                    <Button variant="primary" onClick={close}>Tutup</Button>
                </>
            }
        >
            {loading ? (
                <p className="py-12 text-center text-sm text-ink-2">Memuat riwayat presensi…</p>
            ) : logs.length === 0 ? (
                <p className="py-12 text-center text-sm text-ink-2">Belum ada catatan presensi. Tambahkan lewat kalender.</p>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-line">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-surface-2/60 text-xs text-ink-2">
                            <tr>
                                <th scope="col" className="px-4 py-2.5 font-medium">Tanggal</th>
                                <th scope="col" className="px-4 py-2.5 font-medium">Datang</th>
                                <th scope="col" className="px-4 py-2.5 font-medium">Pulang</th>
                                <th scope="col" className="px-4 py-2.5 font-medium">Status</th>
                                <th scope="col" className="px-4 py-2.5 font-medium">Foto wajah</th>
                                <th scope="col" className="px-4 py-2.5 text-right font-medium"><span className="sr-only">Aksi</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-line">
                            {logs.map((att, idx) => {
                                const date = att.tanggal_formatted || att.tanggal || '–';
                                const time = (jam, waktu) => (att.status === 'libur' ? '–' : jam ? jam : waktu && waktu !== '-' ? waktu : '–');
                                return (
                                    <tr key={att.id || idx}>
                                        <td className="whitespace-nowrap px-4 py-2.5 font-medium text-ink">{date}</td>
                                        <td className="px-4 py-2.5 tabular-nums text-ink">{time(att.jam_masuk, att.waktu_hadir)}</td>
                                        <td className="px-4 py-2.5 tabular-nums text-ink">{time(att.jam_pulang, att.waktu_pulang)}</td>
                                        <td className="px-4 py-2.5"><AttendanceStatus status={att.status} late={att.is_late} /></td>
                                        <td className="px-4 py-2">
                                            <div className="flex gap-1.5">
                                                {[
                                                    { url: att.face_capture_url, label: 'Datang', time: att.jam_masuk },
                                                    { url: att.face_capture_pulang_url, label: 'Pulang', time: att.jam_pulang },
                                                ].map((shot) => (
                                                    <FaceThumb key={shot.label} {...shot} expired={att.media_expired} onOpen={() => setPreview({ ...shot, tanggal: date })} />
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-2">
                                            <div className="flex justify-end gap-1">
                                                <IconAction icon={Pencil} label={`Ubah presensi ${date}`} onClick={() => onEdit(att)} />
                                                <IconAction icon={Trash2} label={`Hapus presensi ${date}`} onClick={() => onDelete(att, date)} danger />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <Dialog
                open={Boolean(preview)}
                onClose={() => setPreview(null)}
                title={preview ? `Foto wajah ${preview.label.toLowerCase()}` : ''}
                description={preview ? `${participant?.nama ?? ''} · ${preview.tanggal}${preview.time ? ` · ${preview.time} WIB` : ''}` : undefined}
                size="sm"
            >
                {preview && <img src={preview.url} alt={`Foto wajah ${preview.label.toLowerCase()} ${participant?.nama ?? ''}`} className="aspect-[3/4] w-full rounded-lg border border-line bg-surface-2 object-cover" />}
            </Dialog>
        </Dialog>
    );
}

/** Gambar mini bukti presensi (foto wajah atau tanda tangan) yang membuka detail. */
export function ProofThumb({ attendance, onOpen }) {
    const { mediaRetentionDays = 30 } = usePage().props;
    const src = attendance.face_capture_url || attendance.signature_url;

    if (!src) {
        return attendance.media_expired
            ? <span className="text-xs text-ink-2" title={`Foto & tanda tangan presensi hanya disimpan ${mediaRetentionDays} hari`}>Bukti kedaluwarsa</span>
            : <span className="text-ink-3">–</span>;
    }

    return (
        <button type="button" onClick={onOpen} aria-label={`Lihat bukti presensi ${attendance.nama}`} className="inline-flex rounded-md border border-line bg-white">
            <img src={src} alt="" loading="lazy" decoding="async" className="h-9 w-20 rounded-md object-contain" />
        </button>
    );
}

function FaceThumb({ url, label, expired = false, onOpen }) {
    const [failed, setFailed] = useState(false);
    const { mediaRetentionDays = 30 } = usePage().props;

    if (!url || failed) {
        const reason = failed ? 'File hilang' : expired ? `Lewat ${mediaRetentionDays} hari` : 'Tidak ada';
        return (
            <span className="flex h-12 w-12 flex-col items-center justify-center rounded-md border border-dashed border-line-strong text-center text-xs leading-tight text-ink-2" title={`Foto ${label.toLowerCase()}: ${reason.toLowerCase()}`}>
                {failed || expired ? <ImageOff className="h-4 w-4" aria-hidden="true" /> : label}
                <span className="sr-only">Foto {label.toLowerCase()}: {reason}</span>
            </span>
        );
    }

    return (
        <button type="button" onClick={onOpen} aria-label={`Lihat foto wajah ${label.toLowerCase()}`} className="relative overflow-hidden rounded-md border border-line">
            <img src={url} alt="" loading="lazy" onError={() => setFailed(true)} className="h-12 w-12 bg-surface-2 object-cover" />
            <span className="absolute inset-x-0 bottom-0 bg-black/60 text-center text-xs font-medium leading-4 text-white" aria-hidden="true">{label}</span>
        </button>
    );
}

function IconAction({ icon: Icon, label, onClick, danger = false }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            title={label}
            className={cx('inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors', danger ? 'text-ink-2 hover:bg-danger-soft hover:text-danger' : 'text-ink-2 hover:bg-surface-2 hover:text-ink')}
        >
            <Icon className="h-4 w-4" aria-hidden="true" />
        </button>
    );
}

function Info({ label, children }) {
    return (
        <div>
            <dt className="text-ink-2">{label}</dt>
            <dd className="mt-0.5 font-medium text-ink">{children}</dd>
        </div>
    );
}
