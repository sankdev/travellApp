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
    faList,
    faPlusCircle,
    faTicketAlt,
    faChevronDown,
    faChevronUp
} from '@fortawesome/free-solid-svg-icons';
import DashboardSwitcher from '../pages/DashboardSwitcher';
import NotificationComponent from './reservation/Notification';

const CustomerLayout = () => {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [reservationsMenuOpen, setReservationsMenuOpen] = useState(false); // ✅ État pour le sous-menu
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const closeMenu = () => {
        setMenuOpen(false);
        setReservationsMenuOpen(false);
    };

    const toggleReservationsMenu = () => {
        setReservationsMenuOpen(!reservationsMenuOpen);
    };

    // Classes de navigation
    const navLinkClass = ({ isActive }) => 
        `text-sm font-medium px-3 py-2 rounded-md flex items-center transition ${
            isActive 
                ? 'text-white bg-orange-600 shadow-md' 
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
        }`;

    const mobileNavLinkClass = ({ isActive }) => 
        `block text-sm font-medium px-3 py-2 rounded-md transition ${
            isActive 
                ? 'text-white bg-orange-600' 
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
        }`;

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-gray-800 shadow sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        {/* Logo */}
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                                <img
                                    src="/agence-logo.png"
                                    alt="Travel Agency Logo"
                                    className="h-8 w-auto sm:h-10"
                                />
                            </div>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex space-x-8 items-center">
                            <NavLink to="/customer/dashboard" className={navLinkClass}>
                                <FontAwesomeIcon icon={faHome} className="mr-2" />
                                Dashboard
                            </NavLink>

                            {/* ✅ Menu Réservations avec hover pour desktop */}
                            <div className="relative group">
                                <button 
                                    className="text-sm font-medium px-3 py-2 rounded-md flex items-center text-gray-300 hover:text-white hover:bg-gray-700"
                                >
                                    <FontAwesomeIcon icon={faTicketAlt} className="mr-2" />
                                    Réservations
                                    <FontAwesomeIcon icon={faChevronDown} className="ml-1 w-3 h-3" />
                                </button>
                                
                                {/* Dropdown qui apparaît au survol */}
                                <div className="absolute left-0 mt-2 w-56 bg-gray-800 rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                    <NavLink 
                                        to="/customer/reservations" 
                                        className={({ isActive }) => 
                                            `block px-4 py-2 text-sm ${isActive ? 'text-orange-400 bg-gray-700' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`
                                        }
                                    >
                                        <FontAwesomeIcon icon={faList} className="mr-2 w-4" />
                                        Toutes les réservations
                                    </NavLink>
                                    <NavLink 
                                        to="/customer/reservations/mes-reservations" 
                                        className={({ isActive }) => 
                                            `block px-4 py-2 text-sm ${isActive ? 'text-orange-400 bg-gray-700' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`
                                        }
                                    >
                                        <FontAwesomeIcon icon={faClipboardList} className="mr-2 w-4" />
                                        Mes réservations
                                    </NavLink>
                                    <NavLink 
                                        to="/customer/reservations/demande" 
                                        className={({ isActive }) => 
                                            `block px-4 py-2 text-sm ${isActive ? 'text-orange-400 bg-gray-700' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`
                                        }
                                    >
                                        <FontAwesomeIcon icon={faPlusCircle} className="mr-2 w-4" />
                                        Nouvelle demande
                                    </NavLink>
                                </div>
                            </div>

                            <NavLink to="/customer/invoices" className={navLinkClass}>
                                <FontAwesomeIcon icon={faFileInvoice} className="mr-2" />
                                Factures
                            </NavLink>

                            {/* Notifications */}
                            <div className="relative">
                                <NotificationComponent userId={user?.id} />
                            </div>

                            <NavLink to="/customer/profile" className={navLinkClass}>
                                <FontAwesomeIcon icon={faUser} className="mr-2" />
                                Profil
                            </NavLink>

                            <button onClick={handleLogout} className="text-sm font-medium px-3 py-2 rounded-md text-white bg-orange-600 hover:bg-orange-800 flex items-center transition">
                                <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                                Déconnexion
                            </button>
                        </nav>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden">
                            <button 
                                onClick={() => setMenuOpen(!menuOpen)} 
                                className="text-gray-300 hover:text-white focus:outline-none p-2"
                            >
                                <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} className="h-6 w-6" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {menuOpen && (
                    <div className="md:hidden bg-gray-800 shadow-xl border-t border-gray-700">
                        <nav className="px-4 py-4 space-y-3">
                            <NavLink to="/customer/dashboard" className={mobileNavLinkClass} onClick={closeMenu}>
                                <FontAwesomeIcon icon={faHome} className="mr-2 w-4" />
                                Dashboard
                            </NavLink>

                            {/* ✅ Menu Réservations avec clic pour mobile */}
                            <div className="space-y-2">
                                <button
                                    onClick={toggleReservationsMenu}
                                    className="w-full flex items-center justify-between text-sm font-medium px-3 py-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700"
                                >
                                    <span className="flex items-center">
                                        <FontAwesomeIcon icon={faTicketAlt} className="mr-2 w-4" />
                                        Réservations
                                    </span>
                                    <FontAwesomeIcon icon={reservationsMenuOpen ? faChevronUp : faChevronDown} className="w-3 h-3" />
                                </button>

                                {/* Sous-menu déroulant */}
                                {reservationsMenuOpen && (
                                    <div className="pl-4 space-y-2 border-l-2 border-gray-600 ml-4">
                                        <NavLink 
                                            to="/customer/reservations" 
                                            className={({ isActive }) => 
                                                `block text-sm px-3 py-2 rounded-md ${isActive ? 'text-orange-400 bg-gray-700' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`
                                            }
                                            onClick={closeMenu}
                                        >
                                            <FontAwesomeIcon icon={faList} className="mr-2 w-4" />
                                            Toutes les réservations
                                        </NavLink>
                                        <NavLink 
                                            to="/customer/reservations/mes-reservations" 
                                            className={({ isActive }) => 
                                                `block text-sm px-3 py-2 rounded-md ${isActive ? 'text-orange-400 bg-gray-700' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`
                                            }
                                            onClick={closeMenu}
                                        >
                                            <FontAwesomeIcon icon={faClipboardList} className="mr-2 w-4" />
                                            Mes réservations
                                        </NavLink>
                                        <NavLink 
                                            to="/customer/reservations/demande" 
                                            className={({ isActive }) => 
                                                `block text-sm px-3 py-2 rounded-md ${isActive ? 'text-orange-400 bg-gray-700' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`
                                            }
                                            onClick={closeMenu}
                                        >
                                            <FontAwesomeIcon icon={faPlusCircle} className="mr-2 w-4" />
                                            Nouvelle demande
                                        </NavLink>
                                    </div>
                                )}
                            </div>

                            <NavLink to="/customer/invoices" className={mobileNavLinkClass} onClick={closeMenu}>
                                <FontAwesomeIcon icon={faFileInvoice} className="mr-2 w-4" />
                                Factures
                            </NavLink>

                            <div className="px-3 py-2">
                                <NotificationComponent userId={user?.id} mobileView={true} />
                            </div>

                            <NavLink to="/customer/profile" className={mobileNavLinkClass} onClick={closeMenu}>
                                <FontAwesomeIcon icon={faUser} className="mr-2 w-4" />
                                Profil
                            </NavLink>

                            <button 
                                onClick={() => { handleLogout(); closeMenu(); }} 
                                className="block w-full text-left text-sm font-medium px-3 py-2 rounded-md text-white bg-red-600 hover:bg-red-700 transition"
                            >
                                <FontAwesomeIcon icon={faSignOutAlt} className="mr-2 w-4" />
                                Déconnexion
                            </button>
                        </nav>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                    <DashboardSwitcher />
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default CustomerLayout;
