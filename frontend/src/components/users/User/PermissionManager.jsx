import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faLock, faCheck, faPlus } from '@fortawesome/free-solid-svg-icons';

const PermissionManager = ({
  role,
  allPermissions,
  isOpen,
  isLoading,
  onClose,
  onAssignPermission,
  onRemovePermission
}) => {
  const [rolePermissions, setRolePermissions] = useState([]);
  const [processingPermissions, setProcessingPermissions] = useState([]);
  console.log('role',role)
  console.log('rolePermission',rolePermissions)
  //console.log('role.permissiona',role?.permissions)
  useEffect(() => {
    if (role && role.permissions) {
      
      setRolePermissions(role.permissions.map(permission => permission.id));
    } else {
      setRolePermissions([]);
    }
  }, [role]);

  const handlePermissionToggle = async (permissionId) => {
    if (!role) return;
     
    setProcessingPermissions(prev => [...prev, permissionId]);
    
    try {
      if (rolePermissions.includes(permissionId)) {
        await onRemovePermission(role.id, permissionId);
        setRolePermissions(prev => prev.filter(id => id !== permissionId));
      } else {
        await onAssignPermission(role.id, permissionId);
        setRolePermissions(prev => [...prev, permissionId]);
      }
    } catch (error) {
      console.error('Error toggling permission:', error);
    } finally {
      setProcessingPermissions(prev => prev.filter(id => id !== permissionId));
    }
  };

  if (!isOpen || !role) return null;

  return (
     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      {/* Conteneur de la modal */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        
        {/* En-tête */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            Gérer les permissions pour {role.name}
          </h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 transition"
            aria-label="Fermer la modal"
          >
            {/* SVG Icône Fermer */}
            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenu */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">Sélectionnez les permissions à attribuer à ce rôle.</p>
          
          <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
            {allPermissions.length > 0 ? (
              allPermissions.map(permission => (
                <div 
                  key={permission.id} 
                  className={`flex items-center justify-between p-3 rounded-lg border transition ${
                    rolePermissions.includes(permission.id) 
                      ? "bg-indigo-100 border-indigo-300" 
                      : "bg-gray-50 border-gray-300"
                  }`}
                >
                  <div className="flex items-center">
                    {/* SVG Icône de Permission */}
                    <svg className={`h-5 w-5 mr-3 ${
                      rolePermissions.includes(permission.id) ? "text-indigo-600" : "text-gray-400"
                    }`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.38 0 2.5-1.12 2.5-2.5S13.38 6 12 6s-2.5 1.12-2.5 2.5S10.62 11 12 11zM15 11v1a4 4 0 01-8 0v-1M8 15h8m-4-9V4" />
                    </svg>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{permission.name}</h4>
                      <p className="text-xs text-gray-500">{permission.description}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePermissionToggle(permission.id)}
                    disabled={isLoading || processingPermissions.includes(permission.id)}
                    className={`p-2 rounded-full transition ${
                      rolePermissions.includes(permission.id) 
                        ? "bg-indigo-500 text-white hover:bg-indigo-600" 
                        : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                    }`}
                  >
                    {processingPermissions.includes(permission.id) ? (
                      // Loader
                      <svg className="h-5 w-5 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/>
                        <path fill="currentColor" d="M4 12a8 8 0 018-8v4l-3 3 3 3v4a8 8 0 01-8-8z"/>
                      </svg>
                    ) : rolePermissions.includes(permission.id) ? (
                      // Icône Check (Permission activée)
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      // Icône Plus (Permission désactivée)
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                  </button>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-gray-500 py-4">Aucune permission disponible</p>
            )}
          </div>
        </div>

        {/* Pied de page */}
        <div className="bg-gray-100 px-6 py-4 flex justify-end">
          <button 
            onClick={onClose} 
            className="px-5 py-2 bg-indigo-600 text-white font-medium rounded-md shadow-sm hover:bg-indigo-700 transition"
          >
            Terminé
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionManager;
