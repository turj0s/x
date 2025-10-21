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
          className="relative overflow-hidden bg-white text-black p-[10px] text-[11px] font-medium uppercase border border-black leading-none group"
        >
          <span className="relative z-10">DISCOVER</span>
          <span className="absolute inset-0 bg-[#E19FF5] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></span>
        </Link>
        <Link 
          to="/create-event" 
          className="relative overflow-hidden bg-white text-black p-[10px] text-[11px] font-medium uppercase border-l-0 border border-black leading-none group"
        >
          <span className="relative z-10">CREATE EVENT</span>
          <span className="absolute inset-0 bg-[#E19FF5] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></span>
        </Link>
        <Link 
          to="/auth" 
          className="relative overflow-hidden bg-white text-black p-[10px] text-[11px] font-medium uppercase border-l-0 border border-black leading-none group"
        >
          <span className="relative z-10">SIGN IN</span>
          <span className="absolute inset-0 bg-[#E19FF5] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></span>
        </Link>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden flex flex-col absolute top-full left-0 mt-2 bg-white border border-black">
        <Link 
          to="/discover" 
          className="relative overflow-hidden p-[10px] text-[11px] font-medium uppercase border-b border-black whitespace-nowrap leading-none group"
        >
          <span className="relative z-10">DISCOVER</span>
          <span className="absolute inset-0 bg-[#E19FF5] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></span>
        </Link>
        <Link 
          to="/create-event" 
          className="relative overflow-hidden p-[10px] text-[11px] font-medium uppercase border-b border-black whitespace-nowrap leading-none group"
        >
          <span className="relative z-10">CREATE EVENT</span>
          <span className="absolute inset-0 bg-[#E19FF5] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></span>
        </Link>
        <Link 
          to="/auth" 
          className="relative overflow-hidden p-[10px] text-[11px] font-medium uppercase whitespace-nowrap leading-none group"
        >
          <span className="relative z-10">SIGN IN</span>
          <span className="absolute inset-0 bg-[#E19FF5] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></span>
        </Link>
      </div>
    </nav>
  );
};
