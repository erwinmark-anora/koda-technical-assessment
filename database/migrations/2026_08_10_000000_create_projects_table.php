<?php

use App\Enums\ProjectPriority;
use App\Enums\ProjectStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table): void {
            $table->id();
            $table->string('client_name');
            $table->string('project_name');
            $table->text('description')->nullable();
            $table->string('status')->default(ProjectStatus::Planning->value);
            $table->string('priority')->default(ProjectPriority::Medium->value);
            $table->date('start_date')->nullable();
            $table->date('due_date')->nullable();
            $table->timestamps();

            // The list screen filters on status/priority and sorts on due date,
            // so those columns carry the indexes.
            $table->index('status');
            $table->index('priority');
            $table->index('due_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
