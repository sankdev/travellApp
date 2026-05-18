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
  faUser,
  faExternalLinkAlt,
  faHistory,
  faFilter,
  faSortAmountDown,
  faEye,
  faEyeSlash
} from '@fortawesome/free-solid-svg-icons';
import { notificationService } from '../../../services/notificationService';

const NotificationComponent = ({ userId, asNavLink = false }) => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [expandedNotification, setExpandedNotification] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [filterType, setFilterType] = useState('all'); // 'all', 'unread', 'read'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest'
  const notificationRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
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
        let sortedNotifications = response.data.data.notifications;
        
        // Sort notifications
        sortedNotifications = sortedNotifications.sort((a, b) => {
          if (sortBy === 'newest') {
            return new Date(b.createdAt) - new Date(a.createdAt);
          } else {
            return new Date(a.createdAt) - new Date(b.createdAt);
          }
        });
        
        setNotifications(sortedNotifications);
        setUnreadCount(sortedNotifications.filter(n => !n.isRead).length);
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
        return { bg: 'bg-blue-100', text: 'text-blue-500', border: 'border-blue-500', badge: 'bg-blue-500' };
      case 'warning':
        return { bg: 'bg-yellow-100', text: 'text-yellow-500', border: 'border-yellow-500', badge: 'bg-yellow-500' };
      case 'success':
        return { bg: 'bg-green-100', text: 'text-green-500', border: 'border-green-500', badge: 'bg-green-500' };
      case 'error':
        return { bg: 'bg-red-100', text: 'text-red-500', border: 'border-red-500', badge: 'bg-red-500' };
      case 'system':
        return { bg: 'bg-purple-100', text: 'text-purple-500', border: 'border-purple-500', badge: 'bg-purple-500' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-500', badge: 'bg-gray-500' };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return 'À l\'instant';
    } else if (diffMins < 60) {
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
        month: 'short'
      });
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFullDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter notifications based on filterType
  const filteredNotifications = notifications.filter(notification => {
    if (filterType === 'unread') return !notification.isRead;
    if (filterType === 'read') return notification.isRead;
    return true; // 'all'
  });

  // Notification Card Component
  const NotificationCard = ({ notification }) => {
    const colors = getColorByType(notification.type);
    const isExpanded = expandedNotification === notification.id;
    const messageLines = notification.message.split('\n');

    return (
      <div
        className={`p-4 border-l-4 ${colors.border} ${!notification.isRead ? 'bg-blue-50/30' : 'bg-white'} 
          hover:bg-gray-50 transition-all duration-200 rounded-r-lg mb-2 cursor-pointer shadow-sm hover:shadow-md`}
        onClick={() => viewNotificationDetails(notification)}
      >
        <div className="flex items-start gap-3">
          {/* Icon with badge */}
          <div className="relative flex-shrink-0">
            <div className={`p-2.5 rounded-xl ${colors.bg}`}>
              <FontAwesomeIcon
                icon={getIconByType(notification.type)}
                className={`text-lg ${colors.text}`}
              />
            </div>
            {!notification.isRead && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base leading-tight">
                    {notification.title}
                  </h4>
                  <span className={`px-2 py-0.5 ${colors.bg} ${colors.text} text-xs font-medium rounded-full`}>
                    {notification.type}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <FontAwesomeIcon icon={faCalendarAlt} className="w-3 h-3" />
                    <span>{formatDate(notification.createdAt)}</span>
                    <span>•</span>
                    <span>{formatTime(notification.createdAt)}</span>
                  </div>
                  {notification.priority && (
                    <span className={`px-2 py-0.5 ${notification.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'} text-xs rounded-full`}>
                      {notification.priority}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
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
              </div>
            </div>

            {/* Message Preview */}
            <div className="mt-3">
              {isExpanded ? (
                <div className="space-y-2">
                  <div className="text-sm text-gray-700 whitespace-pre-line bg-gray-50 p-3 rounded-lg">
                    {notification.message}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(notification.message, notification.id);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800"
                    >
                      <FontAwesomeIcon icon={faCopy} className="w-3 h-3" />
                      {copiedId === notification.id ? 'Copié !' : 'Copier'}
                    </button>
                    {notification.link && (
                      <a
                        href={notification.link}
                        onClick={(e) => e.stopPropagation()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-green-600 hover:text-green-800"
                      >
                        <FontAwesomeIcon icon={faExternalLinkAlt} className="w-3 h-3" />
                        Ouvrir le lien
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {messageLines[0]}
                  {messageLines.length > 1 && '...'}
                  <span className="ml-2 text-xs text-blue-500 font-medium">
                    Lire la suite →
                  </span>
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                {notification.isRead ? (
                  <span className="inline-flex items-center gap-1 text-xs text-green-600">
                    <FontAwesomeIcon icon={faCheckCircle} className="w-3 h-3" />
                    Lu
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-blue-600">
                    <FontAwesomeIcon icon={faEnvelope} className="w-3 h-3" />
                    Non lu
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  Cliquez pour les détails
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
      {/* Notification Bell - Version asNavLink */}
      {asNavLink ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative group flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 w-full"
        >
          <div className="relative">
            <FontAwesomeIcon
              icon={faBell}
              className="text-gray-600 group-hover:text-blue-600 transition-colors"
            />
            {unreadCount > 0 && (
              <>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center border-2 border-white font-bold">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
                <span className="absolute inset-0 bg-red-500 rounded-full opacity-20 animate-ping"></span>
              </>
            )}
          </div>
          <span className="font-medium">Notifications</span>
          <span className="ml-auto text-sm text-gray-500">
            {unreadCount > 0 && `${unreadCount} non lu${unreadCount > 1 ? 's' : ''}`}
          </span>
        </button>
      ) : (
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
      )}

      {/* Notifications Panel */}
      {isOpen && (
        <div className={`absolute ${asNavLink ? 'left-0 mt-1 w-96' : 'right-0 mt-2 w-[420px]'} 
          max-w-[95vw] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-slideDown`}>
          
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-orange-600 to-orange-600 text-white">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="font-bold text-xl flex items-center gap-3">
                  <FontAwesomeIcon icon={faBell} />
                  Notifications
                </h3>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-orange-300 rounded-full animate-pulse"></div>
                    <span className="text-sm text-blue-100">{unreadCount} non lu{unreadCount !== 1 ? 's' : ''}</span>
                  </div>
                  <span className="text-sm text-blue-200">•</span>
                  <span className="text-sm text-blue-100">{notifications.length} total</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={fetchNotifications}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="Actualiser"
                >
                  <FontAwesomeIcon icon={faPaperPlane} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            </div>

            {/* Filters and Sort */}
            <div className="flex items-center gap-3 mt-4">
              <div className="flex bg-white/20 rounded-lg p-1">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${filterType === 'all' ? 'bg-white text-blue-600' : 'text-blue-100 hover:bg-white/10'}`}
                >
                  Toutes
                </button>
                <button
                  onClick={() => setFilterType('unread')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${filterType === 'unread' ? 'bg-white text-blue-600' : 'text-blue-100 hover:bg-white/10'}`}
                >
                  Non lues
                </button>
                <button
                  onClick={() => setFilterType('read')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${filterType === 'read' ? 'bg-white text-blue-600' : 'text-blue-100 hover:bg-white/10'}`}
                >
                  Lues
                </button>
              </div>
              
              <button
                onClick={() => setSortBy(sortBy === 'newest' ? 'oldest' : 'newest')}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/20 text-blue-100 rounded-lg hover:bg-white/30 transition-colors text-sm"
              >
                <FontAwesomeIcon icon={faSortAmountDown} />
                {sortBy === 'newest' ? 'Plus récentes' : 'Plus anciennes'}
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-3 bg-gray-50 border-b flex justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <FontAwesomeIcon icon={faCheckDouble} className="text-green-600" />
                Tout marquer comme lu
              </button>
              <button
                onClick={deleteAllRead}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <FontAwesomeIcon icon={faTrashAlt} className="text-red-500" />
                Vider les lues
              </button>
            </div>
            <button
              onClick={() => setExpandedNotification(null)}
              className="px-3 py-1.5 text-gray-600 hover:text-gray-800 text-sm"
            >
              Tout réduire
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-[500px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="inline-flex flex-col items-center">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-gray-500 font-medium">Chargement des notifications...</p>
                  <p className="text-gray-400 text-sm mt-1">Veuillez patienter</p>
                </div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FontAwesomeIcon icon={faBellSlash} className="text-gray-300 text-3xl" />
                </div>
                <h4 className="font-bold text-gray-900 text-lg mb-2">
                  {filterType === 'unread' ? 'Aucune notification non lue' : 
                   filterType === 'read' ? 'Aucune notification lue' : 
                   'Aucune notification'}
                </h4>
                <p className="text-gray-500 text-sm">
                  {filterType === 'unread' ? 'Vous avez tout lu !' : 
                   filterType === 'read' ? 'Aucune notification marquée comme lue' : 
                   'Vous serez averti des nouvelles activités'}
                </p>
                {filterType !== 'all' && (
                  <button
                    onClick={() => setFilterType('all')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Voir toutes les notifications
                  </button>
                )}
              </div>
            ) : (
              <div className="p-4">
                {filteredNotifications.map((notification) => (
                  <NotificationCard key={notification.id} notification={notification} />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-gray-50 border-t">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faHistory} className="w-4 h-4" />
                <span>Dernière actualisation : {formatTime(new Date())}</span>
              </div>
              <button
                onClick={() => {
                  markAllAsRead();
                  setIsOpen(false);
                }}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Tout marquer comme lu et fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Detail Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-scaleIn">
            {/* Modal Header */}
            <div className={`p-6 ${getColorByType(selectedNotification.type).bg}`}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-white ${getColorByType(selectedNotification.type).text}`}>
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
                      <span className={`px-3 py-1 ${getColorByType(selectedNotification.type).text} 
                        bg-white bg-opacity-30 text-sm font-medium rounded-full`}>
                        {selectedNotification.type}
                      </span>
                      <div className="flex items-center gap-1.5 text-sm text-gray-700">
                        <FontAwesomeIcon icon={faCalendarAlt} className="w-4 h-4" />
                        <span>{formatFullDate(selectedNotification.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={closeDetails}
                  className="p-2 hover:bg-white hover:bg-opacity-30 rounded-full transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} className="text-gray-700 text-xl" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                <div className="text-gray-700 whitespace-pre-line leading-relaxed bg-gray-50 p-4 rounded-lg">
                  {selectedNotification.message}
                </div>
                
                {selectedNotification.metadata && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FontAwesomeIcon icon={faInfoCircle} />
                      Informations supplémentaires
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-sm text-gray-600">
                        {JSON.stringify(selectedNotification.metadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
                
                {selectedNotification.link && (
                  <div className="mt-4">
                    <a
                      href={selectedNotification.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <FontAwesomeIcon icon={faExternalLinkAlt} />
                      Ouvrir le lien associé
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t bg-gray-50">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => copyToClipboard(selectedNotification.message, selectedNotification.id)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FontAwesomeIcon icon={faCopy} className="text-gray-600" />
                    <span>Copier le message</span>
                    {copiedId === selectedNotification.id && (
                      <span className="text-green-600 text-sm font-medium">✓</span>
                    )}
                  </button>
                  
                  <button
                    onClick={() => {
                      if (!selectedNotification.isRead) {
                        markAsRead(selectedNotification.id);
                      }
                      closeDetails();
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors ${
                      selectedNotification.isRead 
                        ? 'bg-gray-100 text-gray-700' 
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    <FontAwesomeIcon icon={selectedNotification.isRead ? faEye : faCheck} />
                    <span>{selectedNotification.isRead ? 'Déjà lu' : 'Marquer comme lu'}</span>
                  </button>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      deleteNotification(selectedNotification.id);
                      closeDetails();
                    }}
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
