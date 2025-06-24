import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, X, Image, FileText, Loader2, Settings } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';
import FormBuilder from './FormBuilder';
import { 
  uploadEventFeaturedImage, 
  uploadEventGalleryImages, 
  uploadEventDocuments,
  deleteEventFilesFromGitHub,
  uploadFileObjectToGitHub 
} from '@/utils/githubStorageHelper';
import { getGitHubStorageConfig } from '@/integrations/github/config';
import { useEventSponsors } from '@/hooks/useSupabaseData';

type Tables = Database['public']['Tables'];
type EventData = Tables['events']['Insert'];
type EventRow = Tables['events']['Row'];

interface EventSponsor {
  id?: string | number; // Database'den string, UI'da number olabilir
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
  // Mevcut event sponsorlarını yükle
  const { data: existingSponsors } = useEventSponsors(initialData?.id);
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    event_date: initialData?.event_date || '',
    end_date: initialData?.end_date || '',
    location: initialData?.location || '',
    event_type: initialData?.event_type || 'seminer',
    max_participants: initialData?.max_participants || '',
    registration_required: initialData?.registration_required || false,
    registration_link: initialData?.registration_link || '',
    featured_image: initialData?.featured_image || '',
    slug: initialData?.slug || '',
    status: initialData?.status || 'upcoming',
    has_custom_form: initialData?.has_custom_form || false,
    price: initialData?.price?.toString() || '',
    currency: initialData?.currency || 'TL',
    latitude: initialData?.latitude?.toString() || '',
    longitude: initialData?.longitude?.toString() || '',
    gallery_images: initialData?.gallery_images || [],
  });

  // GitHub Storage state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [galleryImages, setGalleryImages] = useState<string[]>(initialData?.gallery_images || []);
  const [eventSponsors, setEventSponsors] = useState<EventSponsor[]>([]);
  
  // Sponsor state
  const [newSponsor, setNewSponsor] = useState<Omit<EventSponsor, 'id'>>({
    sponsor_name: '',
    sponsor_logo: '',
    sponsor_website: '',
    sponsor_type: 'destekci',
    sort_order: 0
  });
  const sponsorLogoRef = useRef<HTMLInputElement>(null);
  
  // File input refs
  const featuredImageRef = useRef<HTMLInputElement>(null);
  const galleryImagesRef = useRef<HTMLInputElement>(null);
  const documentsRef = useRef<HTMLInputElement>(null);

  // Helper function to convert datetime-local format
  const formatDateTimeLocal = (isoString: string | null): string => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      // Convert to local datetime-local format: yyyy-MM-ddThh:mm
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  };

  // Update form data when initialData changes
  React.useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        event_date: formatDateTimeLocal(initialData.event_date),
        end_date: formatDateTimeLocal(initialData.end_date),
        location: initialData.location || '',
        event_type: initialData.event_type || 'seminer',
        max_participants: initialData.max_participants?.toString() || '',
        registration_required: initialData.registration_required || false,
        registration_link: initialData.registration_link || '',
        featured_image: initialData.featured_image || '',
        slug: initialData.slug || '',
        status: initialData.status || 'upcoming',
        has_custom_form: initialData.has_custom_form || false,
        price: initialData.price?.toString() || '',
        currency: initialData.currency || 'TL',
        latitude: initialData.latitude?.toString() || '',
        longitude: initialData.longitude?.toString() || '',
        gallery_images: initialData.gallery_images || [],
      });
      setGalleryImages(initialData.gallery_images || []);
      
      // Mevcut sponsorları yükle
      if (existingSponsors) {
        const loadedSponsors: EventSponsor[] = existingSponsors.map(sponsor => ({
          id: sponsor.id,
          sponsor_name: sponsor.sponsor_name,
          sponsor_logo: sponsor.sponsor_logo || '',
          sponsor_website: sponsor.sponsor_website || '',
          sponsor_type: sponsor.sponsor_type,
          sort_order: sponsor.sort_order || 0
        }));
        setEventSponsors(loadedSponsors);
      }
    } else {
      // Reset form for new event
      setFormData({
        title: '',
        description: '',
        event_date: '',
        end_date: '',
        location: '',
        event_type: 'seminer',
        max_participants: '',
        registration_required: false,
        registration_link: '',
        featured_image: '',
        slug: '',
        status: 'upcoming',
        has_custom_form: false,
        price: '',
        currency: 'TL',
        latitude: '',
        longitude: '',
        gallery_images: [],
      });
      setGalleryImages([]);
      setEventSponsors([]);
    }
  }, [initialData, existingSponsors]);

  // GitHub Storage functions
  const handleFeaturedImageUpload = async (file: File) => {
    const config = getGitHubStorageConfig();
    if (!config) {
      alert('GitHub Storage yapılandırılmamış!');
      return;
    }

    if (!formData.slug) {
      alert('Önce etkinlik slug\'ını giriniz!');
      return;
    }

    setIsUploading(true);
    setUploadProgress('Öne çıkan görsel yükleniyor...');

    try {
      const result = await uploadEventFeaturedImage(config, formData.slug, file);
      if (result.success && result.rawUrl) {
        setFormData(prev => ({ ...prev, featured_image: result.rawUrl }));
        setUploadProgress('Öne çıkan görsel başarıyla yüklendi!');
      } else {
        alert(`Upload hatası: ${result.error}`);
      }
    } catch (error) {
      alert(`Upload hatası: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(''), 3000);
    }
  };

  const handleGalleryImagesUpload = async (files: FileList) => {
    const config = getGitHubStorageConfig();
    if (!config) {
      alert('GitHub Storage yapılandırılmamış!');
      return;
    }

    if (!formData.slug) {
      alert('Önce etkinlik slug\'ını giriniz!');
      return;
    }

    setIsUploading(true);
    setUploadProgress('Galeri resimleri yükleniyor...');

    try {
      const fileArray = Array.from(files);
      const result = await uploadEventGalleryImages(config, formData.slug, fileArray);
      
      if (result.success) {
        const newGalleryImages = [...galleryImages, ...result.uploadedUrls];
        setGalleryImages(newGalleryImages);
        setFormData(prev => ({ ...prev, gallery_images: newGalleryImages }));
        setUploadProgress('Galeri resimleri başarıyla yüklendi!');
      } else {
        alert(`Upload hatası: ${result.failedUploads.map(f => f.error).join(', ')}`);
      }
    } catch (error) {
      alert(`Upload hatası: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(''), 3000);
    }
  };

  const removeGalleryImage = (indexToRemove: number) => {
    const newGalleryImages = galleryImages.filter((_, index) => index !== indexToRemove);
    setGalleryImages(newGalleryImages);
    setFormData(prev => ({ ...prev, gallery_images: newGalleryImages }));
  };

  // Sponsor management functions
  const handleSponsorLogoUpload = async (file: File) => {
    const config = getGitHubStorageConfig();
    if (!config) {
      alert('GitHub Storage yapılandırılmamış!');
      return;
    }

    if (!formData.slug) {
      alert('Önce etkinlik slug\'ını giriniz!');
      return;
    }

    setIsUploading(true);
    setUploadProgress('Sponsor logosu yükleniyor...');

    try {
      const fileName = `sponsor-${Date.now()}.${file.name.split('.').pop()}`;
      const filePath = `etkinlikler/${new Date().getFullYear()}/${formData.slug}/sponsorlar/${fileName}`;
      
      const result = await uploadFileObjectToGitHub(config, file, filePath, `Upload sponsor logo for event ${formData.slug}`);
      
      if (result.success && result.rawUrl) {
        setNewSponsor(prev => ({ ...prev, sponsor_logo: result.rawUrl }));
        setUploadProgress('Sponsor logosu başarıyla yüklendi!');
      } else {
        alert(`Upload hatası: ${result.error}`);
      }
    } catch (error) {
      alert(`Upload hatası: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(''), 3000);
    }
  };

  const addSponsor = () => {
    if (!newSponsor.sponsor_name.trim()) {
      alert('Sponsor adı gereklidir!');
      return;
    }

    const sponsorToAdd = {
      ...newSponsor,
      id: Date.now(), // Temporary ID for UI
      sort_order: eventSponsors.length
    };

    setEventSponsors(prev => [...prev, sponsorToAdd]);
    setNewSponsor({
      sponsor_name: '',
      sponsor_logo: '',
      sponsor_website: '',
      sponsor_type: 'destekci',
      sort_order: 0
    });
  };

  const removeSponsor = (indexToRemove: number) => {
    setEventSponsors(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const eventData: EventData & { sponsors?: EventSponsor[] } = {
      ...formData,
      max_participants: formData.max_participants ? Number(formData.max_participants) : null,
      price: formData.price ? Number(formData.price) : null,
      latitude: formData.latitude ? Number(formData.latitude) : null,
      longitude: formData.longitude ? Number(formData.longitude) : null,
      gallery_images: galleryImages,
      sponsors: eventSponsors, // Sponsorları da ekle
    };
    
    onSave(eventData);
    onClose();
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                {initialData ? '✏️ Etkinlik Düzenle' : '✨ Yeni Etkinlik Ekle'}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {initialData ? 'Mevcut etkinlik bilgilerini düzenleyin ve yönetin' : 'Harika bir etkinlik oluşturun ve katılımcılarla buluşun'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">Genel Bilgiler</TabsTrigger>
              <TabsTrigger value="media">
                <Image className="h-4 w-4 mr-2" />
                Medya & Sponsor
              </TabsTrigger>
              <TabsTrigger value="form" disabled={!formData.has_custom_form || !formData.slug}>
                <Settings className="h-4 w-4 mr-2" />
                Kayıt Formu {!formData.has_custom_form && '(Aktif Değil)'}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-4">
          <div>
            <Label htmlFor="title">Başlık</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="event_date">Başlangıç Tarihi</Label>
              <Input
                id="event_date"
                type="datetime-local"
                value={formData.event_date}
                onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="end_date">Bitiş Tarihi</Label>
              <Input
                id="end_date"
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location">Konum</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="latitude">Enlem (Harita için)</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                placeholder="40.7128 (Opsiyonel)"
              />
            </div>
            
            <div>
              <Label htmlFor="longitude">Boylam (Harita için)</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                placeholder="-74.0060 (Opsiyonel)"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="event_type">Etkinlik Türü</Label>
              <Select value={formData.event_type} onValueChange={(value) => setFormData(prev => ({ ...prev, event_type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="atolye">Atölye</SelectItem>
                  <SelectItem value="konferans">Konferans</SelectItem>
                  <SelectItem value="sosyal">Sosyal</SelectItem>
                  <SelectItem value="egitim">Eğitim</SelectItem>
                  <SelectItem value="seminer">Seminer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Durum</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Yaklaşan</SelectItem>
                  <SelectItem value="ongoing">Devam Eden</SelectItem>
                  <SelectItem value="completed">Tamamlandı</SelectItem>
                  <SelectItem value="cancelled">İptal Edildi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="max_participants">Maksimum Katılımcı</Label>
            <Input
              id="max_participants"
              type="number"
              value={formData.max_participants}
              onChange={(e) => setFormData(prev => ({ ...prev, max_participants: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Etkinlik Ücreti</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="0.00 (Ücretsiz için boş bırakın)"
              />
            </div>
            <div>
              <Label htmlFor="currency">Para Birimi</Label>
              <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                <SelectTrigger>
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

          <div className="flex items-center space-x-2">
            <Switch
              id="registration_required"
              checked={formData.registration_required}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, registration_required: checked }))}
            />
            <Label htmlFor="registration_required">Kayıt Gerekli</Label>
          </div>

          {formData.registration_required && (
            <div>
              <Label htmlFor="registration_link">Kayıt Linki</Label>
              <Input
                id="registration_link"
                value={formData.registration_link}
                onChange={(e) => setFormData(prev => ({ ...prev, registration_link: e.target.value }))}
                placeholder="https://example.com/register"
              />
            </div>
          )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="has_custom_form"
                  checked={formData.has_custom_form}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, has_custom_form: checked }))}
                />
                <Label htmlFor="has_custom_form">Özel Kayıt Formu Kullan</Label>
              </div>
            </TabsContent>

            <TabsContent value="media" className="space-y-4">
          <div>
                <Label htmlFor="featured_image">Öne Çıkan Görsel</Label>
                <div className="space-y-3">
            <Input
              id="featured_image"
              value={formData.featured_image}
              onChange={(e) => setFormData(prev => ({ ...prev, featured_image: e.target.value }))}
                    placeholder="Manuel URL girebilir veya dosya yükleyebilirsiniz"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => featuredImageRef.current?.click()}
                      disabled={isUploading || !formData.slug}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Görsel Yükle
                    </Button>
                    {!formData.slug && (
                      <span className="text-sm text-muted-foreground">Önce başlık giriniz</span>
                    )}
                  </div>
                  
                  {/* Görsel Önizleme */}
                  {formData.featured_image && (
                    <div className="border rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800">
                      <div className="p-3 bg-gray-100 dark:bg-gray-700 border-b">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">📸 Önizleme</Label>
                      </div>
                      <div className="p-4 flex justify-center">
                        <img
                          src={formData.featured_image}
                          alt="Öne çıkan görsel önizleme"
                          className="max-w-full max-h-48 object-contain rounded border shadow-sm"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                            (e.target as HTMLImageElement).alt = 'Görsel yüklenemedi';
                          }}
                        />
                      </div>
                    </div>
                  )}
                  
                  <input
                    ref={featuredImageRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFeaturedImageUpload(file);
                    }}
                  />
                </div>
              </div>

              <div>
                <Label>Galeri Resimleri</Label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => galleryImagesRef.current?.click()}
                      disabled={isUploading || !formData.slug}
                      className="flex items-center gap-2"
                    >
                      <Image className="h-4 w-4" />
                      Galeri Resimleri Ekle
                    </Button>
                    {!formData.slug && (
                      <span className="text-sm text-muted-foreground">Önce slug giriniz</span>
                    )}
                  </div>
                  <input
                    ref={galleryImagesRef}
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files && files.length > 0) handleGalleryImagesUpload(files);
                    }}
                  />
                  
                  {galleryImages.length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">🖼️ Galeri Resimleri ({galleryImages.length})</Label>
                      <div className="border rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800">
                        <div className="p-3 bg-gray-100 dark:bg-gray-700 border-b">
                          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">📸 Galeri Önizleme</Label>
                        </div>
                        <div className="p-4">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {galleryImages.map((imageUrl, index) => (
                              <div key={index} className="relative group">
                                <div className="aspect-square bg-white rounded border overflow-hidden shadow-sm">
                                  <img
                                    src={imageUrl}
                                    alt={`Galeri resmi ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                                      (e.target as HTMLImageElement).alt = 'Görsel yüklenemedi';
                                    }}
                                  />
                                </div>
                                <div className="absolute top-1 right-1">
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => removeGalleryImage(index)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                                <div className="absolute bottom-1 left-1">
                                  <Badge variant="secondary" className="text-xs">
                                    {index + 1}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label>Etkinlik Sponsorları</Label>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg space-y-3">
                    <Label className="text-sm font-medium">Yeni Sponsor Ekle</Label>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="sponsor_name">Sponsor Adı</Label>
                        <Input
                          id="sponsor_name"
                          value={newSponsor.sponsor_name}
                          onChange={(e) => setNewSponsor(prev => ({ ...prev, sponsor_name: e.target.value }))}
                          placeholder="Sponsor kuruluş adı"
                        />
                      </div>
                      <div>
                        <Label htmlFor="sponsor_type">Sponsor Türü</Label>
                        <Select 
                          value={newSponsor.sponsor_type} 
                          onValueChange={(value) => setNewSponsor(prev => ({ ...prev, sponsor_type: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ana">Ana Sponsor</SelectItem>
                            <SelectItem value="destekci">Destekçi</SelectItem>
                            <SelectItem value="medya">Medya Sponsoru</SelectItem>
                            <SelectItem value="yerel">Yerel Partner</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="sponsor_website">Web Sitesi</Label>
                      <Input
                        id="sponsor_website"
                        value={newSponsor.sponsor_website}
                        onChange={(e) => setNewSponsor(prev => ({ ...prev, sponsor_website: e.target.value }))}
                        placeholder="https://sponsor-website.com (Opsiyonel)"
            />
          </div>

                    <div>
                      <Label htmlFor="sponsor_logo">Sponsor Logosu</Label>
                      <div className="space-y-2">
                        <Input
                          id="sponsor_logo"
                          value={newSponsor.sponsor_logo}
                          onChange={(e) => setNewSponsor(prev => ({ ...prev, sponsor_logo: e.target.value }))}
                          placeholder="Manuel URL girebilir veya dosya yükleyebilirsiniz"
                        />
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => sponsorLogoRef.current?.click()}
                            disabled={isUploading || !formData.slug}
                            className="flex items-center gap-2"
                          >
                            <Upload className="h-4 w-4" />
                            Logo Yükle
                          </Button>
                          <Button
                            type="button"
                            onClick={addSponsor}
                            size="sm"
                          >
                            Sponsor Ekle
                          </Button>
                        </div>
                        <input
                          ref={sponsorLogoRef}
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleSponsorLogoUpload(file);
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {eventSponsors.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Eklenen Sponsorlar:</Label>
                      <div className="space-y-2">
                        {eventSponsors.map((sponsor, index) => (
                          <div key={sponsor.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              {sponsor.sponsor_logo && (
                                <img
                                  src={sponsor.sponsor_logo}
                                  alt={sponsor.sponsor_name}
                                  className="w-8 h-8 object-contain bg-white rounded"
                                />
                              )}
                              <div>
                                <div className="font-medium">{sponsor.sponsor_name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {sponsor.sponsor_type} • {sponsor.sponsor_website || 'Web sitesi yok'}
                                </div>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSponsor(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {isUploading && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">{uploadProgress}</span>
                </div>
              )}
            </TabsContent>

            <TabsContent value="form" className="space-y-4">
              {formData.has_custom_form && formData.slug && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                    <h3 className="font-medium mb-2">Etkinlik Kayıt Formu</h3>
                    <p className="text-sm text-muted-foreground">
                      Bu etkinlik için özel kayıt formu oluşturun. Katılımcılar bu formu doldurarak etkinliğe kayıt olabilirler.
                    </p>
                  </div>
                  <FormBuilder 
                    formId={formData.slug} 
                    formType="event_registration"
                    formTitle={formData.title}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              İptal
            </Button>
            <Button type="submit">
              {initialData ? 'Güncelle' : 'Kaydet'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventModal;
