import {
    faBars,
    faBuilding,
    faClipboardList,
    faPlane,
    faPlusCircle,
    faSignOutAlt,
    faTachometerAlt,
    faTimes,
    faUserCircle
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState,useEffect } from 'react';
import { NavLink, Outlet,useParams, useNavigate } from 'react-router-dom';
import { agencyService } from '../../services/agencyService';
import DashboardSwitcher from '../pages/DashboardSwitcher';
import NotificationNavBar from  './NotificationNavBar'
const AgencyLayout = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [openMenu, setOpenMenu] = useState(null);
     const { agencyId } = useParams(); // Get agencyId from URL parameters
    const [agencyData, setAgencyData] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAgencyData = async () => {
            try {
                const agencyResponse = await agencyService.getUserAgencies();
                const ageniciesList = Array.isArray(agencyResponse.data) ? agencyResponse.data : [];
            console.log('agenciesList',ageniciesList)
                setAgencyData(ageniciesList.find(agencyData=>agencyData._id === agencyId));
                // const statsResponse = await agencyService.getAgencyStats();
                // setStats(statsResponse.data);
            } catch (err) {
                setError(err.message || 'Failed to load agency data');
            } finally {
                setLoading(false);
            }
        };


            fetchAgencyData();

    }, [agencyId]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const handleToggleMenu = (menu) => {
        setOpenMenu(openMenu === menu ? null : menu);
    };

    const handleNavLinkClick = () => {
        setSidebarOpen(false);
    };

    return (
        <div className="min-h-screen flex bg-[#D97706]">
            {/* Sidebar */}
            <div
                className={`fixed inset-0 z-40 transform ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-auto md:transform-none bg-indigo-700 text-white w-64`}
            >
                <div className="flex flex-col h-full  bg-[#0F172A]">
                    <div className="flex items-center justify-between px-4 py-4">
                        <div className="flex items-center">
                            {agencyData?.logo && (
                            <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={`https://agencesvoyage.com/${agencyData.logo}` || '/default-agency-logo.png'}
                                alt="Agency Logo"
                            />)}
                            <div className="ml-4">
                                <h2 className="text-lg font-semibold">{user?.name || 'Agency Name'}</h2>
                                <p className="text-sm text-gray-300">Agency Dashboard</p>
                            </div>
                        </div>
                        <button
                            className="md:hidden text-white"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <FontAwesomeIcon icon={faTimes} size="lg" />
                        </button>
                    </div>
                    <nav className="mt-5 px-2 space-y-1">
                        {/* Dashboard */}
                        <NavLink
                            to="/agency/dashboard"
                            className={({ isActive }) =>
                                `flex items-center px-4 py-2 rounded-lg ${
                                    isActive ? 'text-white bg-orange-600' : 'text-gray-300 hover:text-white hover:bg-orange-700'
                                }`
                            }
                            onClick={handleNavLinkClick}
                        >
                            <FontAwesomeIcon icon={faTachometerAlt} className="mr-3" />
                            Dashboard
                        </NavLink>

                        {/* Management Section */}
                        <div>
                            <button
                                onClick={() => handleToggleMenu('management')}
                                className="flex items-center justify-between w-full px-4 py-2 rounded-lg hover:bg-orange-600 text-orange-200"
                            >
                                <span className="flex items-center">
                                    <FontAwesomeIcon icon={faBuilding} className="mr-3" />
                                    Management
                                </span>
                                <FontAwesomeIcon
                                    icon={openMenu === 'management' ? faTimes : faPlusCircle}
                                />
                            </button>
                            {openMenu === 'management' && (
                                <div className="pl-6 space-y-1">
                                    
                                    <NavLink
                                        to="/agency/create"
                                        className={({ isActive }) =>
                                            `block px-4 py-2 rounded-lg ${
                                                isActive
                                                    ? 'text-white bg-orange-600'
                                                    : 'text-gray-300 hover:text-white hover:bg-orange-700'
                                            }`
                                        }
                                        onClick={handleNavLinkClick}
                                    >
                                        Ajout Agence Info
                                    </NavLink>
                                    
                                    
                                    <NavLink
                                        to="/agency/compaign"
                                        className={({ isActive }) =>
                                            `block px-4 py-2 rounded-lg ${
                                                isActive
                                                    ? 'text-white bg-orange-600'
                                                    : 'text-gray-300 hover:text-white hover:bg-orange-700'
                                            }`
                                        }
                                        onClick={handleNavLinkClick}
                                    >
                                        Manage Campaigns
                                    </NavLink>
                                    
                                </div>
                            )}
                        </div>

                        {/* Flights Section */}
                        <div>
                            <button
                                onClick={() => handleToggleMenu('flights')}
                                className="flex items-center justify-between w-full px-4 py-2 rounded-lg hover:bg-orange-600 text-indigo-200"
                            >
                                <span className="flex items-center">
                                    <FontAwesomeIcon icon={faPlane} className="mr-3" />
                                    Flights
                                </span>
                                <FontAwesomeIcon
                                    icon={openMenu === 'flights' ? faTimes : faPlusCircle}
                                />
                            </button>
                            {openMenu === 'flights' && (
                                <div className="pl-6 space-y-1">
                                    <NavLink
                                        to="/agency/vol"
                                        className={({ isActive }) =>
                                            `block px-4 py-2 rounded-lg ${
                                                isActive
                                                    ? 'text-white bg-orange-600'
                                                    : 'text-gray-300 hover:text-white hover:bg-orange-700'
                                            }`
                                        }
                                        onClick={handleNavLinkClick}
                                    >
                                        Manage Vols
                                    </NavLink>
                                    <NavLink
                                        to="/agency/company"
                                        className={({ isActive }) =>
                                            `block px-4 py-2 rounded-lg ${
                                                isActive
                                                    ? 'text-white bg-orange-600'
                                                    : 'text-gray-300 hover:text-white hover:bg-orange-700'
                                            }`
                                        }
                                        onClick={handleNavLinkClick}
                                    >
                                        Create Company
                                    </NavLink>
                                    <NavLink
                                        to="/agency/class"
                                        className={({ isActive }) =>
                                            `block px-4 py-2 rounded-lg ${
                                                isActive
                                                    ? 'text-white bg-orange-600'
                                                    : 'text-gray-300 hover:text-white hover:bg-orange-700'
                                            }`
                                        }
                                        onClick={handleNavLinkClick}
                                    >
                                        Manage Classes
                                    </NavLink>
                                    <NavLink
                                        to="/agency/Agency-flight"
                                        className={({ isActive }) =>
                                            `block px-4 py-2 rounded-lg ${
                                                isActive
                                                    ? 'text-white bg-orange-600'
                                                    : 'text-gray-300 hover:text-white hover:bg-orange-700'
                                            }`
                                        }
                                        onClick={handleNavLinkClick}
                                    >
                                         Vols Agency
                                    </NavLink>
                                
                                    <NavLink
                                        to="/agency/destination"
                                        className={({ isActive }) =>
                                            `block px-4 py-2 rounded-lg ${
                                                isActive
                                                    ? 'text-white bg-orange-600'
                                                    : 'text-gray-300 hover:text-white hover:bg-orange-700'
                                            }`
                                        }
                                        onClick={handleNavLinkClick}
                                    >
                                        Manage Destinations
                                    </NavLink>
                                    <NavLink
                                        to="/agency/Agency-Class"
                                        className={({ isActive }) =>
                                            `block px-4 py-2 rounded-lg ${
                                                isActive
                                                    ? 'text-white bg-orange-600'
                                                    : 'text-gray-300 hover:text-white hover:bg-orange-700'
                                            }`
                                        }
                                        onClick={handleNavLinkClick}
                                    >
                                        Agency Class
                                    </NavLink>
                                    <NavLink
                                        to="/agency/Agency-PricingRules"
                                        className={({ isActive }) =>
                                            `block px-4 py-2 rounded-lg ${
                                                isActive
                                                    ? 'text-white bg-orange-600'
                                                    : 'text-gray-300 hover:text-white hover:bg-orange-700'
                                            }`
                                        }
                                        onClick={handleNavLinkClick}
                                    >
                                        Pricing Rules
                                    </NavLink>
                                </div>
                            )}
                           
                        </div>
                              <div className="space-y-1">
                               <NotificationNavBar  userId={user?.id} />
                                </div>
                        {/* Manage Reservations Section */}
                        <div>
                            <button
                                onClick={() => handleToggleMenu('reservations')}
                                className="flex items-center justify-between w-full px-4 py-2 rounded-lg hover:bg-orange-600 text-indigo-200"
                            >
                                <span className="flex items-center">
                                    <FontAwesomeIcon icon={faClipboardList} className="mr-3" />
                                    Manage Reservations
                                </span>
                                <FontAwesomeIcon
                                    icon={openMenu === 'reservations' ? faTimes : faPlusCircle}
                                />
                            </button>
                            {openMenu === 'reservations' && (
                                <div className="pl-6 space-y-1">
                                    <NavLink
                                        to="/agency/reservations"
                                        className={({ isActive }) =>
                                            `block px-4 py-2 rounded-lg ${
                                                isActive
                                                    ? 'text-white bg-orange-600'
                                                    : 'text-gray-300 hover:text-white hover:bg-orange-700'
                                            }`
                                        }
                                        onClick={handleNavLinkClick}
                                    >
                                        My Reservation
                                    </NavLink>
                                    <NavLink
                                        to="/agency/reservationCard"
                                        className={({ isActive }) =>
                                            `block px-4 py-2 rounded-lg ${
                                                isActive
                                                    ? 'text-white bg-orange-600'
                                                    : 'text-gray-300 hover:text-white hover:bg-orange-700'
                                            }`
                                        }
                                        onClick={handleNavLinkClick}
                                    >
                                        Confirm Reservation
                                    </NavLink>
                                        

                                       <NavLink
                                        to="/agency/payment-modes"
                                        className={({ isActive }) =>
                                            `block px-4 py-2 rounded-lg ${
                                                isActive
                                                    ? 'text-white bg-orange-600'
                                                    : 'text-gray-300 hover:text-white hover:bg-orange-700'
                                            }`
                                        }
                                        onClick={handleNavLinkClick}
                                    >
                                        Manage Payment Modes
                                    </NavLink>
                                    <NavLink
                                        to="/agency/invoices"
                                        className={({ isActive }) =>
                                            `block px-4 py-2 rounded-lg ${
                                                isActive
                                                    ? 'text-white bg-orange-600'
                                                    : 'text-gray-300 hover:text-white hover:bg-orange-700'
                                            }`
                                        }
                                        onClick={handleNavLinkClick}
                                    >
                                        Get Invoices
                                    </NavLink>
                                    <NavLink
                                        to="/agency/list-payment"
                                        className={({ isActive }) =>
                                            `block px-4 py-2 rounded-lg ${
                                                isActive
                                                    ? 'text-white bg-orange-600'
                                                    : 'text-gray-300 hover:text-white hover:bg-orange-700'
                                            }`
                                        }
                                        onClick={handleNavLinkClick}
                                    >
                                        Validation Payment
                                    </NavLink>
                                </div>
                            )}
                        </div>

                        {/* Other Section */}
                        <NavLink
                            to="/agency/profile"
                            className={({ isActive }) =>
                                `flex items-center px-4 py-2 rounded-lg ${
                                    isActive ? 'text-white bg-orange-600' : 'text-gray-300 hover:text-white hover:bg-orange-700'
                                }`
                            }
                            onClick={handleNavLinkClick}
                        >
                            <FontAwesomeIcon icon={faUserCircle} className="mr-3" />
                            Profile
                        </NavLink>
                    </nav>
                    <div className="border-t border-indigo-800 p-4">
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-2 w-full text-red-200 hover:text-orange-100 hover:bg-orange-600 p-2 rounded-lg"
                        >
                            <FontAwesomeIcon icon={faSignOutAlt} />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="text-gray-700 bg-white p-2 rounded-md shadow-md"
                >
                    <FontAwesomeIcon icon={faBars} size="lg" />
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 h-screen overflow-y-auto">
                <main className="p-6 bg-gray-100 min-h-screen">
                <DashboardSwitcher/>
                    <Outlet />
                    
                </main>
            </div>
        </div>
    );
};  

export default AgencyLayout;
