import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { AuthSheet } from './AuthSheet';

export const Navbar: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <nav className="fixed top-8 left-8 z-50 flex items-center gap-0">
      {/* Logo */}
      <div className="bg-black text-white p-[10px] text-[11px] font-medium uppercase border border-black leading-none">
        GW EVENT PLANNER
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center">
        <Link 
          to="/" 
          className="relative overflow-hidden bg-white text-black p-[10px] text-[11px] font-medium uppercase border border-black leading-none group"
        >
          <span className="relative z-10">DISCOVER</span>
          <span className="absolute inset-0 bg-[#FA76FF] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></span>
        </Link>
        <Link 
          to="/create-event" 
          className="relative overflow-hidden bg-white text-black p-[10px] text-[11px] font-medium uppercase border-l-0 border border-black leading-none group"
        >
          <span className="relative z-10">CREATE EVENT</span>
          <span className="absolute inset-0 bg-[#FA76FF] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></span>
        </Link>
        {user ? (
          <Link 
            to="/my-events" 
            className="relative overflow-hidden bg-white text-black p-[10px] text-[11px] font-medium uppercase border-l-0 border border-black leading-none group"
          >
            <span className="relative z-10">MY EVENTS</span>
            <span className="absolute inset-0 bg-[#FA76FF] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></span>
          </Link>
        ) : (
          <button 
            onClick={() => setIsAuthOpen(true)}
            className="relative overflow-hidden bg-white text-black p-[10px] text-[11px] font-medium uppercase border-l-0 border border-black leading-none group"
          >
            <span className="relative z-10">SIGN IN</span>
            <span className="absolute inset-0 bg-[#FA76FF] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></span>
          </button>
        )}
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden flex flex-col absolute top-full left-0 mt-2 bg-white border border-black">
        <Link 
          to="/" 
          className="relative overflow-hidden p-[10px] text-[11px] font-medium uppercase border-b border-black whitespace-nowrap leading-none group"
        >
          <span className="relative z-10">DISCOVER</span>
          <span className="absolute inset-0 bg-[#FA76FF] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></span>
        </Link>
        <Link 
          to="/create-event" 
          className="relative overflow-hidden p-[10px] text-[11px] font-medium uppercase border-b border-black whitespace-nowrap leading-none group"
        >
          <span className="relative z-10">CREATE EVENT</span>
          <span className="absolute inset-0 bg-[#FA76FF] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></span>
        </Link>
        {user ? (
          <Link 
            to="/my-events" 
            className="relative overflow-hidden p-[10px] text-[11px] font-medium uppercase whitespace-nowrap leading-none group"
          >
            <span className="relative z-10">MY EVENTS</span>
            <span className="absolute inset-0 bg-[#FA76FF] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></span>
          </Link>
        ) : (
          <button 
            onClick={() => setIsAuthOpen(true)}
            className="relative overflow-hidden p-[10px] text-[11px] font-medium uppercase whitespace-nowrap leading-none group"
          >
            <span className="relative z-10">SIGN IN</span>
            <span className="absolute inset-0 bg-[#FA76FF] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></span>
          </button>
        )}
      </div>
    </nav>
    
    <AuthSheet isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
};
