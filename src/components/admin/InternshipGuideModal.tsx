import React, { useState, useEffect } from 'react';
import { AdminModal } from '@/components/admin/shared/AdminModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, BookOpen } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';

type GuideInsert = Database['public']['Tables']['internship_guides']['Insert'];
type GuideRow = Database['public']['Tables']['internship_guides']['Row'];

interface InternshipGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: GuideRow | null;
}

const InternshipGuideModal = ({ isOpen, onClose, initialData }: InternshipGuideModalProps) => {
  const [formData, setFormData] = useState<Partial<GuideInsert>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const isEditMode = !!initialData;

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && initialData) {
        setFormData(initialData);
      } else {
        setFormData({ title: '', content: '', youtube_video_url: '', sort_order: 0 });
      }
      setIsProcessing(false);
    }
  }, [isOpen, initialData, isEditMode]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsProcessing(true);
    const toastId = toast.loading('İşlem yürütülüyor...');

    try {
      if (isEditMode && initialData?.id) {
        const { error } = await supabase.from('internship_guides').update(formData).eq('id', initialData.id);
        if (error) throw error;
        toast.success('Rehber güncellendi.', { id: toastId });
      } else {
        const { error } = await supabase.from('internship_guides').insert(formData as GuideInsert);
        if (error) throw error;
        toast.success('Rehber başarıyla eklendi.', { id: toastId });
      }
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu.', { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChange = (field: keyof GuideInsert, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={handleSubmit}
      title={isEditMode ? 'Rehber Düzenle' : 'Yeni Rehber Ekle'}
      description="Stajlar sayfasında görünecek rehber içeriğini yönetin."
      icon={<BookOpen className="h-6 w-6 text-white" />}
      isSaving={isProcessing}
      saveLabel={isEditMode ? 'Kaydet' : 'Ekle'}
      size="2xl"
    >
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div>
                <Label htmlFor="title">Başlık *</Label>
                <Input id="title" value={formData.title || ''} onChange={e => handleChange('title', e.target.value)} required />
            </div>
            <div>
                <Label htmlFor="youtube_video_url">YouTube Video URL</Label>
                <Input id="youtube_video_url" value={formData.youtube_video_url || ''} onChange={e => handleChange('youtube_video_url', e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
            </div>
            <div>
                <Label htmlFor="content">İçerik (Açıklama)</Label>
                <Textarea id="content" value={formData.content || ''} onChange={e => handleChange('content', e.target.value)} rows={5}/>
            </div>
             <div>
                <Label htmlFor="sort_order">Sıralama</Label>
                <Input id="sort_order" type="number" value={formData.sort_order || 0} onChange={e => handleChange('sort_order', parseInt(e.target.value,10))} />
            </div>
        </form>
    </AdminModal>
  );
};

export default InternshipGuideModal; 