import PublicShell from '@/Layouts/PublicShell';
import { Button, Field, PasswordInput } from '@/ui';
import { Head, useForm } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';

/** Konfirmasi kata sandi sebelum membuka bagian yang sensitif. */
export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({ password: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.confirm'), { onFinish: () => reset('password') });
    };

    return (
        <PublicShell footer="Keamanan akun">
            <Head title="Konfirmasi kata sandi" />

            <div className="space-y-6">
                <div className="pt-4 text-center">
                    <ShieldCheck className="mx-auto h-12 w-12 text-ink-2" strokeWidth={1.5} aria-hidden="true" />
                    <h1 className="mt-4 font-display text-2xl font-semibold text-ink">Konfirmasi kata sandi</h1>
                    <p className="mt-2 text-sm text-ink-2">Bagian ini butuh keamanan tambahan. Masukkan kata sandi Anda untuk melanjutkan.</p>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <Field label="Kata sandi" error={errors.password}>
                        <PasswordInput value={data.password} onChange={(e) => setData('password', e.target.value)} autoComplete="current-password" autoFocus required />
                    </Field>
                    <Button variant="primary" type="submit" size="lg" loading={processing} className="w-full">Lanjutkan</Button>
                </form>
            </div>
        </PublicShell>
    );
}
