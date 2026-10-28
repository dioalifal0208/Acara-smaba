import { Button, Card, Dialog, Field, Input } from '@/ui';
import { useForm } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';

/** Hapus akun sendiri: konfirmasi dengan kata sandi di dialog (fokus awal di isian kata sandi). */
export default function DeleteUserForm() {
    const [open, setOpen] = useState(false);
    const passwordInput = useRef();
    const { data, setData, delete: destroy, processing, reset, errors, clearErrors } = useForm({ password: '' });

    const close = () => {
        setOpen(false);
        clearErrors();
        reset();
    };

    const submit = (e) => {
        e.preventDefault();
        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: close,
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    return (
        <Card as="section" className="border-danger/30 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-base font-semibold text-ink">Hapus akun</h2>
                    <p className="mt-0.5 max-w-xl text-sm text-ink-2">Akun dan datanya dihapus permanen dan tidak bisa dikembalikan.</p>
                </div>
                <Button variant="danger" icon={Trash2} onClick={() => setOpen(true)}>Hapus akun</Button>
            </div>

            <Dialog
                open={open}
                onClose={close}
                title="Hapus akun Anda?"
                description="Masukkan kata sandi untuk memastikan. Akun dan datanya dihapus permanen."
                size="sm"
                initialFocus={passwordInput}
                footer={
                    <>
                        <Button onClick={close}>Batal</Button>
                        <Button variant="danger" type="submit" form="delete-account" loading={processing} disabled={!data.password}>Hapus akun</Button>
                    </>
                }
            >
                <form id="delete-account" onSubmit={submit}>
                    <Field label="Kata sandi" error={errors.password}>
                        <Input ref={passwordInput} type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} autoComplete="current-password" />
                    </Field>
                </form>
            </Dialog>
        </Card>
    );
}
