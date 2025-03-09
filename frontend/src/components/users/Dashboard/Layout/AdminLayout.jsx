import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './SideBar';
import Header from './Header';
import DashboardSwitcher from '../../../pages/DashboardSwitcher';

const AdminLayout = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  
  // Obtenir le titre de la page en fonction de la route actuelle
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return 'Dashboard';
    if (path === '/admin/users') return 'User Management';
    if (path === '/admin/roles') return 'Role Management';
    if (path === '/admin/permissions') return 'Permission Management';

    if (path === '/admin/analytics') return 'Analytics';
    if (path === '/admin/settings') return 'Settings';
    return 'Admin Panel';
  };
  
  // Vérifier si l'écran est mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);
  
  // Fermer la sidebar lorsque la route change sur mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location, isMobile]);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        isMobile={isMobile} 
        isOpen={sidebarOpen} 
        toggleSidebar={toggleSidebar} 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title={getPageTitle()} 
          toggleSidebar={toggleSidebar} 
        />
        
        <main className="flex-1 overflow-y-auto p-4">
        <DashboardSwitcher/>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
