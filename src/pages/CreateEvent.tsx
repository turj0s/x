import { useState, useRef, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useGooglePlacesAutocomplete } from '@/hooks/useGooglePlacesAutocomplete';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';
import { AuthSheet } from '@/components/AuthSheet';

const CreateEvent = () => {
  const [eventName, setEventName] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const locationInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { onPlaceSelected } = useGooglePlacesAutocomplete(locationInputRef);

  useEffect(() => {
    // Check auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        setShowAuthModal(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    onPlaceSelected((place) => {
      const address = place.formatted_address || place.name || '';
      setLocation(address);
    });
  }, [onPlaceSelected]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    // Check if user is authenticated first
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    // Validate all fields
    if (!eventName.trim()) {
      toast.error('Please enter an event name');
      return;
    }
    if (!startDate) {
      toast.error('Please select a start date');
      return;
    }
    if (!startTime.trim()) {
      toast.error('Please enter a start time');
      return;
    }
    if (!endDate) {
      toast.error('Please select an end date');
      return;
    }
    if (!endTime.trim()) {
      toast.error('Please enter an end time');
      return;
    }
    if (!location.trim()) {
      toast.error('Please enter an event location');
      return;
    }
    if (!description.trim()) {
      toast.error('Please enter an event description');
      return;
    }
    if (!imageFile) {
      toast.error('Please add an event image');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload image to storage
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(filePath);

      // Create target_date from start date and time
      const targetDate = new Date(startDate);
      const [hours, minutes] = startTime.split(':');
      targetDate.setHours(parseInt(hours) || 0, parseInt(minutes) || 0);

      // Format date and time strings
      const dateStr = format(startDate, 'MMMM dd, yyyy');
      const timeStr = `${startTime} - ${endTime}`;

      // Get creator name from user metadata or email
      const creatorName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous';

      // Insert event into database
      const { error: insertError } = await supabase
        .from('events')
        .insert({
          title: eventName,
          description: description,
          date: dateStr,
          time: timeStr,
          address: location,
          background_image_url: publicUrl,
          target_date: targetDate.toISOString(),
          creator: creatorName,
        });

      if (insertError) throw insertError;

      toast.success('Event created successfully!');
      navigate('/my-events');
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AuthSheet isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      
      <div className="min-h-screen bg-white">
        <Navbar />
      
      <div className="max-w-7xl mx-auto pt-32 pb-16 px-8">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          {/* Left: Image Upload */}
          <div className="flex flex-col gap-4">
            <label className="w-full aspect-[4/3] border border-black bg-[#D9D9D9] flex items-center justify-center cursor-pointer hover:bg-[#CECECE] transition-colors">
              {imagePreview ? (
                <img src={imagePreview} alt="Event preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-black text-[11px] font-medium uppercase tracking-wider">
                  ADD IMAGE
                </span>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
            
            {imagePreview && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-3 text-[13px] font-medium uppercase tracking-wider border border-black bg-white hover:bg-black hover:text-white transition-colors"
              >
                Change image
              </button>
            )}
          </div>

          {/* Right: Form Fields */}
          <div className="space-y-6">
            {/* Event Name Input */}
            <input
              type="text"
              placeholder="Event name"
              className="w-full text-black text-[48px] md:text-[56px] font-medium leading-none mb-8 focus:outline-none bg-transparent border-none p-0 placeholder:text-[#C4C4C4]"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
            />

            {/* Start/End Date/Time Container */}
            <div className="relative">
              {/* Start Date/Time */}
              <div className="grid grid-cols-[100px_1fr_100px] gap-0 border border-black mb-6">
                <div className="flex items-center justify-start gap-2 border-r border-black px-3 py-3">
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                  <span className="text-[17px] font-medium">Start</span>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className={cn(
                        "px-4 py-3 text-[17px] text-left border-r border-black focus:outline-none bg-white",
                        !startDate && "text-[#C4C4C4]"
                      )}
                    >
                      {startDate ? format(startDate, "EEE, dd MMM") : "Thu, 28 Oct"}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <input
                  type="text"
                  placeholder="15:00"
                  className="px-4 py-3 text-[17px] text-black text-center focus:outline-none placeholder:text-[#C4C4C4]"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>

              {/* End Date/Time */}
              <div className="grid grid-cols-[100px_1fr_100px] gap-0 border border-black">
                <div className="flex items-center justify-start gap-2 border-r border-black px-3 py-3">
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                  <span className="text-[17px] font-medium">End</span>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className={cn(
                        "px-4 py-3 text-[17px] text-left border-r border-black focus:outline-none bg-white",
                        !endDate && "text-[#C4C4C4]"
                      )}
                    >
                      {endDate ? format(endDate, "EEE, dd MMM") : "Thu, 28 Oct"}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <input
                  type="text"
                  placeholder="16:00"
                  className="px-4 py-3 text-[17px] text-black text-center focus:outline-none placeholder:text-[#C4C4C4]"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            {/* Location */}
            <input
              ref={locationInputRef}
              type="text"
              placeholder="Add event location"
              className="w-full px-4 py-3 text-[17px] text-black border border-black focus:outline-none placeholder:text-[#C4C4C4]"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />

            {/* Description */}
            <textarea
              placeholder="Add description"
              rows={8}
              className="w-full px-4 py-3 text-[17px] text-black border border-black focus:outline-none resize-none placeholder:text-[#C4C4C4]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            {/* Submit Button */}
            <div className="group flex items-center self-stretch relative overflow-hidden mt-8">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex h-[50px] justify-center items-center gap-2.5 border relative px-2.5 py-3.5 border-solid transition-all duration-300 ease-in-out w-[calc(100%-50px)] z-10 bg-[#1A1A1A] border-[#1A1A1A] group-hover:w-full group-hover:bg-[#FA76FF] group-hover:border-[#FA76FF] disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Create event"
              >
                <span className="text-white text-[13px] font-normal uppercase relative transition-colors duration-300 group-hover:text-black">
                  {isSubmitting ? 'CREATING...' : 'CREATE EVENT'}
                </span>
                <svg 
                  width="12" 
                  height="12" 
                  viewBox="0 0 12 12" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute right-[18px] opacity-0 transition-all duration-300 ease-in-out group-hover:opacity-100"
                  aria-hidden="true"
                >
                  <path d="M0.857178 6H10.3929" stroke="#1A1A1A" strokeWidth="1.5" />
                  <path d="M6.39282 10L10.3928 6L6.39282 2" stroke="#1A1A1A" strokeWidth="1.5" />
                </svg>
              </button>
              <div className="flex w-[50px] h-[50px] justify-center items-center border absolute right-0 bg-white rounded-[99px] border-solid border-[#1A1A1A] transition-all duration-300 ease-in-out group-hover:opacity-0 group-hover:scale-50 pointer-events-none z-0">
                <svg 
                  width="12" 
                  height="12" 
                  viewBox="0 0 12 12" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="arrow-icon"
                  aria-hidden="true"
                >
                  <path d="M0.857178 6H10.3929" stroke="#1A1A1A" strokeWidth="1.5" />
                  <path d="M6.39282 10L10.3928 6L6.39282 2" stroke="#1A1A1A" strokeWidth="1.5" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default CreateEvent;
