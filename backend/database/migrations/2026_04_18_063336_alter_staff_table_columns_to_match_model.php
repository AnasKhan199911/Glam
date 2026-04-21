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
        DB::statement('ALTER TABLE staff CHANGE name full_name VARCHAR(255) NOT NULL');
        
        Schema::table('staff', function (Blueprint $table) {
            $table->string('employee_id')->nullable()->after('id');
            $table->string('role')->nullable()->after('phone');
            $table->string('specialization')->nullable()->after('role');
            $table->integer('experience_years')->default(0)->after('specialization');
            $table->decimal('salary', 10, 2)->nullable()->after('experience_years');
            $table->text('bio')->nullable()->after('salary');
            $table->string('profile_image')->nullable()->after('bio');
            $table->decimal('rating', 3, 1)->default(0.0)->after('profile_image');
            $table->integer('total_services')->default(0)->after('rating');
            $table->boolean('is_active')->default(true)->after('total_services');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        DB::statement('ALTER TABLE staff CHANGE full_name name VARCHAR(255) NOT NULL');
        
        Schema::table('staff', function (Blueprint $table) {
            $table->dropColumn([
                'employee_id',
                'role',
                'specialization',
                'experience_years',
                'salary',
                'bio',
                'profile_image',
                'rating',
                'total_services',
                'is_active'
            ]);
        });
    }
};
