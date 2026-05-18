import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faUsers, faDollarSign, faChartBar } from '@fortawesome/free-solid-svg-icons';

const StatsCard = ({ title, value, change, icon, color }) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      icon: 'text-blue-600',
    },
    green: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      icon: 'text-green-600',
    },
    yellow: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      icon: 'text-yellow-600',
    },
    red: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      icon: 'text-red-600',
    },
    indigo: {
      bg: 'bg-indigo-100',
      text: 'text-indigo-800',
      icon: 'text-indigo-600',
    },
    purple: {
      bg: 'bg-purple-100',
      text: 'text-purple-800',
      icon: 'text-purple-600',
    },
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-md p-3 ${colorClasses[color].bg}`}>
            <FontAwesomeIcon icon={icon} className={`h-6 w-6 ${colorClasses[color].icon}`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      {change && (
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <span
              className={`font-medium ${
                change.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {change.isPositive ? '+' : ''}
              {change.value}%
            </span>{' '}
            <span className="text-gray-500">from previous period</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsCard;
