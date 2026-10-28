import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button, Field, Input, PageHeader, Section, useToast } from '@/ui';
import { Head, useForm } from '@inertiajs/react';
import { ExternalLink, QrCode } from 'lucide-react';
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
            <Head title="Pengaturan" />

            <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6">
                <PageHeader title="Pengaturan" description="Tanda tangan laporan cetak dan link unduhan aplikasi Android." />

                <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
                    <Section title="Kepala sekolah" description="Nama dan NIP di bawah QR tanda tangan pada setiap laporan yang dicetak. Tulis nama lengkap beserta gelar sesuai dokumen resmi.">
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

                <ApkLinkSection initialUrl={settings?.android_apk_url || ''} />
            </div>
        </AuthenticatedLayout>
    );
}

/** Link unduhan aplikasi Android untuk tombol "Unduh aplikasi Android" di halaman depan. */
function ApkLinkSection({ initialUrl }) {
    const { data, setData, post, processing, errors, isDirty } = useForm({ android_apk_url: initialUrl });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.settings.apk'), { preserveScroll: true });
    };

    return (
        <Section
            title="Aplikasi Android"
            description="Tombol unduh di halaman depan membuka link ini. Untuk Google Drive, bagikan file atau foldernya sebagai “Siapa saja yang memiliki link”. Kosongkan untuk menyembunyikan tombol."
        >
            <form onSubmit={submit} className="space-y-4">
                <Field label="Link unduhan APK" error={errors.android_apk_url}>
                    <Input
                        type="url"
                        value={data.android_apk_url}
                        onChange={(e) => setData('android_apk_url', e.target.value)}
                        placeholder="https://drive.google.com/…"
                        autoComplete="off"
                        spellCheck={false}
                    />
                </Field>
                <div className="flex flex-wrap items-center gap-3">
                    <Button variant="primary" type="submit" loading={processing} disabled={!isDirty}>Simpan</Button>
                    {data.android_apk_url && (
                        <Button variant="ghost" icon={ExternalLink} href={data.android_apk_url} external target="_blank" rel="noopener noreferrer">
                            Coba buka link
                        </Button>
                    )}
                </div>
            </form>
        </Section>
    );
}
