import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Bell } from 'lucide-react';

// Helper function to convert base64 URL-safe to Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function Profile() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [pushEnabled, setPushEnabled] = useState(false);

  useEffect(() => {
    if (user) {
      loadNotifications();
      checkPushSubscription();
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      toast.error('Error loading notifications');
    }
  };

  const enablePushNotifications = async () => {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        throw new Error('Push notifications are not supported');
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // Get VAPID public key from environment
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        throw new Error('VAPID public key not configured');
      }

      // Convert VAPID key to Uint8Array using the helper function
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey
      });

      // Save subscription to Supabase
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert([
          {
            user_id: user?.id,
            subscription: subscription
          }
        ]);

      if (error) throw error;
      setPushEnabled(true);
      toast.success('Push notifications enabled!');
    } catch (error: any) {
      console.error('Push notification error:', error);
      toast.error(error.message || 'Error enabling push notifications');
    }
  };

  const checkPushSubscription = async () => {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setPushEnabled(!!subscription);
    } catch (error) {
      console.error('Error checking push subscription:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Profile</h2>
          <button
            onClick={enablePushNotifications}
            disabled={pushEnabled}
            className={`flex items-center px-4 py-2 rounded-md ${
              pushEnabled
                ? 'bg-gray-200 text-gray-600'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            <Bell className="h-5 w-5 mr-2" />
            {pushEnabled ? 'Notifications Enabled' : 'Enable Notifications'}
          </button>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Your Information</h3>
          <p className="text-gray-600">Email: {user?.email}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Recent Notifications</h3>
          <div className="space-y-4">
            {notifications.map((notification: any) => (
              <div
                key={notification.id}
                className="bg-gray-50 p-4 rounded-md"
              >
                <h4 className="font-medium">{notification.title}</h4>
                <p className="text-gray-600 mt-1">{notification.message}</p>
                <span className="text-sm text-gray-500 mt-2">
                  {new Date(notification.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
            {notifications.length === 0 && (
              <p className="text-gray-500">No notifications yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}