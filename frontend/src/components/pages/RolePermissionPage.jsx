import React, { useState, useEffect } from 'react';
//import { roleApi, permissionApi } from '../services/api';
import {permissionService} from '../../services/permissionService';
import {roleService} from '../../services/roleService'
import {rolePermissionService} from '../../services/rolePermissionService'
import  RolePermissionManager  from '../users/User/RolePermissionManager';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const RolePermissionPage = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [rolesResponse, permissionsResponse] = await Promise.all([
          roleService.getAllRoles(),
          permissionService.getAllPermissions()
        ]);
        setRoles(rolesResponse);
        setPermissions(permissionsResponse);
      } catch (err) {
        setError('Failed to fetch data. Please try again.');
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAssignPermission = async (roleId, permissionId) => {
    try {
      await rolePermissionService.assignPermission(roleId, permissionId);
      const response = await roleService.getAllRoles();
      setRoles(response.data);
    } catch (err) {
      setError('Failed to assign permission');
    }
  };

  const handleRevokePermission = async (roleId, permissionId) => {
    try {
      await rolePermissionService.revokePermission(roleId, permissionId);
      const response = await roleService.getAllRoles();
      setRoles(response.data);
    } catch (err) {
      setError('Failed to revoke permission');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Role Permissions Management</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage role permissions by assigning or revoking access rights
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FontAwesomeIcon icon={faExclamationTriangle} className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <RolePermissionManager
        roles={roles}
        permissions={permissions}
        onAssign={handleAssignPermission}
        onRevoke={handleRevokePermission}
      />
    </div>
  );
};

export default RolePermissionPage;
