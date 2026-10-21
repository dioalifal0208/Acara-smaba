<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Participant;
use App\Support\FaceDescriptor;
use App\Support\FaceMatcher;
use App\Support\FacePhoto;
use App\Services\FcmService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

/**
 * POST /api/v1/me/face-enrollment: pendaftaran wajah dari aplikasi Android, dengan semantik yang sama
 * seperti pendaftaran mandiri web (FaceRecognitionController::registerSelf): 3-10 sampel wajah depan
 * 128-d model face-api.js, disimpan apa adanya, status menjadi pending sampai disetujui admin di web.
 */
class FaceEnrollmentController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();

        if (! $user->tokenCan('role:participant') || $user->role !== 'participant' || ! $user->participant_id || ! $user->participant) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akses ditolak. Endpoint ini khusus untuk peserta.',
            ], 403);
        }

        if ($request->input('model') !== FaceMatcher::MODEL_ID) {
            return response()->json([
                'status' => 'face_model_mismatch',
                'message' => 'Versi aplikasi/model wajah tidak sesuai. Perbarui aplikasi.',
            ], 426);
        }

        $validator = Validator::make($request->all(), [
            'descriptors' => 'required|array',
            // Foto JPEG/PNG base64 maksimal ~1,5 MB (sekitar 2 juta karakter base64).
            'photo' => ['nullable', 'string', 'max:2000000', 'regex:/^data:image\/(jpeg|jpg|png);base64,/'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'invalid_face_data',
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $participant = $user->participant;
        $face = $participant->faceState();

        if (! $face['can_enroll']) {
            return response()->json([
                'status' => 'face_already_registered',
                'message' => 'Wajah Anda sudah terdaftar dan disetujui. Untuk mengganti foto/wajah, ajukan perubahan foto.',
            ], 409);
        }

        if ($error = FaceDescriptor::validateEnrollment($request->input('descriptors'), requireMultiple: true)) {
            return response()->json([
                'status' => 'invalid_face_data',
                'message' => $error,
            ], 422);
        }

        $photoPath = FacePhoto::storeDataUrl($participant, $request->input('photo'), '_self');

        try {
            $oldPhotoPath = DB::transaction(function () use ($participant, $request, $photoPath) {
                $locked = Participant::lockForUpdate()->findOrFail($participant->id);
                $oldPhotoPath = $locked->photo_path;

                $locked->update(array_filter([
                    'face_descriptor' => $request->input('descriptors'),
                    'face_status' => 'pending',
                    'photo_path' => $photoPath,
                ], fn ($value) => $value !== null));

                return $oldPhotoPath;
            });
        } catch (\Throwable $exception) {
            if ($photoPath) {
                Storage::disk('private')->delete($photoPath);
            }

            throw $exception;
        }

        FacePhoto::deleteReplaced($oldPhotoPath, $photoPath);
        // Aplikasi pendaftar sudah menerima respons ini, tetapi perubahan state juga perlu
        // menjadi pemicu sinkronisasi untuk sesi/perangkat peserta yang lain.
        app(FcmService::class)->sendStateChanged($participant, 'face');

        return response()->json([
            'status' => 'success',
            'message' => 'Data wajah terkirim dan menunggu persetujuan admin.',
            'data' => [
                'face' => $participant->fresh()->faceState(),
            ],
        ], 201);
    }
}
