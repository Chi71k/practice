import { useEffect, useState } from 'react';
import * as applicationsApi from '../api/applicationsApi';
import { useAuth } from '../hooks/useAuth';
import {
  canWithdrawApplication, canUpdateApplicationStatus, canDeleteApplication,
} from '../utils/permissions';
import { ApiError } from '../api/ApiError';
import Pagination from '../components/Pagination';
import styles from '../styles/Applications.module.scss';

const STATUS_LABELS = {
  SUBMITTED: 'Отправлен',
  REVIEWING: 'На рассмотрении',
  ACCEPTED: 'Принят',
  REJECTED: 'Отклонён',
  WITHDRAWN: 'Отозван',
};

const STATUS_ACTIONS = ['REVIEWING', 'REJECTED', 'ACCEPTED'];

const LIMIT = 20;

const describeActionError = (err) => {
  if (err instanceof ApiError) {
    if (err.status === 409) return 'Этот отклик уже нельзя изменить — статус финальный.';
    if (err.status === 403 || err.status === 404) return 'Действие недоступно для этого отклика.';
    return `Не удалось выполнить действие (${err.status}).`;
  }
  return 'Нет соединения с сервером.';
};

const Applications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('idle');
  const [rowErrors, setRowErrors] = useState({});
  const [reloadKey, setReloadKey] = useState(0);
  const refresh = () => setReloadKey((key) => key + 1);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      setStatus('loading');
      try {
        const { data, meta: responseMeta } = await applicationsApi.getApplications(
          { page, limit: LIMIT },
          { signal: controller.signal },
        );
        setApplications(data);
        setMeta(responseMeta);
        setStatus('succeeded');
      } catch (err) {
        if (err.name === 'AbortError') return;
        setStatus('failed');
      }
    };

    load();
    return () => controller.abort();
  }, [page, reloadKey]);

  const setRowError = (id, message) => {
    setRowErrors((prev) => ({ ...prev, [id]: message }));
  };

  const handleWithdraw = async (id) => {
    setRowError(id, null);
    try {
      await applicationsApi.withdrawApplication(id);
      refresh();
    } catch (err) {
      setRowError(id, describeActionError(err));
    }
  };

  const handleStatusChange = async (id, nextStatus) => {
    if (!nextStatus) return;
    setRowError(id, null);
    try {
      await applicationsApi.updateApplicationStatus(id, nextStatus);
      refresh();
    } catch (err) {
      setRowError(id, describeActionError(err));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить отклик безвозвратно?')) return;
    setRowError(id, null);
    try {
      await applicationsApi.deleteApplication(id);
      refresh();
    } catch (err) {
      setRowError(id, describeActionError(err));
    }
  };

  return (
    <div className={styles.page}>
      <h1>Отклики</h1>

      {status === 'loading' && <p>Загрузка...</p>}
      {status === 'failed' && <p>Не удалось загрузить отклики.</p>}
      {status === 'succeeded' && applications.length === 0 && <p>Откликов пока нет</p>}

      <div className={styles.list}>
        {applications.map((application) => (
          <div key={application.id} className={styles.card}>
            <h3>{application.vacancyTitle}</h3>
            <p><strong>Резюме:</strong> {application.resumeTitle}</p>
            <p><strong>Кандидат:</strong> {application.candidateName}</p>
            {application.coverLetter && (
              <p><strong>Сопроводительное письмо:</strong> {application.coverLetter}</p>
            )}
            <span className={styles.badge}>{STATUS_LABELS[application.status] ?? application.status}</span>

            <div className={styles.actions}>
              {canWithdrawApplication(user, application) && (
                <button
                  type="button"
                  className={styles.withdrawBtn}
                  onClick={() => handleWithdraw(application.id)}
                >
                  Отозвать
                </button>
              )}

              {canUpdateApplicationStatus(user, application) && (
                <select
                  className={styles.statusSelect}
                  value=""
                  onChange={(e) => handleStatusChange(application.id, e.target.value)}
                >
                  <option value="">Изменить статус</option>
                  {STATUS_ACTIONS.map((value) => (
                    <option key={value} value={value}>{STATUS_LABELS[value]}</option>
                  ))}
                </select>
              )}

              {canDeleteApplication(user) && (
                <button
                  type="button"
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(application.id)}
                >
                  Удалить
                </button>
              )}
            </div>

            {rowErrors[application.id] && (
              <p className={styles.rowError} role="alert">{rowErrors[application.id]}</p>
            )}
          </div>
        ))}
      </div>

      {meta && meta.pages > 1 && (
        <Pagination currentPage={meta.page} totalPages={meta.pages} onPageChange={setPage} />
      )}
    </div>
  );
};

export default Applications;
