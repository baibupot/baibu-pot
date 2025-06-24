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
import { Upload, X, Image, FileText, Loader2, Settings, Plus } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';
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
import { 
  DEFAULT_EVENT_TYPE,
  DEFAULT_EVENT_STATUS,
  DEFAULT_SPONSOR_TYPE,
  getSponsorTypeIcon,
  EVENT_TYPES,
  EVENT_STATUSES,
  SPONSOR_TYPES,
  type EventType,
  type EventStatus,
  type SponsorType
} from '@/constants/eventConstants';

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
    event_type: initialData?.event_type || DEFAULT_EVENT_TYPE,
    max_participants: initialData?.max_participants || '',
    registration_required: initialData?.registration_required || false,
    registration_link: initialData?.registration_link || '',
    featured_image: initialData?.featured_image || '',
    slug: initialData?.slug || '',
    status: initialData?.status || DEFAULT_EVENT_STATUS,
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
    sponsor_type: DEFAULT_SPONSOR_TYPE,
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

  // Helper functions for location parsing
  const parseLocationInput = (input: string): { lat: string; lng: string; success: boolean; source: string } => {
    if (!input.trim()) return { lat: '', lng: '', success: false, source: '' };
    
    // Google Maps link formatları
    const googleMapsPatterns = [
      // https://maps.app.goo.gl/... kısa linkler için 
      /maps\.app\.goo\.gl/,
      // https://maps.google.com/maps?q=40.123,31.456 formatı
      /[?&]q=([+-]?\d*\.?\d+),([+-]?\d*\.?\d+)/,
      // https://maps.google.com/@40.123,31.456,15z formatı  
      /@([+-]?\d*\.?\d+),([+-]?\d*\.?\d+)/,
      // Google Maps share linklerinden
      /!3d([+-]?\d*\.?\d+)!4d([+-]?\d*\.?\d+)/
    ];
    
    // Direkt koordinat formatları
    const coordPatterns = [
      // "40.714097, 31.512173" formatı
      /^([+-]?\d*\.?\d+)[,\s]+([+-]?\d*\.?\d+)$/,
      // "40.714097,31.512173" formatı (boşluksuz)
      /^([+-]?\d*\.?\d+),([+-]?\d*\.?\d+)$/,
      // "Lat: 40.714097, Lng: 31.512173" formatı
      /lat[:\s]*([+-]?\d*\.?\d+)[,\s]*lng[:\s]*([+-]?\d*\.?\d+)/i,
      // "40.714097 N, 31.512173 E" formatı
      /([+-]?\d*\.?\d+)[^\d]*([+-]?\d*\.?\d+)/
    ];

    // Google Maps URL pattern kontrolü
    for (const pattern of googleMapsPatterns) {
      const match = input.match(pattern);
      if (match) {
        if (pattern.source.includes('q=') && match[1] && match[2]) {
          return { lat: match[1], lng: match[2], success: true, source: 'Google Maps Link' };
        }
        if (pattern.source.includes('@') && match[1] && match[2]) {
          return { lat: match[1], lng: match[2], success: true, source: 'Google Maps Share' };
        }
        if (pattern.source.includes('!3d') && match[1] && match[2]) {
          return { lat: match[1], lng: match[2], success: true, source: 'Google Maps Embed' };
        }
        // Kısa link için genel uyarı
        if (pattern.source.includes('goo.gl')) {
          return { lat: '', lng: '', success: false, source: 'Kısa Link Algılandı - Tam URL gerekli' };
        }
      }
    }

    // Direkt koordinat kontrolü
    for (const pattern of coordPatterns) {
      const match = input.match(pattern);
      if (match && match[1] && match[2]) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        // Koordinat geçerlilik kontrolü
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          return { lat: lat.toString(), lng: lng.toString(), success: true, source: 'Koordinat' };
        }
      }
    }

    return { lat: '', lng: '', success: false, source: 'Tanınmayan Format' };
  };

  const [locationInput, setLocationInput] = useState('');
  const [locationParseResult, setLocationParseResult] = useState<{ lat: string; lng: string; success: boolean; source: string } | null>(null);

  const handleLocationInputChange = (value: string) => {
    setLocationInput(value);
    if (value.trim()) {
      const result = parseLocationInput(value);
      setLocationParseResult(result);
      if (result.success) {
        setFormData(prev => ({ 
          ...prev, 
          latitude: result.lat, 
          longitude: result.lng 
        }));
      }
    } else {
      setLocationParseResult(null);
      setFormData(prev => ({ ...prev, latitude: '', longitude: '' }));
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

  // Helper function to handle registration method changes
  const handleRegistrationMethodChange = (method: 'external' | 'internal' | 'none') => {
    switch (method) {
      case 'external':
        setFormData(prev => ({ 
          ...prev, 
          registration_required: true,
          has_custom_form: false,
          registration_link: prev.registration_link || ''
        }));
        break;
      case 'internal':
        setFormData(prev => ({ 
          ...prev, 
          registration_required: true,
          has_custom_form: true,
          registration_link: ''
        }));
        break;
      case 'none':
        setFormData(prev => ({ 
          ...prev, 
          registration_required: false,
          has_custom_form: false,
          registration_link: ''
        }));
        break;
    }
  };

  // Get current registration method
  const getCurrentRegistrationMethod = (): 'external' | 'internal' | 'none' => {
    if (!formData.registration_required) return 'none';
    if (formData.registration_link) return 'external';
    if (formData.has_custom_form) return 'internal';
    return 'none';
  };

  // Form validation helper
  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Required field validations
    if (!formData.title?.trim()) {
      errors.push('Etkinlik başlığı zorunludur');
    }
    if (!formData.description?.trim()) {
      errors.push('Etkinlik açıklaması zorunludur');
    }
    if (!formData.event_date) {
      errors.push('Etkinlik tarihi zorunludur');
    }

    // Title length validation
    if (formData.title && formData.title.length > 100) {
      errors.push('Etkinlik başlığı 100 karakterden uzun olamaz');
    }

    // Date validation
    if (formData.event_date) {
      const eventDate = new Date(formData.event_date);
      const now = new Date();
      if (eventDate < now) {
        errors.push('Etkinlik tarihi gelecekte olmalıdır');
      }
    }

    // End date validation
    if (formData.end_date && formData.event_date) {
      const startDate = new Date(formData.event_date);
      const endDate = new Date(formData.end_date);
      if (endDate <= startDate) {
        errors.push('Bitiş tarihi başlangıç tarihinden sonra olmalıdır');
      }
    }

    // Price validation
    if (formData.price && Number(formData.price) < 0) {
      errors.push('Etkinlik ücreti negatif olamaz');
    }

    // Max participants validation
    if (formData.max_participants && Number(formData.max_participants) <= 0) {
      errors.push('Maksimum katılımcı sayısı pozitif olmalıdır');
    }

    // Registration validation
    if (formData.registration_required) {
      if (!formData.registration_link?.trim() && !formData.has_custom_form) {
        errors.push('Kayıt gerekli ise kayıt yöntemi belirtilmelidir');
      }
    }

    // URL validation for registration link
    if (formData.registration_link?.trim()) {
      try {
        new URL(formData.registration_link);
      } catch {
        errors.push('Geçerli bir kayıt linki giriniz');
      }
    }

    return { isValid: errors.length === 0, errors };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateForm();
    if (!validation.isValid) {
      toast.error(`❌ Form Hatası:\n${validation.errors.join('\n')}`);
      return;
    }
    
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
      <DialogContent className="max-w-[100vw] max-h-[100vh] sm:max-w-5xl sm:max-h-[95vh] sm:rounded-xl overflow-y-auto p-0 sm:p-6">
        {/* Enhanced Header with Smart Progress */}
        <DialogHeader className="sticky top-0 z-50 bg-gradient-to-r from-blue-50 via-purple-50 to-cyan-50 dark:from-blue-900/30 dark:via-purple-900/30 dark:to-cyan-900/30 backdrop-blur-sm border-b border-blue-200 dark:border-blue-700 p-4 sm:p-6 sm:rounded-t-xl">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">{initialData ? '✏️' : '🎉'}</span>
                </div>
                <div className="flex-1">
                  <DialogTitle className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent leading-tight">
                    {initialData ? '✏️ Etkinlik Düzenle' : '🎉 Yeni Etkinlik Oluştur'}
                  </DialogTitle>
                  <DialogDescription className="text-xs sm:text-base mt-1 text-gray-600 dark:text-gray-300">
                    {initialData ? 'Mevcut etkinlik bilgilerini düzenleyin ve yönetin' : 'Harika bir etkinlik oluşturmak için adım adım rehberi takip edin'}
                  </DialogDescription>
                </div>
              </div>
              
              {/* Smart Progress Indicator */}
              <div className="flex items-center gap-4 mt-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    {/* Step indicators */}
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full transition-all ${formData.title ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                      <span>{formData.title ? '✅' : '📝'}</span>
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full transition-all ${formData.featured_image || galleryImages.length > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                      <span>{formData.featured_image || galleryImages.length > 0 ? '✅' : '🎨'}</span>
                      <span className="hidden sm:inline">Medya</span>
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full transition-all ${formData.has_custom_form && formData.slug ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                      <span>{formData.has_custom_form && formData.slug ? '✅' : '📋'}</span>
                      <span className="hidden sm:inline">Kayıt Form</span>
                    </div>
                  </div>
                </div>
                
                {/* Completion Badge */}
                {formData.title && formData.event_date && (
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-md">
                    🎯 Yayınlamaya Hazır
                  </div>
                )}
              </div>
            </div>
            
            {/* Mobile Close Button */}
            <button 
              onClick={onClose}
              className="sm:hidden ml-4 p-2 rounded-full bg-white dark:bg-gray-700 shadow-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="p-4 sm:p-0 space-y-4 sm:space-y-6">
          <Tabs defaultValue="general" className="w-full">
            {/* Mobile-First Tabs Navigation */}
            <TabsList className="sticky top-[120px] sm:top-0 z-40 w-full grid grid-cols-3 gap-1 h-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 rounded-xl shadow-lg sm:shadow-none mb-4 sm:mb-6">
              <TabsTrigger 
                value="general" 
                className="flex flex-col items-center justify-center p-3 sm:p-4 h-auto min-h-[60px] sm:min-h-[80px] data-[state=active]:bg-blue-50 data-[state=active]:border-blue-200 data-[state=active]:shadow-sm dark:data-[state=active]:bg-blue-900/30 dark:data-[state=active]:border-blue-700 rounded-lg border-2 border-transparent transition-all duration-200"
              >
                <div className="text-lg sm:text-2xl mb-1">📝</div>
                <div className="font-medium text-xs sm:text-sm text-center leading-tight">Genel</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block text-center">Etkinlik detayları</div>
              </TabsTrigger>
              <TabsTrigger 
                value="media"
                className="flex flex-col items-center justify-center p-3 sm:p-4 h-auto min-h-[60px] sm:min-h-[80px] data-[state=active]:bg-purple-50 data-[state=active]:border-purple-200 data-[state=active]:shadow-sm dark:data-[state=active]:bg-purple-900/30 dark:data-[state=active]:border-purple-700 rounded-lg border-2 border-transparent transition-all duration-200"
              >
                <div className="text-lg sm:text-2xl mb-1">🎨</div>
                <div className="font-medium text-xs sm:text-sm text-center leading-tight">Medya</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block text-center">Görseller ve sponsorlar</div>
              </TabsTrigger>
              <TabsTrigger 
                value="form" 
                disabled={!formData.has_custom_form || !formData.slug}
                className="flex flex-col items-center justify-center p-3 sm:p-4 h-auto min-h-[60px] sm:min-h-[80px] data-[state=active]:bg-green-50 data-[state=active]:border-green-200 data-[state=active]:shadow-sm dark:data-[state=active]:bg-green-900/30 dark:data-[state=active]:border-green-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg border-2 border-transparent transition-all duration-200"
              >
                <div className="text-lg sm:text-2xl mb-1">{formData.has_custom_form ? '📋' : '🔒'}</div>
                <div className="font-medium text-xs sm:text-sm text-center leading-tight">Form</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block text-center">
                  {!formData.has_custom_form ? 'Etkinleştirin' : 'Kayıt formu'}
                </div>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-6">
              {/* Temel Bilgiler Bölümü */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 p-6 rounded-xl border border-blue-200 dark:border-blue-700">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-4 flex items-center">
                  📝 Temel Bilgiler
                </h3>
                <div className="space-y-4">
          <div>
                    <Label htmlFor="title" className="text-base font-medium flex items-center gap-2">
                      📝 Etkinlik Başlığı *
                    </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
                      className="mt-2 h-12 sm:h-14 text-base sm:text-lg border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="🎯 Etkinliğinizin çekici bir başlığını girin..."
                    />
                    {formData.title && (
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                        <span className="text-blue-700 dark:text-blue-300 text-sm">
                          🔗 URL Önizleme: <br className="sm:hidden"/>
                          <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded text-xs break-all">
                            /etkinlikler/{generateSlug(formData.title)}
                          </code>
                        </span>
                      </div>
                    )}
          </div>

          <div>
                    <Label htmlFor="description" className="text-base font-medium flex items-center gap-2">
                      📄 Etkinlik Açıklaması *
                    </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              required
                      className="mt-2 text-base border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                      placeholder="📝 Etkinliğinizi detaylı bir şekilde tanıtın..."
            />
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              💡 Katılımcıların ilgisini çekecek detayları ekleyin
            </div>
                  </div>
                </div>
          </div>

              {/* Tarih ve Zaman Bölümü */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 p-6 rounded-xl border border-purple-200 dark:border-purple-700">
                <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300 mb-4 flex items-center">
                  📅 Tarih ve Zaman
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                    <Label htmlFor="event_date" className="text-base font-medium">Başlangıç Tarihi *</Label>
              <Input
                id="event_date"
                type="datetime-local"
                value={formData.event_date}
                onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
                required
                      className="mt-1 h-12"
              />
            </div>
            <div>
                    <Label htmlFor="end_date" className="text-base font-medium">Bitiş Tarihi</Label>
              <Input
                id="end_date"
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                      className="mt-1 h-12"
              />
                  </div>
            </div>
          </div>

              {/* Konum Bilgileri */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 p-6 rounded-xl border border-green-200 dark:border-green-700">
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-4 flex items-center">
                  📍 Konum Bilgileri
                </h3>
                <div className="space-y-4">
          <div>
                    <Label htmlFor="location" className="text-base font-medium">Etkinlik Konumu</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className="mt-1 h-12 text-base"
                      placeholder="Örnek: İstanbul Üniversitesi Merkez Kampüs"
            />
          </div>

                  {/* Akıllı Konum Girişi */}
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/10 dark:to-blue-900/10 p-4 rounded-lg border border-green-200 dark:border-green-700">
                      <Label htmlFor="location_smart" className="text-base font-medium text-green-800 dark:text-green-300 flex items-center mb-3">
                        📍 Akıllı Konum Girişi
                      </Label>
                      <div className="space-y-3">
                        <Input
                          id="location_smart"
                          value={locationInput}
                          onChange={(e) => handleLocationInputChange(e.target.value)}
                          placeholder="🔍 Koordinat veya Google Maps linki yapıştırın... (Örnek: 40.714097, 31.512173)"
                          className="text-base h-12"
                        />
                        
                        <div className="text-sm space-y-2">
                          <div className="flex flex-wrap gap-2">
                            <span className="text-gray-600 dark:text-gray-400">📋 Desteklenen formatlar:</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                            <div className="bg-white dark:bg-gray-800 p-2 rounded border">
                              <span className="font-mono text-blue-600">40.714097, 31.512173</span>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-2 rounded border">
                              <span className="font-mono text-blue-600">maps.google.com/@40.714,31.512</span>
                            </div>
                          </div>
                        </div>

                        {locationParseResult && (
                          <div className={`p-3 rounded-lg border ${locationParseResult.success ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700' : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700'}`}>
                            {locationParseResult.success ? (
                              <div className="flex items-start space-x-2">
                                <div className="text-green-600 dark:text-green-400 mt-0.5">✅</div>
                                <div className="flex-1">
                                  <div className="font-medium text-green-800 dark:text-green-300">Konum başarıyla algılandı!</div>
                                  <div className="text-sm text-green-600 dark:text-green-400 mt-1">
                                    <strong>Kaynak:</strong> {locationParseResult.source}<br/>
                                    <strong>Enlem:</strong> {locationParseResult.lat}<br/>
                                    <strong>Boylam:</strong> {locationParseResult.lng}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-start space-x-2">
                                <div className="text-red-600 dark:text-red-400 mt-0.5">❌</div>
                                <div className="flex-1">
                                  <div className="font-medium text-red-800 dark:text-red-300">Konum algılanamadı</div>
                                  <div className="text-sm text-red-600 dark:text-red-400 mt-1">
                                    {locationParseResult.source || 'Desteklenen formatlardan birini kullanın'}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Manuel Koordinat Girişi */}
                    <details className="group">
                      <summary className="cursor-pointer text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 flex items-center">
                        ⚙️ Gelişmiş: Manuel koordinat girişi
                        <span className="ml-2 transform group-open:rotate-180 transition-transform">▼</span>
                      </summary>
                      <div className="mt-3 grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <Label htmlFor="latitude">Enlem (Latitude)</Label>
                          <Input
                            id="latitude"
                            type="number"
                            step="any"
                            value={formData.latitude}
                            onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                            placeholder="40.7128"
                          />
                        </div>
                        <div>
                          <Label htmlFor="longitude">Boylam (Longitude)</Label>
                          <Input
                            id="longitude"
                            type="number"
                            step="any"
                            value={formData.longitude}
                            onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                            placeholder="31.5173"
                          />
                        </div>
                      </div>
                    </details>
                  </div>
                </div>
              </div>

              {/* Etkinlik Ayarları */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/10 dark:to-red-900/10 p-6 rounded-xl border border-orange-200 dark:border-orange-700">
                <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-300 mb-4 flex items-center">
                  ⚙️ Etkinlik Ayarları
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                      <Label htmlFor="event_type" className="text-base font-medium">Etkinlik Türü</Label>
              <Select value={formData.event_type} onValueChange={(value) => setFormData(prev => ({ ...prev, event_type: value }))}>
                        <SelectTrigger className="mt-1 h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                          {Object.entries(EVENT_TYPES).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                </SelectContent>
              </Select>
            </div>
            <div>
                      <Label htmlFor="status" className="text-base font-medium">Durum</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                        <SelectTrigger className="mt-1 h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                          {Object.entries(EVENT_STATUSES).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
                    <Label htmlFor="max_participants" className="text-base font-medium">Maksimum Katılımcı Sayısı</Label>
            <Input
              id="max_participants"
              type="number"
              value={formData.max_participants}
              onChange={(e) => setFormData(prev => ({ ...prev, max_participants: e.target.value }))}
                      className="mt-1 h-12"
                      placeholder="Örnek: 50 (Sınırsız için boş bırakın)"
            />
          </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price" className="text-base font-medium">Etkinlik Ücreti</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="0.00 (Ücretsiz için boş bırakın)"
                        className="mt-1 h-12"
                      />
                    </div>
                    <div>
                      <Label htmlFor="currency" className="text-base font-medium">Para Birimi</Label>
                      <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                        <SelectTrigger className="mt-1 h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TL">💰 TL</SelectItem>
                          <SelectItem value="USD">💵 USD</SelectItem>
                          <SelectItem value="EUR">💶 EUR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kayıt Ayarları */}
              <div className="bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-900/10 dark:to-teal-900/10 p-6 rounded-xl border border-cyan-200 dark:border-cyan-700">
                <h3 className="text-lg font-semibold text-cyan-800 dark:text-cyan-300 mb-4 flex items-center">
                  📝 Kayıt Ayarları
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg border">
            <Switch
              id="registration_required"
              checked={formData.registration_required}
              onCheckedChange={(checked) => handleRegistrationMethodChange(checked ? 'external' : 'none')}
            />
                    <div className="flex-1">
                      <Label htmlFor="registration_required" className="text-base font-medium">Kayıt Gerekli</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Katılımcıların önceden kayıt olması gereksin mi?</p>
                    </div>
          </div>

          {formData.registration_required && (
            <div className="space-y-4">
              {/* Kayıt Yöntemi Seçimi */}
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-700">
                <div className="flex items-start gap-3">
                  <span className="text-amber-600 dark:text-amber-400 text-lg">⚡</span>
                  <div>
                    <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-1">Kayıt Yöntemi Seçimi</h4>
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      Sadece bir kayıt yöntemi seçebilirsiniz. Harici link (Google Forms) veya özel form sistemi.
                    </p>
                  </div>
                </div>
              </div>

              {/* Harici Kayıt Linki */}
              <div className={`transition-all duration-200 ${formData.has_custom_form ? 'opacity-60 pointer-events-none' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="registration_link" className="text-base font-medium flex items-center gap-2">
                    🔗 Harici Kayıt Linki
                  </Label>
                  {formData.has_custom_form && (
                    <Badge variant="secondary" className="text-xs">Devre Dışı</Badge>
                  )}
                </div>
                <Input
                  id="registration_link"
                  value={formData.registration_link}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleRegistrationMethodChange(value.trim() ? 'external' : 'none');
                  }}
                  placeholder="https://forms.google.com/... veya https://eventbrite.com/..."
                  className="mt-1 h-12"
                  disabled={formData.has_custom_form}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formData.has_custom_form 
                    ? "Özel form aktifken harici link kullanılamaz" 
                    : "Google Forms, Eventbrite, Typeform vs. harici platformları buraya ekleyin"}
                </p>
              </div>

              {/* ÖR İle Ayırıcı */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 px-3">VEYA</span>
                <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
              </div>

              {/* Özel Kayıt Formu */}
              <div className={`transition-all duration-200 ${formData.registration_link?.trim() ? 'opacity-60 pointer-events-none' : ''}`}>
                <div className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg border">
                  <Switch
                    id="has_custom_form"
                    checked={formData.has_custom_form}
                    onCheckedChange={(checked) => handleRegistrationMethodChange(checked ? 'internal' : 'none')}
                    disabled={!!formData.registration_link?.trim()}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="has_custom_form" className="text-base font-medium">🏗️ Özel Kayıt Formu Kullan</Label>
                      {formData.registration_link?.trim() && (
                        <Badge variant="secondary" className="text-xs">Devre Dışı</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formData.registration_link?.trim() 
                        ? "Harici link varken özel form kullanılamaz" 
                        : "Kendi sistemimizde özelleştirilebilir kayıt formu oluşturun"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Aktif Durum Göstergesi */}
              {(formData.registration_link?.trim() || formData.has_custom_form) && (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                  <div className="flex items-center gap-3">
                    <span className="text-green-600 dark:text-green-400 text-lg">✅</span>
                    <div>
                      <h4 className="font-medium text-green-800 dark:text-green-300">Aktif Kayıt Yöntemi</h4>
                      <p className="text-sm text-green-700 dark:text-green-400">
                        {formData.registration_link?.trim() 
                          ? `🔗 Harici platform: ${new URL(formData.registration_link).hostname}`
                          : "🏗️ Özel kayıt formu sistemi"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="media" className="space-y-6">
              {/* Öne Çıkan Görsel Bölümü */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 p-6 rounded-xl border border-purple-200 dark:border-purple-700">
                <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300 mb-4 flex items-center">
                  🖼️ Öne Çıkan Görsel
                </h3>
                <div className="space-y-4">
          <div>
                    <Label htmlFor="featured_image" className="text-base font-medium">Görsel URL'si</Label>
            <Input
              id="featured_image"
              value={formData.featured_image}
              onChange={(e) => setFormData(prev => ({ ...prev, featured_image: e.target.value }))}
                      placeholder="Manuel URL girebilir veya aşağıdan dosya yükleyebilirsiniz"
                      className="mt-1 h-12 text-base"
            />
          </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => featuredImageRef.current?.click()}
                      disabled={isUploading || !formData.slug}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-5 w-5" />
                      {isUploading ? 'Yükleniyor...' : 'Görsel Yükle'}
                    </Button>
                    {!formData.slug && (
                      <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg">
                        <span>⚠️</span>
                        <span>Önce başlık giriniz</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Görsel Önizleme */}
                  {formData.featured_image && (
                    <div className="border rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                          👁️ Önizleme
                        </Label>
                      </div>
                      <div className="p-6 flex justify-center">
                        <img
                          src={formData.featured_image}
                          alt="Öne çıkan görsel önizleme"
                          className="max-w-full max-h-64 object-contain rounded-lg border shadow-sm"
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

              {/* Galeri Resimleri Bölümü */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 p-6 rounded-xl border border-blue-200 dark:border-blue-700">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-4 flex items-center">
                  🎨 Galeri Resimleri
                </h3>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => galleryImagesRef.current?.click()}
                      disabled={isUploading || !formData.slug}
                      className="flex items-center gap-2"
                    >
                      <Image className="h-5 w-5" />
                      {isUploading ? 'Yükleniyor...' : 'Galeri Resimleri Ekle'}
                    </Button>
                    {!formData.slug && (
                      <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg">
                        <span>⚠️</span>
                        <span>Önce başlık giriniz</span>
                      </div>
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
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-medium flex items-center gap-2">
                          🖼️ Galeri Resimleri
                          <Badge variant="secondary">{galleryImages.length}</Badge>
                        </Label>
                      </div>
                      <div className="border rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
                        <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b">
                          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">📸 Galeri Önizleme</Label>
                        </div>
                        <div className="p-6">
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {galleryImages.map((imageUrl, index) => (
                              <div key={index} className="relative group">
                                <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden shadow-sm border">
                                  <img
                                    src={imageUrl}
                                    alt={`Galeri resmi ${index + 1}`}
                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                                      (e.target as HTMLImageElement).alt = 'Görsel yüklenemedi';
                                    }}
                                  />
                                </div>
                                <div className="absolute top-2 right-2">
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                    onClick={() => removeGalleryImage(index)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                                <div className="absolute bottom-2 left-2">
                                  <Badge className="text-xs bg-black/70 text-white border-0">
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

              {/* Sponsorlar Bölümü */}
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/10 dark:to-green-900/10 p-6 rounded-xl border border-emerald-200 dark:border-emerald-700">
                <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-300 mb-4 flex items-center">
                  🤝 Etkinlik Sponsorları
                </h3>
                <div className="space-y-6">
                  {/* Yeni Sponsor Ekleme Formu */}
                  <div className="p-6 border rounded-xl bg-white dark:bg-gray-800 shadow-sm">
                    <Label className="text-base font-medium mb-4 block flex items-center gap-2">
                      ➕ Yeni Sponsor Ekle
                    </Label>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="sponsor_name" className="text-sm font-medium">Sponsor Adı *</Label>
                          <Input
                            id="sponsor_name"
                            value={newSponsor.sponsor_name}
                            onChange={(e) => setNewSponsor(prev => ({ ...prev, sponsor_name: e.target.value }))}
                            placeholder="Örnek: ABC Teknoloji"
                            className="mt-1 h-11"
                          />
                        </div>
                        <div>
                          <Label htmlFor="sponsor_type" className="text-sm font-medium">Sponsor Türü</Label>
                          <Select 
                            value={newSponsor.sponsor_type} 
                            onValueChange={(value) => setNewSponsor(prev => ({ ...prev, sponsor_type: value }))}
                          >
                            <SelectTrigger className="mt-1 h-11">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(SPONSOR_TYPES).map(([key, label]) => (
                                <SelectItem key={key} value={key}>
                                  {getSponsorTypeIcon(key as SponsorType)} {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="sponsor_website" className="text-sm font-medium">Web Sitesi</Label>
                        <Input
                          id="sponsor_website"
                          value={newSponsor.sponsor_website}
                          onChange={(e) => setNewSponsor(prev => ({ ...prev, sponsor_website: e.target.value }))}
                          placeholder="https://sponsor-website.com (Opsiyonel)"
                          className="mt-1 h-11"
                        />
                      </div>

                      <div>
                        <Label htmlFor="sponsor_logo" className="text-sm font-medium">Sponsor Logosu</Label>
                        <div className="space-y-3 mt-1">
                          <Input
                            id="sponsor_logo"
                            value={newSponsor.sponsor_logo}
                            onChange={(e) => setNewSponsor(prev => ({ ...prev, sponsor_logo: e.target.value }))}
                            placeholder="Manuel URL girebilir veya dosya yükleyebilirsiniz"
                            className="h-11"
                          />
                          <div className="flex flex-col sm:flex-row gap-3">
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
                              disabled={!newSponsor.sponsor_name.trim()}
                              className="flex items-center gap-2"
                            >
                              <Plus className="h-4 w-4" />
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
                  </div>

                  {/* Eklenen Sponsorlar */}
                  {eventSponsors.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-medium flex items-center gap-2">
                          ✅ Eklenen Sponsorlar
                          <Badge variant="secondary">{eventSponsors.length}</Badge>
                        </Label>
                      </div>
                      <div className="space-y-3">
                        {eventSponsors.map((sponsor, index) => (
                          <div key={sponsor.id} className="flex items-center justify-between p-4 border rounded-xl bg-white dark:bg-gray-800 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                              {sponsor.sponsor_logo && (
                                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                                  <img
                                    src={sponsor.sponsor_logo}
                                    alt={sponsor.sponsor_name}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                                    }}
                                  />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                  {sponsor.sponsor_name}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 flex flex-wrap gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {getSponsorTypeIcon(sponsor.sponsor_type as SponsorType)} {SPONSOR_TYPES[sponsor.sponsor_type as SponsorType] || sponsor.sponsor_type}
                                  </Badge>
                                  {sponsor.sponsor_website && (
                                    <a 
                                      href={sponsor.sponsor_website} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-600 dark:text-blue-400 hover:underline text-xs"
                                    >
                                      🔗 Web sitesi
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSponsor(index)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
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

              {/* Upload Progress */}
              {isUploading && (
                <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-300">{uploadProgress}</span>
                </div>
              )}
            </TabsContent>

            <TabsContent value="form" className="space-y-4">
              {/* Form Builder Ana Container */}
              <div className="space-y-6">
                {/* Durum Kontrol ve Uyarılar */}
                {!formData.has_custom_form && (
                  <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-4xl">🔒</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Özel Kayıt Formu Devre Dışı
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                      Özel kayıt formu oluşturmak için "Genel Bilgiler" sekmesindeki "Kayıt Ayarları" bölümünden 
                      <span className="font-semibold text-blue-600 dark:text-blue-400"> "Özel Kayıt Formu Kullan"</span> seçeneğini aktifleştirin.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <span>📋</span>
                      <span>Adım: Genel Bilgiler → Kayıt Ayarları → Özel Kayıt Formu Kullan</span>
                    </div>
                  </div>
                )}

                {formData.has_custom_form && !formData.slug && (
                  <div className="text-center py-16 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-600">
                    <div className="w-24 h-24 mx-auto mb-6 bg-amber-200 dark:bg-amber-800 rounded-full flex items-center justify-center">
                      <span className="text-4xl">⚠️</span>
                    </div>
                    <h3 className="text-xl font-semibold text-amber-800 dark:text-amber-300 mb-3">
                      Etkinlik Başlığı Gerekli
                    </h3>
                    <p className="text-amber-700 dark:text-amber-400 max-w-md mx-auto mb-6">
                      Kayıt formu oluşturmak için önce <span className="font-semibold">"Genel Bilgiler"</span> sekmesinden 
                      <span className="font-semibold"> etkinlik başlığını</span> girmeniz gerekmektedir.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                      <span>📝</span>
                      <span>Adım: Genel Bilgiler → Etkinlik Başlığı → Form sekmesine dönün</span>
                    </div>
                  </div>
                )}

                {formData.has_custom_form && formData.slug && (
                  <div className="space-y-4">
                    {/* Form Builder Başlık */}
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-700">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
                          <span className="text-2xl text-white">📋</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300">
                            Etkinlik Kayıt Formu
                          </h3>
                          <p className="text-blue-600 dark:text-blue-400 text-sm">
                            "{formData.title}" etkinliği için özel kayıt formu
                          </p>
                        </div>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-200 dark:border-blue-600">
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          <span className="font-medium">💡 Form ID:</span> <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">{formData.slug}</code><br/>
                          <span className="font-medium">🎯 Kullanım:</span> Katılımcılar bu formu doldurarak etkinliğe kayıt olabilirler<br/>
                          <span className="font-medium">📊 Veriler:</span> Form yanıtları otomatik olarak sisteme kaydedilir ve Excel'e aktarılabilir
                        </p>
                      </div>
                    </div>

                    {/* FormBuilder Component */}
                    <FormBuilder 
                      formId={formData.slug} 
                      formType="event_registration"
                      formTitle={formData.title}
                    />
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Enhanced Smart Footer */}
          <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 sm:relative sm:bg-transparent sm:border-0 sm:pt-6 backdrop-blur-sm">
            {/* Smart Validation Messages */}
            {!formData.title || !formData.event_date ? (
              <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700">
                <div className="flex items-start gap-2">
                  <span className="text-amber-600 dark:text-amber-400">⚠️</span>
                  <div className="flex-1">
                    <h4 className="font-medium text-amber-800 dark:text-amber-300 text-sm">Zorunlu alanları tamamlayın</h4>
                    <ul className="text-xs text-amber-700 dark:text-amber-400 mt-1 list-disc list-inside">
                      {!formData.title && <li>Etkinlik başlığı gerekli</li>}
                      {!formData.event_date && <li>Etkinlik tarihi gerekli</li>}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                <div className="flex items-center gap-2">
                  <span className="text-green-600 dark:text-green-400">✅</span>
                  <span className="text-sm font-medium text-green-800 dark:text-green-300">
                    Etkinlik yayınlamaya hazır!
                  </span>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="w-full sm:w-auto h-12 sm:h-11 px-6 text-base sm:text-sm font-medium border-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
              >
                <X className="h-4 w-4 mr-2" />
                İptal
              </Button>
              <Button 
                type="submit"
                disabled={isUploading || !formData.title || !formData.event_date}
                className="w-full sm:w-auto h-12 sm:h-11 px-8 text-base sm:text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 rounded-xl disabled:transform-none disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Yükleniyor...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{initialData ? '✏️' : '🎉'}</span>
                    <span>{initialData ? 'Güncelle' : 'Etkinliği Oluştur'}</span>
                  </div>
                )}
              </Button>
            </div>
            
            {/* Enhanced Upload Progress */}
            {isUploading && uploadProgress && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-blue-800 dark:text-blue-300 text-sm">
                      Dosyalar işleniyor...
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      {uploadProgress}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Success Tips */}
            {formData.title && formData.event_date && !isUploading && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400">💡</span>
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-800 dark:text-blue-300 text-sm mb-1">Sonraki adımlar</h4>
                    <div className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                      <div>• Etkinlik kaydedildikten sonra Medya sekmesinden görsel ekleyebilirsiniz</div>
                      <div>• Form sekmesinden katılımcı kayıt formu oluşturabilirsiniz</div>
                      <div>• Sponsor ekleyerek etkinliğinizi destekleyenleri tanıtabilirsiniz</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventModal;
