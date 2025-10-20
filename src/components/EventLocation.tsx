import React from 'react';

interface EventLocationProps {
  address: string;
  mapImageUrl: string;
  onGetDirections: () => void;
}

export const EventLocation: React.FC<EventLocationProps> = ({ 
  address, 
  mapImageUrl, 
  onGetDirections 
}) => {
  return (
    <section className="flex flex-col items-start gap-6 self-stretch relative">
      <div className="flex flex-col items-start gap-5 self-stretch relative">
        <hr className="h-px self-stretch relative bg-[#1A1A1A] border-0" />
        <h2 className="self-stretch text-[#1A1A1A] text-[11px] font-normal uppercase relative">
          LOCATION
        </h2>
      </div>
      <div className="flex items-start gap-8 self-stretch relative max-sm:flex-col max-sm:gap-4">
        <address className="flex-[1_0_0] text-[#1A1A1A] text-[11px] font-normal uppercase opacity-50 relative not-italic">
          {address}
        </address>
        <button 
          onClick={onGetDirections}
          className="flex-[1_0_0] text-[#1A1A1A] text-[11px] font-normal uppercase relative bg-transparent border-0 cursor-pointer p-0 text-left hover:opacity-70 transition-opacity"
        >
          GET DIRECTIONS
        </button>
      </div>
      <img
        src={mapImageUrl}
        alt="Google map showing event location"
        className="h-[214px] self-stretch relative w-full object-cover max-sm:h-[180px]"
      />
    </section>
  );
};
