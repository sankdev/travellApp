import React from 'react';
import NotificationComponent from './Notification';

const NotificationNavBar = ({ userId }) => {
  return (
    <div className="fixed top-0 right-0 h-16 bg-white shadow-sm z-30 flex items-center justify-end px-4">
      <div className="flex items-center space-x-4">
        {/* Vous pouvez ajouter d'autres éléments ici si nécessaire */}
        <div className="relative">
          <NotificationComponent userId={userId} />
        </div>
        
        {/* Exemple d'élément de profil */}
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-indigo-600 text-sm font-medium">
              {userId ? userId.toString().charAt(0).toUpperCase() : 'U'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationNavBar;
