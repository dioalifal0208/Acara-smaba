<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EventController extends Controller
{
    /**
     * Tampilkan halaman kelola event.
     */
    public function index()
    {
        $events = Event::withCount('attendances')
            ->orderBy('is_active', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Events/Index', [
            'events' => $events,
        ]);
    }

    /**
     * Simpan event baru.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_event' => 'required|string|max:255',
            'deskripsi' => 'nullable|string|max:1000',
            'set_active' => 'boolean',
        ]);

        $setActive = $request->boolean('set_active') || Event::count() === 0;

        if ($setActive) {
            Event::query()->update(['is_active' => false]);
        }

        $event = Event::create([
            'nama_event' => $validated['nama_event'],
            'deskripsi' => $validated['deskripsi'] ?? null,
            'is_active' => $setActive,
        ]);

        $message = $setActive
            ? "Event '{$event->nama_event}' berhasil dibuat dan diaktifkan!"
            : "Event '{$event->nama_event}' berhasil dibuat.";

        return redirect()->back()->with('success', $message);
    }

    /**
     * Aktifkan event tertentu.
     */
    public function activate(Event $event)
    {
        Event::query()->update(['is_active' => false]);
        $event->update(['is_active' => true]);

        return redirect()->back()->with('success', "Event '{$event->nama_event}' sekarang aktif.");
    }

    /**
     * Nonaktifkan event aktif.
     */
    public function deactivate(Event $event)
    {
        $event->update(['is_active' => false]);

        return redirect()->back()->with('success', "Event '{$event->nama_event}' telah dinonaktifkan.");
    }

    /**
     * Hapus event.
     */
    public function destroy(Event $event)
    {
        $nama = $event->nama_event;
        $event->delete();

        return redirect()->back()->with('success', "Event '{$nama}' berhasil dihapus.");
    }
}
