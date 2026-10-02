import { useState } from 'react';
import Modal from '@/Components/Modal';
import { useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { useToast } from '@/Components/Toast';

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

    const submit = (e) => {
        e.preventDefault();

        post(route('leave.store'), {
            preserveScroll: true,
            onSuccess: () => {
                closeModal();
                toast.success('Pengajuan izin berhasil dikirim.');
            },
            onError: (errors) => {
                if (errors.error) {
                    toast.error(errors.error);
                }
            }
        });
    };

    const closeModal = () => {
        reset();
        onClose();
    };

    return (
        <Modal show={show} onClose={closeModal}>
            <form onSubmit={submit} className="p-6 max-h-[90dvh] overflow-y-auto">
                <h2 className="text-lg font-bold text-gray-900 mb-6">
                    Pengajuan Izin
                </h2>

                <div className="mb-4">
                    <InputLabel htmlFor="tipe_izin" value="Tipe Izin" />
                    <select
                        id="tipe_izin"
                        name="tipe_izin"
                        value={data.tipe_izin}
                        onChange={(e) => setData('tipe_izin', e.target.value)}
                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm min-h-[44px]"
                        required
                    >
                        <option value="" disabled>Pilih tipe izin</option>
                        <option value="izin_penuh">Izin penuh</option>
                        <option value="tidak_absen_datang">Izin tidak absen datang</option>
                        <option value="tidak_absen_pulang">Izin tidak absen pulang</option>
                    </select>
                    <InputError message={errors.tipe_izin} className="mt-2" />
                </div>

                <div className="mb-4">
                    <InputLabel htmlFor="jenis_izin" value="Jenis Izin" />
                    <select
                        id="jenis_izin"
                        name="jenis_izin"
                        value={data.jenis_izin}
                        onChange={(e) => setData('jenis_izin', e.target.value)}
                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm min-h-[44px]"
                        required
                    >
                        <option value="" disabled>Pilih jenis izin</option>
                        <option value="izin_sakit">Izin sakit</option>
                        <option value="force_majeure">Force majeure</option>
                        <option value="tidak_masuk_kerja_dengan_keterangan">Tidak masuk kerja dengan keterangan</option>
                        <option value="perjalanan_dinas_dalam_kota">Perjalanan dinas dalam kota</option>
                        <option value="perjalanan_dinas_luar_kota">Perjalanan dinas luar kota</option>
                        <option value="cuti">Cuti</option>
                        <option value="diklat_dan_pelatihan">Diklat dan pelatihan</option>
                    </select>
                    <InputError message={errors.jenis_izin} className="mt-2" />
                </div>

                <div className="mb-4">
                    <InputLabel htmlFor="keterangan" value="Keterangan" />
                    <textarea
                        id="keterangan"
                        name="keterangan"
                        value={data.keterangan}
                        onChange={(e) => setData('keterangan', e.target.value)}
                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                        rows="3"
                        required
                    />
                    <InputError message={errors.keterangan} className="mt-2" />
                </div>

                <div className="mb-4">
                    <InputLabel htmlFor="tanggal" value={data.izin_lebih_dari_satu_hari ? 'Tanggal Mulai' : 'Tanggal Izin'} />
                    <TextInput
                        id="tanggal"
                        type="date"
                        name="tanggal"
                        value={data.tanggal}
                        onChange={(e) => setData('tanggal', e.target.value)}
                        className="mt-1 block w-full"
                        required
                    />
                    <InputError message={errors.tanggal} className="mt-2" />
                </div>

                <label className="mb-4 flex items-center gap-3 rounded-md border border-gray-200 p-3 text-sm text-gray-700 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={data.izin_lebih_dari_satu_hari}
                        onChange={(e) => {
                            setData('izin_lebih_dari_satu_hari', e.target.checked);
                            if (!e.target.checked) {
                                setData('tanggal_selesai', '');
                            }
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Izin lebih dari 1 hari</span>
                </label>

                {data.izin_lebih_dari_satu_hari && (
                    <div className="mb-4">
                        <InputLabel htmlFor="tanggal_selesai" value="Tanggal Selesai" />
                        <TextInput
                            id="tanggal_selesai"
                            type="date"
                            name="tanggal_selesai"
                            value={data.tanggal_selesai}
                            min={data.tanggal || undefined}
                            onChange={(e) => setData('tanggal_selesai', e.target.value)}
                            className="mt-1 block w-full"
                            required
                        />
                        <InputError message={errors.tanggal_selesai} className="mt-2" />
                    </div>
                )}

                <div className="mb-4">
                    <InputLabel htmlFor="dokumen" value="Dokumen Pendukung (Foto/PDF, maks. 5 MB)" />
                    <input
                        id="dokumen"
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={(e) => setData('dokumen', e.target.files[0])}
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        required
                    />
                    <InputError message={errors.dokumen} className="mt-2" />
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <SecondaryButton onClick={closeModal}>Batal</SecondaryButton>
                    <PrimaryButton disabled={processing}>
                        Kirim Pengajuan
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}
