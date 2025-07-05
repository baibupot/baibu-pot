import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Briefcase } from 'lucide-react';
import { AdminPageContainer, SectionHeader, ItemCard, ActionBar } from '@/components/admin/shared';
import { useAdminContext } from '@/contexts/AdminDashboardContext';
import { useInternships, useInternshipGuides, useInternshipExperiences, useAcademics, useUpdateInternshipExperience, useDeleteInternshipExperience } from '@/hooks/useSupabaseData';
import InternshipModal from '@/components/admin/InternshipModal';
import InternshipGuideModal from '@/components/admin/InternshipGuideModal';
import AcademicModal from '@/components/admin/AcademicModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type Internship = Database['public']['Tables']['internships']['Row'];
type InternshipGuide = Database['public']['Tables']['internship_guides']['Row'];
type InternshipExperience = Database['public']['Tables']['internship_experiences']['Row'];
type Academic = Database['public']['Tables']['academics']['Row'];

export const InternshipsPage: React.FC = () => {
  const { hasPermission } = useAdminContext();
  const { data: internships, refetch: refetchInternships } = useInternships(false);
  const { data: guides, refetch: refetchGuides } = useInternshipGuides();
  const { data: experiences, refetch: refetchExperiences } = useInternshipExperiences();
  const { data: academics, refetch: refetchAcademics } = useAcademics();
  const updateExperience = useUpdateInternshipExperience();
  const deleteExperience = useDeleteInternshipExperience();
  
  const [internshipModalOpen, setInternshipModalOpen] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [academicModalOpen, setAcademicModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const handleDelete = async (id: string, tableName: 'internships' | 'internship_guides' | 'academics') => {
    if (!confirm('Bu öğeyi silmek istediğinizden emin misiniz?')) return;
    try {
      await supabase.from(tableName).delete().eq('id', id);
      toast.success('Öğe silindi');
      if (tableName === 'internships') refetchInternships();
      else if (tableName === 'internship_guides') refetchGuides();
      else if (tableName === 'academics') refetchAcademics();
    } catch (error) {
      toast.error('Silme işlemi başarısız oldu');
    }
  };

  const handleExperienceApproval = async (id: string, is_approved: boolean) => {
    try {
      await updateExperience.mutateAsync({ id, is_approved });
      toast.success(`Deneyim ${is_approved ? 'onaylandı' : 'onayı kaldırıldı'}.`);
      refetchExperiences();
    } catch (error) {
      toast.error('İşlem başarısız oldu.');
    }
  };

  const handleExperienceDelete = async (id: string) => {
    if (!confirm('Bu deneyimi kalıcı olarak silmek istediğinizden emin misiniz?')) return;
    try {
      await deleteExperience.mutateAsync(id);
      toast.success('Deneyim silindi.');
      refetchExperiences();
    } catch (error) {
      toast.error('Silme işlemi başarısız oldu.');
    }
  };

  if (!hasPermission('internships')) {
    return <AdminPageContainer><p>Bu sayfayı görüntüleme yetkiniz yok.</p></AdminPageContainer>;
  }

  return (
    <AdminPageContainer>
      <SectionHeader
        title="Staj Yönetimi"
        subtitle="Staj ilanları, rehberler, deneyimler ve akademisyenleri yönetin"
        icon={<Briefcase className="h-6 w-6 text-white" />}
      />
      
      <Tabs defaultValue="internship-list" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="internship-list">İlanlar</TabsTrigger>
          <TabsTrigger value="guides">Rehber</TabsTrigger>
          <TabsTrigger value="experiences">Deneyimler</TabsTrigger>
          <TabsTrigger value="academics">Akademisyenler</TabsTrigger>
        </TabsList>
        
        <TabsContent value="internship-list" className="mt-4">
          <div className="flex justify-end mb-4">
            <Button onClick={() => { setEditingItem(null); setInternshipModalOpen(true); }}>Yeni İlan Ekle</Button>
          </div>
          <Card>
            <CardContent className="p-4 space-y-4">
              {internships?.map((item: Internship) => (
                <ItemCard key={item.id} title={`${item.position} - ${item.company_name}`} actions={<ActionBar onEdit={() => { setEditingItem(item); setInternshipModalOpen(true); }} onDelete={() => handleDelete(item.id, 'internships')} />}>
                    <div></div>
                </ItemCard>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="guides" className="mt-4">
          <div className="flex justify-end mb-4">
            <Button onClick={() => { setEditingItem(null); setGuideModalOpen(true); }}>Yeni Rehber Ekle</Button>
          </div>
          <Card>
            <CardContent className="p-4 space-y-4">
              {guides?.map((item: InternshipGuide) => (
                <ItemCard key={item.id} title={item.title} actions={<ActionBar onEdit={() => { setEditingItem(item); setGuideModalOpen(true); }} onDelete={() => handleDelete(item.id, 'internship_guides')} />}>
                    <div></div>
                </ItemCard>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="experiences" className="mt-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold">Onay Bekleyen Deneyimler</h3>
              {experiences?.filter((e: InternshipExperience) => !e.is_approved).map((item: InternshipExperience) => (
                <ItemCard key={item.id} title={`${item.student_name} - ${item.internship_place}`} subtitle={item.experience_text || ""} actions={<Button size="sm" onClick={() => handleExperienceApproval(item.id, true)}>Onayla</Button>}>
                    <div></div>
                </ItemCard>
              ))}
              <h3 className="font-semibold pt-4 border-t">Onaylanmış Deneyimler</h3>
              {experiences?.filter((e: InternshipExperience) => e.is_approved).map((item: InternshipExperience) => (
                <ItemCard key={item.id} title={`${item.student_name} - ${item.internship_place}`} subtitle={item.experience_text || ""} actions={<Button size="sm" variant="destructive" onClick={() => handleExperienceDelete(item.id)}>Sil</Button>}>
                    <div></div>
                </ItemCard>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academics" className="mt-4">
          <div className="flex justify-end mb-4">
            <Button onClick={() => { setEditingItem(null); setAcademicModalOpen(true); }}>Yeni Akademisyen Ekle</Button>
          </div>
          <Card>
            <CardContent className="p-4 space-y-4">
              {academics?.map((item: Academic) => (
                <ItemCard key={item.id} title={`${item.name} - ${item.title || ''}`} actions={<ActionBar onEdit={() => { setEditingItem(item); setAcademicModalOpen(true); }} onDelete={() => handleDelete(item.id, 'academics')} />}>
                    <div></div>
                </ItemCard>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <InternshipModal isOpen={internshipModalOpen} onClose={() => setInternshipModalOpen(false)} initialData={editingItem} />
      <InternshipGuideModal isOpen={guideModalOpen} onClose={() => setGuideModalOpen(false)} initialData={editingItem} />
      <AcademicModal isOpen={academicModalOpen} onClose={() => setAcademicModalOpen(false)} initialData={editingItem} />
    </AdminPageContainer>
  );
};