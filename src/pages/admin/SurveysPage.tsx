import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Eye, Edit, Trash2 } from 'lucide-react';
import { AdminPageContainer, SectionHeader, ItemCard, ActionBar, ConfirmDialog } from '@/components/admin/shared';
import { useAdminContext } from '@/contexts/AdminDashboardContext';
import { useSurveys } from '@/hooks/useSupabaseData';
import SurveyModal from '@/components/admin/SurveyModal';
import FormResponsesModal from '@/components/admin/FormResponsesModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';
import { formatDate } from '@/lib/utils';

type Survey = Database['public']['Tables']['surveys']['Row'];

export const SurveysPage: React.FC = () => {
  const { user, hasPermission, refreshData } = useAdminContext();
  const { data: surveys, refetch } = useSurveys();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Survey | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [responsesModalOpen, setResponsesModalOpen] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);

  const handleSave = async (surveyData: any) => {
    try {
      if (editingItem) {
        const { error } = await supabase.from('surveys').update(surveyData).eq('id', editingItem.id);
        if (error) throw error;
        toast.success('Anket güncellendi');
      } else {
        const { error } = await supabase.from('surveys').insert([{ ...surveyData, created_by: user?.id }]);
        if (error) throw error;
        toast.success('Anket eklendi');
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
      const { error } = await supabase.from('surveys').delete().eq('id', itemToDelete);
      if (error) throw error;
      toast.success('Anket silindi');
      refetch();
    } catch (error) {
      toast.error('Silme işlemi başarısız');
    } finally {
      setDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const openEditModal = (item: Survey | null) => {
    setEditingItem(item);
    setModalOpen(true);
  };
  
  const openDeleteDialog = (id: string) => {
    setItemToDelete(id);
    setDialogOpen(true);
  };

  const openResponsesModal = (survey: Survey) => {
    setSelectedSurvey(survey);
    setResponsesModalOpen(true);
  };

  if (!hasPermission('surveys')) {
    return <AdminPageContainer><p>Bu sayfayı görüntüleme yetkiniz yok.</p></AdminPageContainer>;
  }

  return (
    <AdminPageContainer>
      <SectionHeader
        title="Anket Yönetimi"
        subtitle="Anketleri yönetin ve yanıtları görüntüleyin"
        icon={<ClipboardList className="h-6 w-6 text-white" />}
        actionLabel="Yeni Anket"
        onAction={() => openEditModal(null)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {surveys?.map(survey => (
          <Card key={survey.id}>
            <CardHeader>
              <CardTitle>{survey.title}</CardTitle>
              <CardDescription>
                {formatDate(new Date(survey.start_date))} - {formatDate(new Date(survey.end_date))}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant={survey.active ? 'default' : 'secondary'}>
                {survey.active ? 'Aktif' : 'Pasif'}
              </Badge>
              {survey.has_custom_form ? (
                <Badge variant="outline" className="ml-2">Dahili Form</Badge>
              ) : (
                <Badge variant="outline" className="ml-2">Harici Link</Badge>
              )}
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              {survey.has_custom_form && (
                <Button variant="outline" size="sm" onClick={() => openResponsesModal(survey)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Yanıtları Görüntüle
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => openEditModal(survey)}>
                <Edit className="h-4 w-4 mr-2" />
                Düzenle
              </Button>
              <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(survey.id)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Sil
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <SurveyModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingItem(null); }}
        onSave={handleSave}
        initialData={editingItem}
      />
      
      <ConfirmDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleDelete}
        title="Anketi Sil"
        description="Bu anketi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        itemType="anket"
      />

      {responsesModalOpen && selectedSurvey && (
        <FormResponsesModal
          isOpen={responsesModalOpen}
          onClose={() => setResponsesModalOpen(false)}
          formId={selectedSurvey.id}
          formType="survey"
          formTitle={selectedSurvey.title}
        />
      )}
    </AdminPageContainer>
  );
}; 