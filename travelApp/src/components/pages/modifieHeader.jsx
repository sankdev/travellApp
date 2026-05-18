import { faBars, faSignInAlt, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const Header = ({ setIsLoginOpen }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Flights', path: '/flights' },
    { name: 'Agencies', path: '/agencies' },
    { name: 'Campaigns', path: '/campaigns' },
  ];

  return (
    <header
      className="sticky top-0 z-20 shadow-md"
      style={{ backgroundColor: '#0F172A' }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-24">
        <div className="flex justify-between items-center h-[70px]">
          {/* Logo */}
          <div className="flex items-center">
            <img
              src="/agence-logo.png" // ton fichier placé dans public/logo.png
              alt="Travel Agency Logo"
              className="h-8 w-auto sm:h-10"
            />
            

            {/* Navigation Desktop */}
            <nav className="hidden md:ml-10 md:flex  md:space-x-8">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'text-white border-b-2 border-yellow-400'
                        : 'text-gray-300 hover:text-white hover:border-b-2 hover:border-gray-500'
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Bouton Login */}
          <div className="hidden md:flex md:items-center">
            <button
              onClick={() => setIsLoginOpen(true)}
               className="px-4 py-2 rounded-md text-sm font-medium bg-[#D97706] text-white hover:bg-[#b45309] transition-colors duration-200"
            >
              <FontAwesomeIcon icon={faSignInAlt} className="mr-2" />
              Login
            </button>
          </div>

          {/* Menu mobile */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-gray-800 focus:outline-none"
            >
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
        <div className="md:hidden" style={{ backgroundColor: '#0F172A' }}>
          <div className="pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block w-full text-left pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive
                      ? 'text-yellow-400 bg-gray-900 border-yellow-400'
                      : 'text-gray-300 border-transparent hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-700">
            <div className="px-4">
              <button
                onClick={() => {
                  setIsLoginOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center px-4 py-2 rounded-md bg-white text-[#0F172A] hover:bg-gray-100"
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
