import React from 'react';
import { Link } from 'react-router-dom';

export const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-8 left-8 z-50 flex items-center gap-0">
      {/* Logo */}
      <Link 
        to="/" 
        className="bg-black text-white px-6 py-3 text-sm font-medium uppercase border border-black hover:bg-gray-900 transition-colors"
      >
        GW EVENT PLANNER
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center">
        <Link 
          to="/discover" 
          className="bg-white text-black px-6 py-3 text-sm font-medium uppercase border border-black hover:bg-gray-50 transition-colors"
        >
          DISCOVER
        </Link>
        <Link 
          to="/create-event" 
          className="bg-white text-black px-6 py-3 text-sm font-medium uppercase border-l-0 border border-black hover:bg-gray-50 transition-colors"
        >
          CREATE EVENT
        </Link>
        <Link 
          to="/auth" 
          className="bg-white text-black px-6 py-3 text-sm font-medium uppercase border-l-0 border border-black hover:bg-gray-50 transition-colors"
        >
          SIGN IN
        </Link>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden flex flex-col absolute top-full left-0 mt-2 bg-white border border-black">
        <Link 
          to="/discover" 
          className="px-6 py-3 text-sm font-medium uppercase border-b border-black hover:bg-gray-50 transition-colors whitespace-nowrap"
        >
          DISCOVER
        </Link>
        <Link 
          to="/create-event" 
          className="px-6 py-3 text-sm font-medium uppercase border-b border-black hover:bg-gray-50 transition-colors whitespace-nowrap"
        >
          CREATE EVENT
        </Link>
        <Link 
          to="/auth" 
          className="px-6 py-3 text-sm font-medium uppercase hover:bg-gray-50 transition-colors whitespace-nowrap"
        >
          SIGN IN
        </Link>
      </div>
    </nav>
  );
};
