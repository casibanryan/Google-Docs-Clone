<?php

namespace Database\Seeders;

use App\Models\Document;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DocumentSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $user = User::first();
        if (! $user) {
            $user = User::factory()->create();
        }

        // create 20 documents for the user
        Document::factory()->count(20)->for($user)->create();
    }
}
