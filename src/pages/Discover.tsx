import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Calendar } from '@/components/ui/calendar';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-8 relative">
        {/* Decorative flower */}
        <div className="absolute top-20 right-20 w-32 h-32">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="45" fill="#ff6bff" />
            {[...Array(20)].map((_, i) => (
              <circle
                key={i}
                cx={50 + 40 * Math.cos((i * Math.PI * 2) / 20)}
                cy={50 + 40 * Math.sin((i * Math.PI * 2) / 20)}
                r="8"
                fill="#ff6bff"
              />
            ))}
            <line x1="50" y1="35" x2="50" y2="65" stroke="black" strokeWidth="2" />
            <line x1="50" y1="50" x2="62" y2="45" stroke="black" strokeWidth="2" />
          </svg>
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
      <section className="px-8 pb-16">
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
