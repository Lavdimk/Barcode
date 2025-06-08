import styles from './notification.module.css';

interface NotificationModalProps {
  notifications: string[];
}

export default function NotificationModal({ notifications }: NotificationModalProps) {
  return (
    <div className={styles.modal}>
      {notifications.length === 0 ? (
        <p className={styles.empty}>No notifications</p>
      ) : (
        <ul className={styles.list}>
          {notifications.map((notif, index) => (
            <li key={index} className={styles.item}>
              {notif}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
