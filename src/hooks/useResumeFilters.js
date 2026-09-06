import { useMemo, useState } from 'react';

export const useResumeFilters = () => {
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [sortBy, setSortBy] = useState('');

  const filters = useMemo(() => ({ search, city, sortBy }), [search, city, sortBy]);

  const isActive = !!(search || city || sortBy);

  const reset = () => {
    setSearch('');
    setCity('');
    setSortBy('');
  };

  return {
    filters,
    search,
    setSearch,
    city,
    setCity,
    sortBy,
    setSortBy,
    isActive,
    reset,
  };
};
