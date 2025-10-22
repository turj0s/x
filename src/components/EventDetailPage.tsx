import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from './Navbar';
import { EventCountdown } from './EventCountdown';
import { EventMeta } from './EventMeta';
import { EventHeader } from './EventHeader';
import { EventDescription } from './EventDescription';
import { EventLocation } from './EventLocation';
import { EventRegistration } from './EventRegistration';
import { AuthSheet } from './AuthSheet';
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
  const { id } = useParams();
  const [isRegistered, setIsRegistered] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  
  useEffect(() => {
    fetchEvent();
    checkRegistration();
  }, [id]);
  
  const fetchEvent = async () => {
    const { data, error } = id
      ? await supabase.from('events').select('*').eq('id', id).single()
      : await supabase.from('events').select('*').limit(1).maybeSingle();
    
    if (!error && data) {
      setEvent(data);
    }
    setLoading(false);
  };

  const checkRegistration = async () => {
    if (!id) return;
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { data } = await supabase
      .from('event_registrations')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('event_id', id)
      .maybeSingle();
    
    setIsRegistered(!!data);
  };
  const handleGetDirections = () => {
    // Here you would typically open a maps application or navigate to directions
    console.log('Opening directions');
    window.open('https://maps.google.com', '_blank');
  };
  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-[#1A1A1A] text-2xl">Loading...</div>
      </div>;
  }
  if (!event) {
    return <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-[#1A1A1A] text-2xl">No event found</div>
      </div>;
  }
  return <>
      <link href="https://fonts.googleapis.com/css2?family=Host+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <Navbar />
      <main className="flex h-screen justify-center items-start w-full relative bg-white mx-auto my-0 max-md:flex-col max-md:h-auto">
        <div className="flex flex-col justify-end items-start fixed h-screen w-[calc(100%-540px)] pl-[49px] pr-[590px] pt-[calc(100vh-97px)] pb-12 left-0 top-0 overflow-hidden max-md:relative max-md:w-full max-md:h-[400px] max-md:bg-cover max-md:bg-center max-md:pt-80 max-md:pb-5 max-md:px-5 max-md:right-0 max-sm:h-[300px] max-sm:pt-60 max-sm:pb-[15px] max-sm:px-[15px]" role="img" aria-label="Event background image">
          <div className="absolute inset-0 animate-[zoom-in_1.2s_ease-out_forwards]" style={{
            backgroundImage: `url("${event.background_image_url}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}></div>
          <div className="relative z-10 animate-fade-in" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
            <EventCountdown targetDate={new Date(event.target_date)} />
          </div>
        </div>
        
        <aside className="flex w-[540px] flex-col justify-start items-start fixed h-screen box-border right-0 top-0 bg-white overflow-y-auto max-md:relative max-md:w-full max-md:h-auto max-md:right-auto max-md:top-0 max-md:overflow-y-visible">
          <div className="flex w-full flex-col items-start gap-10 relative p-10 pb-24 max-md:w-full max-md:p-[30px] max-md:pb-[30px] max-sm:p-5 max-sm:pb-5 opacity-0 animate-fade-in [animation-delay:200ms]">
            <div className="flex flex-col items-start gap-9 self-stretch relative">
              <EventMeta date={event.date} time={event.time} />
              <EventHeader title={event.title} creator={event.creator} />
            </div>
            
            <EventDescription description={event.description} />
            
            <EventLocation address={event.address} onGetDirections={handleGetDirections} />
          </div>
          
          <div className="fixed bottom-0 right-0 w-[540px] bg-white py-6 border-t border-border max-md:relative max-md:w-full max-md:py-6 max-md:border-t-0 max-sm:py-5">
            <div className="px-10 max-md:px-[30px] max-sm:px-5">
            <EventRegistration 
              eventId={event.id}
              onRegister={checkRegistration} 
              isRegistered={isRegistered}
              onAuthRequired={() => setIsAuthOpen(true)}
              className="opacity-0 animate-fade-in [animation-delay:400ms]" 
            />
            </div>
          </div>
        </aside>
      </main>
      <AuthSheet isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>;
};