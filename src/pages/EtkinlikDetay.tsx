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
  Info
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useFormFields } from '@/hooks/useSupabaseData';
import PageContainer from '@/components/ui/page-container';
import LoadingPage from '@/components/ui/loading-page';
import ErrorState from '@/components/ui/error-state';
import FormBuilder from '@/components/admin/FormBuilder';
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

  // Form fields için query (sadece custom form varsa)
  const { data: formFields = [] } = useFormFields(
    event?.slug || '', 
    'event_registration'
  );

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
      window.open(event.registration_link, '_blank');
    } else if (event?.has_custom_form) {
      // Custom form tab'ına yönlendir
      const registrationTab = document.querySelector('[data-value="registration"]') as HTMLElement;
      registrationTab?.click();
    } else {
      alert('Kayıt sistemi henüz aktif değil. Lütfen organizatörlerle iletişime geçin.');
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
                {event.price && event.price > 0 && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    💰 {event.price} {event.currency || 'TL'}
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
              {event.registration_required && event.status === 'upcoming' && (
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto"
                  onClick={handleRegistration}
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  Etkinliğe Kayıt Ol
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Content */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
          <TabsTrigger value="details">
            <Info className="h-4 w-4 mr-2" />
            Detaylar
          </TabsTrigger>
          <TabsTrigger value="gallery" disabled={!event.gallery_images?.length}>
            <ImageIcon className="h-4 w-4 mr-2" />
            Galeri {event.gallery_images?.length ? `(${event.gallery_images.length})` : ''}
          </TabsTrigger>
          <TabsTrigger value="sponsors" disabled={!event.event_sponsors?.length}>
            Sponsorlar {event.event_sponsors?.length ? `(${event.event_sponsors.length})` : ''}
          </TabsTrigger>
          <TabsTrigger value="registration" disabled={!event.has_custom_form} data-value="registration">
            Kayıt Formu
          </TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="mt-6">
          <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Etkinlik Detayları</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-lg leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
              
              {/* Google Maps Integration */}
              {event.latitude && event.longitude && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Konum</h3>
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <iframe
                      src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3048.425!2d${event.longitude}!3d${event.latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM40zMCczNi4wIk4gMzHCsDMwJzUyLjAiRQ!5e0!3m2!1str!2str!4v1234567890123`}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gallery Tab */}
        <TabsContent value="gallery" className="mt-6">
          <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Etkinlik Galerisi</CardTitle>
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
                <p className="text-slate-500 dark:text-slate-400 text-center py-8">
                  Bu etkinlik için henüz galeri fotoğrafı eklenmemiş.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sponsors Tab */}
        <TabsContent value="sponsors" className="mt-6">
          <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Sponsor Kuruluşlar</CardTitle>
            </CardHeader>
            <CardContent>
              {event.event_sponsors && event.event_sponsors.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {event.event_sponsors
                    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                    .map((sponsor) => (
                    <div 
                      key={sponsor.id} 
                      className="text-center group cursor-pointer"
                      onClick={() => sponsor.sponsor_website && window.open(sponsor.sponsor_website, '_blank')}
                    >
                      {sponsor.sponsor_logo ? (
                        <div className="aspect-square bg-white rounded-lg p-4 shadow-sm group-hover:shadow-md transition-shadow">
                          <LazyImage
                            src={sponsor.sponsor_logo}
                            alt={sponsor.sponsor_name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="aspect-square bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                          <span className="text-slate-500 dark:text-slate-400 text-sm text-center px-2">
                            {sponsor.sponsor_name}
                          </span>
                        </div>
                      )}
                      <h3 className="mt-2 font-medium text-sm group-hover:text-blue-600 transition-colors">
                        {sponsor.sponsor_name}
                      </h3>
                      {sponsor.sponsor_type && (
                        <Badge variant="outline" className="text-xs mt-1">
                          {sponsor.sponsor_type}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 dark:text-slate-400 text-center py-8">
                  Bu etkinlik için henüz sponsor bilgisi eklenmemiş.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Registration Tab */}
        <TabsContent value="registration" className="mt-6">
          <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Etkinlik Kayıt Formu</CardTitle>
            </CardHeader>
            <CardContent>
              {event.has_custom_form && formFields.length > 0 ? (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>{event.title}</strong> etkinliğimize katılmak için aşağıdaki formu doldurun.
                    </p>
                  </div>
                  <FormBuilder 
                    formId={event.slug} 
                    formType="event_registration"
                    formTitle={event.title}
                    onSave={() => {
                      alert('Kayıt başarıyla tamamlandı! Etkinlik öncesi size bilgilendirme yapılacaktır.');
                    }}
                  />
                </div>
              ) : (
                <p className="text-slate-500 dark:text-slate-400 text-center py-8">
                  Bu etkinlik için özel kayıt formu bulunmuyor.
                  {event.registration_link && (
                    <Button 
                      className="mt-4 block mx-auto"
                      onClick={() => window.open(event.registration_link, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Harici Kayıt Linkine Git
                    </Button>
                  )}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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