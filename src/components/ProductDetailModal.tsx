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
        window.open(`mailto:baibupsikolojitoplulugu@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`, '_blank');
        break;
      case 'instagram':
        // Instagram'a yönlendir ve mesajı clipboard'a kopyala
        navigator.clipboard.writeText(productInfo).then(() => {
          // Instagram DM sayfasına yönlendir
          window.open('https://www.instagram.com/baibupsikoloji/', '_blank');
          
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
      <DialogContent className="max-w-7xl w-[95vw] max-h-[90vh] overflow-hidden p-0 m-2">
        <div className="flex flex-col lg:flex-row h-full max-h-[85vh]">
          {/* Image Section */}
          <div className="flex-1 lg:flex-[3] relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-700">
            <div className="relative h-[35vh] sm:h-[40vh] lg:h-full flex items-center justify-center p-3 sm:p-4 lg:p-6">
              {product.images && product.images.length > 0 ? (
                <>
                  <div className="relative w-full h-full bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <LazyImage
                      src={product.images[currentImageIndex]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      fallback={
                        <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-700">
                          <Package className="h-12 w-12 sm:h-16 sm:w-16 text-slate-400" />
                        </div>
                      }
                    />
                  </div>
                  
                  {/* Image Navigation */}
                  {product.images.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-600 h-8 w-8 sm:h-10 sm:w-10"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-600 h-8 w-8 sm:h-10 sm:w-10"
                        onClick={nextImage}
                      >
                        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                      </Button>
                      
                      {/* Image Indicators */}
                      <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 bg-black/60 backdrop-blur-sm rounded-full px-2 sm:px-3 py-1 sm:py-1.5">
                        {product.images.map((_, index) => (
                          <button
                            key={index}
                            className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-200 ${
                              index === currentImageIndex 
                                ? 'bg-white scale-125' 
                                : 'bg-white/50 hover:bg-white/75'
                            }`}
                            onClick={() => setCurrentImageIndex(index)}
                          />
                        ))}
                      </div>
                      
                      {/* Image Counter */}
                      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-black/60 text-white text-xs px-2 py-1 rounded">
                        {currentImageIndex + 1} / {product.images.length}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="text-center space-y-4 p-6 sm:p-8">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center">
                    <Package className="h-12 w-12 sm:h-16 sm:w-16 text-slate-400" />
                  </div>
                  <p className="text-slate-500 font-medium text-sm sm:text-base">Görsel Yakında</p>
                </div>
              )}
              
              {/* Badges */}
              <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex flex-col gap-2 items-end">
                <Badge className={getCategoryColor(product.category) + " text-xs"}>
                  {getCategoryLabel(product.category)}
                </Badge>
                <Badge 
                  variant={product.stock_status === 'available' ? 'default' : 'secondary'}
                  className="flex items-center gap-1 shadow-sm text-xs"
                >
                  {getStockIcon(product.stock_status)}
                  <span className="hidden sm:inline">{getStockText(product.stock_status)}</span>
                </Badge>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 lg:flex-[2] flex flex-col min-h-0">
            {/* Scrollable Content */}
            <div className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-white leading-tight pr-8">
                  {product.name}
                </DialogTitle>
              </DialogHeader>

              {/* Price */}
              <div className="flex items-center gap-3">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-cyan-600 dark:text-cyan-400">
                  ₺{product.price}
                </div>
                <div className="text-sm text-slate-500">
                  {product.currency || 'TL'}
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">Açıklama</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm sm:text-base">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Features */}
              {product.features && product.features.length > 0 && (
                <div className="space-y-2 sm:space-y-3">
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">Özellikler</h3>
                  <div className="grid grid-cols-1 gap-1.5 sm:gap-2">
                    {product.features.slice(0, 5).map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs sm:text-sm">
                        <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                        <span className="text-slate-600 dark:text-slate-400">{feature}</span>
                      </div>
                    ))}
                    {product.features.length > 5 && (
                      <div className="text-xs sm:text-sm text-slate-500 italic">
                        +{product.features.length - 5} özellik daha...
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Quality Badges */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                <Badge variant="outline" className="flex items-center gap-1 text-xs">
                  <Tag className="h-3 w-3" />
                  Özel Tasarım
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1 text-xs">
                  <Star className="h-3 w-3" />
                  Kaliteli
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1 text-xs">
                  <Users className="h-3 w-3" />
                  Öğrenci Dostu
                </Badge>
              </div>

              {/* Where to Buy Info */}
              <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border-cyan-200 dark:border-cyan-800">
                <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                    <h3 className="font-semibold text-cyan-800 dark:text-cyan-300 text-sm sm:text-base">
                      Nereden Alabilirsiniz?
                    </h3>
                  </div>
                  <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-cyan-700 dark:text-cyan-300">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>Kampüste satış noktalarımızdan</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>Etkinliklerimizde</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>Topluluk üyelerinden</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Extra space at bottom to ensure everything is scrollable */}
              <div className="h-4"></div>
            </div>

            {/* Fixed Bottom Section - Contact & Action */}
            <div className="border-t border-slate-200 dark:border-slate-700 p-4 sm:p-6 bg-white dark:bg-slate-900 space-y-4 flex-shrink-0">
              {/* Contact Options */}
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">İletişim & Sipariş</h3>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleContactClick('email')}
                    className="flex items-center gap-2 justify-center h-9 sm:h-10 text-xs sm:text-sm"
                  >
                    <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">E-posta Gönder</span>
                    <span className="sm:hidden">E-posta</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleContactClick('instagram')}
                    className="flex items-center gap-2 justify-center h-9 sm:h-10 text-xs sm:text-sm"
                  >
                    <Instagram className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Instagram DM</span>
                    <span className="sm:hidden">Instagram</span>
                  </Button>
                </div>
                
                {/* Info Text */}
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center bg-slate-50 dark:bg-slate-800 rounded-lg p-2">
                  💡 Instagram butonuna basarsanız ürün bilgileri otomatik kopyalanır
                </p>
              </div>

              {/* Main Action Button */}
              <Button 
                className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold"
                disabled={product.stock_status === 'out_of_stock'}
                onClick={() => handleContactClick('email')}
              >
                {product.stock_status === 'out_of_stock' ? (
                  'Stokta Yok'
                ) : (
                  <>
                    <Mail className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
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