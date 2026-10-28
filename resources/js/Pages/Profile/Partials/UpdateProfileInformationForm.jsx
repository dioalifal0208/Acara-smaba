import { Button, Field, Input, Section } from '@/ui';
import { Link, useForm, usePage } from '@inertiajs/react';
import { Check } from 'lucide-react';

export default function UpdateProfileInformation({ mustVerifyEmail, status }) {
    const user = usePage().props.auth.user;
    const { data, setData, patch, errors, processing, recentlySuccessful, isDirty } = useForm({ name: user.name, email: user.email });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'), { preserveScroll: true });
    };

    return (
        <Section title="Informasi profil" description="Nama dan email yang dipakai untuk masuk.">
            <form onSubmit={submit} className="max-w-xl space-y-4">
                <Field label="Nama" required error={errors.name}>
                    <Input value={data.name} onChange={(e) => setData('name', e.target.value)} autoComplete="name" />
                </Field>
                <Field label="Email" required error={errors.email}>
                    <Input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} autoComplete="username" />
                </Field>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <p className="text-sm text-ink-2">
                        Email Anda belum terverifikasi.{' '}
                        <Link href={route('verification.send')} method="post" as="button" className="font-medium text-accent hover:underline">
                            Kirim ulang email verifikasi
                        </Link>
                        {status === 'verification-link-sent' && <span className="mt-1 block text-status-hadir">Tautan verifikasi baru sudah dikirim.</span>}
                    </p>
                )}

                <div className="flex items-center gap-3">
                    <Button variant="primary" type="submit" loading={processing} disabled={!isDirty}>Simpan perubahan</Button>
                    {recentlySuccessful && <p className="flex items-center gap-1 text-sm text-status-hadir" role="status"><Check className="h-4 w-4" aria-hidden="true" />Tersimpan</p>}
                </div>
            </form>
        </Section>
    );
}
