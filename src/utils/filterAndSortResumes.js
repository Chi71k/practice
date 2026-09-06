export const filterAndSortResumes = (resumes, filters) => {
  const { search = '', city = '', sortBy = '' } = filters;
  const query = search.trim().toLowerCase();
  const cityQuery = city.trim().toLowerCase();

  const filtered = resumes.filter((resume) => {
    const matchesQuery = !query
      || resume.title.toLowerCase().includes(query)
      || resume.summary.toLowerCase().includes(query);
    const matchesCity = !cityQuery || resume.city.toLowerCase().includes(cityQuery);

    return matchesQuery && matchesCity;
  });

  if (sortBy === 'salary') {
    return [...filtered].sort((a, b) => (b.salary ?? 0) - (a.salary ?? 0));
  }

  return filtered;
};
