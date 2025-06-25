import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Star, 
  Tag,
  Users,
  Mail,
  Instagram,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';
import LazyImage from '@/components/LazyImage';

type Tables = Database['public']['Tables'];

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Tables['products']['Row'] | null;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ isOpen, onClose, product }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!product) return null;

  const getStockIcon = (status: string | null) => {
    switch (status) {
      case 'available': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'limited': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'out_of_stock': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
  };

  const getStockText = (status: string | null) => {
    switch (status) {
      case 'available': return 'Stokta Var';
      case 'limited': return 'Sınırlı Stok';
      case 'out_of_stock': return 'Stokta Yok';
      default: return 'Stokta Var';
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      'kirtasiye': 'Kırtasiye',
      'giyim': 'Giyim',
      'aksesuar': 'Aksesuar',
      'diger': 'Diğer'
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'kirtasiye': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'giyim': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'aksesuar': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
      'diger': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    };
    return colors[category as keyof typeof colors] || colors.diger;
  };

  const nextImage = () => {
    if (product.images && product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product.images && product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  const handleContactClick = (method: 'email' | 'instagram') => {
    const productInfo = `🛍️ Ürün: ${product.name}\n💰 Fiyat: ₺${product.price}\n📦 Kategori: ${getCategoryLabel(product.category)}\n\n${product.description ? `📝 ${product.description}\n\n` : ''}🎯 Bu ürün hakkında bilgi almak istiyorum.`;
    
    switch (method) {
      case 'email':
        const emailSubject = `BAİBÜ PÖT Ürün Bilgi Talebi: ${product.name}`;
        const emailBody = `Merhaba BAİBÜ PÖT,\n\n${productInfo}\n\nTeşekkürler.`;
        window.open(`mailto:info@baibupot.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`, '_blank');
        break;
      case 'instagram':
        // Instagram'a yönlendir ve mesajı clipboard'a kopyala
        navigator.clipboard.writeText(productInfo).then(() => {
          // Instagram DM sayfasına yönlendir
          window.open('https://www.instagram.com/baibupot/', '_blank');
          
          // Kullanıcıya bilgi ver
          setTimeout(() => {
            alert('📋 Ürün bilgileri panoya kopyalandı!\n\nInstagram sayfamızda "Mesaj" butonuna basıp yapıştırabilirsiniz.');
          }, 500);
        }).catch(() => {
          // Clipboard çalışmazsa Instagram'a yönlendir
          window.open('https://www.instagram.com/baibupot/', '_blank');
        });
        break;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Image Section */}
          <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800">
            <div className="aspect-square flex items-center justify-center relative">
              {product.images && product.images.length > 0 ? (
                <>
                  <LazyImage
                    src={product.images[currentImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    fallback={<Package className="h-24 w-24 text-slate-400" />}
                  />
                  
                  {/* Image Navigation */}
                  {product.images.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800"
                        onClick={nextImage}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      
                      {/* Image Indicators */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {product.images.map((_, index) => (
                          <button
                            key={index}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              index === currentImageIndex 
                                ? 'bg-white' 
                                : 'bg-white/50'
                            }`}
                            onClick={() => setCurrentImageIndex(index)}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="text-center space-y-4">
                  <Package className="h-24 w-24 text-slate-400 mx-auto" />
                  <p className="text-slate-500">Görsel Yakında</p>
                </div>
              )}
              
              {/* Badges */}
              <div className="absolute top-4 left-4">
                <Badge className={getCategoryColor(product.category)}>
                  {getCategoryLabel(product.category)}
                </Badge>
              </div>
              
              <div className="absolute top-4 right-4">
                <Badge 
                  variant={product.stock_status === 'available' ? 'default' : 'secondary'}
                  className="flex items-center gap-1"
                >
                  {getStockIcon(product.stock_status)}
                  {getStockText(product.stock_status)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 space-y-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                {product.name}
              </DialogTitle>
            </DialogHeader>

            {/* Price */}
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
                ₺{product.price}
              </div>
              <div className="text-sm text-slate-500">
                {product.currency || 'TL'}
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="space-y-2">
                <h3 className="font-semibold text-slate-900 dark:text-white">Açıklama</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-900 dark:text-white">Özellikler</h3>
                <div className="grid grid-cols-1 gap-2">
                  {product.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                      <span className="text-slate-600 dark:text-slate-400">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quality Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                Özel Tasarım
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                Kaliteli Malzeme
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                Öğrenci Dostu
              </Badge>
            </div>

            {/* Where to Buy Info */}
            <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border-cyan-200 dark:border-cyan-800">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  <h3 className="font-semibold text-cyan-800 dark:text-cyan-300">
                    Nereden Satın Alabilirsiniz?
                  </h3>
                </div>
                <div className="space-y-2 text-sm text-cyan-700 dark:text-cyan-300">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Kampüste bulunan satış noktalarımızdan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Etkinliklerimizde özel standlarımızdan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    <span>Topluluğumuz üyelerinden</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Options */}
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900 dark:text-white">İletişim & Sipariş</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleContactClick('email')}
                  className="flex items-center gap-2 justify-center h-10"
                >
                  <Mail className="h-4 w-4" />
                  E-posta Gönder
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleContactClick('instagram')}
                  className="flex items-center gap-2 justify-center h-10"
                >
                  <Instagram className="h-4 w-4" />
                  Instagram DM
                </Button>
              </div>
              
              {/* Info Text */}
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center bg-slate-50 dark:bg-slate-800 rounded-lg p-2">
                💡 Instagram butonuna basarsanız ürün bilgileri otomatik kopyalanır
              </p>
            </div>

            {/* Main Action Button */}
            <div className="pt-4">
              <Button 
                className="w-full h-12 text-base font-semibold"
                disabled={product.stock_status === 'out_of_stock'}
                onClick={() => handleContactClick('email')}
              >
                {product.stock_status === 'out_of_stock' ? (
                  'Stokta Yok'
                ) : (
                  <>
                    <Mail className="h-5 w-5 mr-2" />
                    Sipariş Ver & Bilgi Al
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailModal; 