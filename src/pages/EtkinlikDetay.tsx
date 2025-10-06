import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  ExternalLink, 
  ArrowLeft,
  Image as ImageIcon,
  Download,
  UserPlus,
  Info,
  Facebook,
  Instagram,
  Share,
  CalendarPlus,
  Navigation
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { 
  getEventTypeLabel, 
  getEventStatusLabel, 
  getEventTypeColor, 
  getEventStatusColor,
  type EventType,
  type EventStatus 
} from '@/constants/eventConstants';

import PageContainer from '@/components/ui/page-container';
import LoadingPage from '@/components/ui/loading-page';
import ErrorState from '@/components/ui/error-state';
import EventRegistrationForm from '@/components/EventRegistrationForm';
import LazyImage from '@/components/LazyImage';

type Event = Database['public']['Tables']['events']['Row'];

interface DetailedSponsor {
  id: string;
  name: string;
  logo: string | null;
  website: string | null;
  sponsor_type: string;
}

interface DetailedEventSponsor {
  sponsor_id: string;
  sponsors: DetailedSponsor | null;
}

interface EventWithSponsors extends Event {
  event_sponsors: DetailedEventSponsor[];
}

const EtkinlikDetay = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventWithSponsors | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | null>(null);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchEventDetails(slug);
    }
  }, [slug]);

  const fetchEventDetails = async (eventSlug: string) => {
    try {
      setLoading(true);
      
      const { data, error: fetchError } = await supabase
        .from('events')
        .select(`
          *,
          event_sponsors (
            sponsor_id,
            sponsors ( id, name, logo, website, sponsor_type )
          )
        `)
        .eq('slug', eventSlug)
        .single();

      if (fetchError) throw fetchError;
      if (!data) throw new Error('Etkinlik bulunamadı');

      setEvent(data as unknown as EventWithSponsors);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Etkinlik yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  // Event type ve status helper functions artık constants'tan geliyor

  const formatEventDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: tr });
  };

  const formatEventTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm', { locale: tr });
  };

  // Format date range helper
  const formatDateRange = (startDate: string, endDate?: string) => {
    if (!endDate || startDate === endDate) {
      return null;
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Same day, different times
    if (start.toDateString() === end.toDateString()) {
      const endTime = format(end, 'HH:mm', { locale: tr });
      return ` - ${endTime}`;
    }
    
    // Different days
    const endDay = format(end, 'dd MMMM yyyy', { locale: tr });
    return ` - ${endDay}`;
  };

  // Format price display
  const formatPrice = (price?: number, currency: string = 'TL') => {
    if (!price || price === 0) return '🆓 Ücretsiz';
    return `💰 ${price.toLocaleString('tr-TR')} ${currency}`;
  };

  const openMapsLocation = () => {
    if (event?.latitude && event?.longitude) {
      const mapsUrl = `https://www.google.com/maps?q=${event.latitude},${event.longitude}`;
      window.open(mapsUrl, '_blank');
    } else if (event?.location) {
      const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(event.location)}`;
      window.open(searchUrl, '_blank');
    }
  };

  const handleRegistration = () => {
    if (event?.registration_link) {
      // External registration (Google Forms, Eventbrite, etc.)
      window.open(event.registration_link, '_blank');
    } else if (event?.has_custom_form) {
      // Internal custom form - scroll to form section
      const formElement = document.getElementById('kayit-formu');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth' });
      } else {
        setIsRegistrationModalOpen(true);
      }
    } else {
      alert('Kayıt sistemi henüz hazırlanmıştır. Lütfen organizatörlerle iletişime geçin.');
    }
  };

  const generateCalendarEvent = () => {
    if (!event) return;

    const startDate = new Date(event.event_date);
    const endDate = event.end_date ? new Date(event.end_date) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // +2 saat default

    const formatDateForICS = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Psikoloji Topluluğu//Event//TR',
      'BEGIN:VEVENT',
      `UID:${event.slug}@psikotopluluk.com`,
      `DTSTART:${formatDateForICS(startDate)}`,
      `DTEND:${formatDateForICS(endDate)}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description?.replace(/\n/g, '\\n') || ''}`,
      `LOCATION:${event.location || ''}`,
      `URL:${window.location.href}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-PT1H',
      'ACTION:DISPLAY',
      'DESCRIPTION:Etkinlik 1 saat sonra başlayacak',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('📅 Etkinlik takviminize eklendi!');
  };

  const getDirections = () => {
    if (event?.latitude && event?.longitude) {
      const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`;
      window.open(directionsUrl, '_blank');
    } else if (event?.location) {
      const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(event.location)}`;
      window.open(directionsUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingPage 
          title="Etkinlik Detayı Yükleniyor"
          message="Etkinlik bilgileri hazırlanıyor..."
          icon={Calendar}
        />
      </PageContainer>
    );
  }

  if (error || !event) {
    return (
      <PageContainer>
        <ErrorState 
          title="Etkinlik Bulunamadı"
          message={error || "Aradığınız etkinlik bulunamadı veya silinmiş olabilir."}
          onRetry={() => navigate('/etkinlikler')}
          variant="notfound"
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer background="gradient">
      {/* Mobile-First Header */}
      <div className="mb-6 sm:mb-8">
        {/* Back Button - Mobile Optimized */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/etkinlikler')}
          className="mb-4 h-12 sm:h-11 px-4 sm:px-3 text-base bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border border-white/20 dark:border-slate-700/20 hover:bg-white/80 dark:hover:bg-slate-800/80 active:scale-95 touch-manipulation"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          <span className="font-medium">Etkinliklere Dön</span>
        </Button>
        
        {/* Main Header Card - Modern Design */}
        <Card variant="modern" className="overflow-hidden animate-fade-in-up">
          {/* Featured Image - Full Width on Mobile */}
          {event.featured_image && (
            <div className="relative">
              <div className="aspect-video sm:aspect-[21/9] w-full overflow-hidden">
                <LazyImage
                  src={event.featured_image}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              
              {/* Overlay Badges on Image */}
              <div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex flex-wrap gap-2">
                <Badge className={`${getEventStatusColor(event.status as EventStatus)} shadow-lg backdrop-blur-md border border-white/20`}>
                  {getEventStatusLabel(event.status as EventStatus)}
                </Badge>
                <Badge className={`${event.price && event.price > 0 ? 'bg-gradient-to-r from-emerald-500 to-green-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'} text-white shadow-lg backdrop-blur-md border border-white/20`}>
                  {formatPrice(event.price, event.currency)}
                </Badge>
              </div>
              {event.registration_required && (
                <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg backdrop-blur-md border border-white/20">
                    📝 Kayıt Gerekli
                  </Badge>
                </div>
              )}
            </div>
          )}
          
          {/* Event Info - Mobile Optimized Layout */}
          <CardContent className="p-4 sm:p-6 lg:p-8">
            {/* Badges - Only show if no featured image */}
            {!event.featured_image && (
              <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
                <Badge className={`${getEventTypeColor(event.event_type as EventType)} text-sm font-medium`}>
                  {getEventTypeLabel(event.event_type as EventType)}
                </Badge>
                <Badge className={`${getEventStatusColor(event.status as EventStatus)} text-sm font-medium`}>
                  {getEventStatusLabel(event.status as EventStatus)}
                </Badge>
                {event.registration_required && (
                  <Badge variant="outline" className="text-blue-600 border-blue-600 font-medium">
                    📝 Kayıt Gerekli
                  </Badge>
                )}
                <Badge className={`${event.price && event.price > 0 ? 'bg-gradient-to-r from-emerald-500 to-green-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'} text-white font-medium`}>
                  {formatPrice(event.price, event.currency)}
                </Badge>
              </div>
            )}
            
            {/* Event Type Badge - Always Show */}
            <div className="mb-4 sm:mb-6">
              <Badge className={`${getEventTypeColor(event.event_type as EventType)} text-sm px-4 py-2 font-semibold`}>
                {getEventTypeLabel(event.event_type as EventType)}
              </Badge>
            </div>
            
            {/* Title - Mobile Optimized */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text-primary mb-4 sm:mb-6 leading-tight">
              {event.title}
            </h1>
              
            {/* Event Details - Modern Cards */}
            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              {/* Date & Time Card */}
              <Card variant="modern" className="bg-gradient-to-br from-blue-50/80 to-cyan-50/80 dark:from-blue-950/50 dark:to-cyan-950/50 border-blue-200/50 dark:border-blue-800/50 animate-fade-in-up animation-delay-100">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                      <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-blue-900 dark:text-blue-100 text-base sm:text-lg">
                        📅 {formatEventDate(event.event_date)}
                      </div>
                      <div className="text-sm text-blue-700 dark:text-blue-300 mt-1 leading-relaxed">
                        🕐 {formatEventTime(event.event_date)}
                        {formatDateRange(event.event_date, event.end_date)}
                        {event.end_date && !formatDateRange(event.event_date, event.end_date) && (
                          <span className="ml-2 text-xs font-medium">📅 Çok günlük etkinlik</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Location Card */}
              {event.location && (
                <Card variant="interactive" className="bg-gradient-to-br from-emerald-50/80 to-green-50/80 dark:from-emerald-950/50 dark:to-green-950/50 border-emerald-200/50 dark:border-emerald-800/50 animate-fade-in-up animation-delay-200 cursor-pointer" onClick={openMapsLocation}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl">
                        <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-emerald-900 dark:text-emerald-100 text-base group-hover:text-emerald-700 dark:group-hover:text-emerald-200 transition-colors">
                          📍 {event.location}
                        </div>
                        {(event.latitude && event.longitude) && (
                          <div className="text-sm text-emerald-700 dark:text-emerald-300 mt-1 flex items-center gap-2 group-hover:gap-3 transition-all duration-200">
                            🗺️ Haritada Görüntüle
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              

            </div>
              
            {/* Registration Button - Mobile Optimized */}
            {(event.has_custom_form || (event.registration_required && event.status === 'upcoming')) && (
              <div className="space-y-4">
                <Button 
                  size="lg" 
                  className="w-full h-16 sm:h-14 text-lg sm:text-xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 shadow-xl hover:shadow-2xl transition-all duration-300 sm:transform sm:hover:-translate-y-1 active:scale-95 text-white rounded-xl touch-manipulation"
                  onClick={handleRegistration}
                  disabled={event.status === 'completed' || event.status === 'cancelled'}
                >
                  <UserPlus className="h-6 w-6 sm:h-7 sm:w-7 mr-3" />
                  {event.status === 'completed' ? '✅ Etkinlik Tamamlandı' :
                   event.status === 'cancelled' ? '❌ Etkinlik İptal Edildi' :
                   event.registration_link ? '🔗 Kayıt Sayfasına Git' :
                   event.has_custom_form ? '📝 Kayıt Formunu Doldur' : 
                   '✨ Etkinliğe Kayıt Ol'}
                </Button>
                
                {/* Additional Info Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className={`${event.price && event.price > 0 ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'} px-4 py-3 rounded-xl border text-center sm:text-left`}>
                    <span className={`${event.price && event.price > 0 ? 'text-green-700 dark:text-green-300' : 'text-blue-700 dark:text-blue-300'} font-semibold`}>
                      {formatPrice(event.price, event.currency)}
                    </span>
                  </div>
                  {event.status === 'ongoing' && (
                    <div className="bg-orange-50 dark:bg-orange-900/20 px-4 py-3 rounded-xl border border-orange-200 dark:border-orange-800 text-center sm:text-left">
                      <span className="text-orange-700 dark:text-orange-300 font-semibold">
                        🔴 Etkinlik Devam Ediyor
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs Content */}
      <Tabs defaultValue="details" className="w-full animate-fade-in-up animation-delay-500">
        <TabsList className="grid w-full grid-cols-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-1">
          <TabsTrigger value="details" className="text-sm sm:text-base rounded-xl font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-md transition-all duration-200">
            <Info className="h-4 w-4 mr-2" />
            📋 Detaylar
          </TabsTrigger>
          <TabsTrigger value="gallery" disabled={!event.gallery_images?.length} className="text-sm sm:text-base rounded-xl font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-md transition-all duration-200">
            <ImageIcon className="h-4 w-4 mr-2" />
            📸 Galeri {event.gallery_images?.length ? `(${event.gallery_images.length})` : ''}
          </TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="mt-6 sm:mt-8">
          <div className="space-y-6 sm:space-y-8">
            {/* Main Content */}
            <Card variant="modern" className="animate-fade-in-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  📄 Etkinlik Detayları
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-base sm:text-lg leading-relaxed whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                    {event.description}
                  </p>
                </div>
                
                {/* Social Share & Actions */}
                <div className="mt-6 sm:mt-8 pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
                  <h4 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-xl">
                      <Share className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    🚀 Etkinliği Paylaş & İşlemler
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {/* Takvime Ekle */}
                    <Button
                      variant="modern"
                      size="sm"
                      onClick={generateCalendarEvent}
                      className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white border-0 shadow-lg hover:shadow-xl interactive-scale"
                    >
                      <CalendarPlus className="h-4 w-4 mr-2" />
                      Takvime Ekle
                    </Button>

                    {/* X (Twitter) */}
                    <Button
                      variant="modern"
                      size="sm"
                      onClick={() => {
                        const text = `${event.title} etkinliğini kaçırma! ${window.location.href}`;
                        const xUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
                        window.open(xUrl, '_blank');
                      }}
                      className="bg-black hover:bg-gray-800 text-white border-0 shadow-lg hover:shadow-xl interactive-scale"
                    >
                      <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      
                    </Button>

                    {/* Facebook */}
                    <Button
                      variant="modern"
                      size="sm"
                      onClick={() => {
                        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
                        window.open(facebookUrl, '_blank');
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-lg hover:shadow-xl interactive-scale"
                    >
                      <Facebook className="h-4 w-4 mr-2" />
                    
                    </Button>

                    {/* Instagram */}
                    <Button
                      variant="modern"
                      size="sm"
                      onClick={() => {
                        const text = `🎉 ${event.title}\n\n📅 ${formatEventDate(event.event_date)} - ${formatEventTime(event.event_date)}\n📍 ${event.location || 'Konum belirtilmemiş'}\n\n🔗 ${window.location.href}\n\n#PsikolojiTopluluğu #Etkinlik`;
                        navigator.clipboard.writeText(text);
                        toast.success('📋 Instagram metni kopyalandı! Stories veya post olarak paylaşabilirsiniz.');
                      }}
                      className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white border-0 shadow-lg hover:shadow-xl interactive-scale"
                    >
                      <Instagram className="h-4 w-4 mr-2" />
                    </Button>

                    {/* WhatsApp */}
                    <Button
                      variant="modern"
                      size="sm"
                      onClick={() => {
                        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${event.title} etkinliğini kaçırma! ${window.location.href}`)}`;
                        window.open(whatsappUrl, '_blank');
                      }}
                      className="bg-green-500 hover:bg-green-600 text-white border-0 shadow-lg hover:shadow-xl interactive-scale"
                    >
                      <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                    </Button>

                    {/* Link Kopyala */}
                    <Button
                      variant="modern"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        toast.success('🔗 Link kopyalandı!');
                      }}
                      className="bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white border-0 shadow-lg hover:shadow-xl interactive-scale"
                    >
                      <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                      </svg>
                      Linki Kopyala
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location and Sponsors Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {/* Google Maps */}
              {event.latitude && event.longitude && (
                <Card variant="modern" className="animate-fade-in-up animation-delay-100">
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                          <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        🗺️ Etkinlik Konumu
                      </div>
                      <Button
                        variant="modern"
                        size="sm"
                        onClick={getDirections}
                        className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white border-0 shadow-md hover:shadow-lg interactive-scale"
                      >
                        <Navigation className="h-3 w-3 mr-1" />
                        🧭 Yol Tarifi
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video rounded-2xl overflow-hidden mb-4 shadow-lg border border-slate-200/50 dark:border-slate-700/50">
                      <iframe
                        src={`https://www.google.com/maps?q=${event.latitude},${event.longitude}&hl=tr&z=16&output=embed`}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="rounded-2xl"
                      />
                    </div>
                    <div className="text-center">
                      <Button
                        variant="modern"
                        size="sm"
                        onClick={openMapsLocation}
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 shadow-md hover:shadow-lg interactive-scale"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        🔗 Google Maps'te Aç
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Sponsors */}
              {event.event_sponsors && event.event_sponsors.length > 0 && (
                <Card variant="modern" className="animate-fade-in-up animation-delay-200">
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-xl">
                        <span className="text-lg">🤝</span>
                      </div>
                      💼 Sponsor Kuruluşlar
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      {event.event_sponsors
                        .sort((a, b) => Number(a.sponsor_id || 0) - Number(b.sponsor_id || 0))
                        .slice(0, 4) // İlk 4 sponsoru göster
                        .map(({ sponsors: sponsor }) => 
                          sponsor ? (
                            <a 
                              key={sponsor.id} 
                              href={sponsor.website || '#'} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl hover:scale-105 transition-all duration-300 bg-gradient-to-br from-white/50 to-slate-50/50 dark:from-slate-800/50 dark:to-slate-900/50 backdrop-blur-sm interactive-scale"
                            >
                              {sponsor.logo && (
                                <img src={sponsor.logo} alt={sponsor.name} className="h-12 sm:h-16 object-contain mb-2" />
                              )}
                              <p className="text-xs sm:text-sm font-bold text-center text-slate-700 dark:text-slate-300">{sponsor.name}</p>
                            </a>
                          ) : null
                        )}
                    </div>
                    {event.event_sponsors.length > 4 && (
                      <div className="mt-4 text-center">
                        <p className="text-sm text-gray-500">
                          +{event.event_sponsors.length - 4} sponsor daha
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Full Width Sponsors for many sponsors */}
            {event.event_sponsors && event.event_sponsors.length > 6 && (
              <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-xl">🤝</span>
                    Tüm Sponsor Kuruluşlar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                    {event.event_sponsors
                      .sort((a, b) => Number(a.sponsor_id || 0) - Number(b.sponsor_id || 0))
                      .map(({ sponsors: sponsor }) => 
                        sponsor ? (
                          <a 
                            key={sponsor.id} 
                            href={sponsor.website || '#'} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex flex-col items-center justify-center p-2 border rounded-lg hover:shadow-md transition-shadow bg-gray-50 dark:bg-gray-900/50"
                          >
                            {sponsor.logo && (
                              <img src={sponsor.logo} alt={sponsor.name} className="h-16 object-contain mb-2" />
                            )}
                            <p className="text-sm font-medium text-center">{sponsor.name}</p>
                          </a>
                        ) : null
                      )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Gallery Tab */}
        <TabsContent value="gallery" className="mt-6 sm:mt-8">
          <Card variant="modern" className="animate-fade-in-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                <div className="p-2 bg-pink-100 dark:bg-pink-900/50 rounded-xl">
                  <ImageIcon className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                </div>
                📸 Etkinlik Galerisi
              </CardTitle>
            </CardHeader>
            <CardContent>
              {event.gallery_images && event.gallery_images.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {event.gallery_images.map((image, index) => (
                    <div 
                      key={index} 
                      className="aspect-square rounded-2xl overflow-hidden cursor-pointer hover:scale-105 hover:shadow-xl transition-all duration-300 border border-slate-200/50 dark:border-slate-700/50 interactive-scale animate-fade-in-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                      onClick={() => setSelectedGalleryImage(image)}
                    >
                      <LazyImage
                        src={image}
                        alt={`${event.title} - Görsel ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 animate-fade-in-up">
                  <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <ImageIcon className="h-10 w-10 text-slate-400 dark:text-slate-500" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-3 text-slate-700 dark:text-slate-300">
                    📷 Henüz fotoğraf eklenmemiş
                  </h3>
                  <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
                    Bu etkinlik için henüz galeri fotoğrafı eklenmemiş. Etkinlik sonrası fotoğraflar bu bölümde yer alacak.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Registration Modal */}
      {event && (
        <EventRegistrationForm
          eventId={event.slug}
          eventTitle={event.title}
          isOpen={isRegistrationModalOpen}
          onClose={() => setIsRegistrationModalOpen(false)}
          onSuccess={() => {
            // Kayıt başarılı olunca modal kapanır ve bilgi verilir
            setIsRegistrationModalOpen(false);
          }}
        />
      )}

      {/* Gallery Modal */}
      {selectedGalleryImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedGalleryImage(null)}
        >
          <div className="max-w-4xl max-h-full">
            <img
              src={selectedGalleryImage}
              alt="Galeri görsel"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default EtkinlikDetay; 