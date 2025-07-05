import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { AdminPageContainer, SectionHeader, ConfirmDialog } from '@/components/admin/shared';
import { useAdminContext } from '@/contexts/AdminDashboardContext';
import TeamMemberModal from '@/components/admin/TeamMemberModal';
import TeamManagementSection from '@/components/admin/TeamManagementSection';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type TeamMember = Database['public']['Tables']['team_members']['Row'];

export const TeamPage: React.FC = () => {
  const { hasPermission, refreshData } = useAdminContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TeamMember | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      await supabase.from('team_members').delete().eq('id', itemToDelete);
      toast.success('Ekip üyesi silindi');
      refreshData();
    } catch (error) {
      toast.error('Silme işlemi başarısız');
    } finally {
      setDialogOpen(false);
      setItemToDelete(null);
    }
  };
  
  const openEditModal = (member: TeamMember) => {
    setEditingItem(member);
    setModalOpen(true);
  };
  
  const openDeleteDialog = (memberId: string) => {
    setItemToDelete(memberId);
    setDialogOpen(true);
  };
  
  if (!hasPermission('team')) {
    return <AdminPageContainer><p>Bu sayfayı görüntüleme yetkiniz yok.</p></AdminPageContainer>;
  }

  return (
    <AdminPageContainer>
      <SectionHeader
        title="Ekip Yönetimi"
        subtitle="Topluluk ekibini yönetin"
        icon={<Users className="h-6 w-6 text-white" />}
        actionLabel="Yeni Üye Ekle"
        onAction={() => { setEditingItem(null); setModalOpen(true); }}
      />
      
      <TeamManagementSection
        onEditMember={openEditModal}
        onDeleteMember={openDeleteDialog}
      />

      <TeamMemberModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingItem(null); }}
        initialData={editingItem}
      />
      
      <ConfirmDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleDelete}
        title="Ekip Üyesini Sil"
        description="Bu üyeyi ekipten silmek istediğinizden emin misiniz?"
        itemType="ekip üyesi"
      />
    </AdminPageContainer>
  );
}; 