import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Eye, Edit, Trash2 } from 'lucide-react';
import { AdminPageContainer, SectionHeader, ItemCard, ActionBar, StatsCard, ConfirmDialog } from '@/components/admin/shared';
import { useAdminContext } from '@/contexts/AdminDashboardContext';
import { useMagazineIssues, useMagazineAnalytics, useArticleSubmissions } from '@/hooks/useSupabaseData';
import MagazineModal from '@/components/admin/MagazineModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type MagazineIssue = Database['public']['Tables']['magazine_issues']['Row'];

export const MagazinePage: React.FC = () => {
  const { user, hasPermission, refreshData } = useAdminContext();
  const { data: magazines, refetch: refetchMagazines } = useMagazineIssues(false);
  const { data: magazineReads } = useMagazineAnalytics();
  const { data: articleSubmissions } = useArticleSubmissions();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MagazineIssue | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const calculateMagazineStats = () => {
    if (!magazineReads) return { thisMonth: 0, total: 0, avgDuration: 0 };
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthReads = magazineReads.filter(read => new Date(read.created_at) >= thisMonth).length;
    const totalReads = magazineReads.length;
    const avgDuration = totalReads > 0 ? Math.round(magazineReads.reduce((sum, read) => sum + (read.reading_duration || 0), 0) / totalReads / 60) : 0;
    return { thisMonth: thisMonthReads, total: totalReads, avgDuration };
  };
  
  const magazineStats = calculateMagazineStats();

  const getMagazineReadStats = (magazineId: string) => {
    if (!magazineReads) return { reads: 0, avgDuration: 0 };
    const magazineSpecificReads = magazineReads.filter(read => read.magazine_issue_id === magazineId);
    const reads = magazineSpecificReads.length;
    const avgDuration = reads > 0 ? Math.round(magazineSpecificReads.reduce((sum, read) => sum + (read.reading_duration || 0), 0) / reads / 60) : 0;
    return { reads, avgDuration };
  };

  const handleSaveMagazine = async (magazineData: any) => {
    try {
      const { sponsorIds, ...magazineDetails } = magazineData;
      let magazineId = magazineDetails.id || editingItem?.id;

      if (!magazineId) {
         toast.error("Kaydedilecek dergi bulunamadı.");
         return;
      }

      if (sponsorIds) {
        await supabase.from('magazine_sponsors').delete().eq('magazine_issue_id', magazineId);
        if (sponsorIds.length > 0) {
          const sponsorInserts = sponsorIds.map((sponsor_id: string, index: number) => ({
            magazine_issue_id: magazineId,
            sponsor_id: sponsor_id,
            sponsorship_type: 'sponsor',
            sort_order: index,
          }));
          await supabase.from('magazine_sponsors').insert(sponsorInserts);
        }
      }
      toast.success('Dergi başarıyla güncellendi.');
      refetchMagazines();
      setModalOpen(false);
    } catch (error) {
      toast.error('Dergi kaydedilirken bir hata oluştu.');
      console.error('Error saving magazine:', error);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      const { error } = await supabase.from('magazine_issues').delete().eq('id', itemToDelete);
      if (error) throw error;
      toast.success('Dergi silindi');
      refetchMagazines();
    } catch (error) {
      toast.error('Silme işlemi başarısız');
      console.error('Error deleting magazine:', error);
    } finally {
      setDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const openEditModal = (item: MagazineIssue | null) => {
    setEditingItem(item);
    setModalOpen(true);
  };
  
  const openDeleteDialog = (id: string) => {
    setItemToDelete(id);
    setDialogOpen(true);
  };

  if (!hasPermission('magazine')) {
    return <AdminPageContainer><p>Bu sayfayı görüntüleme yetkiniz yok.</p></AdminPageContainer>;
  }

  return (
    <AdminPageContainer>
      <SectionHeader
        title="Dergi Yönetimi"
        subtitle="Dergi sayılarını, istatistikleri ve makale başvurularını yönetin"
        icon={<BookOpen className="h-6 w-6 text-white" />}
        actionLabel="Yeni Sayı"
        onAction={() => openEditModal(null)}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard title="Toplam Sayı" value={magazines?.length || 0} emoji="📚" variant="primary" />
        <StatsCard title="Bu Ay Okunan" value={magazineStats.thisMonth} emoji="👁️" variant="success" />
        <StatsCard title="Toplam Okuma" value={magazineStats.total} emoji="📈" variant="purple" />
        <StatsCard title="Ortalama Süre" value={`${magazineStats.avgDuration}dk`} emoji="⏱️" variant="warning" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dergi Sayıları</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {magazines?.map(magazine => {
            const stats = getMagazineReadStats(magazine.id);
            return (
              <ItemCard
                key={magazine.id}
                title={magazine.title}
                subtitle={`Sayı ${magazine.issue_number}`}
                image={magazine.cover_image || undefined}
                badges={[
                  { label: magazine.published ? 'Yayında' : 'Taslak', variant: magazine.published ? 'default' : 'secondary' },
                  { label: `👁️ ${stats.reads} okuma`, variant: 'outline' },
                  { label: `⏱️ ${stats.avgDuration}dk ort.`, variant: 'outline' }
                ]}
                actions={<ActionBar onEdit={() => openEditModal(magazine)} onDelete={() => openDeleteDialog(magazine.id)} />}
              >
                  <div></div>
              </ItemCard>
            );
          })}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Makale Başvuruları</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            {articleSubmissions?.map((submission) => (
              <ItemCard
                key={submission.id}
                title={submission.title}
                subtitle={submission.author_name}
                badges={[{label: submission.category, variant: 'secondary'}]}
                metadata={[{label: 'Tarih', value: new Date(submission.created_at).toLocaleDateString()}]}
                actions={<Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-2"/> Detay</Button>}
              >
                  <div></div>
              </ItemCard>
            ))}
            {(!articleSubmissions || articleSubmissions.length === 0) && (
              <p className="text-center text-muted-foreground py-8">
                Henüz makale başvurusu yok.
              </p>
            )}
        </CardContent>
      </Card>

      <MagazineModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingItem(null); }}
        onSave={handleSaveMagazine}
        initialData={editingItem}
      />
      
      <ConfirmDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleDelete}
        title="Dergi Sayısını Sil"
        description="Bu dergi sayısını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        itemType="dergi sayısı"
      />
    </AdminPageContainer>
  );
}; 