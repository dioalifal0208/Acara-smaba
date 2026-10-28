import PublicShell from '@/Layouts/PublicShell';
import { Button } from '@/ui';
import { Head, Link, useForm } from '@inertiajs/react';
import { CheckCircle2, MailCheck } from 'lucide-react';

/** Pengingat verifikasi email beserta tombol kirim ulang tautan. */
export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <PublicShell footer="Verifikasi email">
            <Head title="Verifikasi email" />

            <div className="space-y-6">
                <div className="pt-4 text-center">
                    <MailCheck className="mx-auto h-12 w-12 text-ink-2" strokeWidth={1.5} aria-hidden="true" />
                    <h1 className="mt-4 font-display text-2xl font-semibold text-ink">Verifikasi email Anda</h1>
                    <p className="mt-2 text-sm text-ink-2">Kami sudah mengirim tautan verifikasi ke email Anda. Buka tautan itu untuk mulai memakai akun.</p>
                </div>

                {status === 'verification-link-sent' && (
                    <p className="flex items-start gap-2 rounded-xl border border-line bg-status-hadir-soft p-4 text-sm text-ink" role="status">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-status-hadir" aria-hidden="true" />
                        Tautan verifikasi baru sudah dikirim. Periksa juga folder spam.
                    </p>
                )}

                <form onSubmit={submit} className="space-y-2">
                    <Button variant="primary" type="submit" size="lg" loading={processing} className="w-full">Kirim ulang tautan</Button>
                    <Link href={route('logout')} method="post" as="button" className="inline-flex h-10 w-full items-center justify-center rounded-lg text-sm font-medium text-ink-2 hover:bg-surface-2 hover:text-ink">
                        Keluar
                    </Link>
                </form>
            </div>
        </PublicShell>
    );
}
