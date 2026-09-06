export const initialMyResumesState = {
  status: 'idle',
  resumes: [],
  error: null,
};

export const myResumesReducer = (state, action) => {
  switch (action.type) {
    case 'resumes/fetchStarted':
      return { ...state, status: 'loading', error: null };

    case 'resumes/fetchSucceeded':
      return {
        ...state,
        status: 'succeeded',
        resumes: action.payload.resumes,
        error: null,
      };

    case 'resumes/fetchFailed':
      return { ...state, status: 'failed', error: action.payload.error };

    case 'resumes/cleared':
      return initialMyResumesState;

    default:
      throw new Error(`Неизвестный action type: ${action.type}`);
  }
};
