import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';
import { AdminPageContainer, SectionHeader, ItemCard, ActionBar } from '@/components/admin/shared';
import { useAdminContext } from '@/contexts/AdminDashboardContext';
import { useNews } from '@/hooks/useSupabaseData';
import NewsModal from '@/components/admin/NewsModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T];

export const NewsPage: React.FC = () => {
  const { user, hasPermission, refreshData } = useAdminContext();
  const { data: news } = useNews(false);
  const [newsModalOpen, setNewsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Tables<'news'>['Row'] | null>(null);

  const handleSaveNews = async (newsData: Partial<Tables<'news'>['Insert']>, id?: string) => {
    try {
      if (id) {
        await supabase.from('news').update(newsData).eq('id', id);
        toast.success('Haber güncellendi');
      } else {
        await supabase.from('news').insert([{ 
          ...newsData, 
          author_id: user?.id || '',
          title: newsData.title || '',
          content: newsData.content || '',
          slug: newsData.slug || ''
        }]);
        toast.success('Haber eklendi');
      }
      setEditingItem(null);
      refreshData();
    } catch (error) {
      toast.error('Bir hata oluştu');
      console.error('Error saving news:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!hasPermission('news')) {
      toast.error('Bu işlemi yapma yetkiniz yok.');
      return;
    }
    
    if (!confirm('Bu haberi silmek istediğinizden emin misiniz?')) return;
    
    try {
      const { error } = await supabase.from('news').delete().eq('id', id);
      if (error) throw error;
      
      toast.success('Haber silindi');
      refreshData();
    } catch (error) {
      toast.error('Silme işlemi başarısız');
      console.error('Error deleting news:', error);
    }
  };

  const openEditModal = (item: Tables<'news'>['Row'] | null) => {
    setEditingItem(item);
    setNewsModalOpen(true);
  };

  if (!hasPermission('news')) {
    return (
      <AdminPageContainer>
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Erişim Reddedildi
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Bu sayfayı görüntülemek için gerekli izniniz bulunmuyor.
          </p>
        </div>
      </AdminPageContainer>
    );
  }

  return (
    <AdminPageContainer>
      <SectionHeader
        title="Haberler ve Duyurular"
        subtitle="Haber ve duyuruları yönetin"
        icon={<FileText className="h-6 w-6 text-white" />}
        actionLabel="Yeni Haber"
        onAction={() => openEditModal(null)}
      />

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {news?.map(newsItem => (
              <ItemCard
                key={newsItem.id}
                title={newsItem.title}
                subtitle={newsItem.content?.substring(0, 150) + '...' || ''}
                badges={[
                  { label: newsItem.category, variant: 'outline' },
                  { 
                    label: newsItem.published ? 'Yayında' : 'Taslak', 
                    variant: newsItem.published ? 'default' : 'secondary' 
                  }
                ]}
                metadata={[
                  {
                    icon: <span>📅</span>,
                    label: 'Tarih',
                    value: new Date(newsItem.created_at).toLocaleDateString('tr-TR')
                  }
                ]}
                actions={
                  <ActionBar
                    onEdit={() => openEditModal(newsItem)}
                    onDelete={() => handleDelete(newsItem.id)}
                    editLabel="Düzenle"
                    deleteLabel="Sil"
                  />
                }
              >
                <div></div>
              </ItemCard>
            ))}
            
            {(!news || news?.length === 0) && (
              <p className="text-center text-muted-foreground py-8">
                Henüz haber bulunmuyor
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* News Modal */}
      <NewsModal
        isOpen={newsModalOpen}
        onClose={() => { 
          setNewsModalOpen(false); 
          setEditingItem(null); 
        }}
        onSave={handleSaveNews}
        initialData={editingItem}
      />
    </AdminPageContainer>
  );
}; 