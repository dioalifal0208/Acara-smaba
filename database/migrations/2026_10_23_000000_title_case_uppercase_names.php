<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Nama yang ditulis huruf besar semua dijadikan kapital tiap kata ("AHMAD SHOMADI, S.Pd." menjadi
     * "Ahmad Shomadi, S.Pd."). Gelar setelah koma pertama dan nama yang sudah tidak kapital semua dibiarkan.
     */
    public function up(): void
    {
        foreach (['participants' => 'nama', 'users' => 'name'] as $table => $column) {
            DB::table($table)->select('id', $column)->orderBy('id')->each(function ($row) use ($table, $column) {
                $parts = explode(',', $row->{$column}, 2);

                if (! preg_match('/\p{L}/u', $parts[0]) || mb_strtoupper($parts[0], 'UTF-8') !== $parts[0]) {
                    return;
                }

                $parts[0] = mb_convert_case(mb_strtolower($parts[0], 'UTF-8'), MB_CASE_TITLE, 'UTF-8');
                DB::table($table)->where('id', $row->id)->update([$column => implode(',', $parts)]);
            });
        }
    }

    /** Huruf besar asli tidak disimpan, jadi perubahan ini tidak bisa dikembalikan. */
    public function down(): void {}
};
