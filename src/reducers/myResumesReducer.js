export const initialMyResumesState = { resumes: [] };

export const myResumesReducer = (state, action) => {
  switch (action.type) {
    case 'resume/added':
      return { ...state, resumes: [...state.resumes, action.payload] };

    case 'resume/deleted':
      return { ...state, resumes: state.resumes.filter((resume) => resume.id !== action.payload) };

    case 'resume/updated':
      return {
        ...state,
        resumes: state.resumes.map((resume) => (
          resume.id === action.payload.id
            ? { ...resume, ...action.payload.changes }
            : resume
        )),
      };

    case 'resumes/cleared':
      return { ...state, resumes: [] };

    default:
      throw new Error(`Неизвестный action type: ${action.type}`);
  }
};
