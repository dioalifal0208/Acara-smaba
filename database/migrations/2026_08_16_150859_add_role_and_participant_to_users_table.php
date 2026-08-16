<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['admin', 'participant'])->default('admin')->after('email');
            $table->string('username')->unique()->nullable()->after('email');
            $table->foreignId('participant_id')->nullable()->constrained('participants')->nullOnDelete()->after('id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['participant_id']);
            $table->dropColumn(['role', 'username', 'participant_id']);
        });
    }
};
