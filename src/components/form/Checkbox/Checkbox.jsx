import FormField from '../FormField/FormField';
import styles from './Checkbox.module.scss';

const Checkbox = ({ name, label, checked, onChange, onBlur, disabled = false, error, hint }) => {
  return (
    <FormField error={error} hint={hint}>
      <label htmlFor={name} className={`${styles.wrapper} ${disabled ? styles.wrapperDisabled : ''}`}>
        <input
          type="checkbox"
          id={name}
          checked={!!checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          onBlur={onBlur}
          aria-invalid={!!error}
          className={styles.checkbox}
        />
        <span>{label}</span>
      </label>
    </FormField>
  );
};

export default Checkbox;
