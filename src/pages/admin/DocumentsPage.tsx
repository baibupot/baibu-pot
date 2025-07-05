import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, Search } from 'lucide-react';
import { AdminPageContainer, SectionHeader, ItemCard, ActionBar, ConfirmDialog, StatsCard } from '@/components/admin/shared';
import { useAdminContext } from '@/contexts/AdminDashboardContext';
import { useAcademicDocuments, useIncrementDocumentDownloads } from '@/hooks/useSupabaseData';
import AcademicDocumentModal from '@/components/admin/AcademicDocumentModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { downloadFileSafely } from '@/utils/githubStorageHelper';
import type { Database } from '@/integrations/supabase/types';

type Document = Database['public']['Tables']['academic_documents']['Row'];

export const DocumentsPage: React.FC = () => {
  const { user, hasPermission, refreshData } = useAdminContext();
  const { data: documents, refetch } = useAcademicDocuments();
  const incrementDownloads = useIncrementDocumentDownloads();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Document | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleSave = async (documentData: any) => {
    try {
      if (editingItem) {
        await supabase.from('academic_documents').update(documentData).eq('id', editingItem.id);
        toast.success('Belge güncellendi');
      } else {
        await supabase.from('academic_documents').insert([{ ...documentData, created_by: user?.id }]);
        toast.success('Belge eklendi');
      }
      refetch();
      setModalOpen(false);
      setEditingItem(null);
    } catch (error) {
      toast.error('Belge kaydedilirken hata oluştu');
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      await supabase.from('academic_documents').delete().eq('id', itemToDelete);
      toast.success('Belge silindi');
      refetch();
    } catch (error) {
      toast.error('Silme işlemi başarısız');
    } finally {
      setDialogOpen(false);
      setItemToDelete(null);
    }
  };
  
  const handleDownload = async (doc: Document) => {
    try {
      const fileExtension = doc.file_url.split('.').pop() || 'pdf';
      const fileName = `${doc.title}.${fileExtension}`;
      const result = await downloadFileSafely(doc.file_url, fileName);
      if (result.success) {
        toast.success(`📥 ${doc.title} başarıyla indirildi`);
        await incrementDownloads.mutateAsync(doc.id);
        refetch();
      } else {
        toast.error(`❌ İndirme hatası: ${result.error}`);
        window.open(doc.file_url, '_blank');
      }
    } catch (error) {
      toast.error('❌ İndirme sırasında hata oluştu');
      window.open(doc.file_url, '_blank');
    }
  };
  
  const openEditModal = (item: Document | null) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const openDeleteDialog = (id: string) => {
    setItemToDelete(id);
    setDialogOpen(true);
  };
  
  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      'ders_programlari': '📅 Ders Programları', 'staj_belgeleri': '💼 Staj Belgeleri', 'sinav_programlari': '📊 Sınav Programları', 'ogretim_planlari': '📚 Öğretim Planları', 'ders_kataloglari': '📖 Ders Katalogları', 'basvuru_formlari': '📝 Başvuru Formları', 'resmi_belgeler': '🏛️ Resmi Belgeler', 'rehber_dokumanlari': '🗺️ Rehber Dokümanları', 'diger': '📁 Diğer'
    };
    return categories[category] || category;
  };

  if (!hasPermission('documents')) {
    return <AdminPageContainer><p>Bu sayfayı görüntüleme yetkiniz yok.</p></AdminPageContainer>;
  }

  return (
    <AdminPageContainer>
      <SectionHeader
        title="Öğrenci Hizmetleri Belgeleri"
        subtitle="Ders programları, staj belgeleri ve diğer öğrenci belgelerini yönetin"
        icon={<GraduationCap className="h-6 w-6 text-white" />}
        actionLabel="Yeni Belge Ekle"
        onAction={() => openEditModal(null)}
      />

      <Card>
        <CardContent className="p-4 space-y-4">
          {documents?.map(doc => (
            <ItemCard
              key={doc.id}
              title={doc.title}
              subtitle={doc.description || ''}
              badges={[{ label: getCategoryLabel(doc.category), variant: 'outline' }]}
              metadata={[
                { label: 'Yükleyen', value: doc.author || '-' },
                { label: 'İndirme', value: `${doc.downloads || 0}` },
                { label: 'Boyut', value: doc.file_size ? `${(doc.file_size / (1024 * 1024)).toFixed(2)} MB` : '-' }
              ]}
              actions={
                <ActionBar
                  onDownload={() => handleDownload(doc)}
                  onEdit={() => openEditModal(doc)}
                  onDelete={() => openDeleteDialog(doc.id)}
                />
              }
            >
                <div></div>
            </ItemCard>
          ))}
        </CardContent>
      </Card>
      
      <AcademicDocumentModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingItem(null); }}
        onSave={handleSave}
        initialData={editingItem}
      />
      
      <ConfirmDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleDelete}
        title="Belgeyi Sil"
        description="Bu belgeyi silmek istediğinizden emin misiniz?"
        itemType="belge"
      />
    </AdminPageContainer>
  );
}; 