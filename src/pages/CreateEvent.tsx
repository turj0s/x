import { useState, useRef, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useGooglePlacesAutocomplete } from '@/hooks/useGooglePlacesAutocomplete';

const CreateEvent = () => {
  const [eventName, setEventName] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const locationInputRef = useRef<HTMLInputElement>(null);
  const { onPlaceSelected } = useGooglePlacesAutocomplete(locationInputRef);

  useEffect(() => {
    onPlaceSelected((place) => {
      const address = place.formatted_address || place.name || '';
      setLocation(address);
    });
  }, [onPlaceSelected]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    console.log({
      eventName,
      startDate,
      startTime,
      endDate,
      endTime,
      location,
      description,
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto pt-32 pb-16 px-8">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          {/* Left: Image Upload */}
          <div className="flex items-start justify-start">
            <label className="w-full aspect-[4/3] border border-black bg-[#D9D9D9] flex items-center justify-center cursor-pointer hover:bg-[#CECECE] transition-colors">
              {imagePreview ? (
                <img src={imagePreview} alt="Event preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-black text-[11px] font-medium uppercase tracking-wider">
                  ADD IMAGE
                </span>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
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
                className="flex h-[50px] justify-center items-center gap-2.5 border relative px-2.5 py-3.5 border-solid transition-all duration-300 ease-in-out w-[calc(100%-50px)] z-10 bg-[#1A1A1A] border-[#1A1A1A] group-hover:w-full group-hover:bg-[#FA76FF] group-hover:border-[#FA76FF]"
                aria-label="Create event"
              >
                <span className="text-white text-[13px] font-normal uppercase relative transition-colors duration-300 group-hover:text-black">
                  CREATE EVENT
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
  );
};

export default CreateEvent;
