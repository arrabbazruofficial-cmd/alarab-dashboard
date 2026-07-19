import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { api } from '@/lib/api';

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = async () => {
    try {
      const res = await api.get('/notifications/unread-count/');
      setUnreadCount(res.data.count);
    } catch (e) {
      // fail silently
    }
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 60000);
    return () => clearInterval(interval);
  }, []);

  const openNotificationsTab = () => {
    window.open('/notifications', '_blank');
  };

  return (
    <div className="relative">
      <div 
        className="cursor-pointer hover:bg-white/10 p-2 rounded-full transition-all duration-200 relative"
        onClick={openNotificationsTab}
      >
        <Bell className="w-5 h-5 text-white/80 hover:text-white transition-colors" />
        {unreadCount > 0 && (
          <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-destructive rounded-full ring-2 ring-background" />
        )}
      </div>
    </div>
  );
}
