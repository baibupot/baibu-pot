import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: any) => void;
  product?: Tables['products']['Row'] | null;
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSave, product }) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
          </DialogTitle>
        </DialogHeader>

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

          {/* Images */}
          <div className="space-y-3">
            <Label>Ürün Resimleri</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Resim URL'si ekle..."
                value={newImage}
                onChange={(e) => setNewImage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
              />
              <Button type="button" onClick={addImage} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.images.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.images.map((image, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    <span className="truncate max-w-[200px]">{image}</span>
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-red-500" 
                      onClick={() => removeImage(index)}
                    />
                  </Badge>
                ))}
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

          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              İptal
            </Button>
            <Button type="submit">
              {product ? 'Güncelle' : 'Kaydet'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;
