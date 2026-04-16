<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('attendances', function (Blueprint $table) {
            // Total minutes worked across all sessions on that day
            $table->integer('total_minutes')->default(0)->after('notes');
            // Number of sessions (check-in/out pairs) completed
            $table->integer('session_count')->default(0)->after('total_minutes');
        });
    }

    public function down()
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropColumn(['total_minutes', 'session_count']);
        });
    }
};
