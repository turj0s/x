import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface Event {
  id: string;
  title: string;
  creator: string;
  description: string;
  date: string;
  time: string;
  address: string;
  background_image_url: string;
  map_image_url: string;
  target_date: string;
}

const Admin = () => {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    fetchEvents();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
    }
    setLoading(false);
  };

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setEvents(data || []);
      if (data && data.length > 0) {
        setSelectedEvent(data[0]);
      }
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    const { error } = await supabase
      .from('events')
      .update({
        title: selectedEvent.title,
        creator: selectedEvent.creator,
        description: selectedEvent.description,
        date: selectedEvent.date,
        time: selectedEvent.time,
        address: selectedEvent.address,
        background_image_url: selectedEvent.background_image_url,
        map_image_url: selectedEvent.map_image_url,
        target_date: selectedEvent.target_date,
      })
      .eq('id', selectedEvent.id);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Event updated successfully',
      });
      fetchEvents();
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-normal text-[#1A1A1A] tracking-[-0.02em]">
            Event CMS
          </h1>
          <Button onClick={handleSignOut} variant="outline">
            Sign Out
          </Button>
        </div>

        {selectedEvent && (
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="text-[#1A1A1A] text-sm font-normal uppercase mb-2 block">
                Event Title
              </label>
              <Input
                value={selectedEvent.title}
                onChange={(e) =>
                  setSelectedEvent({ ...selectedEvent, title: e.target.value })
                }
                className="border-[#1A1A1A]"
              />
            </div>

            <div>
              <label className="text-[#1A1A1A] text-sm font-normal uppercase mb-2 block">
                Creator
              </label>
              <Input
                value={selectedEvent.creator}
                onChange={(e) =>
                  setSelectedEvent({ ...selectedEvent, creator: e.target.value })
                }
                className="border-[#1A1A1A]"
              />
            </div>

            <div>
              <label className="text-[#1A1A1A] text-sm font-normal uppercase mb-2 block">
                Description
              </label>
              <Textarea
                value={selectedEvent.description}
                onChange={(e) =>
                  setSelectedEvent({ ...selectedEvent, description: e.target.value })
                }
                className="border-[#1A1A1A] min-h-[120px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[#1A1A1A] text-sm font-normal uppercase mb-2 block">
                  Date
                </label>
                <Input
                  value={selectedEvent.date}
                  onChange={(e) =>
                    setSelectedEvent({ ...selectedEvent, date: e.target.value })
                  }
                  className="border-[#1A1A1A]"
                />
              </div>

              <div>
                <label className="text-[#1A1A1A] text-sm font-normal uppercase mb-2 block">
                  Time
                </label>
                <Input
                  value={selectedEvent.time}
                  onChange={(e) =>
                    setSelectedEvent({ ...selectedEvent, time: e.target.value })
                  }
                  className="border-[#1A1A1A]"
                />
              </div>
            </div>

            <div>
              <label className="text-[#1A1A1A] text-sm font-normal uppercase mb-2 block">
                Address
              </label>
              <Input
                value={selectedEvent.address}
                onChange={(e) =>
                  setSelectedEvent({ ...selectedEvent, address: e.target.value })
                }
                className="border-[#1A1A1A]"
              />
            </div>

            <div>
              <label className="text-[#1A1A1A] text-sm font-normal uppercase mb-2 block">
                Background Image URL
              </label>
              <Input
                value={selectedEvent.background_image_url}
                onChange={(e) =>
                  setSelectedEvent({
                    ...selectedEvent,
                    background_image_url: e.target.value,
                  })
                }
                className="border-[#1A1A1A]"
              />
            </div>

            <div>
              <label className="text-[#1A1A1A] text-sm font-normal uppercase mb-2 block">
                Map Image URL
              </label>
              <Input
                value={selectedEvent.map_image_url}
                onChange={(e) =>
                  setSelectedEvent({ ...selectedEvent, map_image_url: e.target.value })
                }
                className="border-[#1A1A1A]"
              />
            </div>

            <div>
              <label className="text-[#1A1A1A] text-sm font-normal uppercase mb-2 block">
                Target Date (YYYY-MM-DD HH:MM:SS)
              </label>
              <Input
                type="datetime-local"
                value={selectedEvent.target_date.slice(0, 16)}
                onChange={(e) =>
                  setSelectedEvent({ ...selectedEvent, target_date: e.target.value })
                }
                className="border-[#1A1A1A]"
              />
            </div>

            <Button type="submit" className="w-full bg-[#1A1A1A] text-white hover:bg-opacity-90">
              Save Changes
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Admin;
