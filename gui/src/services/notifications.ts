import { apiService } from './api';

export class NotificationService {
  private vapidPublicKey: string | null = null;

  async initialize(): Promise<void> {
    try {
      this.vapidPublicKey = await apiService.getVapidPublicKey();
      await this.registerServiceWorker();
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  }

  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.log('Notification permission denied');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  async subscribeToWallet(walletId: string): Promise<boolean> {
    if (!this.vapidPublicKey) {
      console.error('VAPID public key not available');
      return false;
    }

    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey),
      });

      await apiService.subscribeToNotifications(walletId, subscription);
      console.log('Successfully subscribed to notifications for wallet:', walletId);
      return true;
    } catch (error) {
      console.error('Failed to subscribe to notifications:', error);
      return false;
    }
  }

  async unsubscribeFromWallet(walletId: string): Promise<boolean> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        console.log('Successfully unsubscribed from notifications for wallet:', walletId);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to unsubscribe from notifications:', error);
      return false;
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  isSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  getPermissionStatus(): NotificationPermission {
    return Notification.permission;
  }
}

export const notificationService = new NotificationService();