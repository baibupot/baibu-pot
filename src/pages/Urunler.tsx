import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, ShoppingBag, Tag, Star, CheckCircle, AlertCircle, XCircle, Eye } from 'lucide-react';
import { useProducts } from '@/hooks/useSupabaseData';
import LazyImage from '@/components/LazyImage';
import PageContainer from '@/components/ui/page-container';
import PageHero from '@/components/ui/page-hero';
import LoadingPage from '@/components/ui/loading-page';
import ErrorState from '@/components/ui/error-state';
import EmptyState from '@/components/ui/empty-state';
import ProductDetailModal from '@/components/ProductDetailModal';
import type { Database } from '@/integrations/supabase/types';

type Tables = Database['public']['Tables'];

const Urunler = () => {
  const { data: products, isLoading, error } = useProducts();
  
  // Modal state
  const [selectedProduct, setSelectedProduct] = useState<Tables['products']['Row'] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleProductClick = (product: Tables['products']['Row']) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
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
        description="Psikoloji öğrencileri topluluğumuzun özel tasarım ürünleri. Kaliteli malzemeler ve anlam yüklü tasarımlarla günlük hayatınıza renk katın."
        icon={ShoppingBag}
        gradient="cyan"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
          <div className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              {products.length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-300">Toplam Ürün</div>
          </div>
          <div className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              {new Set(products.map(p => p.category)).size}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-300">Kategori</div>
          </div>
          <div className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              {products.filter(p => p.stock_status === 'available').length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-300">Stokta Var</div>
          </div>
        </div>
      </PageHero>

      {/* Products Grid */}
      <section className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <Card 
              key={product.id} 
              className="card-hover group overflow-hidden border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm cursor-pointer hover:shadow-xl transition-all duration-300"
              onClick={() => handleProductClick(product)}
            >
              <CardHeader className="p-0">
                <div className="h-64 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center relative overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <LazyImage
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      fallback={<Package className="h-16 w-16 text-slate-400" />}
                    />
                  ) : (
                    <div className="text-center space-y-4">
                      <Package className="h-16 w-16 text-slate-400 mx-auto group-hover:scale-110 transition-transform duration-300" />
                      <p className="text-sm text-slate-500">Görsel Yakında</p>
                    </div>
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <Badge className={getCategoryColor(product.category)}>
                      {getCategoryLabel(product.category)}
                    </Badge>
                  </div>
                  
                  {/* Stock Status Badge */}
                  <div className="absolute top-4 right-4">
                    <Badge 
                      variant={product.stock_status === 'available' ? 'default' : 'secondary'}
                      className="flex items-center gap-1"
                    >
                      {getStockIcon(product.stock_status)}
                      {getStockText(product.stock_status)}
                    </Badge>
                  </div>

                  {/* Click to View Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                      <Eye className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Title & Price */}
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-1 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-200">
                      {product.name}
                    </CardTitle>
                    <div className="text-right ml-2">
                      <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                        ₺{product.price}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {product.description && (
                    <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  )}

                  {/* Features */}
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>Özel Tasarım</span>
                    <span>•</span>
                    <Tag className="h-4 w-4" />
                    <span>Kaliteli Malzeme</span>
                  </div>

                  {/* Action Button */}
                  <Button 
                    className="w-full group-hover:shadow-lg transition-all duration-200"
                    disabled={product.stock_status === 'out_of_stock'}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click when button is clicked
                      handleProductClick(product);
                    }}
                  >
                    {product.stock_status === 'out_of_stock' ? (
                      'Stokta Yok'
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Detayları Gör
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            Özel Tasarım Talebi
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Aklınızda özel bir tasarım mı var? Bizimle iletişime geçin, size özel ürünler tasarlayalım.
          </p>
          <Button size="lg" variant="outline" className="group">
            <Package className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform duration-200" />
            Özel Tasarım Talebi
          </Button>
        </div>
      </section>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      )}
    </PageContainer>
  );
};

export default Urunler;
