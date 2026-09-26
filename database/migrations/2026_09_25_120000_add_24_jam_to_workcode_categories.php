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
        Schema::table('workcodes', function (Blueprint $table) {
            $table->enum('kategori', ['workcode', 'harian', '24_jam'])
                ->default('workcode')
                ->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('workcodes')
            ->where('kategori', '24_jam')
            ->update(['kategori' => 'workcode']);

        Schema::table('workcodes', function (Blueprint $table) {
            $table->enum('kategori', ['workcode', 'harian'])
                ->default('workcode')
                ->change();
        });
    }
};
