import { forwardRef } from 'react';
import FormField from '../FormField/FormField';
import styles from './NumberField.module.scss';

const NumberField = forwardRef(({
  name, label, min, max, step = 1, placeholder, hint,
  disabled = false, error, required, onChange, onBlur,
}, ref) => {
  return (
    <FormField label={label} htmlFor={name} error={error} hint={hint} required={required}>
      <input
        id={name}
        name={name}
        type="number"
        ref={ref}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        disabled={disabled}
        onChange={onChange}
        onBlur={onBlur}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
      />
    </FormField>
  );
});

NumberField.displayName = 'NumberField';

export default NumberField;
