import styles from './FormField.module.scss';

const FormField = ({ label, htmlFor, error, hint, required, children }) => {
  return (
    <div className={`${styles.field} ${error ? styles.fieldError : ''}`}>
      {label && (
        <label htmlFor={htmlFor} className={styles.label}>
          {label}
          {required && <span className={styles.required}> *</span>}
        </label>
      )}

      {children}

      {error ? (
        <span className={styles.error} id={htmlFor ? `${htmlFor}-error` : undefined} role="alert">
          {error}
        </span>
      ) : (
        hint && <span className={styles.hint}>{hint}</span>
      )}
    </div>
  );
};

export default FormField;
