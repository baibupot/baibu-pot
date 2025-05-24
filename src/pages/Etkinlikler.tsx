
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

const Etkinlikler = () => {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Mock data for events
  const events = [
    {
      id: '1',
      title: 'Mindfulness ve Stres Yönetimi Atölyesi',
      description: 'Günlük yaşamda stres yönetimi teknikleri üzerine interaktif bir atölye.',
      event_date: '2024-03-25T14:00:00+03:00',
      end_date: '2024-03-25T16:00:00+03:00',
      location: 'Psikoloji Bölümü Konferans Salonu',
      event_type: 'atolye',
      max_participants: 30,
      registration_required: true,
      featured_image: null,
      status: 'upcoming',
      slug: 'mindfulness-atolyesi'
    },
    {
      id: '2',
      title: 'Psikoloji Kariyer Günleri',
      description: 'Psikoloji alanında kariyer fırsatları ve uzman konuşmacılarla buluşma.',
      event_date: '2024-04-02T09:00:00+03:00',
      end_date: '2024-04-02T17:00:00+03:00',
      location: 'Rektörlük Konferans Salonu',
      event_type: 'konferans',
      max_participants: 100,
      registration_required: true,
      featured_image: null,
      status: 'upcoming',
      slug: 'kariyer-gunleri-2024'
    },
    {
      id: '3',
      title: 'Kitap Kulübü Buluşması',
      description: 'Aylık kitap tartışması ve sosyal etkileşim etkinliği.',
      event_date: '2024-04-10T18:30:00+03:00',
      end_date: '2024-04-10T20:00:00+03:00',
      location: 'Kütüphane Toplantı Salonu',
      event_type: 'sosyal',
      max_participants: 20,
      registration_required: false,
      featured_image: null,
      status: 'upcoming',
      slug: 'kitap-kulubu-nisan'
    }
  ];

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

              <Button variant="outline" className="flex items-center gap-2">
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
