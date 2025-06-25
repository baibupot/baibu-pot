import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, Palette, Package, Shirt, PenTool, User, Mail, Phone, FileImage, Calendar, DollarSign, Hash, Target, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';
import { uploadDesignRequestInspirationImages, GitHubStorageConfig } from '@/utils/githubStorageHelper';
import { getGitHubStorageConfig } from '@/integrations/github/config';

type Tables = Database['public']['Tables'];
type ProductDesignRequestData = Tables['product_design_requests']['Insert'];

interface ProductDesignRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductDesignRequestData) => Promise<void>;
}

const PRODUCT_CATEGORIES = {
  'kirtasiye': 'Kırtasiye',
  'giyim': 'Giyim', 
  'aksesuar': 'Aksesuar',
  'diger': 'Diğer'
};

const COMMON_COLORS = [
  'Siyah', 'Beyaz', 'Lacivert', 'Kırmızı', 'Mavi', 'Yeşil', 'Sarı', 'Turuncu', 'Mor', 'Pembe', 'Gri', 'Kahverengi'
];

const COMMON_SIZES = [
  'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'A4', 'A5', 'A6', 'Özel Boyut'
];

const ProductDesignRequestModal: React.FC<ProductDesignRequestModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<ProductDesignRequestData>({
    design_title: '',
    design_description: '',
    product_category: 'kirtasiye',
    target_price_min: null,
    target_price_max: null,
    currency: 'TL',
    quantity_needed: null,
    usage_purpose: '',
    design_preferences: '',
    color_preferences: [],
    size_preferences: [],
    inspiration_images: [],
    special_requirements: '',
    deadline_date: null,
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    contact_student_number: '',
    additional_notes: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [colorInput, setColorInput] = useState('');
  const [sizeInput, setSizeInput] = useState('');
  
  // Inspiration Images state
  const [inspirationImages, setInspirationImages] = useState<File[]>([]);
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});

  // Inspiration images upload handler
  const uploadInspirationsToGitHub = async (): Promise<string[]> => {
    if (inspirationImages.length === 0) return [];
    
    const githubConfig = getGitHubStorageConfig();
    if (!githubConfig) {
      toast.error('❌ GitHub yapılandırması bulunamadı');
      return [];
    }

    setImageUploading(true);
    
    try {
      // Geçici request ID oluştur (UUID)
      const tempRequestId = 'temp-' + Date.now();
      const designTitle = formData.design_title || 'Tasarim-Talebi';
      
      const result = await uploadDesignRequestInspirationImages(
        githubConfig,
        tempRequestId,
        designTitle,
        inspirationImages
      );

      if (result.success) {
        toast.success(`✅ ${result.uploadedUrls.length} resim başarıyla yüklendi!`);
        return result.uploadedUrls;
      } else {
        if (result.failedUploads.length > 0) {
          toast.error(`❌ ${result.failedUploads.length} resim yüklenemedi`);
        }
        return result.uploadedUrls; // Kısmen başarılı olanları döndür
      }
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('❌ Resimler yüklenirken hata oluştu');
      return [];
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.design_title?.trim() || !formData.design_description?.trim() || 
        !formData.contact_name?.trim() || !formData.contact_email?.trim()) {
      toast.error('❌ Lütfen zorunlu alanları doldurun');
      return;
    }

    if (formData.contact_email && !formData.contact_email.includes('@')) {
      toast.error('❌ Lütfen geçerli bir e-posta adresi girin');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Önce resimleri GitHub'a yükle
      let uploadedImageUrls: string[] = [];
      if (inspirationImages.length > 0) {
        uploadedImageUrls = await uploadInspirationsToGitHub();
      }

      // Form data'ya resim URL'lerini ekle
      const finalFormData = {
        ...formData,
        inspiration_images: uploadedImageUrls
      };

      await onSubmit(finalFormData);
      setIsSubmitted(true);
      toast.success('🎉 Özel tasarım talebiniz başarıyla gönderildi!');
      
      // 4 saniye sonra modal'ı kapat ve formu resetle
      setTimeout(() => {
        onClose();
        setIsSubmitted(false);
        setFormData({
          design_title: '',
          design_description: '',
          product_category: 'kirtasiye',
          target_price_min: null,
          target_price_max: null,
          currency: 'TL',
          quantity_needed: null,
          usage_purpose: '',
          design_preferences: '',
          color_preferences: [],
          size_preferences: [],
          inspiration_images: [],
          special_requirements: '',
          deadline_date: null,
          contact_name: '',
          contact_email: '',
          contact_phone: '',
          contact_student_number: '',
          additional_notes: ''
        });
        setColorInput('');
        setSizeInput('');
        setInspirationImages([]);
        setUploadProgress({});
      }, 4000);
    } catch (error) {
      console.error('Error submitting design request:', error);
      toast.error('❌ Talebiniz gönderilirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'kirtasiye': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'giyim': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'aksesuar': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
      'diger': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
    };
    return colors[category as keyof typeof colors] || colors.diger;
  };

  const addColor = () => {
    if (colorInput.trim() && !formData.color_preferences?.includes(colorInput.trim())) {
      setFormData(prev => ({
        ...prev,
        color_preferences: [...(prev.color_preferences || []), colorInput.trim()]
      }));
      setColorInput('');
    }
  };

  const removeColor = (color: string) => {
    setFormData(prev => ({
      ...prev,
      color_preferences: prev.color_preferences?.filter(c => c !== color) || []
    }));
  };

  const addSize = () => {
    if (sizeInput.trim() && !formData.size_preferences?.includes(sizeInput.trim())) {
      setFormData(prev => ({
        ...prev,
        size_preferences: [...(prev.size_preferences || []), sizeInput.trim()]
      }));
      setSizeInput('');
    }
  };

  const removeSize = (size: string) => {
    setFormData(prev => ({
      ...prev,
      size_preferences: prev.size_preferences?.filter(s => s !== size) || []
    }));
  };

  // Inspiration Images handlers
  const handleImageSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Dosya tipi kontrolü
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`❌ ${file.name} bir resim dosyası değil`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error(`❌ ${file.name} çok büyük (max 5MB)`);
        return false;
      }
      return true;
    });

    // Toplam dosya sayısı kontrolü
    if (inspirationImages.length + validFiles.length > 8) {
      toast.error('❌ En fazla 8 resim yükleyebilirsiniz');
      return;
    }

    if (validFiles.length > 0) {
      setInspirationImages(prev => [...prev, ...validFiles]);
      toast.success(`✅ ${validFiles.length} resim eklendi`);
    }

    // Input'u resetle
    if (e.target) {
      e.target.value = '';
    }
  };

  const removeInsprationImage = (index: number) => {
    setInspirationImages(prev => prev.filter((_, i) => i !== index));
    toast.success('✅ Resim kaldırıldı');
  };

  const today = new Date().toISOString().split('T')[0];

  // 🎉 Başarı Ekranı
  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-lg">
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-green-800 dark:text-green-300">
                🎨 Talebiniz Alındı!
              </h3>
              <div className="space-y-3">
                <p className="text-green-600 dark:text-green-400 text-lg">
                  <strong>"{formData.design_title}"</strong> tasarım talebiniz başarıyla gönderildi.
                </p>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-700">
                  <div className="text-sm text-green-700 dark:text-green-300 space-y-2">
                    <p className="flex items-center gap-2">
                      <span>🎯</span>
                      <span>Tasarım ekibimiz talebinizi değerlendirecek</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span>📧</span>
                      <span>Sonuç hakkında <strong>{formData.contact_email}</strong> adresine bilgi verilecek</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span>⏱️</span>
                      <span>İlk geri bildirim genellikle 3-5 gün içinde gelir</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Otomatik Kapanma Göstergesi */}
            <div className="pt-4">
              <div className="text-xs text-green-600 dark:text-green-400 flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Bu pencere 4 saniye içinde otomatik olarak kapanacak...
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[98vw] sm:max-w-4xl max-h-[98vh] overflow-y-auto p-0">
        <DialogHeader className="text-center p-4 sm:p-6 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border-b">
          <div className="space-y-2 sm:space-y-3">
            <div className="text-4xl sm:text-5xl">🎨</div>
            <DialogTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Özel Tasarım Talebi
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-md mx-auto leading-relaxed">
              Aklınızdaki özel tasarımı bizimle paylaşın! Size özel ürünler tasarlayalım 🚀
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
          {/* TASARIM BİLGİLERİ */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <span className="text-2xl">🎯</span>
              <h3 className="text-lg font-semibold">Tasarım Bilgileri</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="design_title" className="text-base font-medium flex items-center gap-2">
                🎨 Tasarım Başlığı *
                <Badge variant="destructive" className="text-xs">Zorunlu</Badge>
              </Label>
              <Input
                id="design_title"
                value={formData.design_title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, design_title: e.target.value }))}
                placeholder="Örnek: BAİBÜ PÖT Özel Logo Tişört"
                className="h-12 text-base border-2 rounded-xl"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="design_description" className="text-base font-medium flex items-center gap-2">
                📝 Tasarım Açıklaması *
                <Badge variant="destructive" className="text-xs">Zorunlu</Badge>
              </Label>
              <Textarea
                id="design_description"
                value={formData.design_description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, design_description: e.target.value }))}
                placeholder="Tasarımın nasıl görünmesini istediğinizi detaylı olarak açıklayın..."
                rows={4}
                className="text-base border-2 rounded-xl resize-none"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-base font-medium">📦 Ürün Kategorisi</Label>
              <Select value={formData.product_category} onValueChange={(value) => setFormData(prev => ({ ...prev, product_category: value }))}>
                <SelectTrigger className="h-12 text-base border-2 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PRODUCT_CATEGORIES).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      <Badge className={getCategoryColor(key)}>{value}</Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* MÜTÇE VE MİKTAR */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <span className="text-2xl">💰</span>
              <h3 className="text-lg font-semibold">Bütçe ve Miktar</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="target_price_min" className="text-base font-medium">💸 Min. Fiyat (TL)</Label>
                <Input
                  id="target_price_min"
                  type="number"
                  value={formData.target_price_min || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, target_price_min: e.target.value ? Number(e.target.value) : null }))}
                  placeholder="50"
                  min="0"
                  className="h-12 text-base border-2 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_price_max" className="text-base font-medium">💰 Max. Fiyat (TL)</Label>
                <Input
                  id="target_price_max"
                  type="number"
                  value={formData.target_price_max || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, target_price_max: e.target.value ? Number(e.target.value) : null }))}
                  placeholder="200"
                  min="0"
                  className="h-12 text-base border-2 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity_needed" className="text-base font-medium">📊 Adet</Label>
                <Input
                  id="quantity_needed"
                  type="number"
                  value={formData.quantity_needed || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity_needed: e.target.value ? Number(e.target.value) : null }))}
                  placeholder="25"
                  min="1"
                  className="h-12 text-base border-2 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* TASARIM TERCİHLERİ */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <span className="text-2xl">🎨</span>
              <h3 className="text-lg font-semibold">Tasarım Tercihleri</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="usage_purpose" className="text-base font-medium">🎯 Kullanım Amacı</Label>
              <Input
                id="usage_purpose"
                value={formData.usage_purpose || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, usage_purpose: e.target.value }))}
                placeholder="Örnek: Etkinlik, günlük kullanım, hediye..."
                className="h-12 text-base border-2 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-base font-medium">🌈 Renk Tercihleri</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                  placeholder="Renk ekleyin..."
                  className="flex-1 h-10 text-sm border-2 rounded-xl"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
                />
                <Button type="button" onClick={addColor} size="sm" className="h-10">
                  Ekle
                </Button>
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {COMMON_COLORS.map(color => (
                  <Button
                    key={color}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (!formData.color_preferences?.includes(color)) {
                        setFormData(prev => ({
                          ...prev,
                          color_preferences: [...(prev.color_preferences || []), color]
                        }));
                      }
                    }}
                    className="text-xs h-8"
                  >
                    {color}
                  </Button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1">
                {formData.color_preferences?.map(color => (
                  <Badge
                    key={color}
                    variant="secondary"
                    className="cursor-pointer hover:bg-red-100"
                    onClick={() => removeColor(color)}
                  >
                    {color} ×
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-medium">📏 Boyut Tercihleri</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={sizeInput}
                  onChange={(e) => setSizeInput(e.target.value)}
                  placeholder="Boyut ekleyin..."
                  className="flex-1 h-10 text-sm border-2 rounded-xl"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
                />
                <Button type="button" onClick={addSize} size="sm" className="h-10">
                  Ekle
                </Button>
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {COMMON_SIZES.map(size => (
                  <Button
                    key={size}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (!formData.size_preferences?.includes(size)) {
                        setFormData(prev => ({
                          ...prev,
                          size_preferences: [...(prev.size_preferences || []), size]
                        }));
                      }
                    }}
                    className="text-xs h-8"
                  >
                    {size}
                  </Button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1">
                {formData.size_preferences?.map(size => (
                  <Badge
                    key={size}
                    variant="secondary"
                    className="cursor-pointer hover:bg-red-100"
                    onClick={() => removeSize(size)}
                  >
                    {size} ×
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="design_preferences" className="text-base font-medium">✨ Tasarım Detayları</Label>
              <Textarea
                id="design_preferences"
                value={formData.design_preferences || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, design_preferences: e.target.value }))}
                placeholder="Logo yerleşimi, yazı fontları, genel stil tercihleri..."
                rows={3}
                className="text-base border-2 rounded-xl resize-none"
              />
            </div>

            {/* İLHAM GÖRSELLERİ */}
            <div className="space-y-2">
              <Label className="text-base font-medium flex items-center gap-2">
                📸 İlham Görselleri 
                <Badge variant="outline" className="text-xs">İsteğe bağlı</Badge>
                <span className="text-xs text-gray-500">(Max 8 resim, 5MB)</span>
              </Label>
              
              <div className="space-y-3">
                {/* Upload Area */}
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelection}
                    className="hidden"
                    id="inspiration-images"
                    disabled={imageUploading || inspirationImages.length >= 8}
                  />
                  <label htmlFor="inspiration-images" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-2">
                      <Upload className={`h-8 w-8 ${inspirationImages.length >= 8 ? 'text-gray-400' : 'text-purple-500'}`} />
                      <div className="text-sm">
                        {inspirationImages.length >= 8 ? (
                          <span className="text-gray-500">Maksimum 8 resim yükleyebilirsiniz</span>
                        ) : (
                          <>
                            <span className="text-purple-600 dark:text-purple-400 font-medium">
                              İlham görsellerinizi seçin
                            </span>
                            <br />
                            <span className="text-gray-500">
                              PNG, JPG, JPEG (Max 5MB per file)
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </label>
                </div>

                {/* Selected Images */}
                {inspirationImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {inspirationImages.map((file, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`İlham ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => removeInsprationImage(index)}
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-80 hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        <div className="absolute bottom-1 left-1 right-1 bg-black/60 text-white text-xs p-1 rounded text-center truncate">
                          {file.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Status */}
                {imageUploading && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                      <span className="text-sm">Resimler GitHub'a yükleniyor...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* TARİH VE ÖZEL GEREKSİNİMLER */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <span className="text-2xl">📋</span>
              <h3 className="text-lg font-semibold">Özel Gereksinimler</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deadline_date" className="text-base font-medium">📅 Son Teslim Tarihi</Label>
                <Input
                  id="deadline_date"
                  type="date"
                  value={formData.deadline_date || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, deadline_date: e.target.value || null }))}
                  min={today}
                  className="h-12 text-base border-2 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="special_requirements" className="text-base font-medium">⚠️ Özel Gereksinimler</Label>
                <Input
                  id="special_requirements"
                  value={formData.special_requirements || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, special_requirements: e.target.value }))}
                  placeholder="Allerji, malzeme önerileri..."
                  className="h-12 text-base border-2 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* İLETİŞİM BİLGİLERİ */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <span className="text-2xl">📞</span>
              <h3 className="text-lg font-semibold">İletişim Bilgileri</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_name" className="text-base font-medium flex items-center gap-2">
                  👤 Adınız Soyadınız *
                  <Badge variant="destructive" className="text-xs">Zorunlu</Badge>
                </Label>
                <Input
                  id="contact_name"
                  value={formData.contact_name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
                  placeholder="Ad Soyad"
                  className="h-12 text-base border-2 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_email" className="text-base font-medium flex items-center gap-2">
                  📧 E-posta *
                  <Badge variant="destructive" className="text-xs">Zorunlu</Badge>
                </Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                  placeholder="email@example.com"
                  className="h-12 text-base border-2 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_phone" className="text-base font-medium">📱 Telefon</Label>
                <Input
                  id="contact_phone"
                  type="tel"
                  value={formData.contact_phone || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                  placeholder="05XX XXX XX XX"
                  className="h-12 text-base border-2 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_student_number" className="text-base font-medium">🎓 Öğrenci No</Label>
                <Input
                  id="contact_student_number"
                  value={formData.contact_student_number || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_student_number: e.target.value }))}
                  placeholder="21xxxxxxx"
                  className="h-12 text-base border-2 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* EK NOTLAR */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <span className="text-2xl">💭</span>
              <h3 className="text-lg font-semibold">Ek Notlar</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additional_notes" className="text-base font-medium">📝 Eklemek İstedikleriniz</Label>
              <Textarea
                id="additional_notes"
                value={formData.additional_notes || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, additional_notes: e.target.value }))}
                placeholder="Diğer istekleriniz, referans görseller, özel notlar..."
                rows={3}
                className="text-base border-2 rounded-xl resize-none"
              />
            </div>
          </div>

          {/* BUTONLAR */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="h-12 px-6 text-base border-2 rounded-xl order-2 sm:order-1"
            >
              ❌ İptal
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="h-12 px-8 text-base font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 shadow-lg rounded-xl order-1 sm:order-2 flex-1"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Gönderiliyor...
                </>
              ) : (
                <>🚀 Talebimi Gönder</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDesignRequestModal; 