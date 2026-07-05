import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { lovable } from '@/integrations/lovable/index';
import { useToast } from '@/hooks/use-toast';

interface AuthSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthSheet: React.FC<AuthSheetProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: window.location.origin,
      });

      if (result.error) {
        toast({
          title: 'Sign in failed',
          description: result.error.message || 'Could not sign in with Google.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      if (result.redirected) {
        return;
      }

      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message ?? 'Something went wrong.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      <div
        className="fixed inset-0 bg-black opacity-50 z-[1000]"
        onClick={onClose}
      />

      <div className={`fixed right-0 top-0 h-full w-full max-w-md bg-[#1A1A1A] z-[1001] shadow-2xl transition-transform duration-300 ${isOpen ? 'animate-slide-in-right' : ''}`}>
        <button
          onClick={onClose}
          className="absolute top-8 right-8 text-white hover:text-gray-300 transition-colors"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col h-full px-10 pt-24 pb-10">
          <h2 className="text-white text-4xl font-medium mb-2">Sign In</h2>
          <p className="text-gray-400 text-sm mb-8">
            Continue with your Google account to save and manage your CV templates.
          </p>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white text-black font-medium py-3 px-6 uppercase text-sm border border-black hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z"/>
            </svg>
            {loading ? 'Please wait...' : 'Continue with Google'}
          </button>
        </div>
      </div>
    </>,
    document.body
  );
};
