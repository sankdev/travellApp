// src/components/pages/StatusBadge.jsx
import React from 'react';

const StatusBadge = ({ status, size = "md" }) => {
  const statusConfig = {
    active: {
      label: 'Actif',
      className: 'bg-green-100 text-green-800 border-green-200'
    },
    inactive: {
      label: 'Inactif',
      className: 'bg-gray-100 text-gray-800 border-gray-200'
    },
    suspended: {
      label: 'Suspendu',
      className: 'bg-red-100 text-red-800 border-red-200'
    },
    pending: {
      label: 'En attente',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };

  const config = statusConfig[status] || statusConfig.inactive;

  return (
    <span className={`inline-flex items-center font-medium border rounded-full ${config.className} ${sizeClasses[size]}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
