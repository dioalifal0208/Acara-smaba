import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

const tabs = [
    ['profile-info', 'Informasi Profil'],
    ['security', 'Keamanan'],
    ['danger-zone', 'Hapus Akun'],
];

export default function Edit({ mustVerifyEmail, status }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const [activeTab, setActiveTab] = useState('profile-info');

    return (
        <AuthenticatedLayout>
            <Head title="Profil" />

            <div className="flex w-full flex-1 flex-col px-4 py-2 sm:px-6 xl:min-h-0 xl:overflow-hidden">
                <div className="mb-4 shrink-0" data-aos="fade-up">
                    <h3 className="text-xl font-bold text-neutral-800">Profil</h3>
                    <p className="mt-0.5 text-sm text-neutral-500">Kelola nama, email, dan password akun Anda.</p>
                </div>

                {/* Kartu identitas + tab (pola halaman Profile pada referensi) */}
                <section className="card-soft p-4" data-aos="fade-up">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex min-w-0 items-center gap-4">
                            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-brand-gradient text-2xl font-semibold text-white shadow-dark">
                                {user.name.charAt(0).toUpperCase()}
                            </span>
                            <div className="min-w-0">
                                <h5 className="truncate text-lg font-semibold text-neutral-800">{user.name}</h5>
                                <p className="truncate text-sm text-neutral-500">{user.email}</p>
                                <span className="mt-1 inline-flex rounded-md bg-brand-gradient px-2 py-0.5 text-[10px] font-bold uppercase leading-4 text-white">
                                    {user.is_admin ? 'Administrator' : 'Peserta'}
                                </span>
                            </div>
                        </div>
                        <div className="inline-flex w-full rounded-lg bg-neutral-100 p-1 md:w-auto" role="tablist" aria-label="Bagian profil">
                            {tabs.map(([key, label]) => (
                                <button
                                    key={key}
                                    type="button"
                                    role="tab"
                                    aria-selected={activeTab === key}
                                    onClick={() => setActiveTab(key)}
                                    className={`flex-1 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200 md:flex-none ${
                                        activeTab === key
                                            ? `bg-white shadow-soft ${key === 'danger-zone' ? 'text-rose-600' : 'text-brand-700'}`
                                            : 'text-neutral-500 hover:text-neutral-900'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="mt-4 grid grid-cols-1 gap-4 xl:min-h-0 xl:flex-1 xl:grid-cols-3 xl:items-start">
                    <div key={activeTab} className="card-soft p-4 sm:p-6 xl:col-span-2 animate-[profileTab_0.25s_ease-out]">
                        {activeTab === 'profile-info' && (
                            <UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} status={status} className="max-w-xl" />
                        )}
                        {activeTab === 'security' && <UpdatePasswordForm className="max-w-xl" />}
                        {activeTab === 'danger-zone' && <DeleteUserForm className="max-w-xl" />}
                    </div>

                    <aside className="card-soft p-4" data-aos="fade-up" data-aos-delay="100">
                        <h6 className="text-base font-semibold text-neutral-800">Informasi Akun</h6>
                        <p className="mt-0.5 text-sm text-neutral-500">Ringkasan akun yang sedang masuk</p>
                        <hr className="hr-fade my-3" />
                        <dl className="space-y-3 text-sm">
                            <InfoRow label="Nama lengkap" value={user.name} />
                            <InfoRow label="Email" value={user.email} />
                            <InfoRow label="Peran" value={user.is_admin ? 'Administrator' : 'Peserta'} />
                            <InfoRow
                                label="Status email"
                                value={
                                    <span className={`inline-flex items-center gap-1.5 ${user.email_verified_at ? 'text-emerald-600' : 'text-amber-600'}`}>
                                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                        {user.email_verified_at ? 'Terverifikasi' : 'Belum terverifikasi'}
                                    </span>
                                }
                            />
                        </dl>
                    </aside>
                </section>
            </div>

            <style>{`
                @keyframes profileTab {
                    from { opacity: 0; transform: translateY(6px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </AuthenticatedLayout>
    );
}

function InfoRow({ label, value }) {
    return (
        <div className="flex items-start justify-between gap-4">
            <dt className="shrink-0 text-neutral-500">{label}</dt>
            <dd className="min-w-0 truncate text-right font-medium text-neutral-800">{value}</dd>
        </div>
    );
}
