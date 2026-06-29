<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->string('admin_role')->nullable()->after('avatar');
        });

        DB::table('users')
            ->where('is_admin', true)
            ->update(['admin_role' => 'super_admin']);

        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn('is_admin');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->boolean('is_admin')->default(false)->after('avatar');
        });

        DB::table('users')
            ->whereNotNull('admin_role')
            ->update(['is_admin' => true]);

        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn('admin_role');
        });
    }
};
