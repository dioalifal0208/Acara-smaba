import { Button, Dialog, Field, Input, PasswordInput } from '@/ui';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';

/** Popup masuk di halaman depan: email (admin) atau NIP (guru & pegawai) + kata sandi. */
export default function LoginModal({ isOpen, onClose }) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        login: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        if (!isOpen) {
            reset();
            clearErrors();
        }
    }, [isOpen]);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
            onSuccess: onClose,
        });
    };

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            title="Masuk"
            description="E-Presensi SMA Negeri 1 Babat"
            size="sm"
        >
            <form onSubmit={submit} className="space-y-4 pb-2">
                <Field label="Email atau NIP" hint="Admin memakai email, guru dan pegawai memakai NIP (GTT/PTT memakai ID pengganti NIP)." error={errors.login}>
                    <Input
                        name="login"
                        value={data.login}
                        onChange={(e) => setData('login', e.target.value)}
                        autoComplete="username"
                        autoCapitalize="none"
                        spellCheck={false}
                        required
                        data-autofocus
                    />
                </Field>

                <Field label="Kata sandi" error={errors.password}>
                    <PasswordInput
                        name="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        autoComplete="current-password"
                        required
                    />
                </Field>

                <label className="flex cursor-pointer items-center gap-3 text-sm text-ink">
                    <input
                        type="checkbox"
                        name="remember"
                        checked={data.remember}
                        onChange={(e) => setData('remember', e.target.checked)}
                        className="h-[18px] w-[18px] rounded border-line-strong bg-surface text-accent focus:ring-accent"
                    />
                    Tetap masuk di perangkat ini
                </label>

                <Button variant="primary" type="submit" size="lg" loading={processing} className="w-full">Masuk</Button>
            </form>
        </Dialog>
    );
}
