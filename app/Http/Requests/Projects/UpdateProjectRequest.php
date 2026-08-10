<?php

namespace App\Http\Requests\Projects;

use App\Concerns\ProjectValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * PUT replaces the project, so it validates the same complete payload the
 * store endpoint does.
 */
class UpdateProjectRequest extends FormRequest
{
    use ProjectValidationRules;

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return $this->projectRules();
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return $this->projectMessages();
    }
}
