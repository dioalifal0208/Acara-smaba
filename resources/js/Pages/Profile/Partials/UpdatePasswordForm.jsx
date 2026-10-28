import { Button, Field, Input, Section } from '@/ui';
import { useForm } from '@inertiajs/react';
import { Check } from 'lucide-react';
import { useRef } from 'react';

export default function UpdatePasswordForm() {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();
    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errs) => {
                if (errs.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }
                if (errs.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <Section title="Kata sandi" description="Pakai kata sandi yang panjang dan acak agar akun tetap aman.">
            <form onSubmit={submit} className="max-w-xl space-y-4">
                <Field label="Kata sandi saat ini" error={errors.current_password}>
                    <Input ref={currentPasswordInput} type="password" value={data.current_password} onChange={(e) => setData('current_password', e.target.value)} autoComplete="current-password" />
                </Field>
                <Field label="Kata sandi baru" error={errors.password} hint="Minimal 8 karakter.">
                    <Input ref={passwordInput} type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} autoComplete="new-password" />
                </Field>
                <Field label="Ulangi kata sandi baru" error={errors.password_confirmation}>
                    <Input type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} autoComplete="new-password" />
                </Field>
                <div className="flex items-center gap-3">
                    <Button variant="primary" type="submit" loading={processing} disabled={!data.password}>Ganti kata sandi</Button>
                    {recentlySuccessful && <p className="flex items-center gap-1 text-sm text-status-hadir" role="status"><Check className="h-4 w-4" aria-hidden="true" />Kata sandi diganti</p>}
                </div>
            </form>
        </Section>
    );
}
