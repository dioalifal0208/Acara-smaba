import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { useToast } from '@/Components/Toast';
import { icons } from '@/lib/adminMenu';

const formatSyncTime = (iso) => new Date(iso).toLocaleString('id-ID', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
});

/**
 * Tombol Sync (petir) admin: minta semua aplikasi Android memuat ulang data dari server
 * (POST /sync → FCM), lalu muat ulang data halaman web ini agar keduanya sama.
 */
export default function SyncButton({ className = '' }) {
    const { lastSync } = usePage().props;
    const { toast } = useToast();
    const [syncing, setSyncing] = useState(false);

    const title = lastSync
        ? `Sinkronkan data web & Android\nTerakhir: ${formatSyncTime(lastSync.at)} oleh ${lastSync.by}`
        : 'Sinkronkan data web & Android';

    const sync = async () => {
        if (syncing) return;
        setSyncing(true);

        try {
            const { data } = await window.axios.post(route('sync.push'));
            toast.success(data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Sinkronisasi gagal. Periksa koneksi lalu coba lagi.');
        } finally {
            // Web ikut memuat ulang data halaman (termasuk info sinkronisasi terakhir).
            router.reload({ preserveScroll: true, onFinish: () => setSyncing(false) });
        }
    };

    return (
        <button
            type="button"
            onClick={sync}
            disabled={syncing}
            title={title}
            aria-label="Sinkronkan data web dan Android"
            className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:text-amber-500 disabled:cursor-wait ${syncing ? 'text-amber-500' : ''} ${className}`}
        >
            <span className={`h-5 w-5 ${syncing ? 'animate-pulse' : ''}`}>{icons.bolt}</span>
        </button>
    );
}
