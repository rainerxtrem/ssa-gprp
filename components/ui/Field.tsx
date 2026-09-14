import { champClasses, labelClasses } from "@/lib/ui";

export function Field({
  label,
  name,
  type = "text",
  required = false,
  defaultValue,
  value,
  onChange,
  placeholder,
  className = "",
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className={labelClasses}>
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        {...(onChange ? { value: value ?? "" } : { defaultValue })}
        onChange={onChange}
        placeholder={placeholder}
        className={champClasses}
      />
    </label>
  );
}

export function FieldTextarea({
  label,
  name,
  required = false,
  defaultValue,
  value,
  onChange,
  rows = 3,
  placeholder,
  className = "",
}: {
  label: string;
  name: string;
  required?: boolean;
  defaultValue?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className={labelClasses}>
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      <textarea
        name={name}
        required={required}
        {...(onChange ? { value: value ?? "" } : { defaultValue })}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        className={`${champClasses} resize-none`}
      />
    </label>
  );
}

export function FieldSelect({
  label,
  name,
  required = false,
  defaultValue,
  options,
  className = "",
}: {
  label: string;
  name: string;
  required?: boolean;
  defaultValue?: string;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className={labelClasses}>
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      <select name={name} required={required} defaultValue={defaultValue} className={champClasses}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
