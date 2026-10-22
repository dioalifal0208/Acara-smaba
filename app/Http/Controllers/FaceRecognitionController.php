<?php

namespace App\Http\Controllers;

use App\Models\FaceHistory;
use App\Models\Participant;
use App\Services\FcmService;
use App\Support\FaceDescriptor;
use App\Support\FaceMatcher;
use App\Support\FacePhoto;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class FaceRecognitionController extends Controller
{
    /**
     * Tolak kiriman descriptor pendaftaran yang tidak valid.
     */
    private function validateEnrollmentDescriptor(Request $request, bool $requireMultiple): void
    {
        $error = FaceDescriptor::validateEnrollment($request->input('descriptor'), $requireMultiple);

        if ($error) {
            throw ValidationException::withMessages(['descriptor' => $error]);
        }
    }

    /**
     * Register Face Descriptor untuk seorang Participant (Admin Only)
     */
    public function register(Request $request, Participant $participant)
    {
        $request->validate([
            'descriptor' => 'required|array',
            'photo' => 'nullable|string',
        ]);
        $this->validateEnrollmentDescriptor($request, requireMultiple: false);

        $updateData = [
            'face_descriptor' => $request->input('descriptor'),
            'face_status' => 'approved', // Admin langsung approved
        ];

        $oldPhotoPath = $participant->photo_path;
        if ($photoPath = FacePhoto::storeDataUrl($participant, $request->input('photo'))) {
            $updateData['photo_path'] = $photoPath;
        }

        // Simpan 128-dimensional array dan photo
        $participant->update($updateData);
        FaceHistory::record($participant, 'admin', auth()->id());
        FacePhoto::deleteReplaced($oldPhotoPath, $photoPath);
        app(FcmService::class)->sendStateChanged($participant, 'face');

        return response()->json([
            'status' => 'success',
            'message' => 'Data wajah berhasil didaftarkan untuk '.$participant->nama,
        ]);
    }

    /**
     * Register Face Descriptor oleh Peserta Sendiri (Status: Pending)
     */
    public function registerSelf(Request $request, Participant $participant)
    {
        // Pastikan peserta hanya bisa mendaftarkan wajahnya sendiri
        if (auth()->user()->participant_id != $participant->id) {
            abort(403, 'Anda tidak diizinkan mengubah data peserta lain.');
        }

        $request->validate([
            'descriptor' => 'required|array',
            'photo' => 'nullable|string',
        ]);
        // Peserta wajib melalui pemindaian terpandu (beberapa sampel wajah depan, bukan satu frame).
        $this->validateEnrollmentDescriptor($request, requireMultiple: true);

        $updateData = [
            'face_descriptor' => $request->input('descriptor'),
            'face_status' => 'pending',
        ];

        $oldPhotoPath = $participant->photo_path;
        if ($photoPath = FacePhoto::storeDataUrl($participant, $request->input('photo'), '_self')) {
            $updateData['photo_path'] = $photoPath;
        }

        $participant->update($updateData);
        FacePhoto::deleteReplaced($oldPhotoPath, $photoPath);
        app(FcmService::class)->sendStateChanged($participant, 'face');

        return response()->json([
            'status' => 'success',
            'message' => 'Data wajah berhasil disimpan. Menunggu persetujuan Admin.',
        ]);
    }

    /**
     * Approve Face Descriptor (Admin Only)
     */
    public function approveFace(Participant $participant)
    {
        // Data wajah yang tidak memiliki sampel 128-d (model lama) tidak bisa dipakai presensi.
        if (FaceMatcher::compatibleSampleCount($participant->face_descriptor) === 0) {
            return redirect()->back()->with('error', 'Data wajah '.$participant->nama.' tidak kompatibel (versi aplikasi lama). Minta peserta mendaftar ulang wajah.');
        }

        $participant->update(['face_status' => 'approved']);
        FaceHistory::record($participant, 'registration', auth()->id());
        app(FcmService::class)->sendStateChanged($participant, 'face');

        return redirect()->back()->with('success', 'Wajah peserta '.$participant->nama.' berhasil disetujui.');
    }

    /**
     * Reject Face Descriptor (Admin Only)
     */
    public function rejectFace(Participant $participant)
    {
        // Hapus foto jika ditolak (foto yang tercatat di riwayat wajah tetap disimpan)
        FaceHistory::deleteFileUnlessReferenced($participant->photo_path);

        $participant->update([
            'face_status' => 'rejected',
            'face_descriptor' => null,
            'photo_path' => null,
        ]);
        app(FcmService::class)->sendStateChanged($participant, 'face');

        return redirect()->back()->with('success', 'Wajah peserta '.$participant->nama.' ditolak dan data dihapus.');
    }

    /**
     * Hapus Face Descriptor
     */
    public function deleteFace(Participant $participant)
    {
        // Foto yang tercatat di riwayat wajah tetap disimpan.
        FaceHistory::deleteFileUnlessReferenced($participant->photo_path);

        $participant->update([
            'face_descriptor' => null,
            'photo_path' => null,
            'face_status' => 'none',
        ]);
        app(FcmService::class)->sendStateChanged($participant, 'face');

        return response()->json([
            'status' => 'success',
            'message' => 'Data wajah berhasil dihapus untuk '.$participant->nama,
        ]);
    }
}
