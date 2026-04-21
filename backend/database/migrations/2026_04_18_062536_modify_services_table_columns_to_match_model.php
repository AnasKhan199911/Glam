<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::statement('ALTER TABLE services CHANGE service_name name VARCHAR(255) NOT NULL');
        DB::statement('ALTER TABLE services CHANGE image_url image VARCHAR(255) DEFAULT NULL');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        DB::statement('ALTER TABLE services CHANGE name service_name VARCHAR(255) NOT NULL');
        DB::statement('ALTER TABLE services CHANGE image image_url VARCHAR(255) DEFAULT NULL');
    }
};
