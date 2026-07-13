import { forwardRef } from 'react';
import FormField from '../FormField/FormField';
import styles from './TextArea.module.scss';

const TextArea = forwardRef(({
  name, label, placeholder, rows = 4, hint,
  disabled = false, error, required, onChange, onBlur,
}, ref) => {
  return (
    <FormField label={label} htmlFor={name} error={error} hint={hint} required={required}>
      <textarea
        id={name}
        name={name}
        ref={ref}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        onChange={onChange}
        onBlur={onBlur}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`${styles.textarea} ${error ? styles.textareaError : ''}`}
      />
    </FormField>
  );
});

TextArea.displayName = 'TextArea';

export default TextArea;
