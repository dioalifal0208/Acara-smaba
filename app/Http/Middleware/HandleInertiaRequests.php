<?php

namespace App\Http\Middleware;

use App\Http\Controllers\SyncController;
use App\Models\Workcode;
use App\Support\AdminNotifications;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'activeWorkcode' => Workcode::getActive(),
            // Pekerjaan admin yang menunggu verifikasi (lonceng notifikasi); null untuk non-admin.
            'adminNotifications' => fn () => $request->user()?->isAdmin() ? AdminNotifications::summary() : null,
            // Sinkronisasi web → Android terakhir (tombol Sync); null untuk non-admin.
            'lastSync' => fn () => $request->user()?->isAdmin() ? Cache::get(SyncController::LAST_SYNC_KEY) : null,
            // Pesan dari back()->with('success'|'error', ...) untuk toast di halaman.
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
