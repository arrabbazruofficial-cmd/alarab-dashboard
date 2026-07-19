import { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/notifications/');
      setNotifications(res.data.results || res.data || []);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read/`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error('Failed to mark read', error);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <div className="max-w-3xl mx-auto p-4 md:p-8">
        <h1 className="text-2xl font-bold font-heading mb-6">Notifications</h1>
        
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y divide-border">
            {isLoading ? (
              <div className="p-8 text-center text-sm text-muted-foreground">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">No notifications</div>
            ) : (
              notifications.map(n => (
                <div key={n.id} className={`p-4 md:p-6 transition-colors ${!n.read ? 'bg-primary/5' : ''}`}>
                  <p className={`text-base ${!n.read ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                    {n.message}
                  </p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-sm text-muted-foreground">
                      {new Date(n.created_at).toLocaleString()}
                    </span>
                    {!n.read && (
                      <button 
                        onClick={() => markAsRead(n.id)} 
                        className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                      >
                        <CheckCircle className="w-4 h-4" /> Mark read
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
