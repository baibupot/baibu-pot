import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MessageSquare, Clock, CheckCircle, XCircle } from 'lucide-react';
import { AdminPageContainer, SectionHeader, ItemCard, ActionBar, StatsCard, ConfirmDialog } from '@/components/admin/shared';
import { useAdminContext } from '@/contexts/AdminDashboardContext';
import { useEvents, useEventSuggestions, useUpdateEventSuggestion } from '@/hooks/useSupabaseData';
import EventModal from '@/components/admin/EventModal';
import FormResponsesModal from '@/components/admin/FormResponsesModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';
import { EVENT_TYPES } from '@/constants/eventConstants';

type EventRow = Database['public']['Tables']['events']['Row'];
type EventSuggestionRow = Database['public']['Tables']['event_suggestions']['Row'];

export const EventsPage: React.FC = () => {
  const { user, hasPermission, refreshData } = useAdminContext();
  const { data: events, refetch: refetchEvents } = useEvents();
  const { data: eventSuggestions, refetch: refetchSuggestions } = useEventSuggestions();
  const updateEventSuggestion = useUpdateEventSuggestion();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EventRow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [responsesModalOpen, setResponsesModalOpen] = useState(false);
  const [selectedEventForResponses, setSelectedEventForResponses] = useState<EventRow | null>(null);
  
  const handleSaveEvent = async (eventData: any) => {
    let savedEventId: string | null = null;
    const isNewEvent = !editingItem;
    
    try {
      const { sponsorIds = [], ...eventDataWithoutSponsors } = eventData;
      
      if (editingItem) {
        const { error } = await supabase.from('events').update(eventDataWithoutSponsors).eq('id', editingItem.id);
        if (error) throw error;
        savedEventId = editingItem.id;
        
        const { error: sponsorDeleteError } = await supabase.from('event_sponsors').delete().eq('event_id', savedEventId);
        if (sponsorDeleteError) throw sponsorDeleteError;
          
        toast.success('Etkinlik güncellendi');
      } else {
        const { data, error } = await supabase.from('events').insert([{ ...eventDataWithoutSponsors, created_by: user?.id }]).select().single();
        if (error) throw error;
        savedEventId = data.id;
        toast.success('Etkinlik eklendi');
      }
      
      if (sponsorIds.length > 0 && savedEventId) {
        const sponsorInserts = sponsorIds.map((id: string, index: number) => ({
          event_id: savedEventId,
          sponsor_id: id,
          sponsor_type: 'destekci',
          sort_order: index,
        }));
        
        const { error: sponsorError } = await supabase.from('event_sponsors').insert(sponsorInserts);
          if (sponsorError) throw sponsorError;
          
        toast.success(`${sponsorIds.length} sponsor ilişkilendirildi`);
      }
      refetchEvents();
      setModalOpen(false);
    } catch (error) {
      toast.error('Bir hata oluştu');
      console.error('Error saving event:', error);
      if (isNewEvent && savedEventId) {
        await supabase.from('events').delete().eq('id', savedEventId);
      }
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      const { error } = await supabase.from('events').delete().eq('id', itemToDelete);
      if (error) throw error;
      
      toast.success('Etkinlik silindi');
      refetchEvents();
    } catch (error) {
      toast.error('Silme işlemi başarısız');
      console.error('Error deleting event:', error);
    } finally {
      setDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const openDeleteDialog = (id: string) => {
    setItemToDelete(id);
    setDialogOpen(true);
  };

  const openEditModal = (item: EventRow | null) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleSuggestionStatusChange = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await updateEventSuggestion.mutateAsync({ id, status });
      toast.success(`Öneri durumu güncellendi: ${status}`);
      refetchSuggestions();
    } catch (error) {
      toast.error("Öneri durumu güncellenirken hata oluştu.");
    }
  };

  const openResponsesModal = (event: EventRow) => {
    setSelectedEventForResponses(event);
    setResponsesModalOpen(true);
  };

  const eventStats = {
    total: events?.length || 0,
    upcoming: events?.filter(e => e.status === 'upcoming').length || 0,
    completed: events?.filter(e => e.status === 'completed').length || 0,
    draft: events?.filter(e => e.status === 'draft').length || 0,
  };

  const suggestionStats = {
    total: eventSuggestions?.length || 0,
    pending: eventSuggestions?.filter(s => s.status === 'pending').length || 0,
    approved: eventSuggestions?.filter(s => s.status === 'approved').length || 0,
    rejected: eventSuggestions?.filter(s => s.status === 'rejected').length || 0,
  };

  if (!hasPermission('events')) {
    return <AdminPageContainer><p>Bu sayfayı görüntüleme yetkiniz yok.</p></AdminPageContainer>;
  }

  return (
    <AdminPageContainer>
      <SectionHeader
        title="Etkinlik Yönetimi"
        subtitle="Etkinlikleri yönetin ve kullanıcı önerilerini değerlendirin"
        icon={<Calendar className="h-6 w-6 text-white" />}
        actionLabel="Yeni Etkinlik Oluştur"
        onAction={() => openEditModal(null)}
      />

      <Tabs defaultValue="events-list" className="w-full">
        <TabsList className="grid w-full grid-cols-2 gap-1 h-12 bg-white dark:bg-gray-800 border rounded-xl shadow-sm">
          <TabsTrigger value="events-list" className="data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/30">
            <Calendar className="h-4 w-4 mr-2" />
            Etkinlik Listesi
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="data-[state=active]:bg-purple-50 dark:data-[state=active]:bg-purple-900/30">
            <MessageSquare className="h-4 w-4 mr-2" />
            Kullanıcı Önerileri
            {suggestionStats.pending > 0 && (
              <Badge variant="destructive" className="ml-2">{suggestionStats.pending}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events-list" className="space-y-6 mt-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatsCard title="Toplam" value={eventStats.total} emoji="📅" variant="primary" />
            <StatsCard title="Yaklaşan" value={eventStats.upcoming} emoji="🔥" variant="success" />
            <StatsCard title="Tamamlanan" value={eventStats.completed} emoji="✅" variant="purple" />
            <StatsCard title="Taslak" value={eventStats.draft} emoji="📝" variant="warning" />
          </div>
          <Card>
            <CardContent className="p-4 space-y-4">
              {events?.map(event => (
                <ItemCard
                  key={event.id}
                  title={event.title}
                  subtitle={event.description || ''}
                  image={event.featured_image || undefined}
                  badges={[
                    { label: EVENT_TYPES[event.event_type as keyof typeof EVENT_TYPES] || event.event_type, variant: 'outline' },
                    { label: event.status, variant: 'secondary' }
                  ]}
                  actions={
                    <>
                      {event.has_custom_form && (
                        <Button variant="outline" size="sm" onClick={() => openResponsesModal(event)}>
                          Kayıtları Gör
                        </Button>
                      )}
                      <ActionBar
                        onEdit={() => openEditModal(event)}
                        onDelete={() => openDeleteDialog(event.id)}
                      />
                    </>
                  }
                >
                    <div></div>
                </ItemCard>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-6 mt-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatsCard title="Toplam" value={suggestionStats.total} emoji="📥" variant="primary" />
            <StatsCard title="Bekleyen" value={suggestionStats.pending} emoji="⏳" variant="warning" />
            <StatsCard title="Onaylanan" value={suggestionStats.approved} emoji="✅" variant="success" />
            <StatsCard title="Reddedilen" value={suggestionStats.rejected} emoji="❌" variant="danger" />
          </div>
          <Card>
            <CardContent className="p-4 space-y-4">
              {eventSuggestions?.map(suggestion => (
                <ItemCard
                  key={suggestion.id}
                  title={suggestion.title}
                  subtitle={suggestion.description || ''}
                  badges={[{ label: suggestion.status, variant: 'secondary' }]}
                  metadata={[
                    { label: 'Öneren', value: suggestion.contact_name || 'Anonim' },
                    { label: 'Email', value: suggestion.contact_email || '-' },
                    { label: 'Tarih', value: new Date(suggestion.created_at).toLocaleDateString() }
                  ]}
                  actions={
                    suggestion.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleSuggestionStatusChange(suggestion.id, 'approved')}>
                          <CheckCircle className="h-4 w-4 mr-2"/> Onayla
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleSuggestionStatusChange(suggestion.id, 'rejected')}>
                          <XCircle className="h-4 w-4 mr-2"/> Reddet
                        </Button>
                      </div>
                    )
                  }
                >
                    <div></div>
                </ItemCard>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <EventModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingItem(null); }}
        onSave={handleSaveEvent}
        initialData={editingItem}
      />
      
      <ConfirmDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleDelete}
        title="Etkinliği Sil"
        description="Bu etkinliği silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        itemType="etkinlik"
      />

      {responsesModalOpen && selectedEventForResponses && (
        <FormResponsesModal
          isOpen={responsesModalOpen}
          onClose={() => setResponsesModalOpen(false)}
          formId={selectedEventForResponses.slug || selectedEventForResponses.id}
          formType="event_registration"
          formTitle={selectedEventForResponses.title}
        />
      )}
    </AdminPageContainer>
  );
}; 