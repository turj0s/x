import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { MapPin, ArrowRight } from 'lucide-react';

const CreateEvent = () => {
  const [eventName, setEventName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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

            {/* Start/End Date/Time Container with connecting line */}
            <div className="relative">
              {/* Vertical connecting line */}
              <div className="absolute left-[18px] top-[46px] w-[2px] h-[24px] bg-black"></div>
              
              {/* Start Date/Time */}
              <div className="grid grid-cols-[100px_1fr_100px] gap-0 border border-black mb-6">
                <div className="flex items-center justify-start gap-2 border-r border-black px-3 py-3">
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                  <span className="text-[11px] font-medium">Start</span>
                </div>
                <input
                  type="text"
                  placeholder="Thu, 28 Oct"
                  className="px-4 py-3 text-[11px] text-black border-r border-black focus:outline-none placeholder:text-[#C4C4C4]"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="15:00"
                  className="px-4 py-3 text-[11px] text-black text-center focus:outline-none placeholder:text-[#C4C4C4]"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>

              {/* End Date/Time */}
              <div className="grid grid-cols-[100px_1fr_100px] gap-0 border border-black">
                <div className="flex items-center justify-start gap-2 border-r border-black px-3 py-3">
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                  <span className="text-[11px] font-medium">End</span>
                </div>
                <input
                  type="text"
                  placeholder="Thu, 28 Oct"
                  className="px-4 py-3 text-[11px] text-black border-r border-black focus:outline-none placeholder:text-[#C4C4C4]"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="16:00"
                  className="px-4 py-3 text-[11px] text-black text-center focus:outline-none placeholder:text-[#C4C4C4]"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            {/* Location */}
            <input
              type="text"
              placeholder="Add event location"
              className="w-full px-4 py-3 text-[11px] text-black border border-black focus:outline-none placeholder:text-[#C4C4C4]"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />

            {/* Description */}
            <textarea
              placeholder="Add description"
              rows={8}
              className="w-full px-4 py-3 text-[11px] text-black border border-black focus:outline-none resize-none placeholder:text-[#C4C4C4]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            {/* Submit Button */}
            <div className="flex items-stretch gap-0 mt-8">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-black text-white py-5 text-[11px] font-medium uppercase tracking-wider hover:bg-[#1A1A1A] transition-colors"
              >
                CREATE EVENT
              </button>
              <button
                onClick={handleSubmit}
                className="w-[56px] border border-l-0 border-black flex items-center justify-center bg-white hover:bg-gray-50 transition-colors"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;
