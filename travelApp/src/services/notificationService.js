import axios from 'axios';

const API_URL = '/api/v1/notifications';

const axiosWithAuth = () => {
  const token = localStorage.getItem('token');
  return axios.create({
    baseURL: `${API_URL}`,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

export const notificationService = {
  // Get all notifications for the current user
  getNotifications: async () => {
    return axiosWithAuth().get('/');
  },

  // Mark a notification as read
  markAsRead: async (notificationId) => {
    return axiosWithAuth().patch(`/${notificationId}/read`);
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    return axiosWithAuth().patch('/mark-all-read');
  },

  // Delete a notification
  deleteNotification: async (notificationId) => {
    return axiosWithAuth().delete(`/${notificationId}`);
  },

  // Get unread notifications count
  getUnreadCount: async () => {
    return axiosWithAuth().get('/unread-count');
  },

  // Create a new notification (for admin purposes)
  createNotification: async (notificationData) => {
    return axiosWithAuth().post('/', notificationData);
  }
};
