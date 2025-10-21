import React from 'react';
import { Link } from 'react-router-dom';

export const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-8 left-8 z-50 flex items-center gap-0">
      {/* Logo */}
      <div className="bg-black text-white p-[10px] text-[11px] font-medium uppercase border border-black leading-none">
        GW EVENT PLANNER
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center">
        <Link 
          to="/discover" 
          className="bg-white text-black p-[10px] text-[11px] font-medium uppercase border border-black hover:bg-gray-50 transition-colors leading-none"
        >
          DISCOVER
        </Link>
        <Link 
          to="/create-event" 
          className="bg-white text-black p-[10px] text-[11px] font-medium uppercase border-l-0 border border-black hover:bg-gray-50 transition-colors leading-none"
        >
          CREATE EVENT
        </Link>
        <Link 
          to="/auth" 
          className="bg-white text-black p-[10px] text-[11px] font-medium uppercase border-l-0 border border-black hover:bg-gray-50 transition-colors leading-none"
        >
          SIGN IN
        </Link>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden flex flex-col absolute top-full left-0 mt-2 bg-white border border-black">
        <Link 
          to="/discover" 
          className="p-[10px] text-[11px] font-medium uppercase border-b border-black hover:bg-gray-50 transition-colors whitespace-nowrap leading-none"
        >
          DISCOVER
        </Link>
        <Link 
          to="/create-event" 
          className="p-[10px] text-[11px] font-medium uppercase border-b border-black hover:bg-gray-50 transition-colors whitespace-nowrap leading-none"
        >
          CREATE EVENT
        </Link>
        <Link 
          to="/auth" 
          className="p-[10px] text-[11px] font-medium uppercase hover:bg-gray-50 transition-colors whitespace-nowrap leading-none"
        >
          SIGN IN
        </Link>
      </div>
    </nav>
  );
};
