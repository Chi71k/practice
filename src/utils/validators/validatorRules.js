const validatorRules = {
  isRequired: (value) => value.trim() !== '',
  isEmail: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  minLength: (value, rule) => value.length >= rule.value,
  maxLength: (value, rule) => value.length <= rule.value,
};

export default validatorRules;
