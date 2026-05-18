import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt } from '@fortawesome/free-solid-svg-icons';

export const RoleDistribution = ({ roles, total, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Role Distribution</h2>
        <div className="animate-pulse space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
              </div>
              <div className="h-2 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (roles.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Role Distribution</h2>
        <div className="text-center py-6">
          <FontAwesomeIcon icon={faShieldAlt} className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No roles defined</h3>
          <p className="mt-1 text-sm text-gray-500">Create roles to see distribution.</p>
        </div>
      </div>
    );
  }

  // Trier les rôles par nombre d'utilisateurs (décroissant)
  const sortedRoles = [...roles].sort((a, b) => b.count - a.count);

  // Couleurs pour les barres de progression
  const colors = [
    'bg-indigo-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-purple-500',
    'bg-pink-500',
  ];

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Role Distribution</h2>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {sortedRoles.map((item, index) => {
            const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
            return (
              <div key={item.role.id}>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center">
                    <FontAwesomeIcon
                      icon={faShieldAlt}
                      className={`h-4 w-4 mr-2 ${index === 0 ? 'text-indigo-600' : 'text-gray-500'}`}
                    />
                    <span className="text-sm font-medium text-gray-700">{item.role.name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {item.count} ({percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${colors[index % colors.length]}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="bg-gray-50 px-6 py-3">
        <div className="text-sm">
          <a
            href="/admin/roles"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Manage roles
          </a>
        </div>
      </div>
    </div>
  );
};
