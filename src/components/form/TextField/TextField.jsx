import { forwardRef } from 'react';
import FormField from '../FormField/FormField';
import styles from './TextField.module.scss';

const TextField = forwardRef(({
  name, label, type = 'text', placeholder, hint,
  disabled = false, error, required, onChange, onBlur,
}, ref) => {
  return (
    <FormField label={label} htmlFor={name} error={error} hint={hint} required={required}>
      <input
        id={name}
        name={name}
        type={type}
        ref={ref}
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

TextField.displayName = 'TextField';

export default TextField;
