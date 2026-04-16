<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('booking_availability', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('service_id');
            $table->date('available_date');
            $table->boolean('is_available')->default(true);
            $table->json('available_times')->nullable(); // Array of time slots like ["10:00", "11:00", "14:00"]
            $table->timestamps();
            
            // Unique constraint - one record per service per date
            $table->unique(['service_id', 'available_date']);
            
            // Foreign key constraint
            $table->foreign('service_id')->references('id')->on('services')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('booking_availability');
    }
};
