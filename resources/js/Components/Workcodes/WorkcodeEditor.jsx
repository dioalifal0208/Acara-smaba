import GoogleMap from '@/Components/GoogleMap';
import { Button, Dialog, Field, Input, Segmented, Textarea, useToast } from '@/ui';
import { useForm } from '@inertiajs/react';
import { LocateFixed, Users } from 'lucide-react';
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
            nama_workcode: '', deskripsi: '', kategori: 'workcode', tanggal: today(), jam_aktif_mulai: '07:00', jam_aktif_selesai: '10:00',
            hari_aktif: [1, 2, 3, 4, 5], ...DEFAULT_DAY, jadwal_per_hari: defaultSchedule(),
            latitude: '', longitude: '', radius_meters: 100, set_active: true, participant_ids: [],
        };
    }

    return {
        nama_workcode: workcode.nama_workcode,
        deskripsi: workcode.deskripsi || '',
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
        participant_ids: (workcode.participants || []).map((p) => p.id),
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

/** Buat atau ubah workcode: jenis, jadwal (kegiatan sekali / mingguan), peserta, dan titik lokasi. */
export default function WorkcodeEditor({ workcode, participants, toleranceMinutes, onClose }) {
    const { toast } = useToast();
    const editing = Boolean(workcode);
    const { data, setData, post, put, processing, errors, transform } = useForm(initialData(workcode));
    const [pickerOpen, setPickerOpen] = useState(false);
    const [locationStatus, setLocationStatus] = useState(null);
    const [mapPosition, setMapPosition] = useState(() => {
        const stored = { lat: Number(workcode?.latitude), lng: Number(workcode?.longitude) };
        return workcode && inIndonesia(stored) ? stored : DEFAULT_MAP_POSITION;
    });
    const daily = data.kategori === 'harian';

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
            description="Atur jenis presensi, jadwal, peserta, dan batas lokasinya."
            size="4xl"
            footer={
                <>
                    <Button onClick={onClose}>Batal</Button>
                    <Button variant="primary" type="submit" form="workcode-form" loading={processing}>{saveLabel}</Button>
                </>
            }
        >
            {/* autoComplete off + atribut pengelola sandi: cegah username akun terisi ke nama workcode */}
            <form id="workcode-form" onSubmit={submit} autoComplete="off" className="space-y-6">
                <div className="space-y-5">
                    <div>
                        <p className="mb-1.5 text-sm font-medium text-ink">Jenis presensi</p>
                        <Segmented
                            label="Jenis presensi"
                            value={data.kategori}
                            onChange={(value) => setData('kategori', value)}
                            options={[{ value: 'workcode', label: 'Kegiatan (sekali)' }, { value: 'harian', label: 'Harian (datang & pulang)' }]}
                        />
                        <p className="mt-1.5 text-sm text-ink-2">
                            {daily
                                ? 'Presensi datang dan pulang setiap hari kerja, dengan jam yang bisa berbeda per hari.'
                                : 'Peserta presensi sekali, misalnya untuk upacara, rapat, seminar, atau ujian.'}
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
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
                        <Field label="Deskripsi" hint="Opsional." error={errors.deskripsi}>
                            <Input value={data.deskripsi} onChange={(e) => setData('deskripsi', e.target.value)} />
                        </Field>
                    </div>

                    {daily ? (
                        <WeekSchedule
                            activeDays={data.hari_aktif}
                            schedule={data.jadwal_per_hari}
                            onToggleDay={toggleDay}
                            onChangeTime={setDayTime}
                            onCopyFirst={copyFirstDay}
                            toleranceMinutes={toleranceMinutes}
                            errors={errors}
                        />
                    ) : (
                        <fieldset>
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
                    )}

                    <div className="flex items-center gap-3 rounded-xl border border-line p-3">
                        <Users className="h-5 w-5 shrink-0 text-ink-2" aria-hidden="true" />
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-ink">Peserta</p>
                            <p className="text-sm text-ink-2">
                                {data.participant_ids.length === 0 ? 'Terbuka untuk semua peserta' : `${data.participant_ids.length} peserta dipilih`}
                            </p>
                        </div>
                        <Button size="sm" onClick={() => setPickerOpen(true)}>Pilih peserta</Button>
                    </div>

                    {!editing && daily && (
                        <label className="flex cursor-pointer items-center gap-3 text-sm text-ink">
                            <input
                                type="checkbox"
                                checked={data.set_active}
                                onChange={(e) => setData('set_active', e.target.checked)}
                                className="h-[18px] w-[18px] rounded border-line-strong bg-surface text-accent focus:ring-accent"
                            />
                            Langsung aktifkan setelah disimpan
                        </label>
                    )}
                </div>

                <fieldset className="border-t border-line pt-5">
                    <legend className="sr-only">Lokasi presensi</legend>
                    <div className="grid gap-4 md:grid-cols-[16rem_1fr]">
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm font-medium text-ink">Lokasi presensi</p>
                                <p className="mt-0.5 text-sm text-ink-2">Peserta hanya bisa presensi di dalam radius dari titik ini.</p>
                            </div>
                            <Field label="Radius (meter)" error={errors.radius_meters}>
                                <Input type="number" min={10} max={5000} inputMode="numeric" value={data.radius_meters} onChange={(e) => setData('radius_meters', parseInt(e.target.value, 10) || 10)} />
                            </Field>
                            <p className="flex items-start gap-1.5 text-sm text-ink-2" role="status">
                                <LocateFixed className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                                <span className={locationStatus?.type === 'error' ? 'text-danger' : undefined}>
                                    {locationStatus?.message || 'Pakai tombol lokasi di peta untuk GPS, klik peta, atau geser penanda untuk memilih titik.'}
                                </span>
                            </p>
                            {mapPosition && (
                                <p className="text-xs tabular-nums text-ink-2">Titik: {mapPosition.lat.toFixed(5)}, {mapPosition.lng.toFixed(5)}</p>
                            )}
                        </div>
                        <div className="relative h-72 overflow-hidden rounded-xl border border-line bg-surface-2 md:h-80">
                            <MapErrorBoundary>
                                <GoogleMap position={mapPosition} radius={data.radius_meters || 100} interactive onPositionChange={setMapPosition} onLocationStatusChange={setLocationStatus} />
                            </MapErrorBoundary>
                        </div>
                    </div>
                </fieldset>
            </form>

            <ParticipantPicker
                open={pickerOpen}
                onClose={() => setPickerOpen(false)}
                participants={participants}
                selected={data.participant_ids}
                onChange={(ids) => setData('participant_ids', ids)}
            />
        </Dialog>
    );
}
