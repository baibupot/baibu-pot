
import React from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import NewsSection from '@/components/NewsSection';
import EventsSection from '@/components/EventsSection';
import MagazineSection from '@/components/MagazineSection';
import SponsorsSection from '@/components/SponsorsSection';

const Index = () => {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
        <Header />
        <main>
          <HeroSection />
          <NewsSection />
          <EventsSection />
          <MagazineSection />
          <SponsorsSection />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default Index;
