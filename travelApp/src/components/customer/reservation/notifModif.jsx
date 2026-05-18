import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,faCheck,faTrashAlt,faBellSlash,
  faInfoCircle,
  faExclamationTriangle,
  faCheckCircle,
  faTimesCircle,
  faTimes,
  faCheckDouble
} from '@fortawesome/free-solid-svg-icons';
import { notificationService } from '../../../services/notificationService';

const NotificationComponent = ({ userId,asNavLink=false }) => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await notificationService.getNotifications();
      if (response.data.status === 'success') {
        setNotifications(response.data.data.notifications);
        setUnreadCount(response.data.data.notifications.filter(n => !n.isRead).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      fetchNotifications(); // Refresh notifications
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications(); // Refresh notifications
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      fetchNotifications(); // Refresh notifications
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // ... rest of the component remains the same ...
  const getIconByType = (type) => {
    switch (type) {
      case 'info':
        return faInfoCircle;
      case 'warning':
        return faExclamationTriangle;
      case 'success':
        return faCheckCircle;
      case 'error':
        return faTimesCircle;
      default:
        return faInfoCircle;
    }
  };

  const getColorByType = (type) => {
    switch (type) {
      case 'info':
        return 'text-blue-500';
      case 'warning':
        return 'text-yellow-500';
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-blue-500';
    }
  };

  return (
   <div className="relative">
  <button
    onClick={() => setIsOpen(!isOpen)}
    className="p-2 relative hover:bg-gray-100 rounded-full transition-colors duration-200"
  >
    <FontAwesomeIcon 
      icon={faBell} 
      className="text-gray-600 text-lg sm:text-xl" 
    />
    {unreadCount > 0 && (
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
        {unreadCount > 150 ? '150+' : unreadCount}
      </span>
    )}
  </button>

  {isOpen && (
    <div className="absolute right-0 mt-2 w-80 max-w-[90vw] sm:max-w-[95vw] bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
      {/* Header */}
      <div className="p-3 bg-gray-50 border-b flex justify-between items-center">
        <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Notifications</h3>
        <div className="flex space-x-2">
          <button
            onClick={markAllAsRead}
            className="text-blue-500 hover:text-blue-700 p-1 rounded transition-colors"
            title="Mark all as read"
          >
            <FontAwesomeIcon icon={faCheckDouble} className="text-sm" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700 p-1 rounded transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} className="text-sm" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-64 sm:max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500 text-sm sm:text-base">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
            Loading...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center text-gray-500 text-sm sm:text-base">
            <FontAwesomeIcon icon={faBellSlash} className="text-2xl mb-2 text-gray-300" />
            <p>No notifications</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 border-b hover:bg-gray-50 transition-colors duration-200 ${
                !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="flex items-start">
                <div className={`mr-3 mt-0.5 ${getColorByType(notification.type)}`}>
                  <FontAwesomeIcon 
                    icon={getIconByType(notification.type)} 
                    className="text-sm sm:text-base" 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-medium text-gray-900 text-sm sm:text-base leading-tight truncate">
                      {notification.title}
                    </h4>
                    <div className="flex space-x-1 flex-shrink-0">
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs text-gray-500 hover:text-blue-500 p-1 rounded transition-colors"
                          title="Mark as read"
                        >
                          <FontAwesomeIcon icon={faCheck} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-xs text-gray-500 hover:text-red-500 p-1 rounded transition-colors"
                        title="Delete"
                      >
                        <FontAwesomeIcon icon={faTrashAlt} />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                    {notification.message}
                  </p>
                  <div className="text-xs text-gray-400 mt-2">
                    {new Date(notification.createdAt).toLocaleString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer pour mobile */}
      <div className="md:hidden p-3 bg-gray-50 border-t flex justify-between text-xs text-gray-600">
        <span>{notifications.length} notification(s)</span>
        <button 
          onClick={markAllAsRead}
          className="text-blue-500 hover:text-blue-700"
        >
          Tout marquer comme lu
        </button>
      </div>
    </div>
  )}
</div>

  )  
};

export default NotificationComponent;
