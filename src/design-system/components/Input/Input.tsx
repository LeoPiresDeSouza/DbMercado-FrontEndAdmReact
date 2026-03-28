import React from 'react';
import './Input.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, className = '', id, disabled, ...rest },
  ref
): React.ReactElement {
  const inputId = id ?? React.useId();
  const errId = error ? `${inputId}-error` : undefined;
  const hintId = hint ? `${inputId}-hint` : undefined;

  return (
    <div className={`ds-input-field ${error ? 'ds-input-field--error' : ''} ${className}`.trim()}>
      {label ? (
        <label className="ds-input-field__label" htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      <input
        ref={ref}
        id={inputId}
        className="ds-input-field__control"
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={[errId, hintId].filter(Boolean).join(' ') || undefined}
        {...rest}
      />
      {hint && !error ? (
        <p className="ds-input-field__hint" id={hintId}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="ds-input-field__error" id={errId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
});
