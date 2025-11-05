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
        <div className="flex gap-4 animate-scroll-left">
          {doubledEvents.map((event, index) => (
            <div
              key={`${event.id}-${index}`}
              onClick={() => navigate(`/?eventId=${event.id}`)}
              className="relative flex-shrink-0 w-[400px] h-[300px] cursor-pointer group overflow-hidden"
            >
              <img
                src={event.background_image_url}
                alt={event.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-xl font-medium mb-1 tracking-tight">{event.title}</h3>
                <p className="text-sm text-white/80 mb-1">{event.address}</p>
                <p className="text-xs text-white/60 uppercase tracking-wider">{event.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
