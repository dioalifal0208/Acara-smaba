import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageHeader, StatusPill } from '@/ui';
import { Head, usePage } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

/** Profil akun yang sedang masuk: tiga bagian pendek dalam satu halaman (tanpa tab). */
export default function Edit({ mustVerifyEmail, status }) {
    const { auth } = usePage().props;
    const user = auth.user;

    return (
        <AuthenticatedLayout>
            <Head title="Profil" />

            <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 sm:px-6">
                <PageHeader title="Profil" description="Nama, email, dan kata sandi akun Anda." />

                <div className="flex items-center gap-4">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xl font-semibold text-ink-2" aria-hidden="true">
                        {user.name.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-ink">{user.name}</p>
                        <p className="truncate text-sm text-ink-2">{user.email}</p>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                            <StatusPill tone="netral" label={user.is_admin ? 'Administrator' : 'Peserta'} />
                            {user.email_verified_at
                                ? <StatusPill status="approved" label="Email terverifikasi" />
                                : <StatusPill status="pending" label="Email belum terverifikasi" />}
                        </div>
                    </div>
                </div>

                <UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} status={status} />
                <UpdatePasswordForm />
                <DeleteUserForm />
            </div>
        </AuthenticatedLayout>
    );
}
