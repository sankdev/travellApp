import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faCheck,
  faTrashAlt,
  faBellSlash,
  faInfoCircle,
  faExclamationTriangle,
  faCheckCircle,
  faTimesCircle,
  faTimes,
  faCheckDouble,
  faExpandAlt,
  faCompressAlt,
  faCopy,
  faEnvelopeOpen,
  faEnvelope,
  faArrowRight,
  faPaperPlane,
  faCalendarAlt,
  faUser
} from '@fortawesome/free-solid-svg-icons';
import { notificationService } from '../../services/notificationService';

const NotificationComponent = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [expandedNotification, setExpandedNotification] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showFullMessage, setShowFullMessage] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const notificationRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
  }, [userId]);

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await notificationService.getNotifications();
      if (response.data.status === 'success') {
        const sortedNotifications = response.data.data.notifications.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setNotifications(sortedNotifications);
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
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const deleteAllRead = async () => {
    try {
      await notificationService.deleteAllRead();
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting read notifications:', error);
    }
  };

  const toggleExpandMessage = (notificationId) => {
    setExpandedNotification(expandedNotification === notificationId ? null : notificationId);
  };

  const viewNotificationDetails = (notification) => {
    setSelectedNotification(notification);
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };

  const closeDetails = () => {
    setSelectedNotification(null);
  };

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

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
      case 'system':
        return faBell;
      case 'user':
        return faUser;
      default:
        return faInfoCircle;
    }
  };

  const getColorByType = (type) => {
    switch (type) {
      case 'info':
        return { bg: 'bg-blue-100', text: 'text-orange-500', border: 'border-blue-500' };
      case 'warning':
        return { bg: 'bg-yellow-100', text: 'text-yellow-500', border: 'border-yellow-500' };
      case 'success':
        return { bg: 'bg-green-100', text: 'text-green-500', border: 'border-green-500' };
      case 'error':
        return { bg: 'bg-red-100', text: 'text-red-500', border: 'border-red-500' };
      case 'system':
        return { bg: 'bg-purple-100', text: 'text-purple-500', border: 'border-purple-500' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-500' };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `Il y a ${diffMins} min`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours} h`;
    } else if (diffDays === 1) {
      return 'Hier';
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jours`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Notification Card Component
  const NotificationCard = ({ notification }) => {
    const colors = getColorByType(notification.type);
    const isExpanded = expandedNotification === notification.id;
    const messageLines = notification.message.split('\n');

    return (
      <div
        className={`p-4 border-l-4 ${colors.border} ${!notification.isRead ? 'bg-blue-50/30' : 'bg-white'} 
          hover:bg-gray-50 transition-all duration-200 rounded-r-lg mb-2 cursor-pointer`}
        onClick={() => viewNotificationDetails(notification)}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`p-2 rounded-lg ${colors.bg} flex-shrink-0`}>
            <FontAwesomeIcon
              icon={getIconByType(notification.type)}
              className={`text-lg ${colors.text}`}
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base leading-tight">
                  {notification.title}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 ${colors.bg} ${colors.text} text-xs rounded-full`}>
                    {notification.type}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(notification.createdAt)} • {formatTime(notification.createdAt)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {!notification.isRead && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(notification.id);
                    }}
                    className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors"
                    title="Marquer comme lu"
                  >
                    <FontAwesomeIcon icon={faEnvelopeOpen} className="text-blue-500 text-sm" />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpandMessage(notification.id);
                  }}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  title={isExpanded ? "Réduire" : "Voir plus"}
                >
                  <FontAwesomeIcon
                    icon={isExpanded ? faCompressAlt : faExpandAlt}
                    className="text-gray-500 text-sm"
                  />
                </button>
              </div>
            </div>

            {/* Message Preview */}
            <div className="mt-3">
              {isExpanded ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-700 whitespace-pre-line">
                    {notification.message}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(notification.message, notification.id);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 mt-2"
                  >
                    <FontAwesomeIcon icon={faCopy} className="w-3 h-3" />
                    {copiedId === notification.id ? 'Copié !' : 'Copier le message'}
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {messageLines[0]}
                  {messageLines.length > 1 && '...'}
                </p>
              )}
            </div>

            {/* Read Status & CTA */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {notification.isRead ? (
                  <>
                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
                    <span>Lu</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faEnvelope} className="text-blue-500" />
                    <span>Non lu</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-blue-600 font-medium flex items-center gap-1">
                  Voir les détails
                  <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative" ref={notificationRef}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-full transition-all duration-200 group"
      >
        <div className="relative">
          <FontAwesomeIcon
            icon={faBell}
            className="text-gray-600 text-xl group-hover:text-blue-600 transition-colors"
          />
          {unreadCount > 0 && (
            <>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center border-2 border-white font-bold animate-pulse">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
              <span className="absolute inset-0 bg-red-500 rounded-full opacity-20 animate-ping"></span>
            </>
          )}
        </div>
      </button>

      {/* Notifications Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-[380px] max-w-[90vw] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-slideDown">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-white-50 to-orange-600 border-b">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  <FontAwesomeIcon icon={faBell} className="text-blue-600" />
                  Notifications
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {unreadCount} non lu{unreadCount !== 1 ? 's' : ''} • {notifications.length} total
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={markAllAsRead}
                  className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                  title="Tout marquer comme lu"
                >
                  <FontAwesomeIcon icon={faCheckDouble} className="text-blue-600" />
                </button>
                <button
                  onClick={deleteAllRead}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  title="Supprimer les lus"
                >
                  <FontAwesomeIcon icon={faTrashAlt} className="text-red-500" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} className="text-gray-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-[500px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-3"></div>
                <p className="text-gray-500">Chargement des notifications...</p>
              </div>
            ) : notifications?.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FontAwesomeIcon icon={faBellSlash} className="text-gray-300 text-2xl" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Aucune notification</h4>
                <p className="text-gray-500 text-sm">Vous serez averti des nouvelles activités</p>
              </div>
            ) : (
              <div className="p-3">
                {notifications.map((notification) => (
                  <NotificationCard key={notification.id} notification={notification} />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-gray-50 border-t">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <button
                onClick={fetchNotifications}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FontAwesomeIcon icon={faPaperPlane} className="w-4 h-4" />
                Actualiser
              </button>
              <span className="text-xs">
                Dernière mise à jour : {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Notification Detail Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-scaleIn">
            {/* Modal Header */}
            <div className={`p-6 ${getColorByType(selectedNotification.type).bg} border-b`}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${getColorByType(selectedNotification.type).text} bg-white`}>
                    <FontAwesomeIcon
                      icon={getIconByType(selectedNotification.type)}
                      className="text-2xl"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedNotification.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`px-3 py-1 ${getColorByType(selectedNotification.type).bg} 
                        ${getColorByType(selectedNotification.type).text} text-sm font-medium rounded-full`}>
                        {selectedNotification.type}
                      </span>
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <FontAwesomeIcon icon={faCalendarAlt} className="w-4 h-4" />
                        <span>{formatDate(selectedNotification.createdAt)}</span>
                        <span>•</span>
                        <span>{formatTime(selectedNotification.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={closeDetails}
                  className="p-2 hover:bg-white hover:bg-opacity-30 rounded-full transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} className="text-gray-600 text-xl" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="prose max-w-none">
                <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                  {selectedNotification.message}
                </div>
                
                {selectedNotification.metadata && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Métadonnées :</h4>
                    <pre className="text-sm text-gray-600 overflow-x-auto">
                      {JSON.stringify(selectedNotification.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t bg-gray-50">
              <div className="flex flex-wrap justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => copyToClipboard(selectedNotification.message, selectedNotification.id)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FontAwesomeIcon icon={faCopy} className="text-gray-600" />
                    <span>Copier le message</span>
                    {copiedId === selectedNotification.id && (
                      <span className="text-green-600 text-sm">✓ Copié</span>
                    )}
                  </button>
                  
                  {!selectedNotification.isRead && (
                    <button
                      onClick={() => {
                        markAsRead(selectedNotification.id);
                        closeDetails();
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <FontAwesomeIcon icon={faCheck} />
                      <span>Marquer comme lu</span>
                    </button>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => deleteNotification(selectedNotification.id)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <FontAwesomeIcon icon={faTrashAlt} />
                    <span>Supprimer</span>
                  </button>
                  <button
                    onClick={closeDetails}
                    className="px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationComponent;
