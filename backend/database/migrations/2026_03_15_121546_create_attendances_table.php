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
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('staff_id');
            $table->date('date');
            $table->string('status')->default('Present'); // Present, Late, Absent
            $table->time('check_in')->nullable();
            $table->time('check_out')->nullable();
            $table->string('notes')->nullable();
            $table->timestamps();

            $table->foreign('staff_id')->references('id')->on('staff')->onDelete('cascade');
            $table->unique(['staff_id', 'date']); // Prevent multiple records for same staff on same day
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('attendances');
    }
};
