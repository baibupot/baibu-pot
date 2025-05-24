import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  end_date?: string;
  location?: string;
  event_type: string;
  max_participants?: number;
  registration_required: boolean;
  featured_image?: string;
  status: string;
  slug: string;
}

interface EventCardProps {
  event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'atolye': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'konferans': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'sosyal': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'egitim': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'seminer': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'upcoming': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'ongoing': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'completed': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
      'cancelled': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

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

  const formatEventDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy, HH:mm', { locale: tr });
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge className={getEventTypeColor(event.event_type)}>
                {getEventTypeLabel(event.event_type)}
              </Badge>
              <Badge className={getStatusColor(event.status)}>
                {getStatusLabel(event.status)}
              </Badge>
            </div>
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
              {event.title}
            </CardTitle>
          </div>
          {event.featured_image && (
            <div className="w-full sm:w-32 h-20 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
              <span className="text-slate-500 dark:text-slate-400 text-sm">Görsel</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-slate-600 dark:text-slate-300 mb-4 line-clamp-3">
          {event.description}
        </p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <Calendar className="h-4 w-4" />
            <span>{formatEventDate(event.event_date)}</span>
            {event.end_date && (
              <>
                <span>-</span>
                <span>{format(new Date(event.end_date), 'HH:mm', { locale: tr })}</span>
              </>
            )}
          </div>
          
          {event.location && (
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <MapPin className="h-4 w-4" />
              <span>{event.location === 'Bolu' ? 'BAİBÜ Gölköy Kampüsü, Psikoloji Bölümü, Bolu (40.71388, 31.51442)' : event.location}</span>
            </div>
          )}
          
          {event.max_participants && (
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <Users className="h-4 w-4" />
              <span>Maksimum {event.max_participants} katılımcı</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" className="flex-1">
            Detayları Görüntüle
          </Button>
          {event.registration_required && event.status === 'upcoming' && (
            <Button className="flex-1 flex items-center gap-2">
              Kayıt Ol
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard;
