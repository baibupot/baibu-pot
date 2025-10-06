import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Calendar, Clock, MapPin, Users, ExternalLink, Image, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { 
  getEventTypeLabel, 
  getEventStatusLabel, 
  getEventTypeColor, 
  getEventStatusColor,
  type EventType,
  type EventStatus 
} from '@/constants/eventConstants';

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
  has_custom_form?: boolean;
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
  const navigate = useNavigate();

  // Event type ve status helper functions artık constants'tan geliyor

  const formatEventDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy, HH:mm', { locale: tr });
  };

  const formatMobileDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM, HH:mm', { locale: tr });
  };

  // Format date range helper
  const formatDateRange = (startDate: string, endDate?: string) => {
    const start = new Date(startDate);
    if (!endDate || startDate === endDate) {
      return null; // Single date, no range
    }
    
    const end = new Date(endDate);
    
    // Same day, different times
    if (start.toDateString() === end.toDateString()) {
      const endTime = format(end, 'HH:mm', { locale: tr });
      return `- ${endTime}`;
    }
    
    // Different days
    const endDay = format(end, 'dd MMM', { locale: tr });
    return `- ${endDay}`;
  };

  // Format price display
  const formatPrice = (price?: number, currency: string = 'TL') => {
    if (!price || price === 0) return '🆓 Ücretsiz';
    return `💰 ${price.toLocaleString('tr-TR')} ${currency}`;
  };

  return (
      <Card className="group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
      {/* Mobile-First Header with Image */}
          {event.featured_image && (
        <div className="relative h-48 sm:h-56 md:h-40 w-full overflow-hidden rounded-t-xl">
              <img 
                src={event.featured_image} 
                alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
          {/* Status overlay */}
          <div className="absolute top-3 left-3">
            <Badge className={`${getEventStatusColor(event.status as EventStatus)} shadow-lg`}>
              {getEventStatusLabel(event.status as EventStatus)}
            </Badge>
          </div>
          {/* Price overlay */}
          <div className="absolute top-3 right-3">
            <Badge className={`${event.price && event.price > 0 ? 'bg-green-600' : 'bg-blue-600'} text-white shadow-lg`}>
              {formatPrice(event.price, event.currency)}
            </Badge>
          </div>
        </div>
      )}

      <CardHeader className="pb-4">
        <div className="space-y-3">
          {/* Event Type Badge - Always Visible */}
          <div className="flex items-center justify-between">
            <Badge className={`${getEventTypeColor(event.event_type as EventType)} text-sm px-3 py-1`}>
              {getEventTypeLabel(event.event_type as EventType)}
            </Badge>
            {!event.featured_image && (
              <Badge className={getEventStatusColor(event.status as EventStatus)}>
                {getEventStatusLabel(event.status as EventStatus)}
              </Badge>
            )}
          </div>
          
          {/* Title - Mobile Optimized */}
          <CardTitle className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight">
            {event.title}
          </CardTitle>

          {/* Date & Time - Prominent on Mobile */}
          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm sm:text-base font-semibold text-blue-900 dark:text-blue-100">
                <span className="sm:hidden">
                  {formatMobileDate(event.event_date)}
                  {formatDateRange(event.event_date, event.end_date)}
                </span>
                <span className="hidden sm:inline">
                  {formatEventDate(event.event_date)}
                  {formatDateRange(event.event_date, event.end_date)}
                </span>
              </div>
              {event.end_date && formatDateRange(event.event_date, event.end_date) && (
                <div className="text-xs text-blue-700 dark:text-blue-300">
                  📅 Çok günlük etkinlik
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Description - Mobile Friendly */}
        <div className="mb-4">
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base line-clamp-3 leading-relaxed">
          {event.description}
        </p>
        </div>
        
        {/* Event Details - Mobile Optimized Grid */}
        <div className="space-y-3 mb-6">
          {event.location && (
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <MapPin className="h-5 w-5 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 truncate">
                  {event.location === 'Bolu' ? 'BAİBÜ Gölköy Kampüsü' : event.location}
                </div>
                {event.location === 'Bolu' && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Psikoloji Bölümü, Bolu
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Additional Info Row */}
          <div className="flex flex-wrap gap-2">
            {event.registration_required && (
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-200 dark:border-blue-800">
                <span className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 font-medium">
                  📝 Kayıt Gerekli
                </span>
            </div>
          )}

            {event.gallery_images && event.gallery_images.length > 0 && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowGallery(true);
                }}
                className="flex items-center gap-2 px-3 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-full border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
              >
                <Image className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs sm:text-sm text-purple-700 dark:text-purple-300 font-medium">
                  📸 Galeri ({event.gallery_images.length})
                </span>
              </button>
            )}
          </div>
        </div>
        
        {/* Action Buttons - Mobile First */}
        <div className="space-y-3">
          {/* Primary Action - Always Full Width on Mobile */}
          {event.registration_required && event.status === 'upcoming' && (
            <Button 
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={() => {
                if (event.registration_link) {
                  // External registration (Google Forms, Eventbrite, etc.)
                  window.open(event.registration_link, '_blank');
                } else if (event.has_custom_form) {
                  // Internal custom form - Navigate to detail page, let detail page handle form
                  navigate(`/etkinlikler/${event.slug}`);
                } else {
                  // No registration method set up
                  alert('Kayıt sistemi henüz hazırlanmıştır. Lütfen etkinlik detaylarından organizatörlerle iletişime geçin.');
                }
              }}
            >
              <span className="mr-2">🎯</span>
              Hemen Kayıt Ol
              {event.registration_link && <ExternalLink className="h-5 w-5 ml-2" />}
              {event.has_custom_form && !event.registration_link && <span className="ml-2">📝</span>}
            </Button>
          )}

          {/* Secondary Action */}
          <Button 
            variant="outline" 
            className="w-full h-11 text-sm sm:text-base font-medium border-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" 
            asChild
          >
            <Link to={`/etkinlikler/${event.slug}`}>
              <Eye className="h-4 w-4 mr-2" />
              Detayları İncele
            </Link>
          </Button>
        </div>

        {/* Galeri Modal - Mobile Optimized */}
        <Dialog open={showGallery} onOpenChange={setShowGallery}>
          <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] p-3 sm:p-6" aria-describedby="gallery-description">
            <DialogHeader className="pb-2 sm:pb-4">
              <DialogTitle className="text-lg sm:text-xl font-bold text-center">
                📸 {event.title} - Galeri
              </DialogTitle>
              <DialogDescription id="gallery-description" className="text-center text-sm text-gray-600 dark:text-gray-400">
                Etkinliğe ait fotoğrafları görüntülemek için resme tıklayabilirsiniz.
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto max-h-[60vh] sm:max-h-[70vh]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {event.gallery_images?.map((imageUrl, index) => (
                <div key={index} className="relative group">
                    <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                  <img
                    src={imageUrl}
                    alt={`${event.title} galeri ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300 cursor-pointer"
                    onClick={() => window.open(imageUrl, '_blank')}
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                    </div>
                    {/* Mobile-friendly overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg">
                        <Eye className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                      </div>
                    </div>
                    {/* Image number indicator */}
                    <div className="absolute top-2 left-2 bg-black/70 text-white text-xs sm:text-sm px-2 py-1 rounded-full">
                      {index + 1}/{event.gallery_images?.length}
                    </div>
                  </div>
                ))}
                  </div>
                </div>
            {/* Mobile-friendly close instruction */}
            <div className="text-center pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                📱 Resme dokunarak büyütebilirsiniz
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default EventCard;
