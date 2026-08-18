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
        tipe: 'izin',
        alasan: '',
        bukti: null,
        workcode_id: workcodeId,
        tanggal: tanggal,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('leave.store'), {
            preserveScroll: true,
            onSuccess: () => {
                closeModal();
                toast.success(`Pengajuan ${data.tipe} berhasil dikirim.`);
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
            <form onSubmit={submit} className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">
                    Pengajuan Izin / Sakit
                </h2>

                <div className="mb-4">
                    <InputLabel htmlFor="tipe" value="Tipe Pengajuan" />
                    <select
                        id="tipe"
                        name="tipe"
                        value={data.tipe}
                        onChange={(e) => setData('tipe', e.target.value)}
                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                    >
                        <option value="izin">Izin</option>
                        <option value="sakit">Sakit</option>
                    </select>
                    <InputError message={errors.tipe} className="mt-2" />
                </div>

                <div className="mb-4">
                    <InputLabel htmlFor="alasan" value="Alasan Keterangan" />
                    <textarea
                        id="alasan"
                        name="alasan"
                        value={data.alasan}
                        onChange={(e) => setData('alasan', e.target.value)}
                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                        rows="3"
                        required
                    />
                    <InputError message={errors.alasan} className="mt-2" />
                </div>

                <div className="mb-4">
                    <InputLabel htmlFor="bukti" value="Bukti Dukung (Foto/Surat Dokter) Maks 2MB" />
                    <input
                        id="bukti"
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={(e) => setData('bukti', e.target.files[0])}
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        required
                    />
                    <InputError message={errors.bukti} className="mt-2" />
                </div>

                <div className="mt-6 flex justify-end">
                    <SecondaryButton onClick={closeModal}>Batal</SecondaryButton>
                    <PrimaryButton className="ml-3" disabled={processing}>
                        Kirim Pengajuan
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}
