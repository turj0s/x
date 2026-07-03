import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-black">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-0 mb-4">
              <div className="bg-black text-white h-[34px] w-[34px] border border-black flex items-center justify-center">
                <span className="text-[11px] font-bold leading-none">CV</span>
              </div>
              <span className="text-[11px] font-medium uppercase border border-black border-l-0 px-3 h-[34px] flex items-center leading-none">
                BY UNICV
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Professional CV templates for modern teams.
            </p>
          </div>

          {/* Product */}
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wide border border-black px-3 py-1 inline-block mb-4">
              Product
            </span>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-black transition-colors">
                  Templates
                </Link>
              </li>
              <li>
                <Link to="/create-event" className="text-sm text-muted-foreground hover:text-black transition-colors">
                  Create CV
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wide border border-black px-3 py-1 inline-block mb-4">
              Account
            </span>
            <ul className="space-y-2">
              <li>
                <Link to="/my-events" className="text-sm text-muted-foreground hover:text-black transition-colors">
                  My CVs
                </Link>
              </li>
              <li>
                <Link to="/auth" className="text-sm text-muted-foreground hover:text-black transition-colors">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wide border border-black px-3 py-1 inline-block mb-4">
              Legal
            </span>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-sm text-muted-foreground hover:text-black transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-black transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 md:mt-16 pt-6 border-t border-black flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <span className="text-[11px] font-medium uppercase text-muted-foreground">
            &copy; {new Date().getFullYear()} UNICV. All rights reserved.
          </span>
          <a href="https://turjo.dev" target="_blank" rel="noopener noreferrer" className="text-[11px] font-medium uppercase text-muted-foreground hover:text-black transition-colors">
            Build by Turjo S.
          </a>
        </div>
      </div>
    </footer>
  );
};
