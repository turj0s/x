import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Calendar } from '@/components/ui/calendar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import arrowDown from '@/assets/arrow-down.png';

function buildScallopedPath(
  cx: number,
  cy: number,
  R: number,
  r: number,
  lobes: number,
  samples = 256
): string {
  let d = '';
  for (let i = 0; i <= samples; i++) {
    const t = (i / samples) * Math.PI * 2;
    const radius = R + r * Math.sin(lobes * t);
    const x = cx + radius * Math.cos(t);
    const y = cy + radius * Math.sin(t);
    d += i === 0 ? `M ${x.toFixed(3)} ${y.toFixed(3)}` : ` L ${x.toFixed(3)} ${y.toFixed(3)}`;
  }
  d += ' Z';
  return d;
}

const EventCard = ({ date, time }: { date: string; time: string }) => (
  <div className="relative">
    <div className="aspect-[4/3] bg-gray-300 mb-3"></div>
    <div className="absolute top-4 left-4 bg-white border border-black px-3 py-2">
      <div className="text-[11px] font-medium uppercase">{date}</div>
      <div className="text-[11px]">{time}</div>
    </div>
    <h3 className="text-base font-medium">Event name</h3>
  </div>
);

const Discover = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const scrollToEvents = () => {
    const eventsSection = document.getElementById('events-section');
    eventsSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-8 relative">
        {/* Decorative rotating badge */}
        <div 
          className="absolute top-20 right-20 w-48 h-48 cursor-pointer"
          onClick={scrollToEvents}
        >
          {/* Rotating badge */}
          <svg viewBox="0 0 200 200" className="w-full h-full animate-[spin_20s_linear_infinite]">
            {/* Scalloped edge circle */}
            <defs>
              <path
                id="circlePath"
                d="M 100, 30 a 70,70 0 1,1 0,140 a 70,70 0 1,1 0,-140"
              />
            </defs>
            
            {/* Scalloped badge smooth sine-edge */}
            <path
              d={buildScallopedPath(100, 100, 68, 12, 16, 256)}
              fill="#ff6bff"
            />
            
            {/* Circular text "BROWSE" repeated around full circle */}
            <text className="text-[16px] font-bold uppercase" fill="black">
              <textPath href="#circlePath" startOffset="0%">BROWSE</textPath>
            </text>
            <text className="text-[16px] font-bold uppercase" fill="black">
              <textPath href="#circlePath" startOffset="20%">BROWSE</textPath>
            </text>
            <text className="text-[16px] font-bold uppercase" fill="black">
              <textPath href="#circlePath" startOffset="40%">BROWSE</textPath>
            </text>
            <text className="text-[16px] font-bold uppercase" fill="black">
              <textPath href="#circlePath" startOffset="60%">BROWSE</textPath>
            </text>
            <text className="text-[16px] font-bold uppercase" fill="black">
              <textPath href="#circlePath" startOffset="80%">BROWSE</textPath>
            </text>
          </svg>
          
          {/* Static down arrow in center */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <img src={arrowDown} alt="Arrow down" className="w-12 h-12" />
          </div>
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-normal mb-6 flex flex-wrap justify-center items-center gap-x-4">
            <span className="border-2 border-black px-4 py-2">Discover</span>
            <span className="bg-[#ff6bff] border-2 border-black px-4 py-2 rounded-3xl">events</span>
            <br />
            <span className="border-2 border-black px-4 py-2">near</span>
            <span className="border-2 border-black px-4 py-2">you</span>
          </h1>
          <p className="text-base text-gray-700 max-w-2xl mx-auto">
            Explore popular events near you, browse by category, or check out some of the great community calendars.
          </p>
        </div>
      </section>

      {/* Events Section */}
      <section id="events-section" className="px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-4xl font-normal">Browsing events in</h2>
            <span className="text-4xl font-normal border-2 border-black px-4 py-2">Malmö</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-12">
            {/* Calendar */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">October 2025</h3>
                <div className="flex gap-2">
                  <button className="p-1 hover:bg-gray-100">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button className="p-1 hover:bg-gray-100">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="border border-black"
              />
            </div>

            {/* Event Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <EventCard date="THURSDAY, OCTOBER 30" time="16:30 - 18:30 CET" />
              <EventCard date="THURSDAY, OCTOBER 30" time="16:30 - 18:30 CET" />
              <EventCard date="THURSDAY, OCTOBER 30" time="16:30 - 18:30 CET" />
              <EventCard date="THURSDAY, OCTOBER 30" time="16:30 - 18:30 CET" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Discover;
