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
        if (Schema::hasColumn('staff', 'name')) {
            DB::statement('ALTER TABLE staff CHANGE name full_name VARCHAR(255) NOT NULL');
        }

        Schema::table('staff', function (Blueprint $table) {
            if (!Schema::hasColumn('staff', 'employee_id')) $table->string('employee_id')->nullable()->after('id');
            if (!Schema::hasColumn('staff', 'role')) $table->string('role')->nullable()->after('phone');
            if (!Schema::hasColumn('staff', 'specialization')) $table->string('specialization')->nullable()->after('role');
            if (!Schema::hasColumn('staff', 'experience_years')) $table->integer('experience_years')->default(0)->after('specialization');
            if (!Schema::hasColumn('staff', 'salary')) $table->decimal('salary', 10, 2)->nullable()->after('experience_years');
            if (!Schema::hasColumn('staff', 'bio')) $table->text('bio')->nullable()->after('salary');
            if (!Schema::hasColumn('staff', 'profile_image')) $table->string('profile_image')->nullable()->after('bio');
            if (!Schema::hasColumn('staff', 'rating')) $table->decimal('rating', 3, 1)->default(0.0)->after('profile_image');
            if (!Schema::hasColumn('staff', 'total_services')) $table->integer('total_services')->default(0)->after('rating');
            if (!Schema::hasColumn('staff', 'is_active')) $table->boolean('is_active')->default(true)->after('total_services');
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
