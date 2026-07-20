import { forwardRef } from 'react';
import FormField from '../FormField/FormField';
import styles from './Select.module.scss';

const Select = forwardRef(({
  name, label, options = [], placeholder, hint,
  disabled = false, error, required, onChange, onBlur,
}, ref) => {
  return (
    <FormField label={label} htmlFor={name} error={error} hint={hint} required={required}>
      <select
        id={name}
        name={name}
        ref={ref}
        disabled={disabled}
        onChange={onChange}
        onBlur={onBlur}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`${styles.select} ${error ? styles.selectError : ''}`}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FormField>
  );
});

Select.displayName = 'Select';

export default Select;
