import React from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faShieldAlt, 
  faCog, 
  faChartBar, 
  faHome, 
  faSignOutAlt, 
  faBars, 
  faTimes, 
  faKey
} from '@fortawesome/free-solid-svg-icons';

const Sidebar = ({ isMobile, isOpen, toggleSidebar }) => {
  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: faHome },
    { name: 'Users', path: '/admin/users', icon: faUsers },
    { name: 'Roles', path: '/admin/roles', icon: faShieldAlt },
    { name: 'Permissions', path: '/admin/permissions', icon: faShieldAlt },
    { name: 'Role Permissions', path: '/admin/role-permissions', icon: faKey },
    { name: 'Analytics', path: '/admin/analytics', icon: faChartBar },
    { name: 'Settings', path: '/admin/settings', icon: faCog },
  ];

  const sidebarClasses = `
    ${isMobile ? 'fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out' : 'sticky top-0 h-screen w-64'}
    ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'}
    bg-indigo-800 text-white flex flex-col
  `;

  return (
    <>
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSidebar}
        />
      )}
      
      <aside className={sidebarClasses}>
        <div className="flex items-center justify-between p-4 border-b border-indigo-700">
          <h1 className="text-xl font-bold">Admin Panel</h1>
          {isMobile && (
            <button onClick={toggleSidebar} className="text-white">
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>
          )}
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center px-4 py-3 text-sm
                    ${isActive 
                      ? 'bg-indigo-900 text-white border-l-4 border-white' 
                      : 'text-indigo-100 hover:bg-indigo-700'}
                  `}
                >
                  <FontAwesomeIcon icon={item.icon} className="mr-3" />
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-indigo-700">
          <button 
            className="flex items-center w-full px-4 py-2 text-sm text-indigo-100 hover:bg-indigo-700 rounded"
            onClick={() => console.log('Logout')}
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="mr-3" />
            Logout
          </button>
        </div>
      </aside>
      
      {isMobile && !isOpen && (
        <button 
          onClick={toggleSidebar}
          className="fixed bottom-4 left-4 z-40 p-2 bg-indigo-600 text-white rounded-full shadow-lg"
        >
          <FontAwesomeIcon icon={faBars} size="lg" />
        </button>
      )}
    </>
  );
};

export default Sidebar;
