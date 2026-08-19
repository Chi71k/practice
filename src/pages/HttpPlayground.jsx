import { useRef, useState } from 'react';
import { requestWithMeta } from '../api/httpClient';
import styles from '../styles/HttpPlayground.module.scss';

const initialState = {
  phase: 'idle', // idle | loading | success | error | aborted
  data: null,
  error: null,
  meta: null, // { status, contentType }
};

const HttpPlayground = () => {
  const [state, setState] = useState(initialState);
  const controllerRef = useRef(null);

  const run = async (endpoint, options) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setState({
      phase: 'loading', data: null, error: null, meta: null,
    });

    try {
      const result = await requestWithMeta(endpoint, { ...options, signal: controller.signal });
      setState({
        phase: 'success',
        data: result.data,
        error: null,
        meta: { status: result.status, contentType: result.contentType },
      });
    } catch (err) {
      if (err.name === 'AbortError') {
        setState({
          phase: 'aborted', data: null, error: null, meta: null,
        });
        return;
      }
      if (err.status) {
        setState({
          phase: 'error', data: null, error: err.message, meta: { status: err.status },
        });
      } else {
        setState({
          phase: 'error',
          data: null,
          error: 'Проблема сети — не удалось выполнить запрос',
          meta: null,
        });
      }
    }
  };

  const handleGetUsers = () => run('/users?limit=5');
  const handleGetPosts = () => run('/posts?limit=5');
  const handleCreatePost = () => run('/posts/add', {
    method: 'POST',
    body: { title: 'Тестовый пост из HTTP Playground', userId: 1 },
  });
  const handleCancel = () => controllerRef.current?.abort();

  return (
    <div className={styles.page}>
      <h1>HTTP Playground</h1>
      <p className={styles.hint}>
        Учебная песочница для запросов без Axios — все кнопки ниже используют один общий
        <code> request()</code>/<code>requestWithMeta()</code> из <code>src/api/httpClient.js</code>.
      </p>

      <div className={styles.actions}>
        <button type="button" onClick={handleGetUsers}>GET /users</button>
        <button type="button" onClick={handleGetPosts}>GET /posts</button>
        <button type="button" onClick={handleCreatePost}>POST /posts/add</button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={state.phase !== 'loading'}
          className={styles.cancelBtn}
        >
          Отменить запрос
        </button>
      </div>

      <div className={styles.result}>
        {state.phase === 'idle' && <p>Выбери запрос выше.</p>}
        {state.phase === 'loading' && <p>Загрузка…</p>}
        {state.phase === 'aborted' && <p>Запрос отменён.</p>}
        {state.phase === 'error' && <p className={styles.error} role="alert">Ошибка: {state.error}</p>}

        {state.meta && (
          <p className={styles.meta}>
            <strong>Status:</strong> {state.meta.status}
            {state.meta.contentType && (
              <>
                {' · '}
                <strong>Content-Type:</strong> {state.meta.contentType}
              </>
            )}
          </p>
        )}

        {state.phase === 'success' && (
          <pre className={styles.body}>{JSON.stringify(state.data, null, 2)}</pre>
        )}
      </div>
    </div>
  );
};

export default HttpPlayground;
