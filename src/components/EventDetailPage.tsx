import React, { useState } from 'react';
import { EventCountdown } from './EventCountdown';
import { EventMeta } from './EventMeta';
import { EventHeader } from './EventHeader';
import { EventDescription } from './EventDescription';
import { EventLocation } from './EventLocation';
import { EventRegistration } from './EventRegistration';

export const EventDetailPage: React.FC = () => {
  const [isRegistered, setIsRegistered] = useState(false);

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

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Host+Grotesk:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <main className="flex h-screen justify-center items-start w-full relative bg-white mx-auto my-0 max-md:flex-col max-md:h-auto">
        <div 
          className="flex flex-col justify-end items-start absolute h-screen pl-[49px] pr-[590px] pt-[calc(100vh-97px)] pb-12 left-0 right-[540px] top-0 animate-fade-zoom-in max-md:relative max-md:w-full max-md:h-[400px] max-md:bg-cover max-md:bg-center max-md:pt-80 max-md:pb-5 max-md:px-5 max-md:right-0 max-sm:h-[300px] max-sm:pt-60 max-sm:pb-[15px] max-sm:px-[15px]"
          style={{
            backgroundImage: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url("https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
          role="img"
          aria-label="Event background image"
        >
          <EventCountdown />
        </div>
        
        <aside className="flex w-[540px] flex-col justify-between items-start absolute h-screen box-border p-10 right-0 top-0 bg-white max-md:relative max-md:w-full max-md:h-auto max-md:p-[30px] max-md:right-auto max-md:top-0 max-sm:p-5">
          <div className="flex w-[455px] flex-col items-start gap-10 relative max-md:w-full opacity-0 animate-fade-in [animation-delay:200ms]">
            <div className="flex flex-col items-start gap-9 self-stretch relative">
              <EventMeta 
                date="THURSDAY, OCTOBER 30"
                time="16:30 - 18:30 CET"
              />
              <EventHeader 
                title="Cocktails with a Side of Sounds"
                creator="EBBA STOPPELBURG"
              />
            </div>
            
            <EventDescription 
              description="Experience the perfect blend of lakeside serenity, culture, and local charm. Explore stunning waterfronts, discover top wineries and galleries, and savour local dining—your ultimate destination for relaxation, discovery, and adventure."
            />
            
            <EventLocation 
              address="ADDRESS GOES HERE"
              mapImageUrl="https://api.builder.io/api/v1/image/assets/TEMP/332f98a4dad5cb2efedd96ff4032a25b1c4d8e3a?width=910"
              onGetDirections={handleGetDirections}
            />
          </div>
          
          <EventRegistration 
            onRegister={handleRegister}
            isRegistered={isRegistered}
            className="opacity-0 animate-fade-in [animation-delay:400ms]"
          />
        </aside>
      </main>
    </>
  );
};
