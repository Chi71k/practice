import {
  useCallback, useEffect, useMemo, useReducer,
} from 'react';
import MyResumesContext from '../contexts/MyResumesContext';
import { initialMyResumesState, myResumesReducer } from '../reducers/myResumesReducer';
import { MY_RESUMES_STORAGE_KEY } from '../constants/storageKeys';

const loadInitialState = () => {
  try {
    const raw = localStorage.getItem(MY_RESUMES_STORAGE_KEY);
    return raw ? { resumes: JSON.parse(raw) } : initialMyResumesState;
  } catch {
    return initialMyResumesState;
  }
};

const MyResumesProvider = ({ children }) => {
  const [state, dispatch] = useReducer(myResumesReducer, undefined, loadInitialState);

  useEffect(() => {
    try {
      localStorage.setItem(MY_RESUMES_STORAGE_KEY, JSON.stringify(state.resumes));
    } catch {
      console.error('Не удалось сохранить резюме в localStorage');
    }
  }, [state.resumes]);

  const addResume = useCallback((resume) => {
    dispatch({ type: 'resume/added', payload: resume });
  }, []);

  const deleteResume = useCallback((id) => {
    dispatch({ type: 'resume/deleted', payload: id });
  }, []);

  const clearResumes = useCallback(() => {
    dispatch({ type: 'resumes/cleared' });
  }, []);

  const resumesCount = state.resumes.length;

  const value = useMemo(() => ({
    resumes: state.resumes,
    resumesCount,
    addResume,
    deleteResume,
    clearResumes,
  }), [state.resumes, resumesCount, addResume, deleteResume, clearResumes]);

  return (
    <MyResumesContext value={value}>
      {children}
    </MyResumesContext>
  );
};

export default MyResumesProvider;
