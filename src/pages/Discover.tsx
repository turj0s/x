import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import arrowDown from '@/assets/arrow-down.png';
import { SEOHead } from '@/components/SEOHead';
import { EventsCarousel } from '@/components/EventsCarousel';
import { RotatingBadge } from '@/components/RotatingBadge';


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
      onClick={() => navigate(`/event/${event.id}/editor`)}
    >
      <div className="overflow-hidden mb-3">
        <div 
          className="aspect-square bg-gray-300 bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-110"
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
            <div className="text-[11px] font-medium uppercase leading-none">NEW</div>
          </div>
        )}
      </div>
      <h3 className="text-lg font-medium">{event.title}</h3>
      <p className="text-sm text-gray-500 mt-1">{event.address}</p>
    </div>
  );
};
const Discover = () => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCountry, setUserCountry] = useState<string>('the world');
  const [initialDateSet, setInitialDateSet] = useState(false);

  useEffect(() => {
    fetchEvents();
    detectUserCountry();
  }, []);

  // Set initial date only if there are events today
  useEffect(() => {
    if (!initialDateSet && events.length > 0) {
      const today = new Date();
      const now = today.getTime();
      const oneHour = 1000 * 60 * 60;
      
      const hasEventsToday = events.some((event) => {
        const eventDate = new Date(event.target_date);
        const target = eventDate.getTime();
        const hasEnded = target < now - oneHour;
        
        if (hasEnded) return false;
        
        return (
          eventDate.getFullYear() === today.getFullYear() &&
          eventDate.getMonth() === today.getMonth() &&
          eventDate.getDate() === today.getDate()
        );
      });
      
      if (hasEventsToday) {
        setDate(today);
      }
      setInitialDateSet(true);
    }
  }, [events, initialDateSet]);

  const detectUserCountry = async () => {
    try {
      const response = await fetch('https://www.cloudflare.com/cdn-cgi/trace');
      const data = await response.text();
      const locMatch = data.match(/loc=([A-Z]{2})/);
      
      if (locMatch && locMatch[1]) {
        const countryCode = locMatch[1];
        // Convert country code to full name
        const countryNames: { [key: string]: string } = {
          'US': 'United States', 'GB': 'United Kingdom', 'CA': 'Canada', 'AU': 'Australia',
          'DE': 'Germany', 'FR': 'France', 'IT': 'Italy', 'ES': 'Spain', 'NL': 'Netherlands',
          'BE': 'Belgium', 'SE': 'Sweden', 'NO': 'Norway', 'DK': 'Denmark', 'FI': 'Finland',
          'PL': 'Poland', 'CH': 'Switzerland', 'AT': 'Austria', 'IE': 'Ireland', 'PT': 'Portugal',
          'IN': 'India', 'JP': 'Japan', 'CN': 'China', 'KR': 'South Korea', 'BR': 'Brazil',
          'MX': 'Mexico', 'AR': 'Argentina', 'CL': 'Chile', 'CO': 'Colombia', 'SG': 'Singapore',
          'NZ': 'New Zealand', 'ZA': 'South Africa', 'RU': 'Russia', 'TR': 'Turkey', 'GR': 'Greece'
        };
        setUserCountry(countryNames[countryCode] || countryCode);
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error detecting country:', error);
      setUserCountry('the world');
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
      if (import.meta.env.DEV) console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter templates based on selected date
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
      <SEOHead 
        title="Browse CV Templates"
        description="Explore beautifully designed CV templates for every industry and career level."
        keywords="cv templates, resume templates, cv maker, resume builder, professional cv"
      />
      <div className="animate-fade-in" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
        <Navbar />
      </div>
      
      {/* Decorative rotating badge - fixed to viewport */}
      <RotatingBadge 
        text="TEMPLATES" 
        onClick={scrollToEvents}
        showIcon={true}
        icon={<img src={arrowDown} alt="Arrow down" className="w-6 h-6 md:w-7 md:h-7 lg:w-12 lg:h-12" />}
      />
      
      {/* Hero Section */}
      <section className="pt-32 md:pt-40 lg:pt-48 pb-6 md:pb-16 lg:pb-24 px-4 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium mb-6 md:mb-10 inline-flex flex-col items-center" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
            <div className="flex items-center">
              <span className="border border-black px-3 md:px-6 py-2 md:py-4 animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>Build your</span>
              <span className="bg-[#ff6bff] border border-black px-3 md:px-6 py-2 md:py-4 rounded-[20px] md:rounded-[40px] -ml-px animate-fade-in" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>perfect</span>
            </div>
            <div className="flex items-center -mt-px">
              <span className="border border-black px-3 md:px-6 py-2 md:py-4 animate-fade-in" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>CV in</span>
              <span className="border border-l-0 border-black px-3 md:px-6 py-2 md:py-4 animate-fade-in" style={{ animationDelay: '0.6s', animationFillMode: 'both' }}>minutes</span>
            </div>
          </h1>
          <p className="text-sm md:text-base lg:text-[18px] text-black max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.7s', animationFillMode: 'both' }}>
            Browse professionally designed CV templates, customize them to your story, and download a resume that stands out.
          </p>
        </div>
      </section>

      {/* Auto-scrolling Events Carousel */}
      <EventsCarousel />

      {/* Events Section */}
      <section id="events-section" className="px-4 md:px-8 pb-16 pt-6 md:pt-16">
        <div>
          <div className="flex flex-wrap items-center gap-0 mb-6 md:mb-8 animate-fade-in" style={{ animationDelay: '0.8s', animationFillMode: 'both' }}>
            <h2 className="text-base md:text-lg lg:text-xl font-normal w-full sm:w-auto mb-2 sm:mb-0">Browsing CV templates for</h2>
            <span className="text-base md:text-lg lg:text-xl font-normal border border-black px-2 py-1 sm:ml-2">{userCountry}</span>
          </div>

          <div className="mt-8 md:mt-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {loading ? (
                <div className="col-span-full text-center py-12">Loading templates...</div>
              ) : filteredEvents.length === 0 ? (
                <div className="col-span-full text-center py-12">No templates found</div>
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

      {/* How it Works Section */}
      <section className="px-4 md:px-8 py-16 md:py-24 border-t border-black">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10 md:mb-16">
            <h2 className="text-[11px] font-medium uppercase tracking-wide border border-black px-3 py-1 inline-block">How it works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="animate-fade-in" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
              <div className="text-4xl md:text-5xl font-medium mb-4">01</div>
              <h3 className="text-lg md:text-xl font-medium mb-2">Pick a template</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Browse our curated collection of professionally designed CV templates built for every industry and experience level.</p>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
              <div className="text-4xl md:text-5xl font-medium mb-4">02</div>
              <h3 className="text-lg md:text-xl font-medium mb-2">Customize your story</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Fill in your details, rearrange sections, and tweak colors and fonts to match your personal brand.</p>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
              <div className="text-4xl md:text-5xl font-medium mb-4">03</div>
              <h3 className="text-lg md:text-xl font-medium mb-2">Download & share</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Export your CV as a polished PDF ready for recruiters, job boards, or email applications.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 md:px-8 py-16 md:py-24 border-t border-black">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10 md:mb-16">
            <span className="text-[11px] font-medium uppercase tracking-wide border border-black px-3 py-1 inline-block">Features</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[
              { title: 'ATS-friendly', desc: 'Every template is optimized to pass through applicant tracking systems cleanly.' },
              { title: 'One-click export', desc: 'Download your CV as a high-resolution PDF in seconds, no watermarks.' },
              { title: 'Mobile editing', desc: 'Build and tweak your resume on any device, wherever inspiration strikes.' },
              { title: 'Real-time preview', desc: 'See changes instantly as you type, so you know exactly what recruiters will see.' },
            ].map((feature, i) => (
              <div key={feature.title} className="border border-black p-6 md:p-8 animate-fade-in" style={{ animationDelay: `${0.1 + i * 0.1}s`, animationFillMode: 'both' }}>
                <h3 className="text-base md:text-lg font-medium mb-3">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built for Real Teams Section */}
      <section className="px-4 md:px-8 py-16 md:py-24 border-t border-black">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10 md:mb-16">
            <span className="text-[11px] font-medium uppercase tracking-wide border border-black px-3 py-1 inline-block">Built for real teams</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="animate-fade-in" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium mb-6 leading-tight">Designed for the way modern teams hire and grow</h2>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-6">
                Whether you are a startup scaling fast or an enterprise refining your employer brand, our CV builder helps you create consistent, professional resumes across your entire organization.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="text-[11px] font-medium uppercase border border-black px-3 py-1">Startups</span>
                <span className="text-[11px] font-medium uppercase border border-black px-3 py-1">Agencies</span>
                <span className="text-[11px] font-medium uppercase border border-black px-3 py-1">Enterprise</span>
                <span className="text-[11px] font-medium uppercase border border-black px-3 py-1">Freelancers</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
              <div className="border border-black p-5 md:p-6 text-center">
                <div className="text-2xl md:text-3xl font-medium mb-1">0</div>
                <div className="text-[11px] font-medium uppercase text-muted-foreground">CVs created</div>
              </div>
              <div className="border border-black p-5 md:p-6 text-center">
                <div className="text-2xl md:text-3xl font-medium mb-1">11</div>
                <div className="text-[11px] font-medium uppercase text-muted-foreground">Templates</div>
              </div>
              <div className="border border-black p-5 md:p-6 text-center">
                <div className="text-2xl md:text-3xl font-medium mb-1">0</div>
                <div className="text-[11px] font-medium uppercase text-muted-foreground">Users</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Teams Switch Section */}
      <section className="px-4 md:px-8 py-16 md:py-24 border-t border-black">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10 md:mb-16">
            <span className="text-[11px] font-medium uppercase tracking-wide border border-black px-3 py-1 inline-block">Why teams switch</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="animate-fade-in" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
              <div className="w-10 h-10 border border-black flex items-center justify-center mb-4">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/></svg>
              </div>
              <h3 className="text-base md:text-lg font-medium mb-2">Faster hiring workflows</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Stop wrestling with Word formatting. Your team builds consistent, recruiter-ready CVs in minutes instead of hours.</p>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
              <div className="w-10 h-10 border border-black flex items-center justify-center mb-4">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z"/><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/></svg>
              </div>
              <h3 className="text-base md:text-lg font-medium mb-2">Better candidate experience</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Give your applicants and employees beautiful templates that reflect your company&apos;s professionalism and care.</p>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
              <div className="w-10 h-10 border border-black flex items-center justify-center mb-4">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              </div>
              <h3 className="text-base md:text-lg font-medium mb-2">Easy sharing & export</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Download, print, or share CVs instantly. No software lock-in, no compatibility headaches, just clean PDFs every time.</p>
            </div>
          </div>
        </div>
      </section>
    </div>;
};
export default Discover;