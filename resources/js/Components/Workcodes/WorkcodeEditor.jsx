import GoogleMap from '@/Components/GoogleMap';
import { Button, cx, Dialog, Field, Input, Segmented, Textarea, useToast } from '@/ui';
import { useForm } from '@inertiajs/react';
import { LocateFixed, UserCheck, Users } from 'lucide-react';
import { Component, useState } from 'react';
import ParticipantPicker from './ParticipantPicker';
import WeekSchedule, { DAYS, DEFAULT_DAY } from './WeekSchedule';

const DEFAULT_MAP_POSITION = { lat: -6.2088, lng: 106.8456 };
const INDONESIA = { south: -11.5, north: 6.5, west: 94.5, east: 141.5 };

const inIndonesia = ({ lat, lng }) => Number.isFinite(lat) && Number.isFinite(lng)
    && lat >= INDONESIA.south && lat <= INDONESIA.north && lng >= INDONESIA.west && lng <= INDONESIA.east;

const hhmm = (value, fallback) => (typeof value === 'string' && value.length >= 5 ? value.substring(0, 5) : fallback);

const today = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 10);
};

const defaultSchedule = () => Object.fromEntries(DAYS.map((day) => [day.id, { ...DEFAULT_DAY, ...(day.id === 5 ? { jam_pulang_mulai: '16:00' } : {}) }]));

const normalizeSchedule = (schedule) => Object.fromEntries(DAYS.map((day) => {
    const times = schedule?.[day.id] ?? {};
    return [day.id, Object.fromEntries(Object.entries(DEFAULT_DAY).map(([key, fallback]) => [key, hhmm(times[key], fallback)]))];
}));

/** Isi form dari workcode yang diedit, atau bawaan untuk workcode baru. */
function initialData(workcode) {
    if (!workcode) {
        return {
            nama_workcode: '', kategori: 'workcode', tanggal: today(), jam_aktif_mulai: '07:00', jam_aktif_selesai: '10:00',
            hari_aktif: [1, 2, 3, 4, 5], ...DEFAULT_DAY, jadwal_per_hari: defaultSchedule(),
            latitude: '', longitude: '', radius_meters: 100, set_active: true, participant_ids: [], auto_participant_ids: [],
        };
    }

    return {
        nama_workcode: workcode.nama_workcode,
        kategori: workcode.kategori || 'workcode',
        tanggal: workcode.tanggal || '',
        jam_aktif_mulai: hhmm(workcode.jam_aktif_mulai, '07:00'),
        jam_aktif_selesai: hhmm(workcode.jam_aktif_selesai, '10:00'),
        hari_aktif: workcode.hari_aktif || [1, 2, 3, 4, 5],
        jam_datang_mulai: hhmm(workcode.jam_datang_mulai, DEFAULT_DAY.jam_datang_mulai),
        jam_datang_selesai: hhmm(workcode.jam_datang_selesai, DEFAULT_DAY.jam_datang_selesai),
        jam_pulang_mulai: hhmm(workcode.jam_pulang_mulai, DEFAULT_DAY.jam_pulang_mulai),
        jam_pulang_selesai: hhmm(workcode.jam_pulang_selesai, DEFAULT_DAY.jam_pulang_selesai),
        jadwal_per_hari: workcode.jadwal_per_hari ? normalizeSchedule(workcode.jadwal_per_hari) : defaultSchedule(),
        latitude: workcode.latitude || '',
        longitude: workcode.longitude || '',
        radius_meters: workcode.radius_meters || 100,
        set_active: false,
        // Stakeholder ikut tersimpan sebagai peserta di server, tetapi di form dipisah dari peserta.
        participant_ids: (workcode.participants || []).map((p) => p.id).filter((id) => !(workcode.auto_attendees || []).some((a) => a.id === id)),
        auto_participant_ids: (workcode.auto_attendees || []).map((p) => p.id),
    };
}

class MapErrorBoundary extends Component {
    state = { failed: false };

    static getDerivedStateFromError() {
        return { failed: true };
    }

    render() {
        return this.state.failed
            ? <div className="flex h-full items-center justify-center p-4 text-center text-sm text-ink-2">Peta gagal dimuat. Muat ulang halaman untuk mencoba lagi.</div>
            : this.props.children;
    }
}

function PickerRow({ icon: Icon, title, summary, error, action, actionLabel, onClick }) {
    return (
        <div className="flex items-center gap-3 rounded-xl border border-line px-3 py-2.5">
            <Icon className="h-5 w-5 shrink-0 text-ink-2" aria-hidden="true" />
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{title}</p>
                <p className="truncate text-sm text-ink-2">{summary}</p>
                {error && <p className="mt-1 text-sm text-danger">{error}</p>}
            </div>
            <Button size="sm" onClick={onClick} aria-label={actionLabel}>{action}</Button>
        </div>
    );
}

/** Buat atau ubah workcode: jenis, jadwal (kegiatan sekali / mingguan), peserta, dan titik lokasi. */
export default function WorkcodeEditor({ workcode, participants, toleranceMinutes, onClose }) {
    const { toast } = useToast();
    const editing = Boolean(workcode);
    const { data, setData, post, put, processing, errors, transform } = useForm(initialData(workcode));
    const [pickerOpen, setPickerOpen] = useState(false);
    const [autoPickerOpen, setAutoPickerOpen] = useState(false);
    const [locationStatus, setLocationStatus] = useState(null);
    const [mapPosition, setMapPosition] = useState(() => {
        const stored = { lat: Number(workcode?.latitude), lng: Number(workcode?.longitude) };
        return workcode && inIndonesia(stored) ? stored : DEFAULT_MAP_POSITION;
    });
    const daily = data.kategori === 'harian';
    // Stakeholder tidak ditawarkan lagi di daftar peserta; memilih stakeholder mengeluarkannya dari peserta.
    const participantCandidates = daily ? participants : participants.filter((p) => !data.auto_participant_ids.includes(p.id));
    const setAutoParticipantIds = (ids) => setData((form) => ({
        ...form,
        auto_participant_ids: ids,
        participant_ids: form.participant_ids.filter((id) => !ids.includes(id)),
    }));

    const setDayTime = (day, field, value) => setData('jadwal_per_hari', { ...data.jadwal_per_hari, [day]: { ...data.jadwal_per_hari[day], [field]: value } });
    const toggleDay = (day) => setData('hari_aktif', data.hari_aktif.includes(day) ? data.hari_aktif.filter((d) => d !== day) : [...data.hari_aktif, day].sort());
    const copyFirstDay = () => {
        const first = data.jadwal_per_hari[[...data.hari_aktif].sort()[0]];
        setData('jadwal_per_hari', { ...data.jadwal_per_hari, ...Object.fromEntries(data.hari_aktif.map((day) => [day, { ...first }])) });
    };

    const submit = (e) => {
        e.preventDefault();
        transform((form) => ({
            ...form,
            latitude: mapPosition?.lat ?? form.latitude,
            longitude: mapPosition?.lng ?? form.longitude,
            set_active: form.kategori === 'workcode' ? false : form.set_active,
            auto_participant_ids: form.kategori === 'workcode' ? form.auto_participant_ids : [],
        }));
        const options = {
            onSuccess: onClose,
            onError: (errs) => toast.error(Object.values(errs)[0] || 'Workcode gagal disimpan. Periksa isian yang ditandai.'),
        };
        if (editing) put(route('workcodes.update', workcode.id), options);
        else post(route('workcodes.store'), options);
    };

    const saveLabel = editing ? 'Simpan perubahan' : daily && data.set_active ? 'Simpan & aktifkan' : 'Simpan';

    return (
        <Dialog
            open
            onClose={onClose}
            title={editing ? 'Ubah workcode' : 'Workcode baru'}
            description={daily
                ? 'Presensi datang dan pulang setiap hari kerja, dengan jam yang bisa berbeda per hari.'
                : 'Peserta presensi sekali, misalnya untuk upacara, rapat, seminar, atau ujian.'}
            size="6xl"
            footer={
                <>
                    {!editing && daily && (
                        <label className="flex cursor-pointer items-center gap-3 order-last py-2 text-sm text-ink sm:order-none sm:mr-auto sm:py-0">
                            <input
                                type="checkbox"
                                checked={data.set_active}
                                onChange={(e) => setData('set_active', e.target.checked)}
                                className="h-[18px] w-[18px] rounded border-line-strong bg-surface text-accent focus:ring-accent"
                            />
                            Langsung aktifkan setelah disimpan
                        </label>
                    )}
                    <Button onClick={onClose}>Batal</Button>
                    <Button variant="primary" type="submit" form="workcode-form" loading={processing}>{saveLabel}</Button>
                </>
            }
        >
            {/* Layar lebar: form di kiri, lokasi di kanan, muat satu layar tanpa gulir. */}
            {/* autoComplete off + atribut pengelola sandi: cegah username akun terisi ke nama workcode */}
            <form id="workcode-form" onSubmit={submit} autoComplete="off" className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)]">
                <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)]">
                        <div>
                            <p className="mb-1.5 text-sm font-medium text-ink">Jenis presensi</p>
                            <Segmented
                                label="Jenis presensi"
                                value={data.kategori}
                                onChange={(value) => setData('kategori', value)}
                                options={[{ value: 'workcode', label: 'Kegiatan (sekali)' }, { value: 'harian', label: 'Harian' }]}
                            />
                        </div>
                        <Field label="Nama" required error={errors.nama_workcode}>
                            <Input
                                value={data.nama_workcode}
                                onChange={(e) => setData('nama_workcode', e.target.value)}
                                placeholder={daily ? 'Contoh: Presensi harian guru & karyawan' : 'Contoh: Rapat pleno semester ganjil'}
                                data-lpignore="true"
                                data-1p-ignore="true"
                                data-bwignore="true"
                                data-form-type="other"
                                data-autofocus
                            />
                        </Field>
                    </div>

                    {/* Kedua isian ditumpuk di sel yang sama agar ukuran popup tetap saat jenis diganti (layar lebar).
                        Yang tidak aktif dinonaktifkan: tidak bisa difokus dan tidak ikut validasi browser. */}
                    <div className="grid">
                        <fieldset disabled={!daily} aria-hidden={!daily || undefined} className={cx('min-w-0 [grid-area:1/1]', !daily && 'max-lg:hidden lg:invisible')}>
                            <WeekSchedule
                                activeDays={data.hari_aktif}
                                schedule={data.jadwal_per_hari}
                                onToggleDay={toggleDay}
                                onChangeTime={setDayTime}
                                onCopyFirst={copyFirstDay}
                                toleranceMinutes={toleranceMinutes}
                                errors={errors}
                            />
                        </fieldset>
                        <fieldset disabled={daily} aria-hidden={daily || undefined} className={cx('min-w-0 [grid-area:1/1]', daily && 'max-lg:hidden lg:invisible')}>
                            <legend className="mb-1 text-sm font-medium text-ink">Waktu kegiatan</legend>
                            <p className="mb-3 text-sm text-ink-2">Workcode menyala otomatis pada jam mulai dan tertutup pada jam selesai (WIB).</p>
                            <div className="grid gap-3 sm:grid-cols-3">
                                <Field label="Tanggal" required error={errors.tanggal}>
                                    <Input type="date" value={data.tanggal} onChange={(e) => setData('tanggal', e.target.value)} />
                                </Field>
                                <Field label="Mulai" required error={errors.jam_aktif_mulai}>
                                    <Input type="time" value={data.jam_aktif_mulai} onChange={(e) => setData('jam_aktif_mulai', e.target.value)} />
                                </Field>
                                <Field label="Selesai" required error={errors.jam_aktif_selesai}>
                                    <Input type="time" value={data.jam_aktif_selesai} min={data.jam_aktif_mulai || undefined} onChange={(e) => setData('jam_aktif_selesai', e.target.value)} />
                                </Field>
                            </div>
                        </fieldset>
                    </div>

                    <div className={daily ? undefined : 'grid gap-3 sm:grid-cols-2'}>
                        <PickerRow
                            icon={Users}
                            title="Peserta"
                            summary={data.participant_ids.length === 0 ? 'Terbuka untuk semua peserta' : `${data.participant_ids.length} peserta dipilih`}
                            action="Pilih"
                            actionLabel="Pilih peserta"
                            onClick={() => setPickerOpen(true)}
                        />
                        {!daily && (
                            <PickerRow
                                icon={UserCheck}
                                title="Stakeholder sudah absensi"
                                summary={data.auto_participant_ids.length === 0
                                    ? 'Belum ada yang dipilih'
                                    : `${data.auto_participant_ids.length} otomatis hadir saat mulai`}
                                error={errors.auto_participant_ids}
                                action="Pilih"
                                actionLabel="Pilih stakeholder"
                                onClick={() => setAutoPickerOpen(true)}
                            />
                        )}
                    </div>
                </div>

                <fieldset className="flex min-h-0 flex-col gap-3 border-t border-line pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                    <legend className="sr-only">Lokasi presensi</legend>
                    <div className="flex items-end justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-ink">Lokasi presensi</p>
                            <p className="mt-0.5 text-sm text-ink-2">Presensi hanya di dalam radius titik ini.</p>
                        </div>
                        <Field label="Radius (m)" error={errors.radius_meters} className="w-24 shrink-0">
                            <Input type="number" min={10} max={5000} inputMode="numeric" value={data.radius_meters} onChange={(e) => setData('radius_meters', parseInt(e.target.value, 10) || 10)} />
                        </Field>
                    </div>
                    <div className="relative h-72 overflow-hidden rounded-xl border border-line bg-surface-2 lg:h-auto lg:min-h-[18rem] lg:flex-1">
                        {/* absolute: di lg tinggi kotak hanya dari min-h/flex-1, sehingga h-full pada peta akan bernilai 0. */}
                        <div className="absolute inset-0">
                            <MapErrorBoundary>
                                <GoogleMap position={mapPosition} radius={data.radius_meters || 100} interactive onPositionChange={setMapPosition} onLocationStatusChange={setLocationStatus} />
                            </MapErrorBoundary>
                        </div>
                    </div>
                    <p className="flex items-start gap-1.5 text-sm text-ink-2" role="status">
                        <LocateFixed className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                        <span className={locationStatus?.type === 'error' ? 'text-danger' : undefined}>
                            {locationStatus?.message || 'Tombol lokasi di peta untuk GPS, atau klik/geser penanda.'}
                            {mapPosition && <span className="block text-xs tabular-nums">Titik: {mapPosition.lat.toFixed(5)}, {mapPosition.lng.toFixed(5)}</span>}
                        </span>
                    </p>
                </fieldset>
            </form>

            <ParticipantPicker
                open={pickerOpen}
                onClose={() => setPickerOpen(false)}
                participants={participantCandidates}
                selected={data.participant_ids}
                onChange={(ids) => setData('participant_ids', ids)}
            />

            <ParticipantPicker
                open={autoPickerOpen}
                onClose={() => setAutoPickerOpen(false)}
                participants={participants}
                selected={data.auto_participant_ids}
                onChange={setAutoParticipantIds}
                title="Stakeholder sudah absensi"
                description="Yang dicentang otomatis tercatat hadir pada jam mulai kegiatan dan tidak muncul lagi di daftar peserta. Bila mereka tetap scan, hasil scan menggantikan catatan otomatis."
                emptyLabel="Belum ada stakeholder dipilih"
            />
        </Dialog>
    );
}
