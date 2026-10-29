import PublicShell from '@/Layouts/PublicShell';
import { Button, Card } from '@/ui';
import { Head } from '@inertiajs/react';
import { BadgeCheck, Info } from 'lucide-react';

const formatDate = (date) => (date
    ? new Date(`${String(date).slice(0, 10)}T00:00:00`).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : null);

/**
 * Hasil memindai QR tanda tangan kepala sekolah di laporan cetak. URL-nya bertanda tangan (signed),
 * jadi halaman ini hanya terbuka untuk QR asli dari sistem. Isi kertas tidak ikut diperiksa,
 * sehingga pembaca diminta mencocokkan nama kegiatan dengan dokumen yang dipegang.
 */
export default function VerifySignature({ workcode, kepalaSekolahNama, kepalaSekolahNip, waktuCetak }) {
    const daily = workcode.kategori === 'harian';

    return (
        <PublicShell footer="Verifikasi dokumen">
            <Head title="Verifikasi tanda tangan" />

            <div className="space-y-6">
                <div className="pt-4 text-center">
                    <BadgeCheck className="mx-auto h-14 w-14 text-status-hadir" strokeWidth={1.5} aria-hidden="true" />
                    <h1 className="mt-4 font-display text-2xl font-semibold text-ink">Tanda tangan asli</h1>
                    <p className="mt-2 text-sm text-ink-2">QR ini diterbitkan oleh sistem E-Presensi SMA Negeri 1 Babat.</p>
                </div>

                <Card className="divide-y divide-line">
                    <dl className="space-y-3 p-5 text-sm">
                        <div>
                            <dt className="text-ink-2">Dokumen</dt>
                            <dd className="mt-0.5 text-base font-semibold text-ink">Rekap presensi {workcode.nama_workcode}</dd>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <dt className="text-ink-2">Jenis</dt>
                                <dd className="mt-0.5 font-medium text-ink">{daily ? 'Presensi Work From Office' : 'Presensi acara'}</dd>
                            </div>
                            {!daily && workcode.tanggal && (
                                <div>
                                    <dt className="text-ink-2">Tanggal acara</dt>
                                    <dd className="mt-0.5 font-medium text-ink">{formatDate(workcode.tanggal)}</dd>
                                </div>
                            )}
                        </div>
                    </dl>
                    <dl className="p-5 text-sm">
                        <dt className="text-ink-2">Ditandatangani oleh</dt>
                        <dd className="mt-0.5 text-base font-semibold text-ink">{kepalaSekolahNama}</dd>
                        <dd className="text-sm tabular-nums text-ink-2">NIP. {kepalaSekolahNip}</dd>
                        <dd className="mt-1 text-sm text-ink-2">Kepala SMA Negeri 1 Babat</dd>
                    </dl>
                </Card>

                <p className="flex items-start gap-2 text-sm text-ink-2">
                    <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    Pastikan nama acara di atas sama dengan dokumen yang Anda pegang. Dokumen elektronik ini sah tanpa stempel basah.
                </p>

                <div className="space-y-2 text-center">
                    {/* Waktu dari server saat halaman ini dibuka, bukan waktu laporan dicetak. */}
                    <p className="text-xs text-ink-2">Diperiksa {waktuCetak}</p>
                    <Button href="/" variant="ghost" className="w-full">Ke halaman utama</Button>
                </div>
            </div>
        </PublicShell>
    );
}
