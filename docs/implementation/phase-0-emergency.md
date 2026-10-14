# Fase 0 — Darurat

**Tujuan:** tidak ada lagi jalan bagi orang asing menjadi admin, dan kredensial yang bocor tidak lagi berlaku.
**Estimasi:** 0,5–1 hari. **Branch:** `fix/phase-0-emergency`.
**Prasyarat:** akses SSH/hPanel Hostinger, akses DB produksi, hak push ke GitHub.

Urutan penting: **0.1 (tutup pintu) → 0.2 (rotasi) → 0.3 (audit) → 0.4 (bersihkan history)**. Jangan audit akun sebelum registrasi ditutup.

---

## 0.1 Tutup registrasi publik

**Perubahan**
1. `routes/auth.php:15-18` — hapus route `register` (GET dan POST) beserta `use RegisteredUserController` di baris 10.
2. Hapus `app/Http/Controllers/Auth/RegisteredUserController.php` dan `resources/js/Pages/Auth/Register.jsx`.
3. Cari referensi sisa: `grep -rn "route('register')" resources/js` lalu hapus link "Register"/"Daftar" di `Login.jsx`, `Welcome.jsx`, `GuestLayout.jsx` bila ada.
4. `app/Models/User.php:26` — keluarkan `'role'` dari `$fillable`. Cari semua `User::create(` / `->fill(` / `updateOrCreate(` yang mengandalkan mass-assignment `role` (seeder, `ParticipantController` sinkronisasi akun peserta) dan ubah menjadi `$user->role = '...'` eksplisit atau `forceFill`.
5. Migration baru `*_set_users_role_default_participant.php`: ubah default kolom `role` menjadi `participant`. **Jangan** mengedit migration lama. Jangan ubah data di migration ini.
   - SQLite tidak mendukung `->change()` pada enum dengan baik; di lingkungan test gunakan `Schema::hasColumn` guard atau rebuild tabel. Cek dengan `php artisan migrate:fresh --env=testing` setelahnya.
6. Admin baru hanya lewat seeder/command: buat `php artisan user:make-admin {username}` (minta password interaktif, tidak menerima password via argumen).

**Test**
- Ganti `tests/Feature/Auth/RegistrationTest.php`: `GET /register` dan `POST /register` → 404; jumlah `User` tidak berubah.
- Test: `User::factory()->create()` tanpa role → role `participant`.
- Test: `PATCH /profile` dengan field `role=admin` → role tidak berubah.
- Jalankan juga suite `AuthenticationTest` (login admin/peserta tetap jalan).

**Verifikasi manual:** `curl -i https://<domain>/register` → 404; halaman login tidak lagi menampilkan link daftar.

**Rollback:** revert PR; tidak ada perubahan data.

---

## 0.2 Rotasi kredensial yang terekspos

Anggap semua ini bocor sejak commit `a2bcfc3` (repo `dioalifal0208/Acara-smaba`), apa pun status privat/publik repo.

| Kredensial | Aksi |
|---|---|
| Password SSH `u203096280@45.90.229.210:65002` | Ganti di hPanel **sekarang**. Tambahkan SSH key (`ssh-keygen -t ed25519`), uji login key, lalu nonaktifkan password login bila hosting mengizinkan. |
| Password DB produksi | Ganti di hPanel + `.env` server. Uji aplikasi. |
| Password akun admin yang ada | Paksa reset semua admin (0.3). |
| `APP_KEY` | Rotasi **hanya** jika `.env` pernah bocor; efeknya semua sesi logout dan data ter-enkripsi tak terbaca (cek penggunaan `encrypted` cast dulu). |
| Firebase service account | Cek `git log --all -- '*firebase*'`; jika pernah ter-commit, buat key baru di Google Cloud dan hapus yang lama. |
| Token Sanctum | `DELETE FROM personal_access_tokens;` setelah koordinasi (semua perangkat Android harus login ulang). Lakukan di jam sepi. |

**Perubahan kode**
1. `git rm deploy/test.ps1`. Pastikan `deploy/deploy.ps1` membaca `deploy/.env.deploy` dan tidak menyimpan password (periksa isinya; hapus fallback hard-coded).
2. `.gitignore`: tambah `deploy/*.local.ps1`, `deploy/.env.*` (kecuali `.env.deploy.example`), `*.pem`, `*firebase*credentials*.json`.
3. Buat `deploy/.env.deploy.example` berisi nama variabel tanpa nilai.
4. Aktifkan pre-commit secret scan: `gitleaks protect --staged` (konfigurasi di Fase 3.3 untuk CI; di sini cukup hook lokal atau dokumentasi).

**Verifikasi:** login SSH dengan password lama gagal; deploy berikutnya memakai key; `gitleaks detect --no-git` pada working tree bersih.

---

## 0.3 Audit akun dan jejak penyalahgunaan

Jalankan di DB produksi (read-only dulu, simpan hasil di luar repo):

```sql
-- Semua admin
SELECT id, name, email, username, role, participant_id, email_verified_at, created_at
FROM users WHERE role = 'admin' ORDER BY created_at;

-- Admin yang tidak terhubung ke peserta dan dibuat lewat /register (email tanpa username)
SELECT id, name, email, created_at FROM users
WHERE role = 'admin' AND username IS NULL;

-- Aktivitas tulis mencurigakan sejak registrasi terbuka
SELECT id, workcode_id, participant_id, tanggal, status, updated_at
FROM attendances WHERE updated_at > :tanggal_deploy_registrasi ORDER BY updated_at DESC;
SELECT id, nama, nis_nip, updated_at FROM participants ORDER BY updated_at DESC LIMIT 50;
SELECT id, participant_id, status, updated_at FROM leave_requests ORDER BY updated_at DESC LIMIT 50;
```

**Keputusan per akun** (konfirmasi dengan kepala/pengelola sekolah):
- Sah → pertahankan, paksa ganti password (`php artisan tinker`: `$u->forceFill(['password'=>Hash::make(...)])->save()`; kirim password sementara lewat kanal aman).
- Tidak dikenal → `DELETE FROM personal_access_tokens WHERE tokenable_id=?`, turunkan role ke `participant`, atau hapus akun; catat tindakan.
- Cek `storage/logs/laravel-*.log` untuk IP yang melakukan `POST /register` dan akses `/dashboard`, `/participants`, `/report`.
- Bila ada tanda data diubah/dihapus: restore dari backup terakhir ke DB sementara dan bandingkan.

**Output:** catatan audit singkat (tanggal, akun yang dihapus/diturunkan, bukti) disimpan di luar repo atau di `docs/` tanpa data pribadi.

---

## 0.4 Bersihkan history Git (butuh persetujuan pemilik)

Hanya dikerjakan setelah 0.2 selesai (rotasi lebih penting daripada pembersihan).

1. Backup: `git clone --mirror <repo> backup.git`.
2. `git filter-repo --path deploy/test.ps1 --invert-paths` (instal `git-filter-repo` dulu) pada klon baru.
3. Periksa: `git log --all -- deploy/test.ps1` kosong; `git grep -I "SSH_PASS" $(git rev-list --all)` kosong.
4. `git push --force --all` dan `--tags` — **hanya dengan izin eksplisit**. Beri tahu semua yang punya klon agar `git clone` ulang.
5. Hapus fork/PR cache di GitHub: ajukan ke GitHub Support untuk purge cached view bila repo publik.

Jika pemilik menolak force-push: dokumentasikan bahwa kredensial lama sudah tidak valid (0.2) dan lanjutkan; risikonya lebih kecil setelah rotasi.

---

## Definition of Done Fase 0

- [ ] `/register` mengembalikan 404 di produksi.
- [ ] `role` tidak di `$fillable`; default DB `participant`; test lulus.
- [ ] Password SSH dan DB diganti; login password SSH lama gagal.
- [ ] `deploy/test.ps1` terhapus dari working tree; `.gitignore` diperbarui.
- [ ] Daftar admin dikonfirmasi sah oleh pemilik; akun asing dicabut; token direset.
- [ ] (Opsional, atas izin) history dibersihkan dan tim klon ulang.
