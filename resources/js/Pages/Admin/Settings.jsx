import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button, Field, Input, PageHeader, Section, StatusPill, useToast } from '@/ui';
import { Head, useForm } from '@inertiajs/react';
import { AlertTriangle, Download, QrCode, Smartphone } from 'lucide-react';
import { useEffect } from 'react';

export default function Settings({ settings, androidApp, flash }) {
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
                <PageHeader title="Pengaturan" description="Tanda tangan laporan cetak dan aplikasi Android." />

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

                <AndroidAppSection app={androidApp} />
            </div>
        </AuthenticatedLayout>
    );
}

const formatSize = (bytes) => `${(bytes / 1024 / 1024).toLocaleString('id-ID', { maximumFractionDigits: 1 })} MB`;
const formatDateTime = (iso) => new Date(iso).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

/**
 * APK terbaru yang diunggah otomatis setiap deploy (hanya versi terakhir yang ditampilkan),
 * beserta versi minimum aplikasi yang bergeser mengikuti rilis.
 */
function AndroidAppSection({ app }) {
    const latest = app?.latest;

    return (
        <Section
            title="Aplikasi Android"
            description="APK diunggah otomatis setiap deploy. Tombol unduh di halaman depan dan layar “Perbarui aplikasi” di HP selalu memakai versi terbaru."
        >
            {latest ? (
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-4 rounded-xl border border-line p-4">
                        <Smartphone className="h-8 w-8 shrink-0 text-ink-2" aria-hidden="true" />
                        <div className="min-w-0 flex-1">
                            <p className="text-base font-semibold text-ink">Versi {latest.version_name}</p>
                            <p className="text-sm tabular-nums text-ink-2">
                                versionCode {latest.version_code} · {formatSize(latest.size_bytes)} · dirilis {formatDateTime(latest.published_at)} · {latest.download_count}× diunduh
                            </p>
                        </div>
                        <Button variant="primary" icon={Download} href={latest.download_url} external download>Unduh APK</Button>
                    </div>

                    <dl className="grid gap-3 text-sm sm:grid-cols-2">
                        <div>
                            <dt className="text-ink-2">Versi minimum saat ini</dt>
                            <dd className="font-medium tabular-nums text-ink">
                                {app.min_version_code > 0 ? `versionCode ${app.min_version_code}` : 'Tidak dibatasi'}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-ink-2">Saat rilis berikutnya</dt>
                            <dd className="flex flex-wrap items-center gap-2 font-medium tabular-nums text-ink">
                                {app.next_min_version_code > 0 ? `minimum naik ke versionCode ${app.next_min_version_code}` : 'Belum ada yang wajib update'}
                                {app.outdated_next_release > 0 && (
                                    <StatusPill tone="alpha" icon={AlertTriangle} label={`${app.outdated_next_release} peserta perlu update`} />
                                )}
                            </dd>
                        </div>
                    </dl>
                    {app.min_version_lag > 0 && (
                        <p className="text-sm text-ink-2">
                            HP boleh tertinggal paling banyak {app.min_version_lag} rilis dari versi terbaru; versi yang lebih lama diminta mengunduh APK terbaru sebelum bisa presensi.
                        </p>
                    )}
                </div>
            ) : (
                <p className="text-sm text-ink-2">
                    Belum ada APK yang diunggah. APK akan tersedia otomatis setelah deploy berikutnya; sampai saat itu tombol unduh di halaman depan disembunyikan.
                </p>
            )}
        </Section>
    );
}
