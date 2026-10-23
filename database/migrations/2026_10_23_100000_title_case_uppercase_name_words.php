<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Lanjutan perapian nama: kata yang huruf besar semua dijadikan kapital tiap kata walau gelarnya
     * tidak dipisah koma ("AINI KURNIA RAHAYU S.Pd." menjadi "Aini Kurnia Rahayu S.Pd."). Gelar setelah
     * koma pertama, singkatan bertitik seperti S.KOM, inisial satu huruf, dan kata yang sudah berhuruf
     * kecil dibiarkan.
     */
    public function up(): void
    {
        foreach (['participants' => 'nama', 'users' => 'name'] as $table => $column) {
            DB::table($table)->select('id', $column)->orderBy('id')->each(function ($row) use ($table, $column) {
                $parts = explode(',', $row->{$column}, 2);
                $parts[0] = preg_replace_callback('/\S+/u', fn ($match) => $this->titleCaseWord($match[0]), $parts[0]);
                $name = implode(',', $parts);

                if ($name !== $row->{$column}) {
                    DB::table($table)->where('id', $row->id)->update([$column => $name]);
                }
            });
        }
    }

    private function titleCaseWord(string $word): string
    {
        $letters = preg_replace('/[^\p{L}]/u', '', $word);

        if (mb_strlen($letters) < 2 || mb_strtoupper($word, 'UTF-8') !== $word || preg_match('/\p{L}\.\p{L}/u', $word)) {
            return $word;
        }

        return mb_convert_case(mb_strtolower($word, 'UTF-8'), MB_CASE_TITLE, 'UTF-8');
    }

    /** Huruf besar asli tidak disimpan, jadi perubahan ini tidak bisa dikembalikan. */
    public function down(): void {}
};
