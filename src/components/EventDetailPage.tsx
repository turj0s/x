import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EventCountdown } from './EventCountdown';
import { EventMeta } from './EventMeta';
import { EventHeader } from './EventHeader';
import { EventDescription } from './EventDescription';
import { EventLocation } from './EventLocation';
import { EventRegistration } from './EventRegistration';

interface Event {
  id: string;
  title: string;
  creator: string;
  description: string;
  date: string;
  time: string;
  address: string;
  background_image_url: string;
  target_date: string;
}

export const EventDetailPage: React.FC = () => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvent();
  }, []);

  const fetchEvent = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      setEvent(data);
    }
    setLoading(false);
  };

  const handleRegister = () => {
    if (!isRegistered) {
      setIsRegistered(true);
      // Here you would typically make an API call to register the user
      console.log('User registered for event');
    }
  };

  const handleGetDirections = () => {
    // Here you would typically open a maps application or navigate to directions
    console.log('Opening directions');
    window.open('https://maps.google.com', '_blank');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-[#1A1A1A] text-2xl">Loading...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-[#1A1A1A] text-2xl">No event found</div>
      </div>
    );
  }

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Host+Grotesk:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <main className="flex h-screen w-full relative bg-white mx-auto my-0 max-md:flex-col max-md:h-auto">
        <div 
          className="flex flex-col justify-end items-start fixed h-screen w-[calc(100%-540px)] pl-[49px] pr-12 pb-12 left-0 top-0 animate-fade-zoom-in max-md:relative max-md:w-full max-md:h-[400px] max-md:bg-cover max-md:bg-center max-md:pb-5 max-md:px-5 max-sm:h-[300px] max-sm:pb-[15px] max-sm:px-[15px]"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url("${event.background_image_url}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
          role="img"
          aria-label="Event background image"
        >
          <EventCountdown targetDate={new Date(event.target_date)} />
        </div>
        
        <aside className="flex w-[540px] flex-col ml-auto h-screen box-border bg-white max-md:w-full max-md:h-auto max-md:ml-0">
          <div className="flex-1 overflow-y-auto p-10 max-md:p-[30px] max-sm:p-5">
            <div className="flex w-full flex-col items-start gap-10 opacity-0 animate-fade-in [animation-delay:200ms]">
              <div className="flex flex-col items-start gap-9 self-stretch relative">
                <EventMeta 
                  date={event.date}
                  time={event.time}
                />
                <EventHeader 
                  title={event.title}
                  creator={event.creator}
                />
              </div>
              
              <EventDescription 
                description={event.description}
              />
              
              <EventLocation 
                address={event.address}
                onGetDirections={handleGetDirections}
              />
            </div>
          </div>
          
          <div className="sticky bottom-0 bg-white p-10 border-t border-[#1A1A1A]/10 max-md:p-[30px] max-sm:p-5">
            <EventRegistration 
              onRegister={handleRegister}
              isRegistered={isRegistered}
              className="opacity-0 animate-fade-in [animation-delay:400ms]"
            />
          </div>
        </aside>
      </main>
    </>
  );
};
