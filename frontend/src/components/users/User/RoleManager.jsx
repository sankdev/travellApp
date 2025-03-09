import React, { useState, useEffect } from 'react';
//import { User, Role } from '../../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faShieldAlt, faCheck } from '@fortawesome/free-solid-svg-icons';

const RoleManager = ({
  user,
  allRoles,
  isOpen,
  isLoading,
  onClose,
  onAssignRole,
  onRemoveRole
}) => {
  const [userRoles, setUserRoles] = useState([]);
  const [processingRoles, setProcessingRoles] = useState([]);
console.log('userRole',allRoles)
console.log('user',user)

  useEffect(() => {
    if (user && user.roles) {
      setUserRoles(user.roles.map(role => role.id));
    } else {
      setUserRoles([]);
    }
  }, [user]);

  const handleRoleToggle = async (roleId) => {
    if (!user) return;

    setProcessingRoles(prev => [...prev, roleId]);

    try {
      if (userRoles.includes(roleId)) {
        await onRemoveRole(user.id, roleId);
        setUserRoles(prev => prev.filter(id => id !== roleId));
      } else {
        await onAssignRole(user.id, roleId);
        setUserRoles(prev => [...prev, roleId]);
      }
    } catch (error) {
      console.error('Error toggling role:', error);
    } finally {
      setProcessingRoles(prev => prev.filter(id => id !== roleId));
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center pb-3 border-b">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Manage Roles for {user.name}
              </h3>
              <button
                onClick={onClose}
                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <FontAwesomeIcon icon={faTimes} className="h-6 w-6" />
              </button>
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-4">
                Select the roles you want to assign to this user.
              </p>

              <div className="space-y-2">
                {allRoles.map(role => (
                  <div 
                    key={role.id}
                    className={`flex items-center justify-between p-3 rounded-md ${
                      userRoles.includes(role.id) 
                        ? 'bg-indigo-50 border border-indigo-200' 
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center">
                      <FontAwesomeIcon 
                        icon={faShieldAlt} 
                        className={`h-5 w-5 mr-2 ${
                          userRoles.includes(role.id) ? 'text-indigo-600' : 'text-gray-400'
                        }`} 
                      />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{role.name}</h4>
                        <p className="text-xs text-gray-500">{role.description}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRoleToggle(role.id)}
                      disabled={isLoading || processingRoles.includes(role.id)}
                      className={`p-1 rounded-full ${
                        userRoles.includes(role.id)
                          ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {processingRoles.includes(role.id) ? (
                        <div className="h-5 w-5 rounded-full border-2 border-t-transparent border-indigo-600 animate-spin"></div>
                      ) : userRoles.includes(role.id) ? (
                        <FontAwesomeIcon icon={faCheck} className="h-5 w-5" />
                      ) : (
                        <span className="h-5 w-5 flex items-center justify-center">+</span>
                      )}
                    </button>
                  </div>
                ))}

                {allRoles.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">No roles available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleManager;
