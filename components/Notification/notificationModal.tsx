'use client';

import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react';
import styles from './notification.module.css';
import { Bell, Trash2 } from 'lucide-react';
import { useNotificationStore } from '@/store/notificationStore';

export type Notification = {
  id: number;
  message: string;
  read: boolean;
  createdAt: string;
};

const NotificationDropdown = forwardRef((_, ref) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  const fetchNotifications = async () => {
    const res = await fetch('/api/notifications');
    const data = await res.json();
    setNotifications(data);
  };

  useEffect(() => {
    fetchNotifications();
    useNotificationStore.getState().setRefetch(fetchNotifications);
  }, []);

  useImperativeHandle(ref, () => ({
    refreshNotifications: fetchNotifications,
  }));

  const deleteNotification = async (id: number) => {
    await fetch(`/api/notifications?id=${id}`, { method: 'DELETE' });
    setNotifications(n => n.filter(noti => noti.id !== id));
  };

  const clearAll = async () => {
    await fetch('/api/notifications', { method: 'DELETE' });
    setNotifications([]);
  };

  function timeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  }
  
const wasOpen = useRef(false);

useEffect(() => {
  if (wasOpen.current && !open) {
    const unread = notifications.filter(n => !n.read);
    if (unread.length > 0) {
      unread.forEach(async (n) => {
        await fetch(`/api/notifications?id=${n.id}`, { method: 'PATCH' });
      });

      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
    }
  }

  wasOpen.current = open;
}, [open, notifications]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.bellIcon} onClick={() => setOpen(!open)}>
        <Bell size={24} className="text-white" />
        {notifications.some(n => !n.read) && (
          <span className={styles.dot}></span>
        )}
      </div>

      {open && (
        <div className={styles.dropdown}>
          {notifications.length === 0 ? (
            <p className={styles.empty}>Nuk ka njoftime</p>
          ) : (
            <>
              <ul className={styles.list}>
                {notifications.map(noti => (
                  <li
                    key={noti.id}
                    className={`${styles.item} ${noti.read ? styles.read : styles.unread}`}
                  >
                    <div className={styles.notificationContent}>
                      <div className={styles.leftSide}>
                        {!noti.read && <span className={styles.blueDot}></span>}
                        <p className={styles.message}>{noti.message}</p>
                      </div>
                      <span className={styles.time}>{timeAgo(noti.createdAt)}</span>
                      <Trash2 size={15} className={styles.icon} color='#9f9a9a' onClick={() => deleteNotification(noti.id)} />
                    </div>
                  </li>
                ))}
              </ul>
              <button onClick={clearAll} className={styles.clearAll}>Fshi të gjitha</button>
            </>
          )}
        </div>
      )}
    </div>
  );
});

NotificationDropdown.displayName = 'NotificationDropdown';
export default NotificationDropdown;
