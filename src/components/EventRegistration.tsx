import React from 'react';

interface EventRegistrationProps {
  onRegister: () => void;
  isRegistered?: boolean;
  className?: string;
}

export const EventRegistration: React.FC<EventRegistrationProps> = ({ 
  onRegister, 
  isRegistered = false,
  className = ""
}) => {
  return (
    <div className={`flex items-center gap-[-1px] self-stretch relative ${className}`}>
      <button 
        onClick={onRegister}
        disabled={isRegistered}
        className="flex h-[50px] justify-center items-center gap-2.5 flex-[1_0_0] border relative bg-[#1A1A1A] px-2.5 py-3.5 border-solid border-[#1A1A1A] hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={isRegistered ? "Already registered for event" : "Register for event"}
      >
        <span className="text-white text-[13px] font-normal uppercase relative">
          {isRegistered ? "REGISTERED" : "REGISTER"}
        </span>
      </button>
      <div className="flex w-[50px] h-[50px] justify-center items-center border relative bg-white rounded-[99px] border-solid border-[#1A1A1A]">
        <svg 
          width="12" 
          height="12" 
          viewBox="0 0 12 12" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="arrow-icon"
          aria-hidden="true"
        >
          <path d="M0.857178 6H10.3929" stroke="#1A1A1A" strokeWidth="1.5" />
          <path d="M6.39282 10L10.3928 6L6.39282 2" stroke="#1A1A1A" strokeWidth="1.5" />
        </svg>
      </div>
    </div>
  );
};
