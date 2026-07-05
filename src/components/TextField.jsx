import { forwardRef } from 'react';
import styles from '../styles/TextField.module.scss';

const TextField = forwardRef(({ name, label, error, type = 'text', placeholder, onChange, onBlur }, ref) => {
  return (
    <div className={styles.field}>
      <label htmlFor={name} className={styles.label}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        ref={ref}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
      />
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
});

TextField.displayName = 'TextField';

export default TextField;
