export const filterAndSortResumes = (resumes, filters) => {
  const { search = '', city = '', employmentType = '', sortBy = '' } = filters;
  const query = search.trim().toLowerCase();

  const filtered = resumes.filter((resume) => {
    const matchesQuery = !query
      || resume.fullName.toLowerCase().includes(query)
      || resume.position.toLowerCase().includes(query);
    const matchesCity = !city || resume.city === city;
    const matchesEmploymentType = !employmentType || resume.employmentType === employmentType;

    return matchesQuery && matchesCity && matchesEmploymentType;
  });

  if (sortBy === 'age') {
    return [...filtered].sort((a, b) => a.age - b.age);
  }

  if (sortBy === 'salary') {
    return [...filtered].sort((a, b) => (b.salary ?? 0) - (a.salary ?? 0));
  }

  return filtered;
};
