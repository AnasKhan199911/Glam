<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('attendance_sessions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('staff_id');
            $table->date('date');              // PKT date (Y-m-d)
            $table->time('check_in');          // PKT time
            $table->time('check_out')->nullable();
            $table->integer('duration_minutes')->default(0); // filled on clock-out
            $table->timestamps();

            $table->foreign('staff_id')->references('id')->on('staff')->onDelete('cascade');
            // No unique constraint – multiple sessions per day are allowed
        });
    }

    public function down()
    {
        Schema::dropIfExists('attendance_sessions');
    }
};
