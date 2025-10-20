import React from 'react';

interface EventMetaProps {
  date: string;
  time: string;
}

export const EventMeta: React.FC<EventMetaProps> = ({ date, time }) => {
  return (
    <div className="flex items-start gap-[-1px] relative max-sm:flex-col max-sm:gap-px">
      <div className="flex justify-center items-center gap-2.5 relative bg-[#1A1A1A] p-2 max-sm:w-full">
        <time className="text-white text-[11px] font-normal uppercase relative">
          {date}
        </time>
      </div>
      <div className="flex justify-center items-center gap-2.5 border relative p-2 border-solid border-[#1A1A1A] max-sm:w-full">
        <time className="text-[#1A1A1A] text-[11px] font-normal uppercase relative">
          {time}
        </time>
      </div>
    </div>
  );
};
