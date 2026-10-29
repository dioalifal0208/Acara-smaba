import LoginModal from '@/Components/LoginModal';
import { appUrl } from '@/lib/appUrl';
import { Button } from '@/ui';
import { Head, Link, usePage } from '@inertiajs/react';
import { CheckCircle2, Download, LogIn, MapPin, QrCode, ScanFace, Smartphone, UserSquare2 } from 'lucide-react';
import { useState } from 'react';

const METHODS = [
    {
        icon: Smartphone,
        title: 'Aplikasi PRESENSI SMABA',
        body: 'Untuk presensi Work From Office datang dan pulang. Wajah dan lokasi diperiksa otomatis saat Anda berada di area sekolah.',
    },
    {
        icon: QrCode,
        title: 'QR acara',
        body: 'Untuk rapat, upacara, dan acara sekolah lainnya. Pindai QR yang ditampilkan panitia, pilih nama, lalu tanda tangan di HP.',
    },
    {
        icon: UserSquare2,
        title: 'QR pribadi',
        body: 'Tunjukkan QR pribadi Anda ke petugas scanner. QR bisa dilihat setelah masuk di web.',
    },
];

const APP_STEPS = [
    { icon: Smartphone, title: 'Masuk dengan NIP', body: 'Buka aplikasi dan masuk memakai NIP (GTT/PTT memakai ID pengganti NIP). Akun terkunci ke HP yang pertama dipakai.' },
    { icon: MapPin, title: 'Berada di area sekolah', body: 'Presensi di luar radius sekolah atau dengan lokasi palsu ditolak.' },
    { icon: ScanFace, title: 'Verifikasi wajah', body: 'Hadapkan wajah ke kamera depan sampai dikenali.' },
    { icon: CheckCircle2, title: 'Kehadiran tercatat', body: 'Jam datang dan pulang langsung masuk ke rekap sekolah.' },
];

const HELP = [
    { q: 'Lupa kata sandi', a: 'Hubungi admin sekolah untuk mengatur ulang kata sandi Anda.' },
    { q: 'Ganti HP', a: 'Satu akun hanya untuk satu HP. Minta admin mereset kunci perangkat, lalu masuk di HP baru.' },
    { q: 'Izin atau sakit', a: 'Ajukan lewat aplikasi atau setelah masuk di web, lengkap dengan bukti pendukung. Izin berlaku setelah disetujui admin.' },
];

/**
 * Halaman depan publik: informasi umum saja (cara presensi dan bantuan), tanpa data kehadiran.
 * Satu-satunya tombol masuk ada di bilah atas.
 */
export default function Welcome({ apkUrl = null }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const [loginOpen, setLoginOpen] = useState(false);
    const home = user && route(user.is_admin ? 'dashboard' : 'participant.dashboard');

    return (
        <>
            <Head title="E-Presensi SMA Negeri 1 Babat" />

            <div className="flex min-h-dvh flex-col bg-app text-ink">
                <header className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
                    <Link href="/" className="flex min-w-0 items-center gap-3">
                        <img src={appUrl('images/logo-96.png')} alt="" width="36" height="36" className="h-9 w-9 shrink-0 object-contain" />
                        <span className="min-w-0 leading-tight">
                            <span className="block truncate text-sm font-semibold text-ink">E-Presensi</span>
                            <span className="block truncate text-xs text-ink-2">SMA Negeri 1 Babat</span>
                        </span>
                    </Link>
                    <nav className="flex shrink-0 items-center gap-1" aria-label="Akun">
                        {user ? (
                            <>
                                <Link href={route('logout')} method="post" as="button" className="hidden h-10 items-center rounded-lg px-3 text-sm font-medium text-ink-2 hover:bg-surface-2 hover:text-ink sm:inline-flex">
                                    Keluar
                                </Link>
                                <Button variant="primary" href={home}>{user.is_admin ? 'Buka dashboard' : 'Beranda saya'}</Button>
                            </>
                        ) : (
                            <Button variant="primary" icon={LogIn} onClick={() => setLoginOpen(true)}>Masuk</Button>
                        )}
                    </nav>
                </header>

                <main className="mx-auto w-full max-w-5xl flex-1 px-4 sm:px-6">
                    <section className="pb-16 pt-14 sm:pb-24 sm:pt-24" data-aos="fade-up">
                        <h1 className="max-w-3xl font-display text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-6xl">
                            Presensi guru dan pegawai SMA Negeri 1 Babat
                        </h1>
                        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-2">
                            Presensi lewat aplikasi Android dengan verifikasi wajah dan lokasi, atau lewat QR saat acara sekolah. Kehadiran tercatat otomatis untuk rekap sekolah.
                        </p>
                        {apkUrl && (
                            <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2">
                                <ApkButton href={apkUrl} />
                                <p className="text-sm text-ink-2">Untuk HP Android. Masuk memakai NIP.</p>
                            </div>
                        )}
                    </section>

                    <InfoSection title="Cara presensi" id="cara">
                        <ul className="grid gap-8 sm:grid-cols-3">
                            {METHODS.map(({ icon: Icon, title, body }) => (
                                <li key={title}>
                                    <Icon className="h-6 w-6 text-accent" strokeWidth={1.75} aria-hidden="true" />
                                    <h3 className="mt-3 text-base font-semibold text-ink">{title}</h3>
                                    <p className="mt-1 text-sm leading-relaxed text-ink-2">{body}</p>
                                </li>
                            ))}
                        </ul>
                    </InfoSection>

                    <InfoSection title="Lewat aplikasi" id="aplikasi">
                        {/* Langkah memang berurutan, jadi nomornya bermakna. */}
                        <ol className="space-y-5">
                            {APP_STEPS.map(({ title, body }, index) => (
                                <li key={title} className="flex gap-4">
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line-strong text-sm font-medium tabular-nums text-ink-2" aria-hidden="true">
                                        {index + 1}
                                    </span>
                                    <div>
                                        <h3 className="text-base font-semibold text-ink"><span className="sr-only">Langkah {index + 1}: </span>{title}</h3>
                                        <p className="mt-0.5 text-sm leading-relaxed text-ink-2">{body}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                        {apkUrl && (
                            <p className="mt-6 text-sm leading-relaxed text-ink-2">
                                Belum punya aplikasinya? <a href={apkUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-accent underline underline-offset-2">Unduh APK PRESENSI SMABA</a>,
                                lalu izinkan pemasangan dari sumber ini bila HP bertanya.
                            </p>
                        )}
                    </InfoSection>

                    <InfoSection title="Bantuan" id="bantuan">
                        <dl className="space-y-5">
                            {HELP.map(({ q, a }) => (
                                <div key={q}>
                                    <dt className="text-base font-semibold text-ink">{q}</dt>
                                    <dd className="mt-0.5 text-sm leading-relaxed text-ink-2">{a}</dd>
                                </div>
                            ))}
                        </dl>
                    </InfoSection>
                </main>

                <footer className="mx-auto mt-16 flex w-full max-w-5xl flex-col gap-1 border-t border-line px-4 py-6 text-sm text-ink-2 sm:flex-row sm:justify-between sm:px-6">
                    <p>&copy; {new Date().getFullYear()} E-Presensi SMA Negeri 1 Babat</p>
                    <p>Dikelola Tim IT Sekolah</p>
                </footer>
            </div>

            <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
        </>
    );
}

/** Bagian informasi: judul di kiri (layar lebar) dan isi di kanan, dipisah garis tipis. */
function InfoSection({ title, id, children }) {
    return (
        <section id={id} aria-labelledby={`${id}-title`} className="grid gap-6 border-t border-line py-12 lg:grid-cols-[13rem_1fr] lg:gap-12" data-aos="fade-up">
            <h2 id={`${id}-title`} className="text-sm font-medium text-ink-2">{title}</h2>
            <div>{children}</div>
        </section>
    );
}

/** Tombol unduh APK (Google Drive), dibuka di tab baru. */
function ApkButton({ href }) {
    return (
        <Button variant="primary" size="lg" icon={Download} href={href} external target="_blank" rel="noopener noreferrer">
            Unduh aplikasi Android
        </Button>
    );
}
