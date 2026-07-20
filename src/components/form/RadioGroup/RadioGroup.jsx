import FormField from '../FormField/FormField';
import styles from './RadioGroup.module.scss';

const RadioGroup = ({
  name, label, options = [], value, onChange, onBlur,
  disabled = false, error, hint, required,
}) => {
  const handleGroupBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      onBlur?.();
    }
  };

  return (
    <FormField error={error} hint={hint}>
      <fieldset className={styles.fieldset} onBlur={handleGroupBlur}>
        {label && (
          <legend className={styles.legend}>
            {label}
            {required && <span className={styles.required}> *</span>}
          </legend>
        )}
        <div className={styles.options} role="radiogroup" aria-invalid={!!error}>
          {options.map((opt) => (
            <label key={opt.value} className={styles.option}>
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={value === opt.value}
                disabled={disabled}
                onChange={() => onChange(opt.value)}
                className={styles.radio}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </fieldset>
    </FormField>
  );
};

export default RadioGroup;
