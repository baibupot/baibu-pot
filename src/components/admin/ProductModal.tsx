import React, { useState, useEffect, useRef } from 'react';
import { AdminModal } from '@/components/admin/shared/AdminModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Upload, Image, Trash2, Loader2, Package } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';
import { uploadProductImages, deleteProductImagesFromGitHub, optimizeProductImage } from '@/utils/githubStorageHelper';
import { getGitHubStorageConfig, isGitHubStorageConfigured } from '@/integrations/github/config';
import { toast } from 'sonner';

type Tables = Database['public']['Tables'];

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: any) => void;
  product?: Tables['products']['Row'] | null;
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSave, product }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'kirtasiye',
    price: '',
    currency: 'TL',
    images: [] as string[],
    features: [] as string[],
    available: true,
    stock_status: 'available',
    sort_order: 0,
  });

  const [newImage, setNewImage] = useState('');
  const [newFeature, setNewFeature] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        category: product.category || 'kirtasiye',
        price: product.price?.toString() || '',
        currency: product.currency || 'TL',
        images: product.images || [],
        features: product.features || [],
        available: product.available ?? true,
        stock_status: product.stock_status || 'available',
        sort_order: product.sort_order || 0,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: 'kirtasiye',
        price: '',
        currency: 'TL',
        images: [],
        features: [],
        available: true,
        stock_status: 'available',
        sort_order: 0,
      });
    }
    setNewImage('');
    setNewFeature('');
  }, [product, isOpen]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const productData = {
      ...formData,
      price: formData.price ? parseFloat(formData.price) : null,
    };

    onSave(productData);
    onClose();
  };

  const addImage = () => {
    if (newImage.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImage.trim()]
      }));
      setNewImage('');
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  // GitHub Storage Image Upload Functions
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (!isGitHubStorageConfigured()) {
      toast.error('GitHub Storage yapılandırılmamış! Lütfen admin ile iletişime geçin.');
      return;
    }

    setIsUploading(true);
    setUploadProgress('Resimler yükleniyor...');

    try {
      const config = getGitHubStorageConfig();
      const fileArray = Array.from(files);
      
      // Optimize images based on category
      const optimizedFiles = await Promise.all(
        fileArray.map(file => optimizeProductImage(file, formData.category as any))
      );

      setUploadProgress(`${optimizedFiles.length} resim GitHub'a yükleniyor...`);

      // Generate UUID with fallback for older browsers
      const generateUUID = () => {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
          return crypto.randomUUID();
        }
        // Fallback UUID generator
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };

      const result = await uploadProductImages(
        config,
        generateUUID(), // Safe UUID generation
        formData.name || 'Yeni Ürün',
        optimizedFiles
      );

      if (result.success) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...result.uploadedUrls]
        }));
        
        toast.success(`✅ ${result.uploadedUrls.length} resim başarıyla yüklendi!`);
        
        if (result.failedUploads.length > 0) {
          toast.warning(`⚠️ ${result.failedUploads.length} resim yüklenemedi`);
          console.warn('Failed uploads:', result.failedUploads);
        }
      } else {
        toast.error('❌ Resim yükleme başarısız');
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('❌ Resim yükleme sırasında hata: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
    } finally {
      setIsUploading(false);
      setUploadProgress('');
      // Reset file input
      event.target.value = '';
    }
  };

  const handleDeleteImage = async (index: number, imageUrl: string) => {
    if (!imageUrl.includes('raw.githubusercontent.com')) {
      // Manuel URL ise sadece listeden kaldır
      removeImage(index);
      return;
    }

    if (!isGitHubStorageConfigured()) {
      toast.error('GitHub Storage yapılandırılmamış!');
      return;
    }

    const confirmed = confirm('Bu resmi kalıcı olarak silmek istediğinizden emin misiniz?');
    if (!confirmed) return;

    try {
      setUploadProgress('Resim siliniyor...');
      const config = getGitHubStorageConfig();
      
      const result = await deleteProductImagesFromGitHub(
        config,
        [imageUrl],
        formData.name
      );

      if (result.success) {
        removeImage(index);
        toast.success('✅ Resim başarıyla silindi');
      } else {
        toast.error('❌ Resim silinirken hata: ' + result.error);
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('❌ Resim silme hatası: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
    } finally {
      setUploadProgress('');
    }
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={handleSubmit}
      title={product ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
      description="Yeni bir ürün ekleyin veya mevcut bir ürünü güncelleyin."
      icon={<Package className="h-6 w-6 text-white" />}
      isSaving={isUploading}
      saveLabel={product ? 'Güncelle' : 'Kaydet'}
      size="2xl"
      compactHeader={true}
    >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Ürün Adı *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                placeholder="BAİBÜ PÖT Kalem"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Kategori *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kirtasiye">Kırtasiye</SelectItem>
                  <SelectItem value="giyim">Giyim</SelectItem>
                  <SelectItem value="aksesuar">Aksesuar</SelectItem>
                  <SelectItem value="diger">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Ürün açıklaması..."
              rows={3}
            />
          </div>

          {/* Price Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Fiyat</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
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

          {/* Images - Enhanced with GitHub Storage */}
          <div className="space-y-4">
            <Label>📸 Ürün Resimleri</Label>
            
            {/* Upload Progress */}
            {isUploading && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm font-medium">{uploadProgress}</span>
                </div>
              </div>
            )}

            {/* File Upload Section */}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 hover:border-blue-400 transition-colors">
              <div className="text-center">
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Resimlerinizi buraya sürükleyin veya
                </div>
                <label className="inline-block">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="hidden"
                    ref={fileInputRef}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    disabled={isUploading}
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }}
                  >
                    <Image className="h-4 w-4 mr-2" />
                    Dosya Seç
                  </Button>
                </label>
                <div className="text-xs text-gray-500 mt-1">
                  JPG, PNG, WebP desteklenir (Maks. 5MB)
                </div>
              </div>
            </div>

            {/* Manual URL Input */}
            <div className="space-y-2">
              <Label className="text-sm text-gray-600 dark:text-gray-400">🔗 Manuel URL Ekle</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                  disabled={isUploading}
                />
                <Button type="button" onClick={addImage} size="sm" disabled={isUploading}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Image Gallery */}
            {formData.images.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">📂 Yüklenen Resimler ({formData.images.length})</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                      {/* Image Preview */}
                      <div className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <img 
                          src={image} 
                          alt={`Ürün resmi ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                      </div>
                      
                      {/* Image Actions Overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteImage(index, image)}
                          disabled={isUploading}
                          className="text-white bg-red-600 hover:bg-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Image Source Indicator */}
                      <div className="absolute top-1 right-1">
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${image.includes('githubusercontent.com') ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'}`}
                        >
                          {image.includes('githubusercontent.com') ? '☁️ GitHub' : '🔗 URL'}
                        </Badge>
                      </div>
                      
                      {/* Image Index */}
                      <div className="absolute bottom-1 left-1">
                        <Badge variant="outline" className="text-xs bg-white/90 dark:bg-gray-900/90">
                          #{index + 1}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* GitHub Storage Info */}
                {isGitHubStorageConfigured() && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 text-green-800 dark:text-green-300">
                      <span className="text-sm">
                        ✅ GitHub Storage aktif - Resimler otomatik olarak güvenli şekilde saklanıyor
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Features */}
          <div className="space-y-3">
            <Label>Ürün Özellikleri</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Özellik ekle..."
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
              />
              <Button type="button" onClick={addFeature} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.features.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.features.map((feature, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    <span>{feature}</span>
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-red-500" 
                      onClick={() => removeFeature(index)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Status and Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock_status">Stok Durumu</Label>
              <Select value={formData.stock_status} onValueChange={(value) => setFormData(prev => ({ ...prev, stock_status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Stokta Var</SelectItem>
                  <SelectItem value="limited">Sınırlı Stok</SelectItem>
                  <SelectItem value="out_of_stock">Stokta Yok</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sort_order">Sıralama</Label>
              <Input
                id="sort_order"
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                placeholder="0"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="available"
                checked={formData.available}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, available: checked }))}
              />
              <Label htmlFor="available">Satışta</Label>
            </div>
          </div>
        </form>
    </AdminModal>
  );
};

export default ProductModal;
