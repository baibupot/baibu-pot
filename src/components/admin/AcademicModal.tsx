import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { uploadFileObjectToGitHub } from '@/utils/githubStorageHelper';
import { getGitHubStorageConfig } from '@/integrations/github/config';
import { toast } from 'sonner';
import { Loader2, User, Image as ImageIcon } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';

type AcademicInsert = Database['public']['Tables']['academics']['Insert'];
type AcademicRow = Database['public']['Tables']['academics']['Row'];

interface AcademicModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: AcademicRow | null;
}

const AcademicModal = ({ isOpen, onClose, initialData }: AcademicModalProps) => {
  const [formData, setFormData] = useState<Partial<AcademicInsert>>({});
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const isEditMode = !!initialData;

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && initialData) {
        setFormData(initialData);
        setExistingImageUrl(initialData.profile_image || null);
      } else {
        setFormData({ name: '', title: '', email: '', sort_order: 0 });
        setExistingImageUrl(null);
      }
      setProfileImage(null);
      setIsProcessing(false);
    }
  }, [isOpen, initialData, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    const toastId = toast.loading('İşlem yürütülüyor...');

    try {
      let finalData = { ...formData };

      if (profileImage) {
        const config = getGitHubStorageConfig();
        if (!config) throw new Error('GitHub yapılandırması eksik.');
        const fileName = `akademisyenler/${Date.now()}-${profileImage.name}`;
        const result = await uploadFileObjectToGitHub(config, profileImage, fileName);
        if (!result.success || !result.rawUrl) throw new Error(result.error || 'Fotoğraf yüklenemedi.');
        finalData.profile_image = result.rawUrl;
      }

      if (isEditMode && initialData?.id) {
        const { error } = await supabase.from('academics').update(finalData).eq('id', initialData.id);
        if (error) throw error;
        toast.success('Akademisyen bilgileri güncellendi.', { id: toastId });
      } else {
        const { error } = await supabase.from('academics').insert(finalData as AcademicInsert);
        if (error) throw error;
        toast.success('Akademisyen başarıyla eklendi.', { id: toastId });
      }
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu.', { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
      setExistingImageUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleChange = (field: keyof AcademicInsert, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Akademisyen Düzenle' : 'Yeni Akademisyen Ekle'}</DialogTitle>
          <DialogDescription>Stajlarla ilgili akademisyenlerin bilgilerini buradan yönetebilirsiniz.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="flex items-center space-x-4">
                <div className="w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center bg-slate-50 dark:bg-slate-800">
                {existingImageUrl ? (
                    <img src={existingImageUrl} alt="Profil" className="w-full h-full object-cover rounded-full" />
                ) : (
                    <User className="h-10 w-10 text-slate-400" />
                )}
                </div>
                <div className="w-full">
                    <Label htmlFor="profile_image">Profil Fotoğrafı</Label>
                    <Input id="profile_image" type="file" onChange={handleImageChange} className="file:text-sm"/>
                </div>
            </div>

            <div>
                <Label htmlFor="name">Ad Soyad *</Label>
                <Input id="name" value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} required />
            </div>
            <div>
                <Label htmlFor="title">Unvan</Label>
                <Input id="title" value={formData.title || ''} onChange={e => handleChange('title', e.target.value)} placeholder="Prof. Dr., Öğr. Gör. vs."/>
            </div>
            <div>
                <Label htmlFor="email">E-posta</Label>
                <Input id="email" type="email" value={formData.email || ''} onChange={e => handleChange('email', e.target.value)} />
            </div>
             <div>
                <Label htmlFor="sort_order">Sıralama</Label>
                <Input id="sort_order" type="number" value={formData.sort_order || 0} onChange={e => handleChange('sort_order', parseInt(e.target.value,10))} />
            </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isProcessing}>İptal</Button>
            <Button type="submit" disabled={isProcessing}>
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? 'Kaydet' : 'Ekle'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AcademicModal; 