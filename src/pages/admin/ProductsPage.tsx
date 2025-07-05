import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Palette, Eye } from 'lucide-react';
import { AdminPageContainer, SectionHeader, ItemCard, ActionBar, StatsCard, ConfirmDialog } from '@/components/admin/shared';
import { useAdminContext } from '@/contexts/AdminDashboardContext';
import { useProducts, useProductDesignRequests, useUpdateProductDesignRequest } from '@/hooks/useSupabaseData';
import ProductModal from '@/components/admin/ProductModal';
import ProductDesignRequestDetailModal from '@/components/admin/ProductDesignRequestDetailModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type Product = Database['public']['Tables']['products']['Row'];
type DesignRequest = Database['public']['Tables']['product_design_requests']['Row'];

export const ProductsPage: React.FC = () => {
  const { user, hasPermission, refreshData } = useAdminContext();
  const { data: products, refetch: refetchProducts } = useProducts(false);
  const { data: designRequests, refetch: refetchRequests } = useProductDesignRequests();
  const updateProductDesignRequest = useUpdateProductDesignRequest();
  
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [requestDetailModalOpen, setRequestDetailModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<DesignRequest | null>(null);
  
  const handleSaveProduct = async (productData: any) => {
    try {
      if (editingProduct) {
        await supabase.from('products').update(productData).eq('id', editingProduct.id);
        toast.success('Ürün güncellendi');
      } else {
        await supabase.from('products').insert([{ ...productData, created_by: user?.id }]);
        toast.success('Ürün eklendi');
      }
      refetchProducts();
      setProductModalOpen(false);
      setEditingProduct(null);
    } catch (error) {
      toast.error('Bir hata oluştu');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return;
    try {
      await supabase.from('products').delete().eq('id', id);
      toast.success('Ürün silindi');
      refetchProducts();
    } catch (error) {
      toast.error('Silme işlemi başarısız');
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateProductDesignRequest.mutateAsync({ id, status, reviewed_at: new Date().toISOString(), reviewer_id: user?.id });
      toast.success('Talep durumu güncellendi');
      refetchRequests();
    } catch (error) {
      toast.error('Durum güncellenirken hata oluştu');
    }
  };

  const openProductModal = (item: Product | null) => {
    setEditingProduct(item);
    setProductModalOpen(true);
  };
  
  const openRequestDetailModal = (item: DesignRequest) => {
    setSelectedRequest(item);
    setRequestDetailModalOpen(true);
  };

  const productStats = {
    total: products?.length || 0,
    available: products?.filter(p => p.available).length || 0,
    kirtasiye: products?.filter(p => p.category === 'kirtasiye').length || 0,
    giyim: products?.filter(p => p.category === 'giyim').length || 0,
  };

  const requestStats = {
    total: designRequests?.length || 0,
    pending: designRequests?.filter(r => r.status === 'pending').length || 0,
    approved: designRequests?.filter(r => r.status === 'approved').length || 0,
    rejected: designRequests?.filter(r => r.status === 'rejected').length || 0,
  };

  if (!hasPermission('products')) {
    return <AdminPageContainer><p>Bu sayfayı görüntüleme yetkiniz yok.</p></AdminPageContainer>;
  }

  return (
    <AdminPageContainer>
      <SectionHeader
        title="Ürün Yönetimi"
        subtitle="Topluluk ürünlerini ve özel tasarım taleplerini yönetin"
        icon={<Package className="h-6 w-6 text-white" />}
      />
      
      <Tabs defaultValue="products-list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="products-list">Ürünler</TabsTrigger>
          <TabsTrigger value="design-requests">Tasarım Talepleri</TabsTrigger>
        </TabsList>

        <TabsContent value="products-list" className="space-y-6 mt-6">
          <div className="flex justify-end">
            <Button onClick={() => openProductModal(null)}>Yeni Ürün Ekle</Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard title="Toplam Ürün" value={productStats.total} variant="primary"/>
            <StatsCard title="Satışta" value={productStats.available} variant="success"/>
            <StatsCard title="Kırtasiye" value={productStats.kirtasiye} variant="warning"/>
            <StatsCard title="Giyim" value={productStats.giyim} variant="purple"/>
          </div>
          <Card>
            <CardContent className="p-4 space-y-4">
              {products?.map(product => (
                <ItemCard
                  key={product.id}
                  title={product.name}
                  subtitle={product.description || ''}
                  image={product.images?.[0] || undefined}
                  badges={[
                    { label: product.category, variant: 'outline' },
                    { label: product.available ? 'Satışta' : 'Stokta Yok', variant: product.available ? 'default' : 'secondary' }
                  ]}
                  actions={<ActionBar onEdit={() => openProductModal(product)} onDelete={() => handleDeleteProduct(product.id)} />}
                >
                    <div></div>
                </ItemCard>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="design-requests" className="space-y-6 mt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard title="Toplam Talep" value={requestStats.total} variant="primary"/>
            <StatsCard title="Bekleyen" value={requestStats.pending} variant="warning"/>
            <StatsCard title="Onaylanan" value={requestStats.approved} variant="success"/>
            <StatsCard title="Reddedilen" value={requestStats.rejected} variant="danger"/>
          </div>
          <Card>
            <CardContent className="p-4 space-y-4">
              {designRequests?.map(request => (
                <ItemCard
                  key={request.id}
                  title={request.design_title}
                  subtitle={`Talep eden: ${request.contact_name}`}
                  badges={[{ label: request.status, variant: 'secondary' }, {label: request.product_category, variant: 'outline'}]}
                  actions={
                    <Button variant="outline" size="sm" onClick={() => openRequestDetailModal(request)}>
                      <Eye className="h-4 w-4 mr-2" /> Detayları Gör
                    </Button>
                  }
                >
                    <div></div>
                </ItemCard>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ProductModal
        isOpen={productModalOpen}
        onClose={() => { setProductModalOpen(false); setEditingProduct(null); }}
        onSave={handleSaveProduct}
        product={editingProduct}
      />

      {selectedRequest && (
        <ProductDesignRequestDetailModal
          isOpen={requestDetailModalOpen}
          onClose={() => setRequestDetailModalOpen(false)}
          request={selectedRequest}
          onUpdate={(id, data) => handleStatusChange(id, data.status)}
        />
      )}
    </AdminPageContainer>
  );
}; 