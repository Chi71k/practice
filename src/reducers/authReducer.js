export const initialAuthState = {
  status: 'loading',
  user: null,
  error: null,
};

export const authReducer = (state, action) => {
  switch (action.type) {
    case 'auth/loginStarted':
      return {
        ...state,
        status: 'loading',
        error: null,
      };

    case 'auth/loginSucceeded':
      return {
        ...state,
        status: 'authenticated',
        user: action.payload.user,
        error: null,
      };

    case 'auth/loginFailed':
      return {
        ...state,
        status: 'error',
        user: null,
        error: action.payload.error,
      };

    case 'auth/loggedOut':
      return {
        ...state,
        status: 'anonymous',
        user: null,
        error: null,
      };

    case 'auth/errorCleared':
      return {
        ...state,
        status: state.status === 'error' ? 'anonymous' : state.status,
        error: null,
      };

    default:
      throw new Error(`Неизвестный action type: ${action.type}`);
  }
};
