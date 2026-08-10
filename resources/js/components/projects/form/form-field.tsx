import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FormFieldProps {
    label: string;
    /** Must match the id of the input passed as children. */
    htmlFor: string;
    /** Laravel returns a list of messages per field; the first is shown. */
    error?: string[];
    required?: boolean;
    className?: string;
    children: React.ReactNode;
}

/**
 * Label + input + error message, stacked.
 *
 * Every field in the project form has the same three parts, so they live here
 * once instead of being repeated seven times.
 */
export function FormField({
    label,
    htmlFor,
    error,
    required = false,
    className,
    children,
}: FormFieldProps) {
    return (
        <div className={cn('grid gap-2', className)}>
            <Label htmlFor={htmlFor}>
                {label}
                {required ? (
                    <span className="text-red-600 dark:text-red-400">*</span>
                ) : null}
            </Label>
            {children}
            <InputError message={error?.[0]} />
        </div>
    );
}
