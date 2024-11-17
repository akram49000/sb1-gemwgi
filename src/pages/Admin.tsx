import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Send, Users } from 'lucide-react';

interface User {
  id: string;
  email: string;
  created_at: string;
}

export function Admin() {
  const { isAdmin } = useAuthStore();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    loadUsers();
  }, [isAdmin, navigate]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('auth_users_view')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Error loading users');
    } finally {
      setLoading(false);
    }
  };

  const sendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user');
      return;
    }

    try {
      setSending(true);
      // 1. Insert notifications into the database
      const notifications = selectedUsers.map(userId => ({
        user_id: userId,
        title,
        message,
      }));

      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .insert(notifications)
        .select();

      if (notificationsError) throw notificationsError;

      // 2. Get push subscriptions for selected users
      const { data: subscriptions, error: subscriptionsError } = await supabase
        .from('push_subscriptions')
        .select('*')
        .in('user_id', selectedUsers);

      if (subscriptionsError) throw subscriptionsError;

      // 3. Send push notifications through Edge Function
      const sendPromises = subscriptions.map(async (sub) => {
        const notification = notificationsData.find(n => n.user_id === sub.user_id);
        if (!notification) return;

        const response = await fetch(
          'https://kxsuilwtojhvogpzvcwp.supabase.co/functions/v1/send-push',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabase.auth.getSession()}`
            },
            body: JSON.stringify({
              subscription: sub.subscription,
              notification
            })
          }
        );

        if (!response.ok) {
          throw new Error('Failed to send push notification');
        }
      });

      await Promise.all(sendPromises);

      toast.success('Notifications sent successfully!');
      setTitle('');
      setMessage('');
      setSelectedUsers([]);
    } catch (error) {
      console.error('Error sending notifications:', error);
      toast.error('Error sending notifications');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center mb-6">
          <Users className="h-6 w-6 text-indigo-600 mr-2" />
          <h2 className="text-2xl font-bold">Admin Panel</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Users</h3>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between bg-gray-50 p-4 rounded-md"
                >
                  <div>
                    <p className="font-medium">{user.email}</p>
                    <p className="text-sm text-gray-500">
                      Joined: {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers([...selectedUsers, user.id]);
                      } else {
                        setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                      }
                    }}
                    className="h-5 w-5 text-indigo-600 rounded"
                  />
                </div>
              ))}
              {users.length === 0 && (
                <p className="text-gray-500 text-center py-4">No users found</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Send Notification</h3>
            <form onSubmit={sendNotification} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={selectedUsers.length === 0 || sending}
                className="flex items-center justify-center w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
              >
                {sending ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    Send Notification ({selectedUsers.length} selected)
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}