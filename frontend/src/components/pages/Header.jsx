import { faBars, faPlane, faSignInAlt, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';

const Header = ({ isLoginOpen, setIsLoginOpen, setIsFlightSearchOpen }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm relative z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <FontAwesomeIcon icon={faPlane} className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">TravelAgency</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <button className="text-gray-900">Home</button>
              <button className="text-gray-500 hover:text-gray-900" >Flights</button>
              <button className="text-gray-500 hover:text-gray-900">Agencies</button>
              <button className="text-gray-500 hover:text-gray-900">Campaigns</button>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <button
              onClick={() => setIsLoginOpen(true)}
              className="px-4 py-2 border text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
            >
              <FontAwesomeIcon icon={faSignInAlt} className="mr-2" /> Login
            </button>
          </div>
          <div className="sm:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-400">
              <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faBars} className="h-6 w-6" />
            </button>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="sm:hidden">
          <button className="block px-4 py-2">Home</button>
          <button className="block px-4 py-2" onClick={() => setIsFlightSearchOpen(true)}>Flights</button>
          <button className="block px-4 py-2">Agencies</button>
          <button className="block px-4 py-2">Campaigns</button>
          <button onClick={() => setIsLoginOpen(true)} className="block w-full px-4 py-2 text-left">
            <FontAwesomeIcon icon={faSignInAlt} className="mr-2" /> Login
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;