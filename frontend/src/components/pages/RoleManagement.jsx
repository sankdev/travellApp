import { faEdit, faLock, faPlus, faShieldAlt, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { permissionService } from '../../services/permissionService';
import { rolePermissionService } from '../../services/rolePermissionService';
import { roleService } from '../../services/roleService';
import PermissionManager from '../users/User/PermissionManager';

export const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPermissionManagerOpen, setIsPermissionManagerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active'
  });

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await roleService.getAllRoles();
      setRoles(response);
    } catch (err) {
      setError('Failed to fetch roles. Please try again.');
      console.error('Error fetching roles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await permissionService.getAllPermissions()
      console.log('permision',response);
      setPermissions(response);
    } catch (err) {
      console.error('Error fetching permissions:', err);
    }
  };

  const handleCreateRole = () => {
    setSelectedRole(null);
    setFormData({ name: '', description: '', status: 'active' });
    setIsFormOpen(true);
  };

  const handleEditRole = (role) => {
    setSelectedRole(role);
    setFormData({ name: role.name, description: role.description || '', status: role.status });
    setIsFormOpen(true);
  };

  const handleManagePermissions = (role) => {
    setSelectedRole(role);
    setIsPermissionManagerOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (selectedRole) {
        await roleService.updateRole(selectedRole.id, formData);
      } else {
        await roleService.createRole(formData);
      }
      setIsFormOpen(false);
      fetchRoles();
    } catch (err) {
      setError('Failed to save role. Please try again.');
      console.error('Error saving role:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;

    setIsLoading(true);
    setError(null);
    try {
      await roleService.deleteRole(roleId);
      fetchRoles();
    } catch (err) {
      setError('Failed to delete role. Please try again.');
      console.error('Error deleting role:', err);
    } finally {
      setIsLoading(false);
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
      await rolePermissionService.revokeRolePermission(roleId, permissionId);
      fetchRoles();
      return Promise.resolve();
    } catch (err) {
      console.error('Error removing permission:', err);
      return Promise.reject(err);
    }
  };

  const filteredRoles = roles.filter(role => role.name.toLowerCase().includes(formData.name.toLowerCase()));

  return (
    <div>
  <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
    <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
    <button
      onClick={handleCreateRole}
      className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
    >
      <FontAwesomeIcon icon={faPlus} className="mr-2" /> Add Role
    </button>
  </div>

  {error && (
    <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 text-red-700">{error}</div>
  )}

  <div className="bg-white shadow rounded-lg overflow-hidden">
    {isLoading && !isFormOpen ? (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    ) : filteredRoles.length === 0 ? (
      <div className="text-center py-12">
        <FontAwesomeIcon icon={faShieldAlt} className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No roles found</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new role.</p>
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissions</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRoles.map((role) => (
              <tr key={role.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <FontAwesomeIcon icon={faShieldAlt} className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{role.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500 max-w-xs truncate">
                    {role.description || 'No description'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {role.permissions && role.permissions.length > 0 ? (
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 mr-2">
                          {role.permissions.length} permissions
                        </span>
                        <button
                          onClick={() => handleManagePermissions(role)}
                          className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <FontAwesomeIcon icon={faLock} className="h-3 w-3 mr-1" />
                          Manage
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleManagePermissions(role)}
                        className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      >
                        <FontAwesomeIcon icon={faLock} className="h-3 w-3 mr-1" />
                        Add Permissions
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${role.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                  >
                    {role.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleEditRole(role)}
                      className="p-1 rounded-full text-blue-600 hover:bg-blue-100"
                      title="Edit Role"
                    >
                      <FontAwesomeIcon icon={faEdit} size="lg" />
                    </button>
                    <button
                      onClick={() => handleDeleteRole(role.id)}
                      className="p-1 rounded-full text-red-600 hover:bg-red-100"
                      title="Delete Role"
                    >
                      <FontAwesomeIcon icon={faTrash} size="lg" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>

  {isFormOpen && (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 sm:w-auto">
        <h2 className="text-lg font-medium">{selectedRole ? 'Edit Role' : 'Create Role'}</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <input type="text" name="name" placeholder="Role Name" value={formData.name} onChange={handleInputChange} required className="w-full p-2 border rounded" />
          <textarea name="description" placeholder="Description" value={formData.description} onChange={handleInputChange} className="w-full p-2 border rounded"></textarea>
          <select name="status" value={formData.status} onChange={handleInputChange} className="w-full p-2 border rounded">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">
              {isLoading ? 'Processing...' : selectedRole ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )}

  <PermissionManager
    role={selectedRole}
    allPermissions={permissions}
    isOpen={isPermissionManagerOpen}
    isLoading={isLoading}
    onClose={() => setIsPermissionManagerOpen(false)}
    onAssignPermission={handleAssignPermission}
    onRemovePermission={handleRemovePermission}
  />
</div>
 
  );
};
