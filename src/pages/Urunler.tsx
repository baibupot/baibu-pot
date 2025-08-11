import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, ShoppingBag, Tag, Star, CheckCircle, AlertCircle, XCircle, Eye } from 'lucide-react';
import { useProducts, useCreateProductDesignRequest } from '@/hooks/useSupabaseData';
import LazyImage from '@/components/LazyImage';
import PageContainer from '@/components/ui/page-container';
import PageHero from '@/components/ui/page-hero';
import LoadingPage from '@/components/ui/loading-page';
import ErrorState from '@/components/ui/error-state';
import EmptyState from '@/components/ui/empty-state';
import ProductDetailModal from '@/components/ProductDetailModal';
import ProductDesignRequestModal from '@/components/ProductDesignRequestModal';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type Tables = Database['public']['Tables'];

const Urunler = () => {
  const { data: products, isLoading, error } = useProducts();
  const createDesignRequest = useCreateProductDesignRequest();
  
  // Modal states
  const [selectedProduct, setSelectedProduct] = useState<Tables['products']['Row'] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDesignRequestModalOpen, setIsDesignRequestModalOpen] = useState(false);

  const handleProductClick = (product: Tables['products']['Row']) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  // Tasarım talebi gönderme fonksiyonu
  const handleDesignRequest = async (requestData: Tables['product_design_requests']['Insert']) => {
    try {
      await createDesignRequest.mutateAsync(requestData);
      toast.success('🎉 Özel tasarım talebiniz başarıyla gönderildi! Yakında size dönüş yapacağız.');
    } catch (error) {
      console.error('Error submitting design request:', error);
      throw error; // Modal kendi error handling'ini yapsın
    }
  };

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

  // Loading state
  if (isLoading) {
    return (
      <PageContainer>
        <LoadingPage 
          title="Ürünler Yükleniyor"
          message="Özel tasarım ürünlerimizi hazırlıyoruz..."
          icon={Package}
        />
      </PageContainer>
    );
  }

  // Error state
  if (error) {
    return (
      <PageContainer>
        <ErrorState 
          title="Ürünler Yüklenemedi"
          message="Ürün kataloğunu yüklerken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
          onRetry={() => window.location.reload()}
          variant="network"
        />
      </PageContainer>
    );
  }

  // Empty state
  if (!products || products.length === 0) {
    return (
      <PageContainer>
        <PageHero
          title="BAİBÜ PÖT Ürünleri"
          description="Psikoloji öğrencileri topluluğumuzun özel tasarım ürünleri. Kaliteli malzemeler ve anlam yüklü tasarımlarla günlük hayatınıza renk katın."
          icon={ShoppingBag}
          gradient="cyan"
        />
        <EmptyState
          icon={Package}
          title="Henüz Ürün Bulunmuyor"
          description="Şu anda satışa sunulmuş ürünümüz bulunmuyor. Yeni ürünler için takipte kalın!"
          actionLabel="Ana Sayfaya Dön"
          onAction={() => window.location.href = '/'}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer background="gradient">
      {/* Hero Section */}
      <PageHero
        title="BAİBÜ PÖT Ürünleri"
        gradient="cyan"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-12">
        <Card variant="modern" className="text-center p-4 sm:p-6 animate-fade-in-up">
          <div className="space-y-1 sm:space-y-2">
            <div className="text-2xl sm:text-3xl font-bold text-cyan-600 dark:text-cyan-400">
              {products.length}
            </div>
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
              📦 Toplam Ürün
            </div>
          </div>
        </Card>
        
        <Card variant="modern" className="text-center p-4 sm:p-6 animate-fade-in-up animation-delay-100">
          <div className="space-y-1 sm:space-y-2">
            <div className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">
              {new Set(products.map(p => p.category)).size}
            </div>
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
              🏷️ Kategori
            </div>
          </div>
        </Card>
        
        <Card variant="modern" className="col-span-2 lg:col-span-1 text-center p-4 sm:p-6 animate-fade-in-up animation-delay-200">
          <div className="space-y-1 sm:space-y-2">
            <div className="text-2xl sm:text-3xl font-bold gradient-text-primary">
              {products.filter(p => p.stock_status === 'available').length}
            </div>
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
              ✅ Stokta Var
            </div>
          </div>
        </Card>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {products.map((product, index) => (
          <Card 
            key={product.id} 
            variant="interactive"
            className="group overflow-hidden animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => handleProductClick(product)}
          >
            {/* Product Image */}
            <div className="aspect-square bg-gradient-to-br from-slate-100/50 to-slate-200/50 dark:from-slate-700/50 dark:to-slate-800/50 flex items-center justify-center relative overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <LazyImage
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  fallback={<Package className="h-12 w-12 sm:h-16 sm:w-16 text-slate-400" />}
                />
              ) : (
                <div className="text-center space-y-3">
                  <Package className="h-12 w-12 sm:h-16 sm:w-16 text-slate-400 mx-auto group-hover:scale-110 transition-transform duration-300" />
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">Görsel Yakında</p>
                </div>
              )}
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Category Badge */}
              <div className="absolute top-3 left-3">
                <Badge className={`${getCategoryColor(product.category)} text-xs font-medium backdrop-blur-sm`}>
                  {getCategoryLabel(product.category)}
                </Badge>
              </div>
              
              {/* Stock Status */}
              <div className="absolute top-3 right-3">
                <div className="flex items-center gap-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg px-2 py-1">
                  {getStockIcon(product.stock_status)}
                  <span className="text-xs font-medium">{getStockText(product.stock_status)}</span>
                </div>
              </div>
              
              {/* View Details Indicator */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full p-3 shadow-lg animate-fade-in-scale">
                  <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-600 dark:text-cyan-400" />
                </div>
              </div>
            </div>
              
                          {/* Product Info */}
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                {/* Title & Price */}
                <div className="flex justify-between items-start gap-3">
                  <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-200 line-clamp-2 flex-1">
                    {product.name}
                  </h3>
                  <div className="text-right flex-shrink-0">
                    <div className="text-lg sm:text-xl font-bold text-cyan-600 dark:text-cyan-400">
                      ₺{product.price}
                    </div>
                  </div>
                </div>

                {/* Description */}
                {product.description && (
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                )}

                {/* Features */}
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                  <span>Özel Tasarım</span>
                  <span>•</span>
                  <Tag className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Kaliteli</span>
                </div>

                {/* Action */}
                <div className="pt-2">
                  <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 text-sm font-medium group-hover:gap-3 transition-all duration-200">
                    <Eye className="h-4 w-4" />
                    <span>Detayları Gör</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </div>
                </div>
              </div>
            </CardContent>
            </Card>
          ))}
        </div>

      {/* Call to Action */}
      <Card variant="modern" className="animate-fade-in-up">
        <CardContent className="p-6 sm:p-8 lg:p-12 text-center">
          <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
            <div className="text-4xl sm:text-5xl lg:text-6xl mb-4 sm:mb-6">🎨</div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">
              Özel Tasarım Talebi
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Aklınızda özel bir tasarım mı var? Bizimle iletişime geçin, beraber tasarlayalım. 
              Kendi stilinizi yansıtan, anlamlı ve kaliteli ürünler için taleplerinizi bekliyoruz.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button 
                size="touch" 
                className="group gradient-primary text-white font-semibold"
                onClick={() => setIsDesignRequestModalOpen(true)}
              >
                <Package className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform duration-200" />
                🎨 Özel Tasarım Talebi Gönder
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      )}

      {/* Product Design Request Modal */}
      <ProductDesignRequestModal
        isOpen={isDesignRequestModalOpen}
        onClose={() => setIsDesignRequestModalOpen(false)}
        onSubmit={handleDesignRequest}
      />
    </PageContainer>
  );
};

export default Urunler;
