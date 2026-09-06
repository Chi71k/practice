import {
  useCallback, useEffect, useMemo, useReducer,
} from 'react';
import MyResumesContext from '../contexts/MyResumesContext';
import { initialMyResumesState, myResumesReducer } from '../reducers/myResumesReducer';
import * as resumesApi from '../api/resumesApi';
import { useAuth } from '../hooks/useAuth';
import { isCandidate } from '../utils/permissions';

const MyResumesProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [state, dispatch] = useReducer(myResumesReducer, initialMyResumesState);
  const canHaveResumes = isAuthenticated && isCandidate(user);

  const fetchResumes = useCallback(async (options = {}) => {
    dispatch({ type: 'resumes/fetchStarted' });
    try {
      const resumes = await resumesApi.getMyResumes(options);
      dispatch({ type: 'resumes/fetchSucceeded', payload: { resumes } });
    } catch (err) {
      if (err.name === 'AbortError') return;
      dispatch({ type: 'resumes/fetchFailed', payload: { error: err } });
    }
  }, []);

  useEffect(() => {
    if (!canHaveResumes) {
      dispatch({ type: 'resumes/cleared' });
      return undefined;
    }

    const controller = new AbortController();
    fetchResumes({ signal: controller.signal });
    return () => controller.abort();
  }, [canHaveResumes, user?.id, fetchResumes]);

  const createResume = useCallback(async (payload) => {
    await resumesApi.createResume(payload);
    await fetchResumes();
  }, [fetchResumes]);

  const updateResume = useCallback(async (id, payload) => {
    await resumesApi.updateResume(id, payload);
    await fetchResumes();
  }, [fetchResumes]);

  const deleteResume = useCallback(async (id) => {
    await resumesApi.deleteResume(id);
    await fetchResumes();
  }, [fetchResumes]);

  const resumesCount = state.resumes.length;

  const value = useMemo(() => ({
    resumes: state.resumes,
    resumesCount,
    status: state.status,
    error: state.error,
    createResume,
    updateResume,
    deleteResume,
    refresh: fetchResumes,
  }), [
    state.resumes, resumesCount, state.status, state.error,
    createResume, updateResume, deleteResume, fetchResumes,
  ]);

  return (
    <MyResumesContext value={value}>
      {children}
    </MyResumesContext>
  );
};

export default MyResumesProvider;
