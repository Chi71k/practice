export const escapeLikePattern = (value) => value.replace(/[\\%_]/g, '\\$&');
