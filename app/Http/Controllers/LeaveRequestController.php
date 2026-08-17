<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\LeaveRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class LeaveRequestController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'tipe' => 'required|in:izin,sakit',
            'alasan' => 'required|string|max:500',
            'bukti' => 'required|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'event_id' => 'required|exists:events,id',
            'tanggal' => 'required|date',
        ]);

        $participant = auth()->user()->participant;

        if (!$participant) {
            return back()->with('error', 'Akses ditolak. Anda bukan peserta.');
        }

        // Cek apakah sudah pernah mengajukan untuk event dan tanggal tersebut
        $existing = LeaveRequest::where('participant_id', $participant->id)
            ->where('event_id', $request->event_id)
            ->whereDate('tanggal', $request->tanggal)
            ->first();

        if ($existing) {
            return back()->with('error', 'Anda sudah mengajukan izin/sakit untuk acara ini pada tanggal tersebut.');
        }

        $path = $request->file('bukti')->store('bukti_izin', 'public');

        LeaveRequest::create([
            'participant_id' => $participant->id,
            'event_id' => $request->event_id,
            'tanggal' => $request->tanggal,
            'tipe' => $request->tipe,
            'alasan' => $request->alasan,
            'bukti_path' => $path,
            'status_approval' => 'pending',
        ]);

        return back()->with('success', 'Pengajuan ' . ucfirst($request->tipe) . ' berhasil dikirim. Menunggu persetujuan admin.');
    }
}
