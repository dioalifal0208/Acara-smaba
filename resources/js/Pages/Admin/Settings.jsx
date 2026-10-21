import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { useToast } from '@/Components/Toast';
import { useEffect } from 'react';
import { icons } from '@/lib/adminMenu';

export default function Settings({ settings, flash }) {
    const { toast } = useToast();

    const { data, setData, post, processing, errors, isDirty } = useForm({
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
        <AuthenticatedLayout>
            <Head title="Pengaturan TTD" />

            <div className="flex w-full flex-1 flex-col px-4 py-2 sm:px-6 xl:min-h-0 xl:overflow-hidden">
                <div className="mb-4 shrink-0" data-aos="fade-up">
                    <h3 className="text-xl font-bold text-neutral-800">Pengaturan TTD</h3>
                    <p className="mt-0.5 text-sm text-neutral-500">Data kepala sekolah yang tampil pada tanda tangan (QR code) di laporan presensi.</p>
                </div>

                <section className="grid grid-cols-1 gap-4 xl:min-h-0 xl:flex-1 xl:grid-cols-3">
                    <div className="card-soft p-4 sm:p-6 xl:col-span-2" data-aos="fade-up">
                        <h6 className="text-base font-semibold text-neutral-800">Data Kepala Sekolah</h6>
                        <p className="mt-0.5 text-sm text-neutral-500">Tulis nama lengkap beserta gelar sesuai dokumen resmi.</p>

                        <form onSubmit={submit} className="mt-6 max-w-xl space-y-5">
                            <div>
                                <InputLabel htmlFor="kepala_sekolah_nama" value="Nama kepala sekolah (beserta gelar)" />
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
                                <InputLabel htmlFor="kepala_sekolah_nip" value="NIP kepala sekolah" />
                                <TextInput
                                    id="kepala_sekolah_nip"
                                    type="text"
                                    name="kepala_sekolah_nip"
                                    inputMode="numeric"
                                    value={data.kepala_sekolah_nip}
                                    className="mt-1 block w-full font-mono"
                                    onChange={(e) => setData('kepala_sekolah_nip', e.target.value)}
                                    placeholder="Contoh: 197205172006041015"
                                />
                                <InputError message={errors.kepala_sekolah_nip} className="mt-2" />
                            </div>

                            <hr className="hr-fade" />
                            <div className="flex items-center gap-4">
                                <PrimaryButton disabled={processing || !isDirty}>
                                    {processing ? 'Menyimpan…' : 'Simpan pengaturan'}
                                </PrimaryButton>
                                {!isDirty && !processing && <span className="text-sm text-neutral-400">Belum ada perubahan</span>}
                            </div>
                        </form>
                    </div>

                    {/* Pratinjau langsung blok tanda tangan di laporan */}
                    <aside className="card-soft flex flex-col p-4" data-aos="fade-up" data-aos-delay="100">
                        <h6 className="text-base font-semibold text-neutral-800">Pratinjau Tanda Tangan</h6>
                        <p className="mt-0.5 text-sm text-neutral-500">Tampilan di bagian bawah laporan</p>
                        <hr className="hr-fade my-3" />
                        <div className="flex flex-1 flex-col items-center justify-center rounded-md border border-dashed border-neutral-300 px-4 py-6 text-center">
                            <p className="text-xs text-neutral-500">Mengetahui,</p>
                            <p className="text-xs font-medium text-neutral-700">Kepala SMA Negeri 1 Babat</p>
                            <span className="my-3 flex h-20 w-20 items-center justify-center rounded-md border border-neutral-200 bg-white p-3 text-neutral-800">
                                {icons.qr}
                            </span>
                            <p className={`max-w-full truncate text-sm font-semibold underline underline-offset-4 transition-colors ${data.kepala_sekolah_nama ? 'text-neutral-900' : 'text-neutral-300'}`}>
                                {data.kepala_sekolah_nama || 'Nama kepala sekolah'}
                            </p>
                            <p className={`mt-1 font-mono text-xs transition-colors ${data.kepala_sekolah_nip ? 'text-neutral-600' : 'text-neutral-300'}`}>
                                NIP. {data.kepala_sekolah_nip || '—'}
                            </p>
                        </div>
                        <p className="mt-3 flex items-center gap-1 text-xs text-neutral-400">
                            <span className="h-3.5 w-3.5">{icons.clock}</span>
                            berubah langsung saat Anda mengetik
                        </p>
                    </aside>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
