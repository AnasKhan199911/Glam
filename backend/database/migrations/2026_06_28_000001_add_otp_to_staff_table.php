<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('staff', function (Blueprint $table) {
            $table->string('login_otp')->nullable()->after('is_online');
            $table->timestamp('login_otp_expires')->nullable()->after('login_otp');
        });
    }

    public function down()
    {
        Schema::table('staff', function (Blueprint $table) {
            $table->dropColumn(['login_otp', 'login_otp_expires']);
        });
    }
};
