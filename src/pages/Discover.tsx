import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Calendar } from '@/components/ui/calendar';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import arrowDown from '@/assets/arrow-down.png';
import badgeImage from '@/assets/badge.png';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  background_image_url: string;
  target_date: string;
  address: string;
}

const EventCard = ({
  event
}: {
  event: Event;
}) => {
  const navigate = useNavigate();
  
  return (
    <div 
      className="relative cursor-pointer group"
      onClick={() => navigate(`/event/${event.id}`)}
    >
      <div className="overflow-hidden mb-3">
        <div 
          className="aspect-[4/3] bg-gray-300 bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-110"
          style={{ backgroundImage: `url(${event.background_image_url})` }}
        ></div>
      </div>
      <div className="absolute top-4 left-4 flex flex-col gap-0">
        <div className="bg-white border border-black px-3 h-[23px] flex items-center">
          <div className="text-[11px] font-medium uppercase leading-none">{event.date}</div>
        </div>
        <div className="bg-white border border-t-0 border-black px-3 h-[23px] flex items-center">
          <div className="text-[11px] font-medium leading-none">{event.time}</div>
        </div>
      </div>
      <h3 className="text-xl font-medium">{event.title}</h3>
      <p className="text-sm text-gray-500 mt-1">{event.address}</p>
    </div>
  );
};
const Discover = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, title, date, time, background_image_url, target_date, address')
        .order('target_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter events based on selected date
  const filteredEvents = events.filter((event) => {
    if (!date) return true;
    
    const eventDate = new Date(event.target_date);
    const selectedDate = new Date(date);
    
    return (
      eventDate.getFullYear() === selectedDate.getFullYear() &&
      eventDate.getMonth() === selectedDate.getMonth() &&
      eventDate.getDate() === selectedDate.getDate()
    );
  });
  const scrollToEvents = () => {
    const eventsSection = document.getElementById('events-section');
    eventsSection?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  return <div className="min-h-screen bg-white">
      <div className="animate-fade-in" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
        <Navbar />
      </div>
      
      {/* Decorative rotating badge - fixed to viewport */}
      <div className="fixed top-8 right-8 w-[172px] h-[172px] cursor-pointer z-40 animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'both' }} onClick={scrollToEvents}>
        {/* Rotating badge background */}
        <div className="w-full h-full animate-[spin_20s_linear_infinite]">
          <img src={badgeImage} alt="Badge" className="w-full h-full" />
          
          {/* Circular text "BROWSE" repeated around badge */}
          <svg viewBox="0 0 200 200" className="w-full h-full absolute inset-0">
            <defs>
              <path id="circlePath" d="M 100, 30 a 70,70 0 1,1 0,140 a 70,70 0 1,1 0,-140" />
            </defs>
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
        </div>
        
        {/* Static down arrow in center */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img src={arrowDown} alt="Arrow down" className="w-12 h-12" />
        </div>
      </div>
      
      {/* Hero Section */}
      <section className="pt-48 pb-24 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-7xl font-medium mb-10 inline-flex flex-col items-center" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
            <div className="flex items-center">
              <span className="border-2 border-black px-6 py-4 animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>Discover</span>
              <span className="bg-[#ff6bff] border-2 border-black px-6 py-4 rounded-[40px] -ml-[2px] animate-fade-in" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>events</span>
            </div>
            <div className="flex items-center -mt-[2px]">
              <span className="border-2 border-black px-6 py-4 animate-fade-in" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>near</span>
              <span className="border-2 border-l-0 border-black px-6 py-4 animate-fade-in" style={{ animationDelay: '0.6s', animationFillMode: 'both' }}>you</span>
            </div>
          </h1>
          <p className="text-[18px] text-black max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.7s', animationFillMode: 'both' }}>
            Explore popular events near you, browse by category, or check out some of the great community calendars.
          </p>
        </div>
      </section>

      {/* Events Section */}
      <section id="events-section" className="px-8 pb-16 pt-12">
        <div>
          <div className="flex items-center gap-4 mb-8 animate-fade-in" style={{ animationDelay: '0.8s', animationFillMode: 'both' }}>
            <h2 className="text-4xl font-normal">Browsing events in</h2>
            <span className="text-4xl font-normal border-2 border-black px-4 py-2">Malmö</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-12 mt-16">
            {/* Calendar */}
            <div className="animate-fade-in sticky top-24 self-start" style={{ animationDelay: '0.9s', animationFillMode: 'both' }}>
              
              <Calendar mode="single" selected={date} onSelect={setDate} />
            </div>

            {/* Event Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-16 gap-x-8">
              {loading ? (
                <div className="col-span-full text-center py-12">Loading events...</div>
              ) : filteredEvents.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  {date ? `No events found for ${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}` : 'No events found'}
                </div>
              ) : (
                filteredEvents.map((event, index) => (
                  <div 
                    key={event.id} 
                    className="animate-fade-in" 
                    style={{ animationDelay: `${1.0 + (index * 0.1)}s`, animationFillMode: 'both' }}
                  >
                    <EventCard event={event} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>;
};
export default Discover;