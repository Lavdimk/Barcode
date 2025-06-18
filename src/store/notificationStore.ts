import { create } from 'zustand';

type NotificationStore = {
    refetch: () => void;
    setRefetch: (fn: () => void) => void;
};

export const useNotificationStore = create<NotificationStore>((set) => ({
    refetch: () => { },
    setRefetch: (fn) => set({ refetch: fn }),
}));
