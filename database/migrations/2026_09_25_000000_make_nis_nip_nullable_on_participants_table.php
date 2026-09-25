<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('participants', function (Blueprint $table) {
            $table->string('nis_nip')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('participants')
            ->whereNull('nis_nip')
            ->get(['id'])
            ->each(function ($participant) {
                DB::table('participants')
                    ->where('id', $participant->id)
                    ->update(['nis_nip' => 'NO-NIP-'.$participant->id]);
            });

        Schema::table('participants', function (Blueprint $table) {
            $table->string('nis_nip')->nullable(false)->change();
        });
    }
};
