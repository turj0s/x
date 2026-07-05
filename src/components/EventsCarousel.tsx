import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Event {
  id: string;
  title: string;
  background_image_url: string;
  address: string;
  date: string;
  time: string;
}

export const EventsCarousel = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('id, title, background_image_url, address, date, time')
        .order('target_date', { ascending: false })
        .limit(10);

      if (data && !error) {
        setEvents(data);
      }
    };

    fetchEvents();
  }, []);

  if (events.length === 0) return null;

  // Duplicate the events array exactly twice for seamless loop
  const multipliedEvents = [...events, ...events];

  return (
    <div className="w-full overflow-hidden py-12 pb-20 md:pb-24 bg-background">
      <div className="relative overflow-hidden">
        <div className="flex gap-px w-max animate-scroll-left-fast will-change-[transform]">
          {multipliedEvents.map((event, index) => (
            <div
              key={`${event.id}-${index}`}
              className="relative flex-shrink-0 w-[65vw] md:w-[calc(40vw-0.5px)] aspect-[3/4] max-h-[900px] overflow-hidden animate-fade-in bg-[#f4f4f4]"
              style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'both' }}
            >
              <img
                src={event.background_image_url}
                alt={event.title}
                width={800}
                height={1000}
                className="w-full h-full object-contain"
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : "auto"}
                decoding={index === 0 ? "sync" : "async"}
              />

              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 bg-gradient-to-t from-black/60 to-transparent text-white">
                <h3 className="text-xl md:text-2xl font-medium tracking-tight">{event.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
