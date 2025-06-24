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

import PageContainer from '@/components/ui/page-container';
import LoadingPage from '@/components/ui/loading-page';
import ErrorState from '@/components/ui/error-state';
import EventRegistrationForm from '@/components/EventRegistrationForm';
import LazyImage from '@/components/LazyImage';

type Event = Database['public']['Tables']['events']['Row'];
type EventSponsor = Database['public']['Tables']['event_sponsors']['Row'];

interface EventWithSponsors extends Event {
  event_sponsors: EventSponsor[];
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
      
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          event_sponsors (*)
        `)
        .eq('slug', eventSlug)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Etkinlik bulunamadı');

      setEvent(data as EventWithSponsors);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Etkinlik yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'atolye': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'konferans': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'sosyal': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'egitim': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'seminer': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'upcoming': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'ongoing': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'completed': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
      'cancelled': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: tr });
  };

  const formatEventTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm', { locale: tr });
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
      // Harici link varsa oraya yönlendir
      window.open(event.registration_link, '_blank');
    } else if (event?.has_custom_form) {
      // Custom form varsa modal aç
      setIsRegistrationModalOpen(true);
    } else {
      alert('Kayıt sistemi henüz aktif değil. Lütfen organizatörlerle iletişime geçin.');
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
      {/* Header */}
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/etkinlikler')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Etkinliklere Dön
        </Button>
        
        <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 shadow-lg">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Featured Image */}
            {event.featured_image && (
              <div className="lg:w-1/3">
                <div className="aspect-video rounded-lg overflow-hidden">
                  <LazyImage
                    src={event.featured_image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
            
            {/* Event Info */}
            <div className={`${event.featured_image ? 'lg:w-2/3' : 'w-full'}`}>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className={getEventTypeColor(event.event_type)}>
                  {getEventTypeLabel(event.event_type)}
                </Badge>
                <Badge className={getStatusColor(event.status)}>
                  {getStatusLabel(event.status)}
                </Badge>
                {event.registration_required && (
                  <Badge variant="outline" className="text-blue-600 border-blue-600">
                    📝 Kayıt Gerekli
                  </Badge>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                {event.title}
              </h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Calendar className="h-5 w-5" />
                  <div>
                    <div className="font-medium">{formatEventDate(event.event_date)}</div>
                    <div className="text-sm">
                      {formatEventTime(event.event_date)}
                      {event.end_date && ` - ${formatEventTime(event.end_date)}`}
                    </div>
                  </div>
                </div>
                
                {event.location && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <MapPin className="h-5 w-5" />
                    <div>
                      <div className="font-medium cursor-pointer hover:text-blue-600" onClick={openMapsLocation}>
                        {event.location}
                      </div>
                      {(event.latitude && event.longitude) && (
                        <div className="text-sm text-blue-600 cursor-pointer" onClick={openMapsLocation}>
                          Haritada Görüntüle →
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {event.max_participants && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Users className="h-5 w-5" />
                    <span>Maksimum {event.max_participants} katılımcı</span>
                  </div>
                )}
              </div>
              
              {/* Registration Button */}
              {(event.has_custom_form || (event.registration_required && event.status === 'upcoming')) && (
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 text-white font-semibold text-base px-8 py-3"
                    onClick={handleRegistration}
                    disabled={event.status === 'completed' || event.status === 'cancelled'}
                  >
                    <UserPlus className="h-5 w-5 mr-2" />
                    {event.status === 'completed' ? 'Etkinlik Tamamlandı' :
                     event.status === 'cancelled' ? 'Etkinlik İptal Edildi' :
                     event.has_custom_form ? '📝 Kayıt Formunu Doldur' : 
                     event.registration_link ? '🔗 Kayıt Sayfasına Git' : 
                     '✨ Etkinliğe Kayıt Ol'}
                  </Button>
                  {event.price && event.price > 0 && (
                    <div className="bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg border border-green-200 dark:border-green-800">
                      <span className="text-green-700 dark:text-green-300 font-semibold">
                        💰 Ücret: {event.price} {event.currency || 'TL'}
                      </span>
                    </div>
                  )}
                  {event.status === 'ongoing' && (
                    <div className="bg-orange-50 dark:bg-orange-900/20 px-4 py-2 rounded-lg border border-orange-200 dark:border-orange-800">
                      <span className="text-orange-700 dark:text-orange-300 font-semibold">
                        🔴 Etkinlik Devam Ediyor
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Content */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
          <TabsTrigger value="details" className="text-sm">
            <Info className="h-4 w-4 mr-2" />
            Detaylar
          </TabsTrigger>
          <TabsTrigger value="gallery" disabled={!event.gallery_images?.length} className="text-sm">
            <ImageIcon className="h-4 w-4 mr-2" />
            Galeri {event.gallery_images?.length ? `(${event.gallery_images.length})` : ''}
          </TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="mt-6">
          <div className="space-y-8">
            {/* Main Content */}
            <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Etkinlik Detayları
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-lg leading-relaxed whitespace-pre-wrap">
                    {event.description}
                  </p>
                </div>
                
                {/* Social Share & Actions */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Share className="h-5 w-5" />
                    Etkinliği Paylaş & İşlemler
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {/* Takvime Ekle */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={generateCalendarEvent}
                      className="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-600"
                    >
                      <CalendarPlus className="h-4 w-4 mr-2" />
                      Takvime Ekle
                    </Button>

                    {/* X (Twitter) */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const text = `${event.title} etkinliğini kaçırma! ${window.location.href}`;
                        const xUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
                        window.open(xUrl, '_blank');
                      }}
                      className="bg-black hover:bg-gray-800 text-white border-black"
                    >
                      <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      X
                    </Button>

                    {/* Facebook */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
                        window.open(facebookUrl, '_blank');
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                    >
                      <Facebook className="h-4 w-4 mr-2" />
                      Facebook
                    </Button>

                    {/* Instagram */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const text = `🎉 ${event.title}\n\n📅 ${formatEventDate(event.event_date)} - ${formatEventTime(event.event_date)}\n📍 ${event.location || 'Konum belirtilmemiş'}\n\n🔗 ${window.location.href}\n\n#PsikolojiTopluluğu #Etkinlik`;
                        navigator.clipboard.writeText(text);
                        toast.success('📋 Instagram metni kopyalandı! Stories veya post olarak paylaşabilirsiniz.');
                      }}
                      className="bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 text-white border-purple-600"
                    >
                      <Instagram className="h-4 w-4 mr-2" />
                      Instagram
                    </Button>

                    {/* WhatsApp */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${event.title} etkinliğini kaçırma! ${window.location.href}`)}`;
                        window.open(whatsappUrl, '_blank');
                      }}
                      className="bg-green-500 hover:bg-green-600 text-white border-green-500"
                    >
                      <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                      WhatsApp
                    </Button>

                    {/* Link Kopyala */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        toast.success('🔗 Link kopyalandı!');
                      }}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Google Maps */}
              {event.latitude && event.longitude && (
                <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-blue-600" />
                        Etkinlik Konumu
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={getDirections}
                        className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200 text-xs"
                      >
                        <Navigation className="h-3 w-3 mr-1" />
                        Yol Tarifi
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video rounded-lg overflow-hidden mb-4">
                      <iframe
                        src={`https://www.google.com/maps?q=${event.latitude},${event.longitude}&hl=tr&z=16&output=embed`}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                    <div className="text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={openMapsLocation}
                        className="text-sm"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Google Maps'te Aç
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Sponsors */}
              {event.event_sponsors && event.event_sponsors.length > 0 && (
                <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className="text-xl">🤝</span>
                      Sponsor Kuruluşlar
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {event.event_sponsors
                        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                        .slice(0, 4) // İlk 4 sponsoru göster
                        .map((sponsor) => (
                        <div 
                          key={sponsor.id} 
                          className="text-center group cursor-pointer"
                          onClick={() => sponsor.sponsor_website && window.open(sponsor.sponsor_website, '_blank')}
                        >
                          {sponsor.sponsor_logo ? (
                            <div className="aspect-square bg-white rounded-lg p-3 shadow-sm group-hover:shadow-md transition-shadow">
                              <LazyImage
                                src={sponsor.sponsor_logo}
                                alt={sponsor.sponsor_name}
                                className="w-full h-full object-contain"
                              />
                            </div>
                          ) : (
                            <div className="aspect-square bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                              <span className="text-slate-500 dark:text-slate-400 text-xs text-center px-2">
                                {sponsor.sponsor_name}
                              </span>
                            </div>
                          )}
                          <h3 className="mt-2 font-medium text-xs group-hover:text-blue-600 transition-colors line-clamp-2">
                            {sponsor.sponsor_name}
                          </h3>
                          {sponsor.sponsor_type && (
                            <Badge variant="outline" className="text-[10px] mt-1">
                              {sponsor.sponsor_type}
                            </Badge>
                          )}
                        </div>
                      ))}
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
                      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                      .map((sponsor) => (
                      <div 
                        key={sponsor.id} 
                        className="text-center group cursor-pointer"
                        onClick={() => sponsor.sponsor_website && window.open(sponsor.sponsor_website, '_blank')}
                      >
                        {sponsor.sponsor_logo ? (
                          <div className="aspect-square bg-white rounded-lg p-2 shadow-sm group-hover:shadow-md transition-shadow">
                            <LazyImage
                              src={sponsor.sponsor_logo}
                              alt={sponsor.sponsor_name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="aspect-square bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                            <span className="text-slate-500 dark:text-slate-400 text-xs text-center px-1">
                              {sponsor.sponsor_name}
                            </span>
                          </div>
                        )}
                        <h3 className="mt-1 font-medium text-xs group-hover:text-blue-600 transition-colors line-clamp-2">
                          {sponsor.sponsor_name}
                        </h3>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Gallery Tab */}
        <TabsContent value="gallery" className="mt-6">
          <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Etkinlik Galerisi
              </CardTitle>
            </CardHeader>
            <CardContent>
              {event.gallery_images && event.gallery_images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {event.gallery_images.map((image, index) => (
                    <div 
                      key={index} 
                      className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => setSelectedGalleryImage(image)}
                    >
                      <LazyImage
                        src={image}
                        alt={`${event.title} - Görsel ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-600 dark:text-gray-400">
                    Henüz fotoğraf eklenmemiş
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400">
                    Bu etkinlik için henüz galeri fotoğrafı eklenmemiş.
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