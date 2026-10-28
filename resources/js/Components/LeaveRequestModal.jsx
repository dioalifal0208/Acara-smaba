import { Button, Dialog, Field, Input, Select, Textarea, useToast } from '@/ui';
import { useForm } from '@inertiajs/react';

/** Formulir pengajuan izin/sakit oleh peserta; disetujui admin sebelum status presensi berubah. */
export default function LeaveRequestModal({ show, onClose, workcodeId, tanggal }) {
    const { toast } = useToast();
    const { data, setData, post, processing, errors, reset } = useForm({
        tipe_izin: '',
        jenis_izin: '',
        keterangan: '',
        izin_lebih_dari_satu_hari: false,
        dokumen: null,
        workcode_id: workcodeId,
        tanggal: tanggal,
        tanggal_selesai: '',
    });

    const closeModal = () => {
        reset();
        onClose();
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('leave.store'), {
            preserveScroll: true,
            onSuccess: () => {
                closeModal();
                toast.success('Pengajuan izin terkirim. Tunggu persetujuan admin.');
            },
            onError: (errs) => {
                if (errs.error) toast.error(errs.error);
            },
        });
    };

    return (
        <Dialog
            open={show}
            onClose={closeModal}
            title="Ajukan izin"
            description="Status presensi baru berubah setelah admin menyetujui pengajuan ini."
            size="lg"
            footer={
                <>
                    <Button onClick={closeModal}>Batal</Button>
                    <Button variant="primary" type="submit" form="leave-request" loading={processing}>Kirim pengajuan</Button>
                </>
            }
        >
            <form id="leave-request" onSubmit={submit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Tipe izin" required error={errors.tipe_izin}>
                        <Select value={data.tipe_izin} onChange={(e) => setData('tipe_izin', e.target.value)}>
                            <option value="" disabled>Pilih tipe</option>
                            <option value="izin_penuh">Izin penuh</option>
                            <option value="tidak_absen_datang">Tidak absen datang</option>
                            <option value="tidak_absen_pulang">Tidak absen pulang</option>
                        </Select>
                    </Field>
                    <Field label="Jenis izin" required error={errors.jenis_izin}>
                        <Select value={data.jenis_izin} onChange={(e) => setData('jenis_izin', e.target.value)}>
                            <option value="" disabled>Pilih jenis</option>
                            <option value="izin_sakit">Sakit</option>
                            <option value="force_majeure">Force majeure</option>
                            <option value="tidak_masuk_kerja_dengan_keterangan">Tidak masuk dengan keterangan</option>
                            <option value="perjalanan_dinas_dalam_kota">Dinas dalam kota</option>
                            <option value="perjalanan_dinas_luar_kota">Dinas luar kota</option>
                            <option value="cuti">Cuti</option>
                            <option value="diklat_dan_pelatihan">Diklat dan pelatihan</option>
                        </Select>
                    </Field>
                </div>

                <Field label="Keterangan" required error={errors.keterangan}>
                    <Textarea rows={3} value={data.keterangan} onChange={(e) => setData('keterangan', e.target.value)} />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label={data.izin_lebih_dari_satu_hari ? 'Tanggal mulai' : 'Tanggal'} required error={errors.tanggal}>
                        <Input type="date" value={data.tanggal} onChange={(e) => setData('tanggal', e.target.value)} />
                    </Field>
                    {data.izin_lebih_dari_satu_hari && (
                        <Field label="Tanggal selesai" required error={errors.tanggal_selesai}>
                            <Input type="date" value={data.tanggal_selesai} min={data.tanggal || undefined} onChange={(e) => setData('tanggal_selesai', e.target.value)} />
                        </Field>
                    )}
                </div>

                <label className="flex cursor-pointer items-center gap-3 text-sm text-ink">
                    <input
                        type="checkbox"
                        checked={data.izin_lebih_dari_satu_hari}
                        onChange={(e) => {
                            setData('izin_lebih_dari_satu_hari', e.target.checked);
                            if (!e.target.checked) setData('tanggal_selesai', '');
                        }}
                        className="h-[18px] w-[18px] rounded border-line-strong bg-surface text-accent focus:ring-accent"
                    />
                    Izin lebih dari satu hari
                </label>

                <Field label="Dokumen pendukung" required hint="Foto atau PDF, maksimal 5 MB. Contoh: surat dokter atau surat tugas." error={errors.dokumen}>
                    <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={(e) => setData('dokumen', e.target.files[0])}
                        className="block w-full text-sm text-ink-2 file:mr-3 file:h-10 file:cursor-pointer file:rounded-lg file:border file:border-line-strong file:bg-surface file:px-4 file:text-sm file:font-medium file:text-ink hover:file:bg-surface-2"
                    />
                </Field>
            </form>
        </Dialog>
    );
}
