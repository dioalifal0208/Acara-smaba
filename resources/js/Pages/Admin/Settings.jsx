import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button, Field, Input, PageHeader, Section, useToast } from '@/ui';
import { Head, useForm } from '@inertiajs/react';
import { QrCode } from 'lucide-react';
import { useEffect } from 'react';

export default function Settings({ settings, flash }) {
    const { toast } = useToast();
    const { data, setData, post, processing, errors, isDirty } = useForm({
        kepala_sekolah_nama: settings?.kepala_sekolah_nama || '',
        kepala_sekolah_nip: settings?.kepala_sekolah_nip || '',
    });

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        else if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.settings.update'), { preserveScroll: true });
    };

    const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <AuthenticatedLayout>
            <Head title="Tanda tangan" />

            <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6">
                <PageHeader title="Tanda tangan" description="Nama dan NIP kepala sekolah di bawah QR tanda tangan pada setiap laporan yang dicetak." />

                <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
                    <Section title="Kepala sekolah" description="Tulis nama lengkap beserta gelar sesuai dokumen resmi.">
                        <form onSubmit={submit} className="space-y-4">
                            <Field label="Nama beserta gelar" error={errors.kepala_sekolah_nama}>
                                <Input
                                    value={data.kepala_sekolah_nama}
                                    onChange={(e) => setData('kepala_sekolah_nama', e.target.value)}
                                    placeholder="Contoh: Muhtarom, S.Pd., M.Si."
                                    autoComplete="off"
                                />
                            </Field>
                            <Field label="NIP" error={errors.kepala_sekolah_nip}>
                                <Input
                                    value={data.kepala_sekolah_nip}
                                    onChange={(e) => setData('kepala_sekolah_nip', e.target.value)}
                                    inputMode="numeric"
                                    placeholder="Contoh: 197205172006041015"
                                    autoComplete="off"
                                    className="tabular-nums"
                                />
                            </Field>
                            <div className="flex items-center gap-3">
                                <Button variant="primary" type="submit" loading={processing} disabled={!isDirty}>Simpan</Button>
                                {!isDirty && !processing && <span className="text-sm text-ink-2">Belum ada perubahan</span>}
                            </div>
                        </form>
                    </Section>

                    {/* Pratinjau mengikuti blok tanda tangan di lib/reportPrint.js; kertas selalu putih seperti hasil cetak. */}
                    <Section title="Pratinjau" description="Bagian bawah laporan cetak, berubah saat Anda mengetik.">
                        <div className="rounded-lg border border-line bg-white px-4 py-6 text-center font-['Times_New_Roman',Times,serif] text-[13px] leading-snug text-neutral-900" aria-label="Pratinjau blok tanda tangan">
                            <p>Babat, {today}</p>
                            <p>Kepala Sekolah,</p>
                            <QrCode className="mx-auto my-3 h-20 w-20 text-neutral-800" strokeWidth={1.25} aria-hidden="true" />
                            <p className={`font-bold underline ${data.kepala_sekolah_nama ? '' : 'text-neutral-500'}`}>{data.kepala_sekolah_nama || 'Nama kepala sekolah'}</p>
                            <p className="font-[Arial,sans-serif] text-xs text-neutral-600">NIP. {data.kepala_sekolah_nip || '–'}</p>
                        </div>
                    </Section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
