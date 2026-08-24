import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { useToast } from '@/Components/Toast';
import { useEffect } from 'react';

export default function Settings({ settings, flash }) {
    const { toast } = useToast();
    
    const { data, setData, post, processing, errors } = useForm({
        kepala_sekolah_nama: settings?.kepala_sekolah_nama || '',
        kepala_sekolah_nip: settings?.kepala_sekolah_nip || '',
    });

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        } else if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.settings.update'));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Pengaturan Tanda Tangan</h2>}
        >
            <Head title="Pengaturan Tanda Tangan" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 max-w-2xl mx-auto">
                        
                        <div className="mb-6 border-b pb-4">
                            <h3 className="text-lg font-bold text-gray-900">Data Kepala Sekolah</h3>
                            <p className="text-sm text-gray-500">Informasi ini akan ditampilkan pada bagian tanda tangan (QR Code) di laporan presensi.</p>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <InputLabel htmlFor="kepala_sekolah_nama" value="Nama Kepala Sekolah (beserta gelar)" />
                                <TextInput
                                    id="kepala_sekolah_nama"
                                    type="text"
                                    name="kepala_sekolah_nama"
                                    value={data.kepala_sekolah_nama}
                                    className="mt-1 block w-full"
                                    isFocused={true}
                                    onChange={(e) => setData('kepala_sekolah_nama', e.target.value)}
                                    placeholder="Contoh: Muhtarom, S.Pd., M.Si."
                                />
                                <InputError message={errors.kepala_sekolah_nama} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="kepala_sekolah_nip" value="NIP Kepala Sekolah" />
                                <TextInput
                                    id="kepala_sekolah_nip"
                                    type="text"
                                    name="kepala_sekolah_nip"
                                    value={data.kepala_sekolah_nip}
                                    className="mt-1 block w-full font-mono"
                                    onChange={(e) => setData('kepala_sekolah_nip', e.target.value)}
                                    placeholder="Contoh: 197205172006041015"
                                />
                                <InputError message={errors.kepala_sekolah_nip} className="mt-2" />
                            </div>

                            <div className="flex items-center gap-4 pt-4 border-t">
                                <PrimaryButton disabled={processing}>
                                    Simpan Pengaturan
                                </PrimaryButton>
                                
                                {processing && (
                                    <span className="text-sm text-gray-500 animate-pulse">Menyimpan...</span>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
