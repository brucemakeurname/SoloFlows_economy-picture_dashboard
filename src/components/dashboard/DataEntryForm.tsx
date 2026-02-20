import { useState, useCallback, type FormEvent } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

interface Field {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "textarea";
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface DataEntryFormProps {
  title: string;
  fields: Field[];
  onSubmit: (data: Record<string, string>) => Promise<void>;
  initialValues?: Record<string, string>;
}

export default function DataEntryForm({
  title,
  fields,
  onSubmit,
  initialValues = {},
}: DataEntryFormProps) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const field of fields) {
      init[field.name] = initialValues[field.name] ?? "";
    }
    return init;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const updateValue = useCallback((name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    for (const field of fields) {
      if (field.required && !values[field.name]?.trim()) {
        newErrors[field.name] = `${field.label} is required`;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [fields, values]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!validate()) return;

      setSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setSubmitting(false);
      }
    },
    [validate, onSubmit, values]
  );

  const handleReset = useCallback(() => {
    const init: Record<string, string> = {};
    for (const field of fields) {
      init[field.name] = initialValues[field.name] ?? "";
    }
    setValues(init);
    setErrors({});
  }, [fields, initialValues]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => {
          const hasError = !!errors[field.name];

          return (
            <div
              key={field.name}
              className={cn(
                "space-y-2",
                field.type === "textarea" && "sm:col-span-2"
              )}
            >
              <Label htmlFor={field.name}>
                {field.label}
                {field.required && (
                  <span className="ml-0.5 text-destructive">*</span>
                )}
              </Label>

              {field.type === "select" ? (
                <Select
                  id={field.name}
                  value={values[field.name]}
                  onChange={(e) => updateValue(field.name, e.target.value)}
                  disabled={submitting}
                  className={cn(hasError && "border-destructive")}
                >
                  <option value="">
                    {field.placeholder ?? `Select ${field.label.toLowerCase()}`}
                  </option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              ) : field.type === "textarea" ? (
                <Textarea
                  id={field.name}
                  value={values[field.name]}
                  onChange={(e) => updateValue(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  disabled={submitting}
                  className={cn(hasError && "border-destructive")}
                  rows={3}
                />
              ) : (
                <Input
                  id={field.name}
                  type={field.type}
                  value={values[field.name]}
                  onChange={(e) => updateValue(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  disabled={submitting}
                  className={cn(hasError && "border-destructive")}
                />
              )}

              {hasError && (
                <p className="text-xs text-destructive">{errors[field.name]}</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Saving...
            </span>
          ) : (
            "Save"
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          disabled={submitting}
        >
          Reset
        </Button>
      </div>
    </form>
  );
}
