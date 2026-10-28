import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { useToast } from '@/ui';
import { Zap } from 'lucide-react';

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
            aria-label={syncing ? 'Menyinkronkan data web dan Android' : 'Sinkronkan data web dan Android'}
            aria-busy={syncing || undefined}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink disabled:cursor-wait ${syncing ? 'text-status-telat' : ''} ${className}`}
        >
            <Zap className={`h-5 w-5 ${syncing ? 'animate-pulse motion-reduce:animate-none' : ''}`} aria-hidden="true" />
        </button>
    );
}
