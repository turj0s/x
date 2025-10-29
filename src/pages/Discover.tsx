import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import arrowDown from '@/assets/arrow-down.png';
import badgeImage from '@/assets/badge.png';
import { SEOHead } from '@/components/SEOHead';

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
  
  const isEventLive = () => {
    const now = new Date().getTime();
    const target = new Date(event.target_date).getTime();
    const oneHour = 1000 * 60 * 60;
    return now >= target && now <= target + oneHour;
  };
  
  const eventLive = isEventLive();
  
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
        {eventLive && (
          <div className="bg-white border border-t-0 border-black px-3 h-[23px] flex items-center">
            <div className="text-[11px] font-medium uppercase leading-none">LIVE NOW</div>
          </div>
        )}
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
  const [userCountry, setUserCountry] = useState<string>('your location');

  useEffect(() => {
    fetchEvents();
    detectUserCountry();
  }, []);

  const detectUserCountry = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      if (data.country_name) {
        setUserCountry(data.country_name);
      }
    } catch (error) {
      console.error('Error detecting country:', error);
      // Keep default value on error
    }
  };

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

  // Filter events based on selected date and hide ended events
  const filteredEvents = events.filter((event) => {
    // Check if event has ended (more than 1 hour past target_date)
    const now = new Date().getTime();
    const target = new Date(event.target_date).getTime();
    const oneHour = 1000 * 60 * 60;
    const hasEnded = target < now - oneHour;
    
    if (hasEnded) return false;
    
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
      <SEOHead 
        title="Discover Events"
        description="Explore popular events near you, browse by category, or check out some of the great community calendars."
        keywords="events, discover events, community events, local events, event calendar"
      />
      <div className="animate-fade-in" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
        <Navbar />
      </div>
      
      {/* Decorative rotating badge - fixed to viewport */}
      <div className="fixed top-4 right-4 md:top-8 md:right-8 w-[60px] h-[60px] md:w-[72px] md:h-[72px] lg:w-[154px] lg:h-[154px] cursor-pointer z-40 animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'both' }} onClick={scrollToEvents}>
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
          <img src={arrowDown} alt="Arrow down" className="w-6 h-6 md:w-7 md:h-7 lg:w-12 lg:h-12" />
        </div>
      </div>
      
      {/* Hero Section */}
      <section className="pt-32 md:pt-40 lg:pt-48 pb-12 md:pb-16 lg:pb-24 px-4 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium mb-6 md:mb-10 inline-flex flex-col items-center" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
            <div className="flex items-center">
              <span className="border-2 border-black px-3 md:px-6 py-2 md:py-4 animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>Discover</span>
              <span className="bg-[#ff6bff] border-2 border-black px-3 md:px-6 py-2 md:py-4 rounded-[20px] md:rounded-[40px] -ml-[2px] animate-fade-in" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>events</span>
            </div>
            <div className="flex items-center -mt-[2px]">
              <span className="border-2 border-black px-3 md:px-6 py-2 md:py-4 animate-fade-in" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>near</span>
              <span className="border-2 border-l-0 border-black px-3 md:px-6 py-2 md:py-4 animate-fade-in" style={{ animationDelay: '0.6s', animationFillMode: 'both' }}>you</span>
            </div>
          </h1>
          <p className="text-sm md:text-base lg:text-[18px] text-black max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.7s', animationFillMode: 'both' }}>
            Explore popular events near you, browse by category, or check out some of the great community calendars.
          </p>
        </div>
      </section>

      {/* Events Section */}
      <section id="events-section" className="px-4 md:px-8 pb-16 pt-4 md:pt-8">
        <div>
          <div className="flex flex-wrap items-center gap-0 mb-6 md:mb-8 animate-fade-in" style={{ animationDelay: '0.8s', animationFillMode: 'both' }}>
            <h2 className="text-base md:text-lg lg:text-xl font-normal w-full sm:w-auto mb-2 sm:mb-0">Browsing events in</h2>
            <span className="text-base md:text-lg lg:text-xl font-normal border-2 border-black px-2 py-1 sm:ml-2">{userCountry}</span>
            
            {/* Calendar button for mobile/tablet */}
            <div className="lg:hidden">
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      "text-base md:text-lg lg:text-xl font-normal border-2 border-l-0 border-black px-2 py-1 flex items-center bg-white hover:bg-gray-50 transition-colors",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "MMM do, yyyy") : <span>Pick a date</span>}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar 
                    mode="single" 
                    selected={date} 
                    onSelect={setDate} 
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 lg:gap-12 mt-8 md:mt-16">
            {/* Calendar - Desktop only */}
            <div className="hidden lg:block animate-fade-in lg:sticky lg:top-24 self-start" style={{ animationDelay: '0.9s', animationFillMode: 'both' }}>
              <Calendar mode="single" selected={date} onSelect={setDate} className="mx-auto" />
            </div>

            {/* Event Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:col-start-2 gap-y-12 md:gap-y-16 gap-x-6 md:gap-x-8">
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