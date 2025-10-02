import webpush from 'web-push';
import { NotificationPayload } from './types';

export class PushNotificationService {
  private vapidPublicKey: string;
  private vapidPrivateKey: string;
  private subscriptions: Map<string, any[]> = new Map();

  constructor(vapidPublicKey: string, vapidPrivateKey: string) {
    this.vapidPublicKey = vapidPublicKey;
    this.vapidPrivateKey = vapidPrivateKey;
    
    webpush.setVapidDetails(
      'mailto:ops@sol-snatcher.com',
      vapidPublicKey,
      vapidPrivateKey
    );
  }

  async subscribe(walletId: string, subscription: any): Promise<void> {
    if (!this.subscriptions.has(walletId)) {
      this.subscriptions.set(walletId, []);
    }
    
    const walletSubscriptions = this.subscriptions.get(walletId)!;
    
    // Check if subscription already exists
    const exists = walletSubscriptions.some(sub => 
      sub.endpoint === subscription.endpoint
    );
    
    if (!exists) {
      walletSubscriptions.push(subscription);
      console.log(`Added push subscription for wallet ${walletId}`);
    }
  }

  async unsubscribe(walletId: string, endpoint: string): Promise<void> {
    const walletSubscriptions = this.subscriptions.get(walletId);
    if (walletSubscriptions) {
      const index = walletSubscriptions.findIndex(sub => sub.endpoint === endpoint);
      if (index !== -1) {
        walletSubscriptions.splice(index, 1);
        console.log(`Removed push subscription for wallet ${walletId}`);
      }
    }
  }

  async notify(walletId: string, payload: NotificationPayload): Promise<void> {
    const walletSubscriptions = this.subscriptions.get(walletId);
    if (!walletSubscriptions || walletSubscriptions.length === 0) {
      console.log(`No subscriptions found for wallet ${walletId}`);
      return;
    }

    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: '/icons/sol-snatcher.png',
      badge: '/icons/badge.png',
      data: payload.data || {},
      actions: [
        {
          action: 'view',
          title: 'View Dashboard',
          icon: '/icons/view.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/icons/dismiss.png'
        }
      ],
      requireInteraction: true,
      silent: false,
    });

    const promises = walletSubscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(subscription, notificationPayload);
        console.log(`Push notification sent to wallet ${walletId}`);
      } catch (error) {
        console.error(`Failed to send push notification to wallet ${walletId}:`, error);
        
        // Remove invalid subscriptions
        if (error instanceof Error && error.message.includes('410')) {
          const index = walletSubscriptions.indexOf(subscription);
          if (index !== -1) {
            walletSubscriptions.splice(index, 1);
          }
        }
      }
    });

    await Promise.allSettled(promises);
  }

  async notifyAll(payload: NotificationPayload): Promise<void> {
    const allWalletIds = Array.from(this.subscriptions.keys());
    const promises = allWalletIds.map(walletId => this.notify(walletId, payload));
    await Promise.allSettled(promises);
  }

  getVapidPublicKey(): string {
    return this.vapidPublicKey;
  }

  getSubscriptionCount(walletId?: string): number {
    if (walletId) {
      const walletSubscriptions = this.subscriptions.get(walletId);
      return walletSubscriptions ? walletSubscriptions.length : 0;
    }
    
    return Array.from(this.subscriptions.values())
      .reduce((total, subs) => total + subs.length, 0);
  }
}