import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Eye, CheckCircle, Trash2 } from 'lucide-react';
import { AdminPageContainer, SectionHeader, ItemCard, ActionBar, ConfirmDialog } from '@/components/admin/shared';
import { useAdminContext } from '@/contexts/AdminDashboardContext';
import { useContactMessages, useUpdateContactMessage, useDeleteContactMessage } from '@/hooks/useSupabaseData';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type Message = Database['public']['Tables']['contact_messages']['Row'];

export const MessagesPage: React.FC = () => {
  const { hasPermission } = useAdminContext();
  const { data: messages, refetch } = useContactMessages();
  const updateMessage = useUpdateContactMessage();
  const deleteMessage = useDeleteContactMessage();

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleMarkAsRead = async (id: string) => {
    try {
      await updateMessage.mutateAsync({ id, status: 'read' });
      toast.success('Mesaj okundu olarak işaretlendi');
      refetch();
    } catch (error) {
      toast.error('İşlem başarısız oldu');
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteMessage.mutateAsync(itemToDelete);
      toast.success('Mesaj silindi');
      refetch();
    } catch (error) {
      toast.error('Silme işlemi başarısız');
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };
  
  const openDetailModal = (message: Message) => {
    setSelectedMessage(message);
    setDetailModalOpen(true);
    if (message.status === 'unread') {
      handleMarkAsRead(message.id);
    }
  };

  const openDeleteDialog = (id: string) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };
  
  if (!hasPermission('messages')) {
    return <AdminPageContainer><p>Bu sayfayı görüntüleme yetkiniz yok.</p></AdminPageContainer>;
  }

  return (
    <AdminPageContainer>
      <SectionHeader
        title="İletişim Mesajları"
        subtitle="Kullanıcılardan gelen iletişim mesajlarını yönetin"
        icon={<MessageSquare className="h-6 w-6 text-white" />}
      />

      <Card>
        <CardContent className="p-4 space-y-4">
          {messages?.map((message: Message) => (
            <ItemCard
              key={message.id}
              title={message.subject}
              subtitle={`${message.name} - ${message.email}`}
              badges={[{ label: message.status || 'unread', variant: message.status === 'unread' ? 'default' : 'secondary' }]}
              actions={
                <ActionBar
                  onView={() => openDetailModal(message)}
                  onDelete={() => openDeleteDialog(message.id)}
                />
              }
            >
                <div></div>
            </ItemCard>
          ))}
        </CardContent>
      </Card>
      
      {selectedMessage && (
        <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedMessage.subject}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p><strong>Gönderen:</strong> {selectedMessage.name} ({selectedMessage.email})</p>
              <p><strong>Tarih:</strong> {new Date(selectedMessage.created_at || "").toLocaleString()}</p>
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
                {selectedMessage.message}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Mesajı Sil"
        description="Bu mesajı kalıcı olarak silmek istediğinizden emin misiniz?"
        itemType="mesaj"
        isLoading={deleteMessage.isPending}
      />
    </AdminPageContainer>
  );
}; 