import React, { useState, useRef } from 'react';
import { AdminModal } from '@/components/admin/shared/AdminModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, X, Image, Loader2, Plus, Calendar, MapPin, Users, 
  Settings2, FileText, Trash2, ExternalLink, Save, Navigation 
} from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import FormBuilder from './FormBuilder';
import { 
  uploadEventFeaturedImage, 
  uploadEventGalleryImages, 
  uploadFileObjectToGitHub 
} from '@/utils/githubStorageHelper';
import { getGitHubStorageConfig } from '@/integrations/github/config';
import { useEventSponsors } from '@/hooks/useSupabaseData';
import { logContentCreate, logContentUpdate } from '@/utils/activityLogger';
import { useAdminContext } from '@/contexts/AdminDashboardContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  DEFAULT_EVENT_TYPE,
  DEFAULT_EVENT_STATUS,
  DEFAULT_SPONSOR_TYPE,
  getSponsorTypeIcon,
  EVENT_TYPES,
  EVENT_STATUSES,
  SPONSOR_TYPES,
  type SponsorType
} from '@/constants/eventConstants';

// 🛡️ Database schema ile uyumlu status listesi (draft yok!)
const ADMIN_EVENT_STATUSES = {
  upcoming: 'Yaklaşan',
  ongoing: 'Devam Eden',
  completed: 'Tamamlandı',
  cancelled: 'İptal Edildi'
};
import SponsorSelect from './SponsorSelect';

type Tables = Database['public']['Tables'];
type EventTable = Tables['events'];
type EventData = EventTable['Insert'];
type EventRow = EventTable['Row'];

interface EventSponsor {
  id?: string | number;
  sponsor_name: string;
  sponsor_logo: string;
  sponsor_website: string;
  sponsor_type: string;
  sort_order: number;
}

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: EventData) => void;
  initialData?: EventRow;
}

const EventModal = ({ isOpen, onClose, onSave, initialData }: EventModalProps) => {
  const { user } = useAdminContext();
  
  // 🎯 Form State
  const [formData, setFormData] = useState<Omit<EventData, 'id' | 'created_at' | 'updated_at' | 'created_by'>>({
    title: '',
    description: '',
    event_date: '',
    end_date: null,
    location: null,
    event_type: DEFAULT_EVENT_TYPE,
    max_participants: null,
    registration_required: false,
    registration_link: null,
    featured_image: null,
    slug: '',
    status: DEFAULT_EVENT_STATUS,
    has_custom_form: false,
    price: null,
    currency: 'TL',
    latitude: null,
    longitude: null,
    gallery_images: [],
    registration_enabled: true,
    registration_closed_reason: null,
  });

  // 🎯 State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [selectedSponsorIds, setSelectedSponsorIds] = useState<string[]>([]);
  
  // 🎯 Refs
  const featuredImageRef = useRef<HTMLInputElement>(null);
  const galleryImagesRef = useRef<HTMLInputElement>(null);
  const sponsorLogoRef = useRef<HTMLInputElement>(null);

  // 🎯 Data Loading
  const { data: existingSponsors } = useEventSponsors(initialData?.id);

  // 🎯 Initialize data
  React.useEffect(() => {
    if (initialData) {
      const formatDateTime = (date: string | null) => {
        if (!date) return '';
        try {
          // UTC tarihini lokal saat dilimine çevir (datetime-local input için)
          const d = new Date(date);
          // Timezone offset'i hesaba katarak lokal saati al
          const offset = d.getTimezoneOffset();
          const localDate = new Date(d.getTime() - (offset * 60 * 1000));
          return localDate.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm formatı
        } catch {
          return '';
        }
      };

      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        event_date: formatDateTime(initialData.event_date),
        end_date: formatDateTime(initialData.end_date),
        location: initialData.location || null,
        event_type: initialData.event_type || DEFAULT_EVENT_TYPE,
        max_participants: initialData.max_participants,
        registration_required: initialData.registration_required || false,
        registration_link: initialData.registration_link || null,
        featured_image: initialData.featured_image || null,
        slug: initialData.slug || '',
        status: initialData.status || DEFAULT_EVENT_STATUS,
        has_custom_form: initialData.has_custom_form || false,
        price: initialData.price,
        currency: initialData.currency || 'TL',
        latitude: initialData.latitude,
        longitude: initialData.longitude,
        gallery_images: initialData.gallery_images || [],
        registration_enabled: initialData.registration_enabled !== false,
        registration_closed_reason: initialData.registration_closed_reason || null,
      });
      
      setGalleryImages(initialData.gallery_images || []);
      
      if (existingSponsors) {
        // Yeni şema: sponsor_id alanı mevcut
        const ids = existingSponsors.map((s: any) => s.sponsor_id).filter(Boolean);
        setSelectedSponsorIds(ids);
      }
    }
  }, [initialData, existingSponsors]);

  // 🎯 Slug generation
  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({ ...prev, title, slug: generateSlug(title) }));
  };

  // 🎯 Registration handling
  const handleRegistrationToggle = (enabled: boolean) => {
    if (enabled) {
      // Kayıt açıldığında varsayılan olarak harici link seç
      setFormData(prev => ({ 
        ...prev, 
        registration_required: true,
        has_custom_form: false,
        registration_link: prev.registration_link || ''
      }));
    } else {
      // Kayıt kapatıldığında her şeyi sıfırla
      setFormData(prev => ({ 
        ...prev, 
        registration_required: false,
        has_custom_form: false,
        registration_link: ''
      }));
    }
  };

  const switchToExternal = () => {
    setFormData(prev => ({ 
      ...prev, 
      has_custom_form: false
    }));
  };

  const switchToInternal = () => {
    setFormData(prev => ({ 
      ...prev, 
      has_custom_form: true,
      registration_link: ''
    }));
  };

  // 🎯 File uploads
  const handleFeaturedImageUpload = async (file: File) => {
    if (!formData.slug) {
      toast.error('Önce etkinlik başlığını giriniz');
      return;
    }

    const config = getGitHubStorageConfig();
    if (!config) {
      toast.error('GitHub Storage yapılandırılmamış');
      return;
    }

    setIsUploading(true);
    setUploadProgress('Görsel yükleniyor...');

    try {
      const result = await uploadEventFeaturedImage(config, formData.slug, file);
      if (result.success && result.rawUrl) {
        setFormData(prev => ({ ...prev, featured_image: result.rawUrl }));
        toast.success('Görsel yüklendi');
      }
    } catch (error) {
      toast.error('Upload hatası');
    } finally {
      setIsUploading(false);
      setUploadProgress('');
    }
  };

  const handleGalleryUpload = async (files: FileList) => {
    if (!formData.slug) {
      toast.error('Önce etkinlik başlığını giriniz');
      return;
    }

    const config = getGitHubStorageConfig();
    if (!config) {
      toast.error('GitHub Storage yapılandırılmamış');
      return;
    }

    setIsUploading(true);
    setUploadProgress('Galeri yükleniyor...');

    try {
      const result = await uploadEventGalleryImages(config, formData.slug, Array.from(files));
      if (result.success) {
        const newImages = [...galleryImages, ...result.uploadedUrls];
        setGalleryImages(newImages);
        setFormData(prev => ({ ...prev, gallery_images: newImages }));
        toast.success('Galeri yüklendi');
      }
    } catch (error) {
      toast.error('Upload hatası');
    } finally {
      setIsUploading(false);
      setUploadProgress('');
    }
  };

  const handleSponsorLogoUpload = async (file: File) => {
    if (!formData.slug) {
      toast.error('Önce etkinlik başlığını giriniz');
      return;
    }

    const config = getGitHubStorageConfig();
    if (!config) return;

    setIsUploading(true);
    try {
      const fileName = `sponsor-${Date.now()}.${file.name.split('.').pop()}`;
      const filePath = `etkinlikler/${new Date().getFullYear()}/${formData.slug}/sponsorlar/${fileName}`;
      
      const result = await uploadFileObjectToGitHub(config, file, filePath, 'Upload sponsor logo');
      
      if (result.success && result.rawUrl) {
        setFormData(prev => ({ ...prev, featured_image: result.rawUrl }));
        toast.success('Logo yüklendi');
      }
    } catch (error) {
      toast.error('Upload hatası');
    } finally {
      setIsUploading(false);
    }
  };

  const removeGalleryImage = (index: number) => {
    const newImages = galleryImages.filter((_, i) => i !== index);
    setGalleryImages(newImages);
    setFormData(prev => ({ ...prev, gallery_images: newImages }));
  };

  // 🎯 Form validation
  const isValid = () => {
    return formData.title.trim() && formData.description.trim() && formData.event_date;
  };

  // 🎯 Form submission
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
    e.preventDefault();
    }
    
    if (!isValid()) {
      toast.error('Lütfen zorunlu alanları doldurun');
      return;
    }
    
    // Lokal saati UTC'ye çevir (veritabanına kaydetmek için)
    const convertToUTC = (dateString: string | null) => {
      if (!dateString) return null;
      try {
        // datetime-local input'tan gelen değer lokal saat dilimindeir
        const localDate = new Date(dateString);
        // ISO string formatında UTC'ye çevir
        return localDate.toISOString();
      } catch {
        return null;
      }
    };
    
    const eventData: Partial<EventData> & { sponsorIds: string[] } = {
      ...formData,
      event_date: convertToUTC(formData.event_date),
      end_date: convertToUTC(formData.end_date),
      max_participants: formData.max_participants ? Number(formData.max_participants) : null,
      price: formData.price ? Number(formData.price) : null,
      latitude: formData.latitude ? Number(formData.latitude) : null,
      longitude: formData.longitude ? Number(formData.longitude) : null,
      location: formData.location?.trim() || null,
      registration_link: formData.registration_link?.trim() || null,
      featured_image: formData.featured_image?.trim() || null,
      gallery_images: galleryImages,
      sponsorIds: selectedSponsorIds,
      registration_enabled: formData.registration_enabled, // 🎛️ Kayıt durumu
      registration_closed_reason: formData.registration_closed_reason, // 🎛️ Kapanma sebebi
    };
    
    // Aktivite logu kaydet
    try {
      // Kullanıcı adını users tablosundan al
      const { data: userProfile } = await supabase
        .from('users')
        .select('name')
        .eq('id', user?.id)
        .single();
      
      const userName = userProfile?.name || user?.email?.split('@')[0] || 'Bilinmeyen Kullanıcı';
      const userRole = user?.userRoles?.[0] || 'Kullanıcı';
      
      if (initialData) {
        // Güncelleme logu
        await logContentUpdate(
          userName,
          userRole,
          'events',
          formData.title,
          initialData.id
        );
      } else {
        // Oluşturma logu
        await logContentCreate(
          userName,
          userRole,
          'events',
          formData.title
        );
      }
    } catch (error) {
      console.error('Aktivite logu kaydedilemedi:', error);
    }
    
    onSave(eventData as EventData);
    onClose();
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={handleSubmit}
      title={initialData ? 'Etkinlik Düzenle' : 'Yeni Etkinlik'}
      description="Etkinlik detaylarını buradan ekleyebilir veya güncelleyebilirsiniz."
      icon={<Calendar className="h-6 w-6 text-white" />}
      isSaving={isUploading}
      saveLabel={initialData ? 'Güncelle' : 'Kaydet & Oluştur'}
      size="5xl"
      compactHeader={true}
    >
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <Tabs defaultValue="basic" className="flex flex-col h-full">
            {/* Tabs */}
            <TabsList className="mx-4 sm:mx-6 mt-[-1rem] grid grid-cols-3 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              <TabsTrigger value="basic" className="flex items-center justify-center gap-2 h-11 sm:h-10 text-sm sm:text-base touch-manipulation">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Temel</span>
                <span className="sm:hidden text-xs">Temel</span>
              </TabsTrigger>
              <TabsTrigger value="media" className="flex items-center justify-center gap-2 h-11 sm:h-10 text-sm sm:text-base touch-manipulation">
                <Image className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Medya</span>
                <span className="sm:hidden text-xs">Medya</span>
              </TabsTrigger>
              <TabsTrigger value="registration" className="flex items-center justify-center gap-2 h-11 sm:h-10 text-sm sm:text-base touch-manipulation">
                <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Kayıt & Form</span>
                <span className="sm:hidden text-xs">Kayıt</span>
              </TabsTrigger>
            </TabsList>
            
            <div className="flex-1 overflow-y-auto pt-6">
              {/* Basic Info */}
              <TabsContent value="basic" className="px-4 sm:px-6 mt-0 space-y-4 sm:space-y-6">
                <div className="space-y-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <span className="text-red-500">*</span>
                      Etkinlik Başlığı
                    </Label>
            <Input
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="Etkinliğinizin başlığını yazın..."
                      className="h-12 sm:h-11 text-base touch-manipulation"
              required
                    />
                    {formData.title && (
                      <p className="text-xs text-muted-foreground">
                        URL: /etkinlikler/{generateSlug(formData.title)}
                      </p>
                    )}
          </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <span className="text-red-500">*</span>
                      Açıklama
                    </Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Etkinliği detaylı açıklayın..."
              rows={4}
              className="text-base resize-none touch-manipulation"
              required
            />
          </div>

                  {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span className="text-red-500">*</span>
                        Başlangıç
                      </Label>
              <Input
                type="datetime-local"
                value={formData.event_date}
                onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
                        className="h-12 sm:h-11 text-base touch-manipulation"
                required
              />
            </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Bitiş
                      </Label>
              <Input
                type="datetime-local"
                value={formData.end_date || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                        className="h-12 sm:h-11 text-base touch-manipulation"
              />
            </div>
          </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Konum
                    </Label>
            <Input
              value={formData.location || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Örnek: Üniversite Konferans Salonu"
                      className="h-12 sm:h-11 text-base touch-manipulation"
            />
          </div>

                  {/* Coordinates (GPS) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm">
                        <Navigation className="h-3 w-3" />
                        Enlem (Latitude)
                      </Label>
                      <Input
                        value={formData.latitude?.toString() || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value ? parseFloat(e.target.value) : null }))}
                        placeholder="Örnek: 41.0082"
                        type="number"
                        step="0.000001"
                        className="h-12 sm:h-11 text-base touch-manipulation"
                      />
                      <p className="text-xs text-muted-foreground">
                        Google Maps'ten koordinat alabilirsiniz
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm">
                        <Navigation className="h-3 w-3" />
                        Boylam (Longitude)
                      </Label>
                      <Input
                        value={formData.longitude?.toString() || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value ? parseFloat(e.target.value) : null }))}
                        placeholder="Örnek: 28.9784"
                        type="number"
                        step="0.000001"
                        className="h-12 sm:h-11 text-base touch-manipulation"
                      />
                      {formData.latitude && formData.longitude && (
                        <a
                          href={`https://www.google.com/maps?q=${formData.latitude},${formData.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 flex items-center gap-1"
                        >
                          <MapPin className="h-3 w-3" />
                          Haritada Görüntüle
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Tür</Label>
              <Select value={formData.event_type} onValueChange={(value) => setFormData(prev => ({ ...prev, event_type: value }))}>
                        <SelectTrigger className="h-12 sm:h-11 text-base touch-manipulation">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                          {Object.entries(EVENT_TYPES).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                </SelectContent>
              </Select>
            </div>
                    <div className="space-y-2">
                      <Label>Durum</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                        <SelectTrigger className="h-12 sm:h-11 text-base touch-manipulation">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                          {Object.entries(ADMIN_EVENT_STATUSES).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                </SelectContent>
              </Select>
            </div>
                    <div className="space-y-2">
                      <Label>Max Katılımcı</Label>
            <Input
              value={formData.max_participants?.toString() || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, max_participants: e.target.value ? parseInt(e.target.value) : null }))}
              type="number"
              className="h-12 sm:h-11 text-base touch-manipulation"
              placeholder="Örn: 50"
            />
                    </div>
          </div>

                  {/* Price */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Ücret</Label>
                      <Input
                        value={formData.price?.toString() || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value ? parseFloat(e.target.value) : null }))}
                        type="number"
                        step="0.01"
                        className="h-12 sm:h-11 text-base touch-manipulation"
                        placeholder="Örn: 50.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Para Birimi</Label>
                      <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                        <SelectTrigger className="h-12 sm:h-11 text-base touch-manipulation">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TL">TL</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                        </SelectContent>
                      </Select>
                  </div>
                </div>
              </div>
            </TabsContent>

              {/* Media */}
              <TabsContent value="media" className="px-4 sm:px-6 mt-0 space-y-4 sm:space-y-6">
                {/* Featured Image */}
                <div className="space-y-4">
                  <Label>Öne Çıkan Görsel</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {formData.featured_image ? (
                      <div className="space-y-4">
                        <img src={formData.featured_image} alt="Featured" className="max-h-48 mx-auto rounded-lg" />
                        <Button type="button" variant="outline" onClick={() => setFormData(prev => ({ ...prev, featured_image: '' }))}>
                          Kaldır
                        </Button>
          </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => featuredImageRef.current?.click()}
                      disabled={isUploading || !formData.slug}
                    >
                          Görsel Yükle
                    </Button>
                        {!formData.slug && <p className="text-xs text-muted-foreground">Önce başlık giriniz</p>}
                      </div>
                    )}
                  </div>
                  <input
                    ref={featuredImageRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFeaturedImageUpload(e.target.files[0])}
                    className="hidden"
                  />
              </div>

                {/* Gallery */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Galeri</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => galleryImagesRef.current?.click()}
                      disabled={isUploading || !formData.slug}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ekle
                    </Button>
                  </div>
                  
                  {galleryImages.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {galleryImages.map((image, index) => (
                              <div key={index} className="relative group">
                          <img src={image} alt={`Gallery ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                            className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                                    onClick={() => removeGalleryImage(index)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                              </div>
                            ))}
                          </div>
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                      <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-muted-foreground">Henüz galeri resmi yok</p>
                    </div>
                  )}
                  
                  <input
                    ref={galleryImagesRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => e.target.files && handleGalleryUpload(e.target.files)}
                    className="hidden"
                  />
              </div>

                {/* Sponsors */}
                    <div className="space-y-4">
                  <Label>Sponsorlar</Label>
                  
                  <SponsorSelect selectedIds={selectedSponsorIds} onChange={setSelectedSponsorIds} />
              </div>
              </TabsContent>

              {/* Registration & Form */}
              <TabsContent value="registration" className="px-4 sm:px-6 mt-0 space-y-4 sm:space-y-6">
                <div className="space-y-6">
                  {/* 🎛️ Kayıt Kontrol Paneli */}
                  <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Settings2 className="h-5 w-5 text-blue-600" />
                      Kayıt Kontrol Paneli
                    </h3>
                    
                    {/* Kayıt Gerekli */}
                    <div className="flex items-center space-x-3">
                      <Switch
                        checked={formData.registration_required}
                        onCheckedChange={handleRegistrationToggle}
                      />
                      <div>
                        <Label className="text-base font-medium">Kayıt Gerekli</Label>
                        <p className="text-sm text-muted-foreground">Katılımcıların kayıt olması gereksin mi?</p>
                      </div>
                    </div>

                    {/* Manuel Kayıt Kontrolü */}
                    {formData.registration_required && (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <Switch
                            checked={formData.registration_enabled !== false}
                            onCheckedChange={(enabled) => setFormData(prev => ({ 
                              ...prev, 
                              registration_enabled: enabled,
                              registration_closed_reason: enabled ? null : prev.registration_closed_reason || 'Manuel olarak kapatıldı'
                            }))}
                          />
                          <div>
                            <Label className="text-base font-medium">Kayıtlar Açık</Label>
                            <p className="text-sm text-muted-foreground">
                              Kayıtları manuel olarak açıp kapatabilirsiniz
                            </p>
                          </div>
                        </div>
                        
                        {/* Kapanma Sebebi Input */}
                        {formData.registration_enabled === false && (
                          <div className="space-y-2 pl-8">
                            <Label className="text-sm font-medium text-red-700 dark:text-red-400">
                              Kayıt Kapatma Sebebi
                            </Label>
                            <Input
                              value={formData.registration_closed_reason || ''}
                              onChange={(e) => setFormData(prev => ({ 
                                ...prev, 
                                registration_closed_reason: e.target.value 
                              }))}
                              placeholder="Örn: Kontenjan doldu, Etkinlik ertelendi"
                              className="h-12 sm:h-11 text-base touch-manipulation"
                            />
                            <p className="text-xs text-muted-foreground">
                              Bu mesaj kullanıcılara gösterilecek
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Kayıt Durumu Göstergesi */}
                    {formData.registration_required && (
                      <div className="p-3 rounded-lg border-l-4 bg-white dark:bg-gray-900">
                        {formData.registration_enabled !== false ? (
                          <div className="border-l-green-500">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                                ✅ Kayıtlar Açık
                              </span>
                                </div>
                            {formData.max_participants && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Maks. {formData.max_participants} katılımcı
                              </p>
                                  )}
                                </div>
                        ) : (
                          <div className="border-l-red-500">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <span className="text-sm font-medium text-red-700 dark:text-red-400">
                                ❌ Kayıtlar Kapalı
                              </span>
                              </div>
                            {formData.registration_closed_reason && (
                              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                Sebep: {formData.registration_closed_reason}
                              </p>
                            )}
                            </div>
                        )}
                      </div>
                    )}
                  </div>

                  {formData.registration_required && (
                    <div className="space-y-6">
                      {/* 🎯 Kayıt Yöntemi Seçimi */}
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200">
                          <Label className="text-base font-medium mb-3 block">Kayıt Yöntemi Seçin</Label>
                          <div className="space-y-3">
                            {/* Harici Link Seçeneği */}
                            <div 
                              className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                !formData.has_custom_form 
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                              }`}
                              onClick={switchToExternal}
                            >
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                !formData.has_custom_form 
                                  ? 'border-blue-500 bg-blue-500' 
                                  : 'border-gray-300 dark:border-gray-600'
                              }`}>
                                {!formData.has_custom_form && (
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                  )}
                          </div>
                              <div className="flex-1">
                                <Label className="font-medium cursor-pointer">
                                  🔗 Harici Platform (Google Forms, Eventbrite vs.)
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                  Dış platformdaki formu link olarak ekleyin
                                </p>
                      </div>
                    </div>

                            {/* Özel Form Seçeneği */}
                            <div 
                              className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                formData.has_custom_form 
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                              }`}
                              onClick={switchToInternal}
                            >
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                formData.has_custom_form 
                                  ? 'border-blue-500 bg-blue-500' 
                                  : 'border-gray-300 dark:border-gray-600'
                              }`}>
                                {formData.has_custom_form && (
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                )}
                          </div>
                              <div className="flex-1">
                                <Label className="font-medium cursor-pointer">
                                  📋 Özel Form Tasarla
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                  Kendi form alanlarınızı oluşturun
                                </p>
                      </div>
                    </div>
                </div>
              </div>

                        {/* Harici Link Input */}
                        {!formData.has_custom_form && (
                          <div className="space-y-2">
                            <Label>Harici Kayıt Linki</Label>
                            <Input
                              value={formData.registration_link || ''}
                              onChange={(e) => setFormData(prev => ({ ...prev, registration_link: e.target.value }))}
                              placeholder="https://forms.google.com/..."
                              className="h-12 sm:h-11 text-base touch-manipulation"
                            />
                            {formData.registration_link && (
                              <div className="flex items-center gap-2 text-sm">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-green-600">
                                  Harici platform: {
                                    (() => {
                                      try {
                                        return new URL(formData.registration_link).hostname;
                                      } catch {
                                        return "Geçersiz URL";
                                      }
                                    })()
                                  }
                                </span>
                </div>
              )}
                          </div>
                        )}

                        {/* Özel Form Bilgisi */}
                        {formData.has_custom_form && (
                          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm font-medium text-green-800 dark:text-green-300">
                                Özel form sistemi aktif - Form alanlarını aşağıda tasarlayın
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                                                                    {/* 🎯 Özel Form Alanları */}
                      {formData.has_custom_form && (
                        <div className="border-t pt-6">
                          <div className="mb-6">
                            <Label className="text-xl font-bold flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Settings2 className="h-4 w-4 text-white" />
                              </div>
                              Form Alanları Tasarla
                            </Label>
                            <p className="text-muted-foreground mt-2">
                              Katılımcıların dolduracağı form alanlarını oluşturun ve düzenleyin
                    </p>
                  </div>
                          
                          {/* Form Builder Container */}
                          {formData.slug ? (
                            <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20 p-6 rounded-xl border-2 border-blue-200 dark:border-blue-700">
                  <FormBuilder 
                    formId={formData.slug} 
                    formType="event_registration"
                    formTitle={formData.title}
                  />
                </div>
                          ) : (
                            <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-xl border-2 border-amber-200 dark:border-amber-700">
                              <div className="text-center">
                                <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                  <span className="text-2xl">⚠️</span>
                                </div>
                                <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-300 mb-2">
                                  Önce Etkinlik Başlığını Girin
                                </h3>
                                <p className="text-amber-700 dark:text-amber-400">
                                  Form alanları oluşturmak için önce yukarıdaki "Temel" sekmesinden etkinlik başlığını girmeniz gerekiyor.
                                </p>
                              </div>
                </div>
              )}
                          
                          {/* Form Bilgilendirme */}
                          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200">
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-white text-xs">💡</span>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1">Form Alanları Bilgisi</h4>
                                <p className="text-sm text-blue-700 dark:text-blue-400">
                                  Form alanlarınızı tasarladıktan sonra FormBuilder içindeki "Form Alanlarını Kaydet" butonunu kullanarak kaydedin.
                                  Etkinlik ve form alanları ayrı ayrı kaydedilir.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
            </TabsContent>


            </div>
          </Tabs>
        </form>
    </AdminModal>
  );
};

export default EventModal;
