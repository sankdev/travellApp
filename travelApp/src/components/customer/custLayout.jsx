import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHome,
    faClipboardList,
    faFileInvoice,
    faUser,
    faSignOutAlt,
    faBars,
    faTimes,
} from '@fortawesome/free-solid-svg-icons';
import DashboardSwitcher from '../pages/DashboardSwitcher';
import NotificationComponent from './reservation/Notification'

const CustomerLayout = (userId) => {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false); // State to toggle mobile menu
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-gray-800 shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        {/* Logo */}
                        <div className="flex items-center space-x-4">
                            <div className="text-indigo-600 text-3xl font-bold tracking-tight">
                                <div className="flex items-center">
            <img
              src="/agence-logo.png" // ton fichier placé dans public/logo.png
              alt="Travel Agency Logo"
              className="h-8 w-auto sm:h-10"
            />
</div>
                               
                            </div>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex space-x-8">
                            <NavLink
                                to="/customer/dashboard"
                                className={({ isActive }) =>
                                    `text-sm font-medium px-3 py-2 rounded-md flex items-center transition ${
                                        isActive
                                            ? 'text-white bg-orange-600 shadow-md'
                                            : 'text-gray-300 hover:text-white hover:bg-gray-700'
                                    }`
                                }
                            >
                                <FontAwesomeIcon icon={faHome} className="mr-2" />
                                Dashboard
                            </NavLink>
                            <NavLink
                                to="/customer/reservations"
                                className={({ isActive }) =>
                                    `text-sm font-medium px-3 py-2 rounded-md flex items-center transition ${
                                        isActive
                                            ? 'text-white bg-orange-600 shadow-md'
                                            : 'text-gray-300 hover:text-white hover:bg-gray-700'
                                    }`
                                }
                            >
                                <FontAwesomeIcon icon={faClipboardList} className="mr-2" />
                                My Reservations
                            </NavLink>
                            <NavLink
                                to="/customer/nouveau/list"
                                className={({ isActive }) =>
                                    `text-sm font-medium px-3 py-2 rounded-md flex items-center transition ${
                                        isActive
                                            ? 'text-white bg-orange-600 shadow-md'
                                            : 'text-gray-300 hover:text-white hover:bg-gray-700'
                                    }`
                                }
                            >
                                <FontAwesomeIcon icon={faClipboardList} className="mr-2" />
                                Reservation List
                            </NavLink>
                           
                            <NavLink
                                to="/customer/invoices"
                                className={({ isActive }) =>
                                    `text-sm font-medium px-3 py-2 rounded-md flex items-center transition ${
                                        isActive
                                            ? 'text-white bg-orange-600 shadow-md'
                                            : 'text-gray-300 hover:text-white hover:bg-gray-700'
                                    }`
                                }
                            >
                                <FontAwesomeIcon icon={faFileInvoice} className="mr-2" />
                                Invoices
                            </NavLink>
                              {/* Composant de notifications */}
                            <div className="relative">
                                <NotificationComponent userId={user?.id} />
                            </div>

                            <NavLink
                                to="/customer/profile"
                                className={({ isActive }) =>
                                    `text-sm font-medium px-3 py-2 rounded-md flex items-center transition ${
                                        isActive
                                            ? 'text-white bg-orange-600 shadow-md'
                                            : 'text-gray-300 hover:text-white hover:bg-gray-700'
                                    }`
                                }
                            >
                                <FontAwesomeIcon icon={faUser} className="mr-2" />
                                Profile
                            </NavLink>
                            <button
                                onClick={handleLogout}
                                className="text-sm font-medium px-3 py-2 rounded-md text-white hover:text-indigo-800 bg-orange-600 hover:bg-orange-800 flex items-center transition"
                            >
                                <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                                Logout
                            </button>
                        </nav>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="text-gray-700 hover:text-indigo-600 focus:outline-none"
                            >
                                <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} className="h-6 w-6" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {menuOpen && (
                    <div className="md:hidden bg-gray-800 shadow-xl">
                        <nav className="px-4 py-4 space-y-4">
                            <NavLink
                                to="/customer/dashboard"
                                className={({ isActive }) =>
                                    `block text-sm font-medium px-3 py-2 rounded-md transition ${
                                        isActive
                                            ? 'text-white bg-orange-600'
                                            : 'text-gray-300 hover:text-white hover:bg-gray-700'
                                    }`
                                }
                                onClick={() => setMenuOpen(false)}
                            >
                                <FontAwesomeIcon icon={faHome} className="mr-2" />
                                Dashboard
                            </NavLink>
                            <NavLink
                                to="/customer/reservations"
                                className={({ isActive }) =>
                                    `block text-sm font-medium px-3 py-2 rounded-md transition ${
                                        isActive
                                            ? 'text-white bg-orange-600'
                                            : 'text-gray-300 hover:text-white hover:bg-gray-700'
                                    }`
                                }
                                onClick={() => setMenuOpen(false)}
                            >
                                <FontAwesomeIcon icon={faClipboardList} className="mr-2" />
                                My Reservations
                            </NavLink>
                            <NavLink
                                to="/customer/reservations/list"
                                className={({ isActive }) =>
                                    `block text-sm font-medium px-3 py-2 rounded-md transition ${
                                        isActive
                                            ? 'text-white bg-orange-600'
                                            : 'text-gray-300 hover:text-white hover:bg-gray-700'
                                    }`
                                }
                                onClick={() => setMenuOpen(false)}
                            >
                                <FontAwesomeIcon icon={faClipboardList} className="mr-2" />
                                Reservation List
                            </NavLink>
                            <NavLink
                                to="/customer/reservations/:id"
                                className={({ isActive }) =>
                                    `block text-sm font-medium px-3 py-2 rounded-md transition ${
                                        isActive
                                            ? 'text-white bg-orange-600'
                                            : 'text-gray-300 hover:text-white hover:bg-gray-700'
                                    }`
                                }
                                onClick={() => setMenuOpen(false)}
                            >
                                <FontAwesomeIcon icon={faClipboardList} className="mr-2" />
                                Reservation Detail
                            </NavLink>
                            <NavLink
                                to="/customer/invoices"
                                className={({ isActive }) =>
                                    `block text-sm font-medium px-3 py-2 rounded-md transition ${
                                        isActive
                                            ? 'text-white bg-orange-600'
                                            : 'text-gray-300 hover:text-white hover:bg-gray-700'
                                    }`
                                }
                                onClick={() => setMenuOpen(false)}
                            >
                                <FontAwesomeIcon icon={faFileInvoice} className="mr-2" />
                                Invoices
                            </NavLink>
                            <div className="px-4 py-3">
                        <NotificationComponent userId={user?.id} mobileView={true} />
                    </div>
                            <NavLink
                                to="/customer/profile"
                                className={({ isActive }) =>
                                    `block text-sm font-medium px-3 py-2 rounded-md transition ${
                                        isActive
                                            ? 'text-white bg-orange-600'
                                            : 'text-gray-300 hover:text-white hover:bg-gray-700'
                                    }`
                                }
                                onClick={() => setMenuOpen(false)}
                            >
                                <FontAwesomeIcon icon={faUser} className="mr-2" />
                                Profile
                            </NavLink>
                            <button
                                onClick={() => {
                                    handleLogout();
                                    setMenuOpen(false);
                                }}
                                className="block w-full text-left text-sm font-medium px-3 py-2 rounded-md text-red-600 hover:text-red-800 transition"
                            >
                                <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                                Logout
                            </button>
                        </nav>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow p-6">
                <DashboardSwitcher/>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default CustomerLayout;
