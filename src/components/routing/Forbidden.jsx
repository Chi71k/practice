import { Link } from 'react-router-dom';
import styles from '../../styles/Forbidden.module.scss';

const Forbidden = ({
  title = 'Недостаточно прав',
  message = 'Ваша роль не позволяет выполнить это действие.',
}) => (
  <div className={styles.forbidden} role="alert">
    <h2>{title}</h2>
    <p>{message}</p>
    <Link to="/">На главную</Link>
  </div>
);

export default Forbidden;
