import { faExclamationTriangle, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { permissionService } from '../../services/permissionService';
import { rolePermissionService } from '../../services/rolePermissionService';

import { roleService } from '../../services/roleService';
import { userRoleService } from '../../services/userRoleService';
import { userService } from '../../services/userService';
import Pagination from '../users/User/Pagination';
import PermissionManager from '../users/User/PermissionManager';
import RoleManager from '../users/User/RoleManager';
import UserFilters from '../users/User/UserFilter';
import UserForm from '../users/User/UserForm';
import UserTable from '../users/User/UserTable';

export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isRoleManagerOpen, setIsRoleManagerOpen] = useState(false);
  const [isPermissionManagerOpen, setIsPermissionManagerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  useEffect(() => {
    fetchUsers();

  }, [filters]);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await userService.getAllUsers();
      setUsers(response);
      setPagination({
        total: response.total,
        totalPages: response.totalPages,
      });
    } catch (err) {
      setError('Failed to fetch users. Please try again.');
      console.error('Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await roleService.getAllRoles();
      setRoles(response);
    } catch (err) {
      console.error('Error fetching roles:', err);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await permissionService.getAllPermissions();
      setPermissions(response);
    } catch (err) {
      console.error('Error fetching permissions:', err);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
  };

  const handleResetFilters = () => {
    setFilters({ page: 1, limit: 10 });
  };

  const handlePageChange = (page) => {
    setFilters({ ...filters, page });
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleManageRoles = (user) => {
    setSelectedUser(user);
    setIsRoleManagerOpen(true);
  };

  const handleManagePermissions = (role) => {
    setSelectedRole(role);
    setIsPermissionManagerOpen(true);
  };

  const handleSubmitUser = async (userData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (selectedUser) {
        await userService.updateUser(selectedUser.id, userData);
      } else {
        await userService.register(userData);
      }
      setIsFormOpen(false);
      fetchUsers();
    } catch (err) {
      setError('Failed to save user. Please try again.');
      console.error('Error saving user:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setIsLoading(true);
    setError(null);
    try {
      await userService.deleteUser(userId);
      fetchUsers();
    } catch (err) {
      setError('Failed to delete user. Please try again.');
      console.error('Error deleting user:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    setIsLoading(true);
    setError(null);
    try {
      await userService.updateUser(userId, { status: newStatus });
      fetchUsers();
    } catch (err) {
      setError('Failed to update user status. Please try again.');
      console.error('Error updating user status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignRole = async (userId, roleId) => {
    try {
      await userRoleService.assignRole(userId, roleId);
      fetchUsers();
      return Promise.resolve();
    } catch (err) {
      console.error('Error assigning role:', err);
      return Promise.reject(err);
    }
  };

  const handleRemoveRole = async (userId, roleId) => {
    try {
      await userRoleService.revokeRole(userId, roleId);
      fetchUsers();
      return Promise.resolve();
    } catch (err) {
      console.error('Error removing role:', err);
      return Promise.reject(err);
    }
  };

  const handleAssignPermission = async (roleId, permissionId) => {
    try {
      await rolePermissionService.assignPermission(roleId, permissionId);
      fetchRoles();
      return Promise.resolve();
    } catch (err) {
      console.error('Error assigning permission:', err);
      return Promise.reject(err);
    }
  };

  const handleRemovePermission = async (roleId, permissionId) => {
    try {
      await rolePermissionService.revokePermission(roleId, permissionId);
      fetchRoles();
      return Promise.resolve();
    } catch (err) {
      console.error('Error removing permission:', err);
      return Promise.reject(err);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <button
          onClick={handleCreateUser}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <FontAwesomeIcon icon={faUserPlus} className="-ml-1 mr-2 h-5 w-5" />
          Add User
        </button>
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

      <UserFilters filters={filters} roles={roles} onFilterChange={handleFilterChange} onResetFilters={handleResetFilters} />

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <UserTable users={users} isLoading={isLoading} onEdit={handleEditUser} onDelete={handleDeleteUser} onStatusChange={handleStatusChange} onManageRoles={handleManageRoles} />
      </div>

      <Pagination currentPage={filters.page || 1} totalPages={pagination.totalPages} onPageChange={handlePageChange} />

      <UserForm user={selectedUser || undefined} roles={roles} isOpen={isFormOpen} isLoading={isSubmitting} onClose={() => setIsFormOpen(false)} onSubmit={handleSubmitUser} />

      <RoleManager user={selectedUser} allRoles={roles} isOpen={isRoleManagerOpen} isLoading={isLoading} onClose={() => setIsRoleManagerOpen(false)} onAssignRole={handleAssignRole} onRemoveRole={handleRemoveRole} />

      <PermissionManager role={selectedRole} allPermissions={permissions} isOpen={isPermissionManagerOpen} isLoading={isLoading} onClose={() => setIsPermissionManagerOpen(false)} onAssignPermission={handleAssignPermission} onRemovePermission={handleRemovePermission} />
    </div>
  );
};
