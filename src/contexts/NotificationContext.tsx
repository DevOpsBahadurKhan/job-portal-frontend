
'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';

import { apiClient } from '@/lib/api';
import { useAuth } from './AuthContext';

interface PushSubscriptionPayload {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface NotificationContextType {
  permission: NotificationPermission;
  requestPermission: () => Promise<void>;
  subscribeToPush: () => Promise<void>;
  isSubscribed: boolean;
  error: string | null;
}

const NotificationContext =
  createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [permission, setPermission] =
    useState<NotificationPermission>('default');

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user, isAuthenticated } = useAuth();

  // Initialize browser notification permission
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'Notification' in window
    ) {
      setPermission(Notification.permission);
    }
  }, []);

  // Reset local subscription state when user logs out
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setIsSubscribed(false);
      setError(null);
    }
  }, [isAuthenticated, user]);

  const bufferToBase64 = useCallback(
    (buffer: ArrayBuffer): string => {
      const bytes = new Uint8Array(buffer);
      let binary = '';

      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }

      return window.btoa(binary);
    },
    []
  );

  const urlBase64ToUint8Array = useCallback(
    (base64String: string): Uint8Array => {
      const padding = '='.repeat(
        (4 - (base64String.length % 4)) % 4
      );

      const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      const rawData = window.atob(base64);

      const outputArray = new Uint8Array(rawData.length);

      for (let i = 0; i < rawData.length; i++) {
        outputArray[i] = rawData.charCodeAt(i);
      }

      return outputArray;
    },
    []
  );

  const getSubscriptionPayload = useCallback(
    (
      subscription: globalThis.PushSubscription
    ): PushSubscriptionPayload => {
      const p256dh = subscription.getKey('p256dh');
      const auth = subscription.getKey('auth');

      if (!p256dh || !auth) {
        throw new Error(
          'Push subscription keys are missing'
        );
      }

      return {
        endpoint: subscription.endpoint,
        expirationTime: subscription.expirationTime,
        keys: {
          p256dh: bufferToBase64(p256dh),
          auth: bufferToBase64(auth),
        },
      };
    },
    [bufferToBase64]
  );

  const subscribeToPush = useCallback(async (): Promise<void> => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker is not supported');
    }

    if (!('PushManager' in window)) {
      throw new Error('Push API is not supported');
    }

    if (!user || !isAuthenticated) {
      throw new Error('Please login to enable notifications');
    }

    if (Notification.permission !== 'granted') {
      throw new Error(
        'Please allow browser notifications first'
      );
    }

    setError(null);
    setIsSubscribed(false);

    try {
      console.log('Registering service worker...');

      // Register or update the root service worker
      const registration =
        await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        });

      // Wait until the service worker is ready
      const readyRegistration =
        await navigator.serviceWorker.ready;

      console.log('Service worker ready:', {
        scope: readyRegistration.scope,
        active: readyRegistration.active?.state,
        scriptURL: readyRegistration.active?.scriptURL,
      });

      if (!readyRegistration.pushManager) {
        throw new Error('Push Manager is not available');
      }

      // Check whether a subscription already exists
      let subscription =
        await readyRegistration.pushManager.getSubscription();

      if (subscription) {
        console.log('Existing push subscription found');
      } else {
        console.log('Creating a new push subscription...');

        const vapidPublicKey =
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

        if (!vapidPublicKey) {
          throw new Error(
            'NEXT_PUBLIC_VAPID_PUBLIC_KEY is not configured'
          );
        }

        const convertedVapidKey =
          urlBase64ToUint8Array(vapidPublicKey);

        subscription =
          await readyRegistration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVapidKey,
          });
      }

      console.log('Push endpoint:', subscription.endpoint);

      // Send the subscription to the authenticated backend
      const payload = getSubscriptionPayload(subscription);

      const response =
        await apiClient.registerPushSubscription(payload);

      if (!response.success) {
        throw new Error(
          response.error ||
          'Failed to register push subscription'
        );
      }

      setIsSubscribed(true);
      setPermission(Notification.permission);
      setError(null);

      console.log('Push subscription saved successfully');
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to subscribe to push notifications';

      setError(message);
      setIsSubscribed(false);

      console.error('Push subscription error:', err);

      throw err;
    }
  }, [
    user,
    isAuthenticated,
    getSubscriptionPayload,
    urlBase64ToUint8Array,
  ]);

  const requestPermission = useCallback(
    async (): Promise<void> => {
      if (
        typeof window === 'undefined' ||
        !('Notification' in window)
      ) {
        setError(
          'This browser does not support notifications'
        );
        return;
      }

      if (!isAuthenticated || !user) {
        setError('Please login first');
        return;
      }

      try {
        setError(null);

        console.log(
          'Current notification permission:',
          Notification.permission
        );

        const result =
          await Notification.requestPermission();

        setPermission(result);

        console.log('Permission result:', result);

        if (result === 'granted') {
          await subscribeToPush();
        } else {
          setIsSubscribed(false);
          setError('Notification permission denied');
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to request notification permission';

        setError(message);
        console.error('Permission request error:', err);
      }
    },
    [isAuthenticated, user, subscribeToPush]
  );

  return (
    <NotificationContext.Provider
      value={{
        permission,
        requestPermission,
        subscribeToPush,
        isSubscribed,
        error,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      'useNotifications must be used within NotificationProvider'
    );
  }

  return context;
}