import React from 'react';
import './Select.css';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, hint, className = '', id, disabled, children, ...rest },
  ref
): React.ReactElement {
  const selectId = id ?? React.useId();
  const errId = error ? `${selectId}-error` : undefined;
  const hintId = hint ? `${selectId}-hint` : undefined;

  return (
    <div className={`ds-select-field ${error ? 'ds-select-field--error' : ''} ${className}`.trim()}>
      {label ? (
        <label className="ds-select-field__label" htmlFor={selectId}>
          {label}
        </label>
      ) : null}
      <div className="ds-select-field__wrap">
        <select
          ref={ref}
          id={selectId}
          className="ds-select-field__control"
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={[errId, hintId].filter(Boolean).join(' ') || undefined}
          {...rest}
        >
          {children}
        </select>
      </div>
      {hint && !error ? (
        <p className="ds-select-field__hint" id={hintId}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="ds-select-field__error" id={errId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
});
