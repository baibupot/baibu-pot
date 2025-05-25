
import React, { useState } from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, List, Search, Filter, MapPin, Clock, Users } from 'lucide-react';
import EventCard from '@/components/events/EventCard';
import EventCalendar from '@/components/events/EventCalendar';
import { useEvents } from '@/hooks/useSupabaseData';

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

  if (isLoading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <div className="text-center">Yükleniyor...</div>
          </main>
          <Footer />
        </div>
      </ThemeProvider>
    );
  }

  if (error) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <div className="text-center text-red-500">Etkinlikler yüklenirken bir hata oluştu.</div>
          </main>
          <Footer />
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
        <Header />
        <main className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Etkinlik Takvimimiz
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Topluluğumuzun düzenlediği tüm etkinlikleri keşfedin. Atölyeler, konferanslar, 
              sosyal etkinlikler ve daha fazlası için takipte kalın.
            </p>
          </div>

          {/* Controls */}
          <div className="mb-8 space-y-4">
            {/* View Mode Toggle */}
            <div className="flex justify-center">
              <div className="inline-flex rounded-lg border bg-muted p-1">
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Etkinlik ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
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
                <SelectTrigger>
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

              <Button variant="outline" className="flex items-center gap-2" onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setTypeFilter('all');
              }}>
                <Filter className="h-4 w-4" />
                Filtreleri Temizle
              </Button>
            </div>
          </div>

          {/* Content */}
          {viewMode === 'list' ? (
            <div className="space-y-6">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-slate-500 dark:text-slate-400">
                    Aramanızla eşleşen etkinlik bulunamadı.
                  </p>
                </Card>
              )}
            </div>
          ) : (
            <EventCalendar events={filteredEvents} />
          )}
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default Etkinlikler;
