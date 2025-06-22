import React from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, ShoppingBag, Tag, Star, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { useProducts } from '@/hooks/useSupabaseData';
import LazyImage from '@/components/LazyImage';

const Urunler = () => {
  const { data: products, isLoading } = useProducts();

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

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
        <Header />
        <main className="pt-8 pb-16">
          {/* Hero Section */}
          <section className="bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-slate-800 dark:to-slate-700 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-cyan-100 dark:bg-cyan-900 rounded-full">
                  <ShoppingBag className="h-12 w-12 text-cyan-600 dark:text-cyan-400" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                BAİBÜ PÖT Ürünleri
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                Psikoloji öğrencileri topluluğumuzun özel tasarım ürünleri. 
                Kaliteli malzemeler ve anlam yüklü tasarımlarla günlük hayatınıza renk katın.
              </p>
            </div>
          </section>

          {/* Products Section */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="aspect-square bg-slate-200 dark:bg-slate-700 rounded-t-lg"></div>
                    <CardContent className="p-6">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
                      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : !products || products.length === 0 ? (
              <div className="text-center py-16">
                <Package className="h-24 w-24 text-slate-400 mx-auto mb-6" />
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                  Henüz Ürün Bulunmuyor
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Yakında yeni ürünlerimiz ile karşınızda olacağız!
                </p>
              </div>
            ) : (
              <>
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                    Ürün Kataloğumuz
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    {products.length} farklı ürün ile karşınızdayız
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {products.map((product) => (
                    <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                      {/* Product Image */}
                      <div className="aspect-square relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                        {product.images && product.images.length > 0 ? (
                          <LazyImage
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-16 w-16 text-slate-400" />
                          </div>
                        )}
                        
                        {/* Category Badge */}
                        <div className="absolute top-3 left-3">
                          <Badge variant="secondary" className="bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300">
                            <Tag className="h-3 w-3 mr-1" />
                            {getCategoryLabel(product.category)}
                          </Badge>
                        </div>

                        {/* Stock Status */}
                        <div className="absolute top-3 right-3">
                          <Badge 
                            variant={product.stock_status === 'available' ? 'default' : 'destructive'}
                            className="bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 flex items-center gap-1"
                          >
                            {getStockIcon(product.stock_status)}
                            {getStockText(product.stock_status)}
                          </Badge>
                        </div>
                      </div>

                      <CardContent className="p-6">
                        <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2 line-clamp-2">
                          {product.name}
                        </h3>
                        
                        {product.description && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
                            {product.description}
                          </p>
                        )}

                        {/* Features */}
                        {product.features && product.features.length > 0 && (
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-1">
                              {product.features.slice(0, 3).map((feature, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                              {product.features.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{product.features.length - 3} daha
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Price */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {product.price && (
                              <span className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                                {product.price} {product.currency || 'TL'}
                              </span>
                            )}
                          </div>
                          
                          <Button 
                            size="sm" 
                            variant="outline"
                            disabled={product.stock_status === 'out_of_stock'}
                            className="flex items-center gap-2"
                          >
                            <Star className="h-4 w-4" />
                            Detay
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </section>

          {/* Info Section */}
          <section className="bg-slate-50 dark:bg-slate-800 py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
                Ürün Satış Bilgilendirmesi
              </h2>
              <div className="bg-white dark:bg-slate-900 rounded-lg p-8 shadow-sm">
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Bu sayfada listelenen ürünler BAİBÜ Psikoloji Öğrencileri Topluluğu tarafından tasarlanan 
                  özel ürünlerdir. Online satış yapılmamaktadır.
                </p>
                <div className="space-y-4 text-left max-w-2xl mx-auto">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-slate-700 dark:text-slate-300">
                      Ürünler kampüs içindeki etkinliklerde satışa sunulmaktadır
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-slate-700 dark:text-slate-300">
                      Sipariş vermek için İletişim sayfasından bize ulaşabilirsiniz
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-slate-700 dark:text-slate-300">
                      Tüm ürünler kaliteli malzemeler kullanılarak özenle üretilmektedir
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default Urunler;
