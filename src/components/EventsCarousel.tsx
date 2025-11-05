import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface Event {
  id: string;
  title: string;
  background_image_url: string;
  address: string;
  date: string;
}

export const EventsCarousel = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('id, title, background_image_url, address, date')
        .order('target_date', { ascending: false })
        .limit(10);

      if (data && !error) {
        setEvents(data);
      }
    };

    fetchEvents();
  }, []);

  if (events.length === 0) return null;

  // Double the events array for seamless infinite scroll
  const doubledEvents = [...events, ...events];

  return (
    <div className="w-full overflow-hidden py-12 bg-background">
      <div className="relative">
        <div className="flex animate-scroll-left-fast">
          {doubledEvents.map((event, index) => (
            <div
              key={`${event.id}-${index}`}
              onClick={() => navigate(`/?eventId=${event.id}`)}
              className="relative flex-shrink-0 w-[90vw] sm:w-[70vw] md:w-[50vw] lg:w-[40vw] h-[400px] md:h-[500px] cursor-pointer group overflow-hidden"
            >
              <img
                src={event.background_image_url}
                alt={event.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <h3 className="text-2xl md:text-3xl font-medium mb-2 tracking-tight">{event.title}</h3>
                <p className="text-base md:text-lg text-white/80 mb-2">{event.address}</p>
                <p className="text-sm text-white/60 uppercase tracking-wider">{event.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
