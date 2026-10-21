import { useForm, Link } from '@inertiajs/react';
import { appUrl } from '@/lib/appUrl';
import { useState, useEffect } from 'react';
import InputError from '@/Components/InputError';
import Checkbox from '@/Components/Checkbox';

export default function LoginModal({ isOpen, onClose, canResetPassword = true }) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        login: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            reset();
            clearErrors();
            setShowPassword(false);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
            onSuccess: () => {
                onClose();
            },
        });
    };

    if (!isOpen) return null;

    const input = 'w-full rounded-md border border-neutral-300 bg-white py-2.5 pl-10 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors focus:border-brand-600 focus:outline-none focus:ring-0';

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-neutral-900/40 p-0 backdrop-blur-sm animate-[loginFade_0.2s_ease-out] sm:items-center sm:p-6"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-title"
        >
            <div
                className="relative mt-10 w-full rounded-t-lg border border-neutral-200 bg-white px-4 pb-6 pt-0 shadow-soft-lg animate-[loginPop_0.25s_cubic-bezier(0.4,0,0.2,1)] sm:max-w-sm sm:rounded-lg"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Kepala gelap yang menumpang di tepi atas kartu (pola halaman Sign In referensi) */}
                <div className="relative -mt-8 rounded-lg bg-brand-gradient px-4 py-5 text-center text-white shadow-dark">
                    <img src={appUrl('images/logo.png')} alt="" className="mx-auto h-10 w-10 rounded-full bg-white object-contain p-1" />
                    <h2 id="login-title" className="mt-2 text-lg font-bold">Masuk</h2>
                    <p className="text-xs text-white/70">E-Presensi SMA Negeri 1 Babat</p>
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                        aria-label="Tutup"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={submit} className="mt-6 space-y-4 px-2">
                    <div>
                        <label className="mb-1 block text-sm text-neutral-600" htmlFor="modal-email">Email / NIP</label>
                        <div className="relative">
                            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </span>
                            <input
                                id="modal-email"
                                type="text"
                                name="login"
                                value={data.login}
                                className={`${input} pr-3`}
                                placeholder="Email atau NIP Anda"
                                autoComplete="username"
                                autoFocus
                                required
                                onChange={(e) => setData('login', e.target.value)}
                            />
                        </div>
                        <InputError message={errors.login} className="mt-1.5" />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm text-neutral-600" htmlFor="modal-password">Password</label>
                        <div className="relative">
                            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </span>
                            <input
                                id="modal-password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={data.password}
                                className={`${input} pr-10`}
                                placeholder="••••••••"
                                autoComplete="current-password"
                                required
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 transition-colors hover:text-neutral-700"
                                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        <InputError message={errors.password} className="mt-1.5" />
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="flex cursor-pointer items-center">
                            <Checkbox name="remember" checked={data.remember} onChange={(e) => setData('remember', e.target.checked)} />
                            <span className="ms-2 text-sm text-neutral-600">Ingat saya</span>
                        </label>
                        {canResetPassword && (
                            <Link href={route('password.request')} className="text-sm font-medium text-brand-700 underline-offset-2 hover:underline">
                                Lupa password?
                            </Link>
                        )}
                    </div>

                    <button type="submit" disabled={processing} className="btn-brand w-full">
                        {processing ? (
                            <>
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                Memproses…
                            </>
                        ) : (
                            'Masuk'
                        )}
                    </button>
                </form>
            </div>

            <style>{`
                @keyframes loginFade { from { opacity: 0; } to { opacity: 1; } }
                @keyframes loginPop {
                    from { opacity: 0; transform: translateY(12px) scale(0.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
}
