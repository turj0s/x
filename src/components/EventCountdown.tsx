import React, { useState, useEffect } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface EventCountdownProps {
  targetDate?: Date;
}

export const EventCountdown: React.FC<EventCountdownProps> = ({ 
  targetDate = new Date(Date.now() + 132 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000 + 51 * 60 * 1000 + 2 * 1000)
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 132, hours: 12, minutes: 51, seconds: 2 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const formatTime = (value: number, unit: string) => {
    return `${value.toString().padStart(unit === 'D' ? 1 : 2, '0')}${unit}`;
  };

  return (
    <div className="flex items-center gap-[0.5px] absolute w-[409px] h-[49px] left-[49px] top-[863px] max-md:static max-md:w-auto max-md:justify-center max-sm:flex-wrap max-sm:gap-1">
      <div className="flex justify-center items-center gap-[5px] relative bg-white px-[7px] py-2.5 max-sm:px-[5px] max-sm:py-2">
        <div className="text-[#1A1A1A] text-[42px] font-bold tracking-[-1.68px] relative max-md:text-[32px] max-md:tracking-[-1.28px] max-sm:text-2xl max-sm:tracking-[-0.96px]">
          {formatTime(timeLeft.days, 'D')}
        </div>
      </div>
      <div className="flex justify-center items-center gap-[5px] relative bg-white px-[7px] py-2.5 max-sm:px-[5px] max-sm:py-2">
        <div className="text-[#1A1A1A] text-[42px] font-bold tracking-[-1.68px] relative max-md:text-[32px] max-md:tracking-[-1.28px] max-sm:text-2xl max-sm:tracking-[-0.96px]">
          {formatTime(timeLeft.hours, 'H')}
        </div>
      </div>
      <div className="flex justify-center items-center gap-[5px] relative bg-white px-[7px] py-2.5 max-sm:px-[5px] max-sm:py-2">
        <div className="text-[#1A1A1A] text-[42px] font-bold tracking-[-1.68px] relative max-md:text-[32px] max-md:tracking-[-1.28px] max-sm:text-2xl max-sm:tracking-[-0.96px]">
          {formatTime(timeLeft.minutes, 'M')}
        </div>
      </div>
      <div className="flex justify-center items-center gap-[5px] relative bg-white px-[7px] py-2.5 max-sm:px-[5px] max-sm:py-2">
        <div className="text-[#1A1A1A] text-[42px] font-bold tracking-[-1.68px] relative max-md:text-[32px] max-md:tracking-[-1.28px] max-sm:text-2xl max-sm:tracking-[-0.96px]">
          {formatTime(timeLeft.seconds, 'S')}
        </div>
      </div>
    </div>
  );
};
