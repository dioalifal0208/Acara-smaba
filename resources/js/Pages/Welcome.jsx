import { Link, Head } from '@inertiajs/react';
import { appUrl } from '@/lib/appUrl';
import { useState } from 'react';
import LoginModal from '@/Components/LoginModal';
import { icons } from '@/lib/adminMenu';

const steps = [
    { icon: icons.phone, title: 'Buka aplikasi', body: 'Masuk ke aplikasi E-Presensi di HP Anda.' },
    { icon: icons.camera, title: 'Verifikasi wajah', body: 'Hadapkan wajah ke kamera di area sekolah.' },
    { icon: icons.check, title: 'Presensi tercatat', body: 'Kehadiran langsung masuk ke sistem sekolah.' },
];

export default function Welcome({ auth, stats: initialStats, recentScans = [], canResetPassword = true }) {
    const { user } = auth;
    const stats = initialStats || { total: 0, hadir: 0, belum: 0 };
    const attendancePercentage = stats.total > 0 ? Math.round((stats.hadir / stats.total) * 100) : 0;
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    return (
        <>
            <Head title="E-Presensi SMA Negeri 1 Babat" />

            <div className="flex min-h-screen flex-col bg-canvas text-neutral-700">
                {/* Navbar melayang (pola Material Dashboard) */}
                <header className="sticky top-0 z-40 px-4 pt-3 sm:px-6">
                    <div className="mx-auto flex h-14 max-w-6xl items-center justify-between rounded-lg border border-neutral-200 bg-white/80 px-4 shadow-soft backdrop-blur-md">
                        <div className="flex items-center gap-2">
                            <img src={appUrl('images/logo.png')} alt="" className="h-7 w-7 object-contain" />
                            <span className="text-sm font-semibold text-neutral-800">E-Presensi SMABA</span>
                        </div>
                        <nav className="flex items-center gap-2">
                            {user ? (
                                <>
                                    <Link href={route(user.is_admin ? 'dashboard' : 'participant.dashboard')} className="btn-brand">
                                        {user.is_admin ? 'Buka Dashboard' : 'Beranda Saya'}
                                    </Link>
                                    <Link href={route('logout')} method="post" as="button" className="rounded-md px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900">
                                        Keluar
                                    </Link>
                                </>
                            ) : (
                                <button type="button" id="btn-login-nav" onClick={() => setIsLoginModalOpen(true)} className="btn-brand">
                                    Masuk
                                </button>
                            )}
                        </nav>
                    </div>
                </header>

                <main className="flex flex-1 items-center px-4 py-10 sm:px-6">
                    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-[1.618fr_1fr] lg:gap-14">
                        {/* ── Teks utama ── */}
                        <section data-aos="fade-up">
                            <p className="flex items-center gap-2 text-sm text-neutral-500">
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                                </span>
                                Presensi digital SMA Negeri 1 Babat
                            </p>
                            <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-neutral-900 sm:text-5xl">
                                Presensi cepat, akurat,
                                <br className="hidden sm:block" /> dan tercatat otomatis.
                            </h1>
                            <p className="mt-4 max-w-xl text-base leading-relaxed text-neutral-500">
                                Guru dan pegawai melakukan presensi lewat aplikasi Android dengan verifikasi wajah dan lokasi.
                                Kehadiran tercatat langsung dan dapat dipantau sekolah secara real-time.
                            </p>

                            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                                {steps.map((step, index) => (
                                    <div key={step.title} className="card-soft p-4 transition-shadow duration-200 hover:shadow-soft-lg" data-aos="fade-up" data-aos-delay={100 + index * 50}>
                                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-gradient text-white shadow-dark">
                                            <span className="h-5 w-5">{step.icon}</span>
                                        </span>
                                        <p className="mt-3 text-sm font-semibold text-neutral-800">
                                            <span className="mr-1.5 tabular-nums text-neutral-400">0{index + 1}</span>
                                            {step.title}
                                        </p>
                                        <p className="mt-0.5 text-xs leading-relaxed text-neutral-500">{step.body}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* ── Kartu statistik langsung ── */}
                        <aside data-aos="fade-up" data-aos-delay="150">
                            <div className="card-soft">
                                <div className="flex items-start justify-between gap-3 p-4">
                                    <div>
                                        <h6 className="text-base font-semibold text-neutral-800">Kehadiran Hari Ini</h6>
                                        <p className="text-sm text-neutral-500">Statistik presensi langsung</p>
                                    </div>
                                    <span className="flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                                        Live
                                    </span>
                                </div>

                                <div className="grid grid-cols-3 gap-3 px-4">
                                    <Stat label="Hadir" value={stats.hadir} tone="text-emerald-600" />
                                    <Stat label="Belum" value={stats.belum} tone="text-rose-500" />
                                    <Stat label="Total" value={stats.total} tone="text-neutral-800" />
                                </div>
                                <div className="px-4 pt-4">
                                    <div className="mb-1.5 flex items-baseline justify-between text-xs">
                                        <span className="text-neutral-500">Tingkat kehadiran</span>
                                        <span className="font-bold tabular-nums text-neutral-800">{attendancePercentage}%</span>
                                    </div>
                                    <div className="h-1 overflow-hidden rounded-full bg-neutral-200">
                                        <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-1000 ease-out" style={{ width: `${attendancePercentage}%` }} />
                                    </div>
                                </div>

                                <hr className="hr-fade mt-4" />
                                <div className="p-4">
                                    <p className="mb-3 text-xs font-semibold uppercase text-neutral-500 opacity-70">Aktivitas terkini</p>
                                    {recentScans.length > 0 ? (
                                        <ol className="relative space-y-3 before:absolute before:bottom-3 before:left-[13px] before:top-3 before:w-px before:bg-neutral-200">
                                            {recentScans.map((scan, index) => (
                                                <li key={scan.id || index} className="relative flex items-center gap-3">
                                                    <span className="relative z-10 flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-white text-emerald-500">
                                                        <span className="h-2.5 w-2.5 rounded-full bg-current" />
                                                    </span>
                                                    <p className="min-w-0 flex-1 truncate text-sm font-medium text-neutral-800">{scan.nama}</p>
                                                    <span className="shrink-0 text-xs tabular-nums text-neutral-500">{scan.waktu}</span>
                                                </li>
                                            ))}
                                        </ol>
                                    ) : (
                                        <p className="py-4 text-center text-sm text-neutral-400">Belum ada presensi hari ini.</p>
                                    )}
                                </div>
                            </div>

                            {!user && (
                                <p className="mt-4 text-center text-sm text-neutral-500">
                                    Admin sekolah?{' '}
                                    <button
                                        type="button"
                                        id="btn-login-card-prompt"
                                        onClick={() => setIsLoginModalOpen(true)}
                                        className="font-medium text-brand-700 underline-offset-2 hover:underline"
                                    >
                                        Masuk di sini
                                    </button>
                                </p>
                            )}
                        </aside>
                    </div>
                </main>

                <footer className="px-4 py-4 sm:px-6">
                    <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-1 text-sm text-neutral-500 sm:flex-row">
                        <p>&copy; {new Date().getFullYear()} E-Presensi SMA Negeri 1 Babat</p>
                        <p className="text-neutral-400">Dikelola oleh Tim IT Sekolah</p>
                    </div>
                </footer>
            </div>

            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                canResetPassword={canResetPassword}
            />
        </>
    );
}

function Stat({ label, value, tone }) {
    return (
        <div className="rounded-md border border-neutral-200 px-2 py-2.5 text-center">
            <p className={`text-xl font-bold tabular-nums ${tone}`}>{value}</p>
            <p className="text-xs text-neutral-500">{label}</p>
        </div>
    );
}
