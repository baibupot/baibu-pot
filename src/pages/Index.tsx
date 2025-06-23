import React from 'react';
import PageContainer from '@/components/ui/page-container';
import HeroSection from '@/components/HeroSection';
import NewsSection from '@/components/NewsSection';
import EventsSection from '@/components/EventsSection';
import MagazineSection from '@/components/MagazineSection';
import SponsorsSection from '@/components/SponsorsSection';

const Index = () => {
  return (
    <PageContainer background="default">
      <HeroSection />
      <NewsSection />
      <EventsSection />
      <MagazineSection />
      <SponsorsSection />
    </PageContainer>
  );
};

export default Index;
