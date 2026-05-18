import { faBars, faPlane, faSignInAlt, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';

const Header = ({ isLoginOpen, setIsLoginOpen, setIsFlightSearchOpen }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo et navigation principale */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <FontAwesomeIcon 
                icon={faPlane} 
                className="h-6 w-6 text-indigo-600"
              />
              <span className="ml-2 text-xl font-bold text-gray-900 hidden sm:block">
                TravelAgency
              </span>
            </div>
            
            {/* Navigation desktop */}
            <div className="hidden sm:ml-8 sm:flex sm:space-x-6">
              <button 
                className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-indigo-500 text-sm font-medium"
              >
                Home
              </button>
              <button 
                onClick={() => setIsFlightSearchOpen(true)}
                className="text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium"
              >
                Flights
              </button>
              <button 
                className="text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium"
              >
                Agencies
              </button>
              <button 
                className="text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium"
              >
                Campaigns
              </button>
            </div>
          </div>

          {/* Bouton de connexion (desktop) */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <button
              onClick={() => setIsLoginOpen(true)}
              className="px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              <FontAwesomeIcon icon={faSignInAlt} className="mr-2" />
              Login
            </button>
          </div>

          {/* Menu mobile */}
          <div className="sm:hidden flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <FontAwesomeIcon 
                icon={isMobileMenuOpen ? faTimes : faBars} 
                className="h-6 w-6"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile déplié */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-white shadow-md">
          <div className="pt-2 pb-3 space-y-1">
            <button 
              className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-indigo-500 text-base font-medium text-indigo-700 bg-indigo-50"
            >
              Home
            </button>
            <button 
              onClick={() => {
                setIsFlightSearchOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300"
            >
              Flights
            </button>
            <button 
              className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300"
            >
              Agencies
            </button>
            <button 
              className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300"
            >
              Campaigns
            </button>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="px-4">
              <button
                onClick={() => {
                  setIsLoginOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <FontAwesomeIcon icon={faSignInAlt} className="mr-2" />
                Login
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
