import { useMemo, useState } from 'react';

export const useResumeFilters = () => {
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [sortBy, setSortBy] = useState('');

  const filters = useMemo(() => ({
    search, city, employmentType, sortBy,
  }), [search, city, employmentType, sortBy]);

  const isActive = !!(search || city || employmentType || sortBy);

  const reset = () => {
    setSearch('');
    setCity('');
    setEmploymentType('');
    setSortBy('');
  };

  return {
    filters,
    search,
    setSearch,
    city,
    setCity,
    employmentType,
    setEmploymentType,
    sortBy,
    setSortBy,
    isActive,
    reset,
  };
};
