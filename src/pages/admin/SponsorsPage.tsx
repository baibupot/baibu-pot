import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, ExternalLink } from 'lucide-react';
import { AdminPageContainer, SectionHeader, ItemCard, ActionBar, ConfirmDialog } from '@/components/admin/shared';
import { useAdminContext } from '@/contexts/AdminDashboardContext';
import { useSponsors } from '@/hooks/useSupabaseData';
import SponsorModal from '@/components/admin/SponsorModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';
import { cn } from '@/lib/utils';

type Sponsor = Database['public']['Tables']['sponsors']['Row'];

export const SponsorsPage: React.FC = () => {
  const { hasPermission, refreshData } = useAdminContext();
  const { data: sponsors, refetch } = useSponsors(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Sponsor | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleSave = async (sponsorData: any) => {
    try {
      if (editingItem) {
        await supabase.from('sponsors').update(sponsorData).eq('id', editingItem.id);
        toast.success('Sponsor güncellendi');
      } else {
        await supabase.from('sponsors').insert([sponsorData]);
        toast.success('Sponsor eklendi');
      }
      refetch();
      setModalOpen(false);
      setEditingItem(null);
    } catch (error) {
      toast.error('Bir hata oluştu');
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      await supabase.from('sponsors').delete().eq('id', itemToDelete);
      toast.success('Sponsor silindi');
      refetch();
    } catch (error) {
      toast.error('Silme işlemi başarısız');
    } finally {
      setDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const openEditModal = (item: Sponsor | null) => {
    setEditingItem(item);
    setModalOpen(true);
  };
  
  const openDeleteDialog = (id: string) => {
    setItemToDelete(id);
    setDialogOpen(true);
  };

  if (!hasPermission('sponsors')) {
    return <AdminPageContainer><p>Bu sayfayı görüntüleme yetkiniz yok.</p></AdminPageContainer>;
  }

  return (
    <AdminPageContainer>
      <SectionHeader
        title="Sponsor Yönetimi"
        subtitle="Topluluk sponsorlarını yönetin"
        icon={<Building2 className="h-6 w-6 text-white" />}
        actionLabel="Yeni Sponsor Ekle"
        onAction={() => openEditModal(null)}
        actionDisabled={!hasPermission('sponsors')}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sponsors?.sort((a, b) => (a.active === b.active) ? 0 : a.active ? -1 : 1).map(sponsor => (
          <Card key={sponsor.id} className={cn(
            "flex flex-col transition-all",
            !sponsor.active && "bg-gray-100 dark:bg-gray-900/50 opacity-60"
          )}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    {sponsor.name}
                    {!sponsor.active && <Badge variant="destructive">Pasif</Badge>}
                  </CardTitle>
                  <CardDescription>
                    <Badge variant="secondary">{sponsor.sponsor_type}</Badge>
                  </CardDescription>
                </div>
                {sponsor.logo && (
                  <img src={sponsor.logo} alt={sponsor.name} className="w-16 h-16 object-contain rounded-md border p-1" />
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
              <p className="text-sm text-muted-foreground">
                {sponsor.description || "Açıklama mevcut değil."}
              </p>
              {sponsor.website && (
                <a 
                  href={sponsor.website} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm text-blue-500 hover:underline flex items-center gap-1"
                >
                  Website <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </CardContent>
            <CardFooter className="flex justify-end gap-2 bg-gray-50 dark:bg-gray-900/50 p-3">
              <ActionBar
                onEdit={() => openEditModal(sponsor)}
                onDelete={() => openDeleteDialog(sponsor.id)}
                disabled={!hasPermission('sponsors')}
              />
            </CardFooter>
          </Card>
        ))}
      </div>

      {(!sponsors || sponsors?.length === 0) && (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Henüz sponsor eklenmemiş.</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Başlamak için yeni bir sponsor ekleyin.</p>
        </div>
      )}

      <SponsorModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingItem(null); }}
        onSave={handleSave}
        initialData={editingItem}
      />
      
      <ConfirmDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleDelete}
        title="Sponsoru Sil"
        description="Bu sponsoru silmek istediğinizden emin misiniz?"
        itemType="sponsor"
      />
    </AdminPageContainer>
  );
}; 