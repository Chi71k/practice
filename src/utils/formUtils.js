export const hasErrors = (errors) => Object.values(errors).some(Boolean);

export const createChangeHandler = (setValues) => (e) => {
  const { name, value } = e.target;
  setValues((prev) => ({ ...prev, [name]: value }));
};

export const createClearFieldError = (setErrors) => (fieldName) => {
  setErrors((prev) => ({ ...prev, [fieldName]: '' }));
};

export const createInitialValues = (fieldNames) => {
  return fieldNames.reduce((acc, name) => ({ ...acc, [name]: '' }), {});
};
