const KEY = 'myResumes';

export const getMyResumes = () => {
  try {
    const data = localStorage.getItem(KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveMyResume = (resume) => {
  try {
    const current = getMyResumes();
    const updated = [...current, resume];
    localStorage.setItem(KEY, JSON.stringify(updated));
  } catch {
    console.error('Ошибка сохранения резюме');
  }
};

export const deleteMyResume = (id) => {
  try {
    const current = getMyResumes();
    const updated = current.filter((r) => r.id !== id);
    localStorage.setItem(KEY, JSON.stringify(updated));
  } catch {
    console.error('Ошибка удаления резюме');
  }
};
