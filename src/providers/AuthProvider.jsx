import { useCallback, useMemo, useReducer } from 'react';
import AuthContext from '../contexts/AuthContext';
import { authReducer, initialAuthState } from '../reducers/authReducer';
import { login as loginRequest, getCurrentUser } from '../api/authApi';
import { ApiError } from '../api/ApiError';

const resolveErrorMessage = (err) => {
  if (err instanceof ApiError) {
    if (err.status === 400 || err.status === 401) {
      return 'Неверный логин или пароль';
    }
    return `Сервер вернул ошибку (${err.status})`;
  }
  return 'Не удалось соединиться с сервером. Проверьте интернет-соединение.';
};

const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  const login = useCallback(async (credentials, options = {}) => {
    dispatch({ type: 'auth/loginStarted' });

    try {
      const loginData = await loginRequest(credentials, options);
      const user = await getCurrentUser(loginData.accessToken, options);
      dispatch({
        type: 'auth/loginSucceeded',
        payload: { user, accessToken: loginData.accessToken },
      });
    } catch (err) {
      if (err.name === 'AbortError') {
        dispatch({ type: 'auth/loggedOut' });
        throw err;
      }
      dispatch({ type: 'auth/loginFailed', payload: { error: resolveErrorMessage(err) } });
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: 'auth/loggedOut' });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'auth/errorCleared' });
  }, []);

  const isAuthenticated = state.status === 'authenticated';

  const value = useMemo(() => ({
    status: state.status,
    user: state.user,
    error: state.error,
    isAuthenticated,
    login,
    logout,
    clearError,
  }), [state.status, state.user, state.error, isAuthenticated, login, logout, clearError]);

  return (
    <AuthContext value={value}>
      {children}
    </AuthContext>
  );
};

export default AuthProvider;
