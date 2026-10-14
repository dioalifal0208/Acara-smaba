<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

class MakeAdminUser extends Command
{
    /**
     * Registrasi publik ditutup; akun admin hanya dibuat lewat command ini.
     *
     * Contoh:
     *   php artisan user:make-admin operator1 --name="Operator TU"
     *
     * Bila username sudah ada, akun tersebut dinaikkan menjadi admin dan passwordnya diganti.
     */
    protected $signature = 'user:make-admin
                            {username : Username untuk login}
                            {--name= : Nama tampilan (default: username)}
                            {--email= : Email (opsional)}';

    protected $description = 'Buat akun admin baru atau naikkan akun yang ada menjadi admin (password diminta interaktif).';

    public function handle(): int
    {
        $username = $this->argument('username');
        $user = User::where('username', $username)->first();

        if ($user && ! $this->confirm("User '{$username}' sudah ada (role: {$user->role}). Jadikan admin dan ganti passwordnya?")) {
            $this->warn('Dibatalkan.');

            return self::FAILURE;
        }

        $password = $this->secret('Password');
        if ($password !== $this->secret('Ulangi password')) {
            $this->error('Password tidak sama.');

            return self::FAILURE;
        }

        $validator = Validator::make(['password' => $password], ['password' => ['required', Password::min(8)]]);
        if ($validator->fails()) {
            $this->error($validator->errors()->first('password'));

            return self::FAILURE;
        }

        $user ??= new User(['username' => $username]);
        $user->fill(array_filter([
            'name' => $this->option('name') ?? $user->name ?? $username,
            'email' => $this->option('email'),
        ]));
        $user->password = Hash::make($password);
        $user->role = 'admin';
        $user->save();

        $this->info("Akun admin '{$username}' siap dipakai.");

        return self::SUCCESS;
    }
}
