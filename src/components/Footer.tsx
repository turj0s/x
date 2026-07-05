import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import { AuthSheet } from './AuthSheet';

export const Footer: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  const handleMyCVs = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) navigate('/my-events');
    else setIsAuthOpen(true);
  };

  return (
    <footer className="border-t border-black">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-0 mb-4">
              <div className="bg-black text-white h-[34px] w-[34px] border border-black flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14" className="w-4 h-4">
                  <g id="smiley-smirk">
                    <path id="Subtract" fill="currentColor" stroke="currentColor" strokeWidth="0.5" fillRule="evenodd" d="M1.83645 1.83645C3.06046 0.612432 4.82797 0 7 0s3.9395 0.612432 5.1636 1.83645C13.3876 3.06046 14 4.82797 14 7s-0.6124 3.9395 -1.8364 5.1636C10.9395 13.3876 9.17203 14 7 14s-3.93954 -0.6124 -5.16355 -1.8364C0.612432 10.9395 0 9.17203 0 7s0.612432 -3.93954 1.83645 -5.16355ZM5.0769 4.98816c0 -0.34518 -0.27982 -0.625 -0.625 -0.625 -0.34517 0 -0.625 0.27982 -0.625 0.625v0.7c0 0.34518 0.27983 0.625 0.625 0.625 0.34518 0 0.625 -0.27982 0.625 -0.625v-0.7Zm5.0962 0c0 -0.34518 -0.27983 -0.625 -0.625 -0.625 -0.34518 0 -0.625 0.27982 -0.625 0.625v0.7c0 0.34518 0.27982 0.625 0.625 0.625 0.34517 0 0.625 -0.27982 0.625 -0.625v-0.7Zm0.1787 2.42929c0.3217 0.12505 0.4812 0.48724 0.3561 0.80897 -0.2805 0.72182 -0.75537 1.29603 -1.40641 1.68306 -0.64416 0.38292 -1.4264 0.56282 -2.30149 0.56282 -0.34518 0 -0.625 -0.2798 -0.625 -0.62501 0 -0.34518 0.27982 -0.625 0.625 -0.625 0.7083 0 1.25628 -0.14564 1.66273 -0.38728 0.39956 -0.23753 0.69571 -0.58697 0.88012 -1.06143 0.12505 -0.32173 0.48725 -0.48117 0.80895 -0.35613Z" clipRule="evenodd"></path>
                  </g>
                </svg>
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
                <a href="/my-events" onClick={handleMyCVs} className="text-sm text-muted-foreground hover:text-black transition-colors cursor-pointer">
                  My CVs
                </a>
              </li>
              {!user && (
                <li>
                  <button type="button" onClick={() => setIsAuthOpen(true)} className="text-sm text-muted-foreground hover:text-black transition-colors text-left">
                    Sign In
                  </button>
                </li>
              )}
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
      <AuthSheet isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </footer>
  );

};
