import { faEdit, faExclamationTriangle, faLock, faPlus, faSearch, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { permissionService } from '../../services/permissionService';
import Pagination from '../users/User/Pagination';

const PermissionManagement = () => {
  const [permissions, setPermissions] = useState([]);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active'
  });
  const [filters, setFilters] = useState({
    search: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0
  });

  // Fetch permissions
  const fetchPermissions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await permissionService.getAllPermissions();
      setPermissions(response);
      setPagination({
        total: response.length,
        totalPages: Math.ceil(response.length / filters.limit)
      });
    } catch (err) {
      setError('Failed to fetch permissions. Please try again.');
      console.error('Error fetching permissions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, [filters]);

  const handleCreatePermission = () => {
    setSelectedPermission(null);
    setFormData({ name: '', description: '', status: 'active' });
    setIsFormOpen(true);
  };

  const handleEditPermission = (permission) => {
    setSelectedPermission(permission);
    setFormData({
      name: permission.name,
      description: permission.description || '',
      status: permission.status
    });
    setIsFormOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      if (selectedPermission) {
        await permissionService.updatePermission(selectedPermission.id, formData);
      } else {
        await permissionService.createPermission(formData);
      }
      setIsFormOpen(false);
      fetchPermissions();
    } catch (err) {
      setError('Failed to save permission. Please try again.');
      console.error('Error saving permission:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePermission = async (permissionId) => {
    if (!window.confirm('Are you sure you want to delete this permission?')) return;
    
    setIsLoading(true);
    setError(null);
    try {
      await permissionService.deletePermission(permissionId);
      fetchPermissions();
    } catch (err) {
      setError('Failed to delete permission. Please try again.');
      console.error('Error deleting permission:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setFilters({ ...filters, page });
  };

  const handleSearch = (e) => {
    setFilters({ ...filters, search: e.target.value, page: 1 });
  };

  return (
    <div>
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-2xl font-bold text-gray-900">Permission Management</h1>
      <button
        onClick={handleCreatePermission}
        className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
      >
        <FontAwesomeIcon icon={faPlus} className="mr-2" />
        Add Permission
      </button>
    </div>
  
    {error && (
      <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
        <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2 text-red-400" />
        <span className="text-sm text-red-700">{error}</span>
      </div>
    )}
  
    <div className="mb-6 bg-white shadow rounded-lg p-4">
      <div className="relative">
        <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search permissions..."
          value={filters.search}
          onChange={handleSearch}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm"
        />
      </div>
    </div>
  
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {isLoading && !isFormOpen ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : permissions.length === 0 ? (
        <div className="text-center py-12">
          <FontAwesomeIcon icon={faLock} className="text-gray-400 text-4xl" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No permissions found</h3>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Permission</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {permissions.map((permission) => (
                <tr key={permission.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{permission.name}</td>
                  <td className="px-6 py-4">{permission.description || 'No description'}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        permission.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {permission.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex flex-wrap justify-end">
                    <button onClick={() => handleEditPermission(permission)} className="p-1 text-blue-600 mb-2 sm:mb-0 sm:mr-2">
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button onClick={() => handleDeletePermission(permission.id)} className="p-1 text-red-600">
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  
    <Pagination currentPage={filters.page} totalPages={pagination.totalPages} onPageChange={handlePageChange} />
  
    {/* Permission Form Modal */}
    {isFormOpen && (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity" aria-hidden="true">
            <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setIsFormOpen(false)}></div>
          </div>
  
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
  
          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <form onSubmit={handleSubmit}>
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                    <FontAwesomeIcon icon={faLock} className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {selectedPermission ? 'Edit Permission' : 'Create New Permission'}
                    </h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Permission Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <textarea
                          name="description"
                          id="description"
                          rows={3}
                          value={formData.description}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                          Status
                        </label>
                        <select
                          name="status"
                          id="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {isLoading ? 'Processing...' : selectedPermission ? 'Update Permission' : 'Create Permission'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )}
  </div>
  

  );
};

export default PermissionManagement;