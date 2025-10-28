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
    <div className="min-h-screen bg-[#2A2A2A]">
      <Navbar />
      
      <div className="pt-24 px-4 md:px-8">
        <h1 className="text-white text-[11px] font-medium uppercase mb-8 tracking-wider">
          create my event
        </h1>

        <div className="bg-white p-8 md:p-12">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-0 mb-12">
            <div className="bg-black text-white h-[34px] px-3 flex items-center text-[11px] font-medium uppercase border border-black">
              GW EVENT PLANNER
            </div>
            <div className="bg-white text-black h-[34px] px-3 flex items-center text-[11px] font-medium uppercase border border-l-0 border-black">
              DISCOVER
            </div>
            <div className="bg-white text-black h-[34px] px-3 flex items-center text-[11px] font-medium uppercase border border-l-0 border-black">
              CREATE EVENT
            </div>
            <div className="bg-white text-black h-[34px] px-3 flex items-center text-[11px] font-medium uppercase border border-l-0 border-black">
              MY EVENTS
            </div>
          </div>

          {/* Form Content */}
          <div className="grid md:grid-cols-2 gap-12">
            {/* Left: Image Upload */}
            <div className="flex items-center justify-center">
              <label className="w-full aspect-[4/3] border-2 border-black bg-[#D9D9D9] flex items-center justify-center cursor-pointer hover:bg-[#C9C9C9] transition-colors">
                {imagePreview ? (
                  <img src={imagePreview} alt="Event preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[#666666] text-[11px] font-medium uppercase tracking-wider">
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
              <h2 className="text-[#C4C4C4] text-[40px] md:text-[56px] font-normal leading-none mb-8">
                Event name
              </h2>

              {/* Start Date/Time */}
              <div className="grid grid-cols-[80px_1fr_80px] gap-0 border border-black">
                <div className="flex items-center justify-center border-r border-black px-2 py-3">
                  <MapPin className="w-4 h-4" />
                  <span className="ml-1 text-[11px] font-medium">Start</span>
                </div>
                <input
                  type="text"
                  placeholder="Thu, 28 Oct"
                  className="px-3 py-3 text-[11px] border-r border-black focus:outline-none"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="15:00"
                  className="px-3 py-3 text-[11px] text-center focus:outline-none"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>

              {/* End Date/Time */}
              <div className="grid grid-cols-[80px_1fr_80px] gap-0 border border-black">
                <div className="flex items-center justify-center border-r border-black px-2 py-3">
                  <MapPin className="w-4 h-4" />
                  <span className="ml-1 text-[11px] font-medium">End</span>
                </div>
                <input
                  type="text"
                  placeholder="Thu, 28 Oct"
                  className="px-3 py-3 text-[11px] border-r border-black focus:outline-none"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="16:00"
                  className="px-3 py-3 text-[11px] text-center focus:outline-none"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>

              {/* Location */}
              <input
                type="text"
                placeholder="Add event location"
                className="w-full px-4 py-3 text-[11px] border border-black focus:outline-none placeholder:text-[#C4C4C4]"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />

              {/* Description */}
              <textarea
                placeholder="Add description"
                rows={6}
                className="w-full px-4 py-3 text-[11px] border border-black focus:outline-none resize-none placeholder:text-[#C4C4C4]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              {/* Submit Button */}
              <div className="flex items-center gap-0">
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-black text-white py-4 text-[11px] font-medium uppercase tracking-wider hover:bg-[#1A1A1A] transition-colors"
                >
                  CREATE EVENT
                </button>
                <div className="w-[56px] h-[56px] border border-l-0 border-black flex items-center justify-center bg-white">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;
