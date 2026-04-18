"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  type?: "success" | "warning" | "info" | "error";
}

interface NotificationContextProps {
  notifications: AppNotification[];
  unreadCount: number;
  markAllAsRead: () => void;
  addNotification: (notif: Omit<AppNotification, "id" | "timestamp" | "read">) => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = (notif: Omit<AppNotification, "id" | "timestamp" | "read">) => {
    const newNotif: AppNotification = {
      ...notif,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };



  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllAsRead, addNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
