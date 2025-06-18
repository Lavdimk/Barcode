'use client';

import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import styles from './notification.module.css';
import { Trash2, Check, Bell } from 'lucide-react';
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

  // regjistro refetch-in në Zustand
  useEffect(() => {
    fetchNotifications();
    useNotificationStore.getState().setRefetch(fetchNotifications);
  }, []);

  useImperativeHandle(ref, () => ({
    refreshNotifications: fetchNotifications,
  }));


  const markAsRead = async (id: number) => {
    await fetch(`/api/notifications?id=${id}`, { method: 'PATCH' });
    setNotifications(n =>
      n.map(noti => (noti.id === id ? { ...noti, read: true } : noti))
    );
  };

  const deleteNotification = async (id: number) => {
    await fetch(`/api/notifications?id=${id}`, { method: 'DELETE' });
    setNotifications(n => n.filter(noti => noti.id !== id));
  };

  const clearAll = async () => {
    await fetch('/api/notifications', { method: 'DELETE' });
    setNotifications([]);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.bellIcon} onClick={() => setOpen(!open)}>
        <Bell size={24} className="text-white" />
        {notifications.some(n => !n.read) && <span className={styles.dot}></span>}
      </div>

      {open && (
        <div className={styles.dropdown}>
          {notifications.length === 0 ? (
            <p className={styles.empty}>Nuk ka njoftime</p>
          ) : (
            <>
              <ul className={styles.list}>
                {notifications.map(noti => (
                  <li key={noti.id} className={`${styles.item} ${noti.read ? styles.read : ''}`}>
                    <p>{noti.message}</p>
                    <small>{new Date(noti.createdAt).toLocaleString()}</small>
                    <div className={styles.actions}>
                      {!noti.read && <Check size={16} onClick={() => markAsRead(noti.id)} />}
                      <Trash2 size={16} onClick={() => deleteNotification(noti.id)} />
                    </div>
                  </li>
                ))}
              </ul>
              <button onClick={clearAll} className={styles.clearAll}>Clear All</button>
            </>
          )}
        </div>
      )}
    </div>
  );
});

NotificationDropdown.displayName = 'NotificationDropdown';

export default NotificationDropdown;
