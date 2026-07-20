import { useCallback, useState } from 'react';

const readValue = (key, initialValue) => {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : initialValue;
  } catch {
    return initialValue;
  }
};

export const useLocalStorage = (key, initialValue) => {
  const [value, setValueState] = useState(() => readValue(key, initialValue));

  const setValue = useCallback((next) => {
    setValueState((prev) => {
      const resolved = typeof next === 'function' ? next(prev) : next;
      try {
        localStorage.setItem(key, JSON.stringify(resolved));
      } catch {
        console.error(`Не удалось сохранить "${key}" в localStorage`);
      }
      return resolved;
    });
  }, [key]);

  const removeValue = useCallback(() => {
    try {
      localStorage.removeItem(key);
    } catch {
      console.error(`Не удалось удалить "${key}" из localStorage`);
    }
    setValueState(initialValue);
  }, [key, initialValue]);

  return [value, setValue, removeValue];
};
