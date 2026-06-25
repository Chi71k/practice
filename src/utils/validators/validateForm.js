import validatorRules from './validatorRules';

const validateForm = (values, validatorConfig) => {
  const errors = {};

  for (const fieldName in validatorConfig) {
    const fieldRules = validatorConfig[fieldName];
    const value = values[fieldName] ?? '';

    for (const ruleName in fieldRules) {
      const ruleConfig = fieldRules[ruleName];
      const isValid = validatorRules[ruleName](value, ruleConfig);

      if (!isValid) {
        errors[fieldName] = ruleConfig.message;
        break;
      }
    }
  }

  return errors;
};

export default validateForm;
