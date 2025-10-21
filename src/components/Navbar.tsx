import React from 'react';
import { Link } from 'react-router-dom';

export const Navbar: React.FC = () => {
  return (
    <nav className="w-full bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-xl font-medium text-foreground">GW Event planner</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              to="/discover" 
              className="text-sm font-normal text-foreground hover:text-primary transition-colors"
            >
              discover
            </Link>
            <Link 
              to="/create-event" 
              className="text-sm font-normal text-foreground hover:text-primary transition-colors"
            >
              create event
            </Link>
            <Link 
              to="/auth" 
              className="text-sm font-normal text-foreground hover:text-primary transition-colors"
            >
              sign in
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2">
            <svg 
              className="w-6 h-6 text-foreground" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 6h16M4 12h16M4 18h16" 
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-border">
        <div className="px-4 py-4 space-y-3">
          <Link 
            to="/discover" 
            className="block text-sm font-normal text-foreground hover:text-primary transition-colors"
          >
            discover
          </Link>
          <Link 
            to="/create-event" 
            className="block text-sm font-normal text-foreground hover:text-primary transition-colors"
          >
            create event
          </Link>
          <Link 
            to="/auth" 
            className="block text-sm font-normal text-foreground hover:text-primary transition-colors"
          >
            sign in
          </Link>
        </div>
      </div>
    </nav>
  );
};
