const parseArray = (value) => {
  try {
    const parsed = JSON.parse(value ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const toBoolean = (value) => value === 1;

export const publicUser = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export const mapResume = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    ownerId: row.owner_id,
    ownerName: row.owner_name,
    title: row.title,
    summary: row.summary,
    city: row.city,
    salary: row.salary,
    skills: parseArray(row.skills),
    isPublished: toBoolean(row.is_published),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export const mapVacancy = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    employerId: row.employer_id,
    employerName: row.employer_name,
    title: row.title,
    description: row.description,
    city: row.city,
    salaryFrom: row.salary_from,
    salaryTo: row.salary_to,
    employmentType: row.employment_type,
    skills: parseArray(row.skills),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export const mapApplication = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    vacancyId: row.vacancy_id,
    vacancyTitle: row.vacancy_title,
    candidateId: row.candidate_id,
    candidateName: row.candidate_name,
    resumeId: row.resume_id,
    resumeTitle: row.resume_title,
    employerId: row.employer_id,
    coverLetter: row.cover_letter,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};
