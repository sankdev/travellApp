import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCheck, faUserTimes, faShieldAlt, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

const UserTable = ({ users, isLoading, onEdit, onDelete, onStatusChange, onManageRoles }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
          <FontAwesomeIcon icon={faUserTimes} className="text-indigo-600 text-xl" />
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
        <p className="mt-1 text-sm text-gray-500">
          No users match your current filters or there are no users in the system.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roles</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-indigo-800 font-medium text-sm">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-wrap gap-1">
                  {user.roles?.length > 0 ? (
                    user.roles.map((role) => (
                      <span key={role.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {role.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">No roles assigned</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {user.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => onStatusChange(user.id, user.status === 'active' ? 'inactive' : 'active')}
                    className={`p-1 rounded-full ${user.status === 'active' ? 'text-green-600 hover:bg-green-100' : 'text-red-600 hover:bg-red-100'}`}
                    title={user.status === 'active' ? 'Deactivate User' : 'Activate User'}
                  >
                    <FontAwesomeIcon icon={user.status === 'active' ? faUserCheck : faUserTimes} size="sm" />
                  </button>
                  <button
                    onClick={() => onManageRoles(user)}
                    className="p-1 rounded-full text-indigo-600 hover:bg-indigo-100"
                    title="Manage Roles"
                  >
                    <FontAwesomeIcon icon={faShieldAlt} size="sm" />
                  </button>
                  <button
                    onClick={() => onEdit(user)}
                    className="p-1 rounded-full text-blue-600 hover:bg-blue-100"
                    title="Edit User"
                  >
                    <FontAwesomeIcon icon={faEdit} size="sm" />
                  </button>
                  <button
                    onClick={() => onDelete(user.id)}
                    className="p-1 rounded-full text-red-600 hover:bg-red-100"
                    title="Delete User"
                  >
                    <FontAwesomeIcon icon={faTrash} size="sm" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
