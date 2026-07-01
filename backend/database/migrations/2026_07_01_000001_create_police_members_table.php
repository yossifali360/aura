<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('police_members', function (Blueprint $table): void {
            $table->id();
            $table->string('badge_number')->unique();
            $table->string('name');
            $table->string('shoulder_rank')->nullable();
            $table->string('rank');
            $table->string('section');
            $table->string('status')->default('active');
            $table->string('position')->nullable();
            $table->string('discord_username')->nullable();
            $table->string('discord_id')->nullable()->unique();
            $table->boolean('points_exempt')->default(false);
            $table->unsignedInteger('points')->nullable();
            $table->unsignedSmallInteger('warnings')->default(0);
            $table->date('last_promotion_date')->nullable();
            $table->date('joined_at')->nullable();
            $table->string('specialty_speed')->default('none');
            $table->string('specialty_motor')->default('none');
            $table->string('specialty_air')->default('none');
            $table->string('specialty_offroad')->default('none');
            $table->string('specialty_operations')->default('none');
            $table->string('specialty_negotiation')->default('none');
            $table->string('specialty_national_security')->default('none');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('police_members');
    }
};
