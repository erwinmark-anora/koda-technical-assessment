import { useState } from 'react';
import { FormField } from '@/components/projects/form/form-field';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { ApiError, ApiValidationError } from '@/lib/api/http';
import { createProject, updateProject } from '@/lib/api/projects';
import { hasErrors, validateProject } from '@/lib/validate-project';
import type {
    EnumOption,
    Project,
    ProjectPayload,
    ProjectPriority,
    ProjectStatus,
    ValidationErrors,
} from '@/types/project';

interface ProjectFormProps {
    /** The project being edited, or null when creating a new one. */
    project: Project | null;
    statusOptions: EnumOption<ProjectStatus>[];
    priorityOptions: EnumOption<ProjectPriority>[];
    onCancel: () => void;
    onSaved: (project: Project, mode: 'created' | 'updated') => void;
}

const EMPTY_FORM: ProjectPayload = {
    client_name: '',
    project_name: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    start_date: '',
    due_date: '',
};

function toFormValues(project: Project | null): ProjectPayload {
    if (!project) {
        return EMPTY_FORM;
    }

    return {
        client_name: project.client_name,
        project_name: project.project_name,
        description: project.description ?? '',
        status: project.status,
        priority: project.priority,
        start_date: project.start_date ?? '',
        due_date: project.due_date ?? '',
    };
}

/**
 * The project fields and their submission.
 *
 * One form serves both create and edit; the only differences are the initial
 * values and which endpoint it posts to.
 */
export function ProjectForm({
    project,
    statusOptions,
    priorityOptions,
    onCancel,
    onSaved,
}: ProjectFormProps) {
    const [values, setValues] = useState<ProjectPayload>(() =>
        toFormValues(project),
    );
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const isEditing = project !== null;

    function setField<TField extends keyof ProjectPayload>(
        field: TField,
        value: ProjectPayload[TField],
    ) {
        setValues((current) => ({ ...current, [field]: value }));

        // Clear the message for a field as soon as the user edits it.
        setErrors((current) => {
            if (!(field in current)) {
                return current;
            }

            const next = { ...current };

            delete next[field];

            return next;
        });
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();

        const clientErrors = validateProject(values);

        if (hasErrors(clientErrors)) {
            setErrors(clientErrors);
            setFormError(null);

            return;
        }

        setIsSaving(true);
        setFormError(null);

        try {
            const saved = isEditing
                ? await updateProject(project.id, values)
                : await createProject(values);

            onSaved(saved, isEditing ? 'updated' : 'created');
        } catch (caught) {
            if (caught instanceof ApiValidationError) {
                setErrors(caught.errors);
                setFormError(null);
            } else if (caught instanceof ApiError) {
                setFormError(caught.message);
            } else {
                setFormError('The project could not be saved.');
            }

            setIsSaving(false);
        }
    }

    return (
        <form
            noValidate
            onSubmit={handleSubmit}
            className="grid gap-4 sm:grid-cols-2"
        >
            <FormField
                label="Client name"
                htmlFor="client_name"
                error={errors.client_name}
                required
            >
                <Input
                    id="client_name"
                    value={values.client_name}
                    autoFocus
                    aria-invalid={Boolean(errors.client_name)}
                    placeholder="Acme Corporation"
                    onChange={(event) =>
                        setField('client_name', event.target.value)
                    }
                />
            </FormField>

            <FormField
                label="Project name"
                htmlFor="project_name"
                error={errors.project_name}
                required
            >
                <Input
                    id="project_name"
                    value={values.project_name}
                    aria-invalid={Boolean(errors.project_name)}
                    placeholder="Corporate Website Redesign"
                    onChange={(event) =>
                        setField('project_name', event.target.value)
                    }
                />
            </FormField>

            <FormField
                label="Description"
                htmlFor="description"
                error={errors.description}
                className="sm:col-span-2"
            >
                <Textarea
                    id="description"
                    rows={3}
                    value={values.description}
                    aria-invalid={Boolean(errors.description)}
                    placeholder="What is this project about?"
                    onChange={(event) =>
                        setField('description', event.target.value)
                    }
                />
            </FormField>

            <FormField label="Status" htmlFor="status" error={errors.status}>
                <Select
                    value={values.status}
                    onValueChange={(value) =>
                        setField('status', value as ProjectStatus)
                    }
                >
                    <SelectTrigger id="status" className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </FormField>

            <FormField
                label="Priority"
                htmlFor="priority"
                error={errors.priority}
            >
                <Select
                    value={values.priority}
                    onValueChange={(value) =>
                        setField('priority', value as ProjectPriority)
                    }
                >
                    <SelectTrigger id="priority" className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {priorityOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </FormField>

            <FormField
                label="Start date"
                htmlFor="start_date"
                error={errors.start_date}
            >
                <Input
                    id="start_date"
                    type="date"
                    value={values.start_date}
                    aria-invalid={Boolean(errors.start_date)}
                    onChange={(event) =>
                        setField('start_date', event.target.value)
                    }
                />
            </FormField>

            <FormField
                label="Due date"
                htmlFor="due_date"
                error={errors.due_date}
            >
                <Input
                    id="due_date"
                    type="date"
                    value={values.due_date}
                    min={values.start_date || undefined}
                    aria-invalid={Boolean(errors.due_date)}
                    onChange={(event) =>
                        setField('due_date', event.target.value)
                    }
                />
            </FormField>

            {formError ? (
                <p
                    role="alert"
                    className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2 dark:bg-red-400/10 dark:text-red-300"
                >
                    {formError}
                </p>
            ) : null}

            <DialogFooter className="sm:col-span-2">
                <Button
                    type="button"
                    variant="outline"
                    disabled={isSaving}
                    onClick={onCancel}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                    {isSaving ? <Spinner /> : null}
                    {isEditing ? 'Save changes' : 'Create project'}
                </Button>
            </DialogFooter>
        </form>
    );
}
