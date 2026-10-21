import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Login({ status, canResetPassword }) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        login: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Masuk" />

            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Masuk</h1>
            <p className="mt-1 text-sm font-medium text-slate-500">Gunakan akun yang diberikan sekolah.</p>

            {status && (
                <div className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700" role="status">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="mt-6 space-y-4">
                <div>
                    <InputLabel htmlFor="login" value="Email / NIP" />
                    <TextInput
                        id="login"
                        type="text"
                        name="login"
                        value={data.login}
                        className="mt-1.5 block w-full py-3"
                        autoComplete="username"
                        isFocused={true}
                        placeholder="Email atau NIP"
                        onChange={(e) => setData('login', e.target.value)}
                    />
                    <InputError message={errors.login} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Password" />
                    <div className="relative mt-1.5">
                        <TextInput
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            className="block w-full py-3 pr-12"
                            autoComplete="current-password"
                            placeholder="Password"
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((value) => !value)}
                            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-2xl text-slate-400 transition hover:text-brand-600"
                            aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                        >
                            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                    </div>
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex items-center justify-between gap-3">
                    <label className="flex items-center">
                        <Checkbox name="remember" checked={data.remember} onChange={(e) => setData('remember', e.target.checked)} />
                        <span className="ms-2 text-sm font-medium text-slate-600">Ingat saya</span>
                    </label>
                    {canResetPassword && (
                        <Link href={route('password.request')} className="text-sm font-semibold text-brand-600 hover:text-brand-700">
                            Lupa password?
                        </Link>
                    )}
                </div>

                <PrimaryButton className="w-full py-3 text-base" disabled={processing}>
                    {processing ? 'Memeriksa…' : 'Masuk'}
                </PrimaryButton>
            </form>
        </GuestLayout>
    );
}

function EyeIcon() {
    return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    );
}

function EyeOffIcon() {
    return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
        </svg>
    );
}
