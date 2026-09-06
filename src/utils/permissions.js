export const isCandidate = (user) => user?.role === 'CANDIDATE';
export const isEmployer = (user) => user?.role === 'EMPLOYER';
export const isAdmin = (user) => user?.role === 'ADMIN';

export const canCreateResume = (user) => isCandidate(user);

export const canEditResume = (user, resume) => (
  !!user && (isAdmin(user) || user.id === resume.ownerId)
);

export const canCreateVacancy = (user) => isEmployer(user);

export const canManageVacancy = (user, vacancy) => (
  !!user && (isAdmin(user) || (isEmployer(user) && user.id === vacancy.employerId))
);

export const canWithdrawApplication = (user, application) => (
  isCandidate(user)
  && user.id === application.candidateId
  && ['SUBMITTED', 'REVIEWING'].includes(application.status)
);

export const canUpdateApplicationStatus = (user, application) => (
  !!user && (isAdmin(user) || (isEmployer(user) && user.id === application.employerId))
);

export const canDeleteApplication = (user) => isAdmin(user);

export const canAccessAdmin = (user) => isAdmin(user);
