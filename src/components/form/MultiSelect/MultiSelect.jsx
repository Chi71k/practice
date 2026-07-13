import FormField from '../FormField/FormField';
import styles from './MultiSelect.module.scss';

const MultiSelect = ({
  name, label, options = [], value = [], onChange, onBlur,
  hint, disabled = false, error, required, maxSelected,
}) => {
  const toggle = (optValue) => {
    if (disabled) return;
    if (value.includes(optValue)) {
      onChange(value.filter((v) => v !== optValue));
      return;
    }
    if (maxSelected && value.length >= maxSelected) return;
    onChange([...value, optValue]);
  };

  return (
    <FormField label={label} htmlFor={name} error={error} hint={hint} required={required}>
      <div
        className={`${styles.list} ${error ? styles.listError : ''}`}
        onBlur={onBlur}
        role="group"
        aria-invalid={!!error}
      >
        {options.map((opt) => {
          const checked = value.includes(opt.value);
          const limitReached = !checked && maxSelected && value.length >= maxSelected;
          return (
            <label key={opt.value} className={`${styles.option} ${checked ? styles.optionSelected : ''}`}>
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled || limitReached}
                onChange={() => toggle(opt.value)}
                className={styles.checkboxInput}
              />
              {opt.label}
            </label>
          );
        })}
      </div>
    </FormField>
  );
};

export default MultiSelect;
