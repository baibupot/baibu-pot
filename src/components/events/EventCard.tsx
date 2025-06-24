import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Clock, MapPin, Users, ExternalLink, Image, Eye } from 'lucide-react';
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
  registration_link?: string;
  featured_image?: string;
  gallery_images?: string[];
  status: string;
  slug: string;
  price?: number;
  currency?: string;
  latitude?: number;
  longitude?: number;
}

interface EventCardProps {
  event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const [showGallery, setShowGallery] = useState(false);

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
            <div className="w-full sm:w-32 h-20 rounded-lg overflow-hidden">
              <img 
                src={event.featured_image} 
                alt={event.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
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
          
          {event.price && event.price > 0 && (
            <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
              <span>💰 {event.price} {event.currency || 'TL'}</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" className="flex-1" asChild>
            <Link to={`/etkinlikler/${event.slug}`}>
              <Eye className="h-4 w-4 mr-2" />
              Detayları Görüntüle
            </Link>
          </Button>
          
          {event.gallery_images && event.gallery_images.length > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowGallery(true)}
              className="flex items-center gap-2"
            >
              <Image className="h-4 w-4" />
              Galeri ({event.gallery_images.length})
            </Button>
          )}
          
          {event.registration_required && event.status === 'upcoming' && (
            <Button 
              className="flex-1 flex items-center gap-2"
              onClick={() => {
                if (event.registration_link) {
                  window.open(event.registration_link, '_blank');
                } else {
                  alert('Kayıt linki henüz belirlenmemiş. Lütfen organizatörlerle iletişime geçin.');
                }
              }}
            >
              Kayıt Ol
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Galeri Modal */}
        <Dialog open={showGallery} onOpenChange={setShowGallery}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{event.title} - Galeri</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {event.gallery_images?.map((imageUrl, index) => (
                <div key={index} className="relative group">
                  <img
                    src={imageUrl}
                    alt={`${event.title} galeri ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg hover:scale-105 transition-transform cursor-pointer"
                    onClick={() => window.open(imageUrl, '_blank')}
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg flex items-center justify-center">
                    <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default EventCard;
