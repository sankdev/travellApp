import { faCheck, faExclamationTriangle, faLock, faPlus, faSearch, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';

const RolePermissionManager = ({ roles, permissions, onAssign, onRevoke }) => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [assignedPermissions, setAssignedPermissions] = useState([]);

  useEffect(() => {
    if (selectedRole && Array.isArray(selectedRole.permissions)) {
      setAssignedPermissions(selectedRole.permissions.map(p => p.id));
    } else {
      setAssignedPermissions([]);
    }
  }, [selectedRole]);

  const handlePermissionToggle = async (permissionId) => {
    if (!selectedRole) return;

    setIsLoading(true);
    setError(null);

    try {
      if (assignedPermissions.includes(permissionId)) {
        await onRevoke(selectedRole.id, permissionId);
        setAssignedPermissions(prev => prev.filter(id => id !== permissionId));
      } else {
        await onAssign(selectedRole.id, permissionId);
        setAssignedPermissions(prev => [...prev, permissionId]);
      }
    } catch (err) {
      setError('Failed to update permission assignment');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPermissions = (permissions || []).filter(permission =>
    permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Role Permissions</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Role Selection */}
        <div className="md:col-span-1 border-r border-gray-200 pr-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Select Role</h3>
          <div className="space-y-2">
            {Array.isArray(roles)&& roles.map(role => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role)}
                className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                  selectedRole?.id === role.id
                    ? 'bg-indigo-50 border border-indigo-200'
                    : 'bg-white border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <FontAwesomeIcon
                  icon={faShieldAlt}
                  className={`h-5 w-5 mr-2 ${
                    selectedRole?.id === role.id ? 'text-indigo-600' : 'text-gray-400'
                  }`}
                />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">{role.name}</p>
                  {role.description && (
                    <p className="text-xs text-gray-500 truncate">{role.description}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Permissions Management */}
        <div className="md:col-span-2 pl-6">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedRole ? `Permissions for ${selectedRole.name}` : 'Select a role'}
              </h3>
            </div>
            {selectedRole && (
              <div className="mt-2">
                <div className="relative">
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search permissions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full border border-gray-300 rounded-md shadow-sm py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <FontAwesomeIcon icon={faExclamationTriangle} className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {selectedRole ? (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filteredPermissions.map(permission => (
                <div
                  key={permission.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    assignedPermissions.includes(permission.id)
                      ? 'bg-indigo-50 border border-indigo-200'
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center flex-1">
                    <FontAwesomeIcon
                      icon={faLock}
                      className={`h-5 w-5 mr-2 ${
                        assignedPermissions.includes(permission.id)
                          ? 'text-indigo-600'
                          : 'text-gray-400'
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{permission.name}</p>
                      {permission.description && (
                        <p className="text-xs text-gray-500">{permission.description}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handlePermissionToggle(permission.id)}
                    disabled={isLoading}
                    className={`ml-4 p-2 rounded-full ${
                      assignedPermissions.includes(permission.id)
                        ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    {isLoading ? (
                      <div className="h-5 w-5 rounded-full border-2 border-t-transparent border-indigo-600 animate-spin" />
                    ) : assignedPermissions.includes(permission.id) ? (
                      <FontAwesomeIcon icon={faCheck} className="h-5 w-5" />
                    ) : (
                      <FontAwesomeIcon icon={faPlus} className="h-5 w-5" />
                    )}
                  </button>
                </div>
              ))}

              {filteredPermissions.length === 0 && (
                <div className="text-center py-6">
                  <FontAwesomeIcon icon={faLock} className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No permissions found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm ? 'Try a different search term' : 'No permissions available'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <FontAwesomeIcon icon={faShieldAlt} className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No role selected</h3>
              <p className="mt-1 text-sm text-gray-500">Select a role to manage its permissions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RolePermissionManager;
