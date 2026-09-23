'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { useAuth } from './AuthContext';

interface PushSubscription {
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

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasRequestedPermission, setHasRequestedPermission] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Automatically request permission when user logs in
  useEffect(() => {
    console.log('Notification effect check:', { isAuthenticated, user, permission, isSubscribed, hasRequestedPermission });
    
    if (isAuthenticated && user && permission === 'default' && !isSubscribed && !hasRequestedPermission) {
      // Remove localStorage check temporarily to fix loading issue
      const timer = setTimeout(() => {
        console.log('Requesting permission...');
        setHasRequestedPermission(true);
        void requestPermission();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, permission, isSubscribed, hasRequestedPermission]);

  const requestPermission = async () => {
    console.log('requestPermission called');
    
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.log('Notifications not supported');
      setError('This browser does not support notifications');
      return;
    }

    try {
      console.log('Current permission:', Notification.permission);
      const result = await Notification.requestPermission();
      console.log('Permission result:', result);
      
      setPermission(result);
      // Remove localStorage.setItem temporarily
      
      if (result === 'granted') {
        await subscribeToPush();
      } else {
        setError('Notification permission denied');
      }
    } catch (err) {
      console.error('Permission request error:', err);
      setError(err instanceof Error ? err.message : 'Failed to request permission');
    }
  };

  const subscribeToPush = async () => {
    if (typeof window === 'undefined') return;

    try {
      console.log('Starting service worker registration...');
      
      // Check if service worker is supported
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service Worker not supported');
      }

      // Check existing registration first
      const existingRegistration = await navigator.serviceWorker.getRegistration();
      console.log('Existing registration:', existingRegistration);

      let registration = existingRegistration;
      
      if (!registration) {
        console.log('No existing registration, registering new service worker...');
        // Register Service Worker
        registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        console.log('Service Worker registered:', registration);
      } else {
        console.log('Using existing service worker registration');
      }

      // Ensure service worker is active
      if (registration.active) {
        console.log('Service worker is already active');
      } else if (registration.installing) {
        console.log('Service worker is installing, waiting for activation...');
        await new Promise<void>((resolve, reject) => {
          registration!.installing!.addEventListener('statechange', (e: Event) => {
            const target = e.target as ServiceWorker;
            console.log('Service worker state:', target.state);
            if (target.state === 'activated') {
              resolve();
            } else if (target.state === 'redundant') {
              reject(new Error('Service worker became redundant'));
            }
          });
        });
      } else if (registration.waiting) {
        console.log('Service worker is waiting, activating...');
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        await new Promise<void>((resolve, reject) => {
          registration!.waiting!.addEventListener('statechange', (e: Event) => {
            const target = e.target as ServiceWorker;
            console.log('Service worker state:', target.state);
            if (target.state === 'activated') {
              resolve();
            } else if (target.state === 'redundant') {
              reject(new Error('Service worker became redundant'));
            }
          });
        });
      }

      console.log('Service worker is active, checking push manager...');
      
      // Check if push manager is available
      if (!registration.pushManager) {
        throw new Error('Push Manager not available');
      }

      // Check existing subscription
      const existingSubscription = await registration.pushManager.getSubscription();
      console.log('Existing subscription:', existingSubscription);

      if (existingSubscription) {
        console.log('Already subscribed, using existing subscription');
        // Send existing subscription to backend
        if (user) {
          const response = await apiClient.registerPushSubscription({
            endpoint: existingSubscription.endpoint,
            expirationTime: existingSubscription.expirationTime,
            keys: {
              p256dh: existingSubscription.getKey('p256dh') 
                ? bufferToBase64(existingSubscription.getKey('p256dh')!)
                : '',
              auth: existingSubscription.getKey('auth')
                ? bufferToBase64(existingSubscription.getKey('auth')!)
                : '',
            },
          });

          if (response.success) {
            setIsSubscribed(true);
            setError(null);
            return;
          }
        }
      }

      // Get VAPID public key from environment
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        throw new Error('VAPID public key not configured');
      }

      console.log('VAPID Key from env:', vapidPublicKey);
      console.log('VAPID Key length:', vapidPublicKey.length);

      // Convert base64 to Uint8Array
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

      console.log('VAPID Key converted:', convertedVapidKey);
      console.log('VAPID Key length:', convertedVapidKey.length);

      // Create PushSubscription
      console.log('Creating push subscription...');
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey as any,
      });

      console.log('Push subscription created:', subscription);

      // Send subscription to backend
      if (user) {
        const response = await apiClient.registerPushSubscription({
          endpoint: subscription.endpoint,
          expirationTime: subscription.expirationTime,
          keys: {
            p256dh: subscription.getKey('p256dh') 
              ? bufferToBase64(subscription.getKey('p256dh')!)
              : '',
            auth: subscription.getKey('auth')
              ? bufferToBase64(subscription.getKey('auth')!)
              : '',
          },
        });

        if (response.success) {
          setIsSubscribed(true);
          setError(null);
        } else {
          throw new Error(response.error || 'Failed to send subscription to server');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to subscribe to push notifications');
      console.error('Push subscription error:', err);
    }
  };

  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  };

  const bufferToBase64 = (buffer: ArrayBuffer): string => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    
    return window.btoa(binary);
  };

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
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
