<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('staff', function (Blueprint $table) {
            $table->id();
            $table->string('employee_id')->unique();
            $table->string('full_name');
            $table->string('email')->unique();
            $table->string('phone');
            $table->string('role');
            $table->string('specialization')->nullable();
            $table->integer('experience_years')->default(0);
            $table->decimal('salary', 10, 2)->nullable();
            $table->text('bio')->nullable();
            $table->string('profile_image')->nullable();
            $table->decimal('rating', 3, 1)->default(0.0);
            $table->integer('total_services')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('staff');
    }
};
