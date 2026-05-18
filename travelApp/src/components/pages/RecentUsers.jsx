import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faUserPlus } from '@fortawesome/free-solid-svg-icons';

export const RecentUsers = ({ users, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Users</h2>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="rounded-full bg-gray-200 h-10 w-10"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Users</h2>
        <div className="text-center py-6">
          <FontAwesomeIcon icon={faUserPlus} className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No users yet</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new user.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Recent Users</h2>
      </div>
      <ul className="divide-y divide-gray-200">
        {users.map((user) => (
          <li key={user.id}>
            <div className="px-6 py-4 flex items-center">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-indigo-800 font-medium text-sm">
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              </div>
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <FontAwesomeIcon icon={faClock} className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                    <p>{new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {user.status}
                  </span>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="bg-gray-50 px-6 py-3">
        <div className="text-sm">
          <a
            href="/admin/users"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            View all users
          </a>
        </div>
      </div>
    </div>
  );
};
