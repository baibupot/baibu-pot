import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEvents } from '@/hooks/useSupabaseData';
import { 
  getEventTypeLabel, 
  getEventTypeColor,
  type EventType 
} from '@/constants/eventConstants';

const EventsSection = () => {
  const { data: events = [], isLoading } = useEvents();
  
  // Gelecek etkinlikleri filtrele ve ilk 3'ünü al
  const upcomingEvents = events
    .filter(event => event.status === 'upcoming' && new Date(event.event_date) > new Date())
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
    .slice(0, 3);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format price display - DİĞER SAYFALARDA OLDUĞU GİBİ
  const formatPrice = (price?: number, currency: string = 'TL') => {
    if (!price || price === 0) return '🆓 Ücretsiz';
    return `💰 ${price.toLocaleString('tr-TR')} ${currency}`;
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Etkinlikler yükleniyor...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            🎉 Gelecek Etkinlik Takvimimiz
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            🧠 Psikoloji alanında düzenlediğimiz atölyeler, konferanslar ve sosyal etkinliklere katılın.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {upcomingEvents.map((event, index) => (
            <Link key={event.id} to={`/etkinlikler/${event.slug}`} className="block">
              <Card 
                variant="modern" 
                className="group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer animate-fade-in-up interactive-scale"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Badge className={getEventTypeColor(event.event_type as EventType)}>
                      {getEventTypeLabel(event.event_type as EventType)}
                    </Badge>
                    <Badge className={`${event.price && event.price > 0 ? 'bg-green-600' : 'bg-blue-600'} text-white`}>
                      {formatPrice(event.price, event.currency)}
                    </Badge>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-200">
                    {event.title}
                  </h3>
                  
                  <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center">
                      <span className="font-medium w-16">Tarih:</span>
                      <span>{formatDate(event.event_date)}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium w-16">Saat:</span>
                      <span>{formatTime(event.event_date)}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-start">
                        <span className="font-medium w-16 mt-0.5">Yer:</span>
                        <span className="flex-1">{event.location}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                
                <CardFooter className="px-6 pb-6">
                  {event.registration_required ? (
                    <Button 
                      size="sm" 
                      className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white interactive-scale group"
                    >
                      🎯 Kayıt Ol
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="w-full interactive-scale group"
                    >
                      👀 Detayları Gör
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>

        {upcomingEvents.length === 0 && (
          <div className="text-center mb-12">
            <p className="text-slate-600 dark:text-slate-400">
              Şu anda yaklaşan etkinlik bulunmuyor.
            </p>
          </div>
        )}

        <div className="text-center animate-fade-in-up animation-delay-500">
          <Button asChild size="lg" variant="outline" className="interactive-scale group">
            <Link to="/etkinlikler" className="flex items-center gap-2">
              🎪 Tüm Etkinlikler
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
