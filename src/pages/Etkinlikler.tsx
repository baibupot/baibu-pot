import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, List, Search, Filter, MapPin, Clock, Users } from 'lucide-react';
import EventCard from '@/components/events/EventCard';
import EventCalendar from '@/components/events/EventCalendar';
import { useEvents } from '@/hooks/useSupabaseData';
import PageContainer from '@/components/ui/page-container';
import PageHero from '@/components/ui/page-hero';
import LoadingPage from '@/components/ui/loading-page';
import ErrorState from '@/components/ui/error-state';
import EmptyState from '@/components/ui/empty-state';

const Etkinlikler = () => {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  const { data: events = [], isLoading, error } = useEvents();

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    const matchesType = typeFilter === 'all' || event.event_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getEventTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'atolye': 'Atölye',
      'konferans': 'Konferans',
      'sosyal': 'Sosyal',
      'egitim': 'Eğitim',
      'seminer': 'Seminer'
    };
    return types[type] || type;
  };

  const getStatusLabel = (status: string) => {
    const statuses: Record<string, string> = {
      'upcoming': 'Yaklaşan',
      'ongoing': 'Devam Eden',
      'completed': 'Tamamlandı',
      'cancelled': 'İptal Edildi'
    };
    return statuses[status] || status;
  };

  // Loading state
  if (isLoading) {
    return (
      <PageContainer>
        <LoadingPage 
          title="Etkinlikler Yükleniyor"
          message="Topluluk etkinliklerimizi hazırlıyoruz..."
          icon={Calendar}
        />
      </PageContainer>
    );
  }

  // Error state
  if (error) {
    return (
      <PageContainer>
        <ErrorState 
          title="Etkinlikler Yüklenemedi"
          message="Etkinlik takvimini yüklerken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
          onRetry={() => window.location.reload()}
          variant="network"
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer background="gradient">
      {/* Hero Section */}
      <PageHero
        title="Etkinlik Takvimimiz"
        description="Topluluğumuzun düzenlediği tüm etkinlikleri keşfedin. Atölyeler, konferanslar, sosyal etkinlikler ve daha fazlası için takipte kalın."
        icon={Calendar}
        gradient="purple"
      >
        {events.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mt-8">
            <div className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {events.length}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Toplam Etkinlik</div>
            </div>
            <div className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {events.filter(e => e.status === 'upcoming').length}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Yaklaşan</div>
            </div>
            <div className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {events.filter(e => e.status === 'ongoing').length}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Devam Eden</div>
            </div>
            <div className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {new Set(events.map(e => e.event_type)).size}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Etkinlik Türü</div>
            </div>
          </div>
        )}
      </PageHero>

      {/* Controls */}
      <section className="py-8">
        <div className="space-y-6">
          {/* View Mode Toggle */}
          <div className="flex justify-center">
            <div className="inline-flex rounded-lg border bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-1 shadow-lg">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="flex items-center gap-2"
              >
                <List className="h-4 w-4" />
                Liste Görünümü
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('calendar')}
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Takvim Görünümü
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Etkinlik ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/80 dark:bg-slate-700/80"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-white/80 dark:bg-slate-700/80">
                  <SelectValue placeholder="Durum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  <SelectItem value="upcoming">Yaklaşan</SelectItem>
                  <SelectItem value="ongoing">Devam Eden</SelectItem>
                  <SelectItem value="completed">Tamamlandı</SelectItem>
                  <SelectItem value="cancelled">İptal Edildi</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="bg-white/80 dark:bg-slate-700/80">
                  <SelectValue placeholder="Tür" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Türler</SelectItem>
                  <SelectItem value="atolye">Atölye</SelectItem>
                  <SelectItem value="konferans">Konferans</SelectItem>
                  <SelectItem value="sosyal">Sosyal</SelectItem>
                  <SelectItem value="egitim">Eğitim</SelectItem>
                  <SelectItem value="seminer">Seminer</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                className="flex items-center gap-2 bg-white/80 dark:bg-slate-700/80 hover:bg-white dark:hover:bg-slate-600" 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setTypeFilter('all');
                }}
              >
                <Filter className="h-4 w-4" />
                Filtreleri Temizle
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-12">
        {viewMode === 'list' ? (
          <div className="space-y-6">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <div key={event.id} className="transform transition-all duration-300 hover:scale-[1.02]">
                  <EventCard event={event} />
                </div>
              ))
            ) : (
              <EmptyState
                icon={Calendar}
                title="Etkinlik Bulunamadı"
                description="Aradığınız kriterlere uygun etkinlik bulunmuyor. Lütfen farklı filtreler deneyin."
                variant="search"
                actionLabel="Filtreleri Temizle"
                onAction={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setTypeFilter('all');
                }}
              />
            )}
          </div>
        ) : (
          <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <EventCalendar events={filteredEvents} />
          </div>
        )}
      </section>

      {/* Call to Action */}
      {events.length > 0 && (
        <section className="py-16 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              Etkinlik Önerisi
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Aklınızda bir etkinlik fikri mi var? Bizimle paylaşın, birlikte gerçekleştirelim!
            </p>
            <Button size="lg" variant="outline" className="group">
              <Users className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform duration-200" />
              Etkinlik Öner
            </Button>
          </div>
        </section>
      )}
    </PageContainer>
  );
};

export default Etkinlikler;
