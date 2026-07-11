import * as React from "react";

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function TextField({ label, className = "", id, ...props }: TextFieldProps) {
  const inputId = id || React.useId();
  const [isFocused, setIsFocused] = React.useState(false);
  const [hasValue, setHasValue] = React.useState(Boolean(props.value || props.defaultValue));

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    setHasValue(Boolean(e.target.value));
    props.onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(Boolean(e.target.value));
    props.onChange?.(e);
  };
  
  // Custom onInput for generic props passing compatibility
  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    setHasValue(Boolean(e.currentTarget.value));
    props.onInput?.(e as any);
  };

  const active = isFocused || hasValue;

  return (
    <div className={`relative inline-flex flex-col h-14 bg-surface rounded-md ${className}`}>
      <input
        id={inputId}
        {...props}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        onInput={handleInput}
        className="peer w-full h-full px-4 pt-4 pb-2 bg-transparent text-on-surface text-base outline-none z-10"
      />
      <label
        htmlFor={inputId}
        className={`absolute left-3 px-1 transition-all duration-200 pointer-events-none z-20 
          ${active 
            ? "-top-2.5 text-xs bg-surface text-primary" 
            : "top-4 text-base text-on-surface-variant"
          }`}
      >
        {label}
      </label>
      <fieldset
        className={`absolute inset-0 rounded-md border pointer-events-none transition-colors duration-200 
          ${isFocused ? "border-2 border-primary" : "border-outline hover:border-on-surface"}
        `}
      >
        <legend className={`h-2.5 ml-2.5 transition-all duration-200 invisible whitespace-nowrap px-1 text-xs ${active ? "max-w-full" : "max-w-0"}`}>
          {label}
        </legend>
      </fieldset>
    </div>
  );
}
