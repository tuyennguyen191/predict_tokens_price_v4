import React from "react";

interface FormFieldProps {
  htmlFor: string;
  label: string;
  type?: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

export function FormField({
  htmlFor,
  label,
  type = "text",
  value,
  onChange = () => {},
  error = "",
}: FormFieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="sr-only">
        {label}
      </label>
      <input
        id={htmlFor}
        name={htmlFor}
        type={type}
        required
        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
        placeholder={label}
        value={value}
        onChange={onChange}
      />
      {error ? (
        <p className="text-red-500 text-xs italic mt-1">{error}</p>
      ) : null}
    </div>
  );
}
