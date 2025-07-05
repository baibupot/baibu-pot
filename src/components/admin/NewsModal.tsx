import React, { useState, useEffect } from 'react';
import { AdminModal } from '@/components/admin/shared/AdminModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { Database } from '@/integrations/supabase/types';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { uploadFileObjectToGitHub } from '@/utils/githubStorageHelper';
import { getGitHubStorageConfig } from '@/integrations/github/config';
import { toast } from 'sonner';
import { Loader2, Image as ImageIcon, Link2, FileText } from 'lucide-react';
import { Editor } from '@tiptap/react';

type NewsData = Database['public']['Tables']['news']['Insert'];
type NewsRow = Database['public']['Tables']['news']['Row'];

interface NewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newsData: Partial<NewsData>, id?: string) => void;
  initialData?: NewsRow | null;
}

const NewsModal = ({ isOpen, onClose, onSave, initialData }: NewsModalProps) => {
  const [formData, setFormData] = useState<Partial<NewsData>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null);

  const isEditMode = !!initialData;

  useEffect(() => {
    if (isOpen) {
      const initialContent = initialData?.content || '';
      if (isEditMode && initialData) {
        setFormData(initialData);
        if(editorInstance) editorInstance.commands.setContent(initialContent);
      } else {
        const defaultData = { title: '', content: '', category: 'genel', published: true, slug: '' };
        setFormData(defaultData);
        if(editorInstance) editorInstance.commands.setContent(defaultData.content);
      }
      setCoverImageFile(null);
      setIsProcessing(false);
    }
  }, [isOpen, initialData, isEditMode, editorInstance]);

  useEffect(() => {
    if (formData.title && !isEditMode) {
        const slug = formData.title.toLowerCase()
            .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
            .replace(/ /g, '-').replace(/[^\w-]+/g, '');
        handleChange('slug', slug);
    }
  }, [formData.title, isEditMode]);

  const handleContentChange = (content: string) => {
    handleChange('content', content);
  };
  
  const handleImageUpload = async (file: File) => {
    setIsProcessing(true);
    const toastId = toast.loading('Resim yükleniyor...');
    try {
        const config = getGitHubStorageConfig();
        if (!config) throw new Error('GitHub yapılandırması eksik.');
        const fileName = `haber-resimleri/${Date.now()}-${file.name}`;
        const result = await uploadFileObjectToGitHub(config, file, fileName);
        if (!result.success || !result.rawUrl) throw new Error(result.error || 'Resim yüklenemedi.');
        toast.success('Resim başarıyla yüklendi.', { id: toastId });
        return result.rawUrl;
    } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Bir hata oluştu.', { id: toastId });
        return null;
    } finally {
        setIsProcessing(false);
    }
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Kapak fotoğrafı boyutu 2MB\'dan büyük olamaz.');
            return;
        }
        setCoverImageFile(file);
        handleChange('featured_image', URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsProcessing(true);
    const toastId = toast.loading('Haber kaydediliyor...');
    try {
        let finalData = { ...formData };
        if (coverImageFile) {
            const uploadedUrl = await handleImageUpload(coverImageFile);
            if (!uploadedUrl) throw new Error('Kapak fotoğrafı yüklenemedi.');
            finalData.featured_image = uploadedUrl;
        }
        onSave(finalData, initialData?.id);
        toast.success(isEditMode ? 'Haber güncellendi!' : 'Haber oluşturuldu!', { id: toastId });
        onClose();
    } catch (error) {
         toast.error(error instanceof Error ? error.message : 'Bir hata oluştu.', { id: toastId });
    } finally {
        setIsProcessing(false);
    }
  };

  const handleChange = (field: keyof NewsData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <AdminModal
        isOpen={isOpen}
        onClose={onClose}
        onSave={handleSubmit}
        title={isEditMode ? 'Haberi Düzenle' : 'Yeni Haber Ekle'}
        description='Haber veya duyuru içeriğini buradan oluşturun ve düzenleyin.'
        icon={<FileText className="h-6 w-6 text-white" />}
        isSaving={isProcessing}
        saveLabel={isEditMode ? 'Değişiklikleri Kaydet' : 'Haberi Oluştur'}
        size="4xl"
        compactHeader={true}
    >
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-2">
                    <Label>Öne Çıkan Kapak Fotoğrafı</Label>
                    <div className="aspect-square w-full rounded-lg border-2 border-dashed flex items-center justify-center relative bg-slate-50 dark:bg-slate-800">
                        {formData.featured_image ? (
                            <img src={formData.featured_image} alt="Kapak Önizleme" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                            <div className="text-center text-slate-500 p-2">
                            <ImageIcon className="mx-auto h-8 w-8" />
                            <p className="mt-1 text-xs">Seçin veya sürükleyin</p>
                            </div>
                        )}
                    </div>
                    <Input id="cover-image-upload" type="file" onChange={handleCoverImageChange} accept="image/jpeg, image/png, image/webp" className="file:text-sm file:font-medium"/>
                </div>

                <div className="md:col-span-2 space-y-4">
                     <div>
                        <Label htmlFor="title">Başlık *</Label>
                        <Input id="title" value={formData.title || ''} onChange={e => handleChange('title', e.target.value)} required />
                    </div>
                    <div>
                        <Label htmlFor="category">Kategori</Label>
                        <Select value={formData.category || 'genel'} onValueChange={value => handleChange('category', value)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="genel">Genel</SelectItem>
                                <SelectItem value="duyuru">Duyuru</SelectItem>
                                <SelectItem value="etkinlik">Etkinlik Haberi</SelectItem>
                                <SelectItem value="dergi">Dergi Haberi</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div>
                        <Label htmlFor="excerpt">Kısa Özet (Manşetlerde Görünür)</Label>
                        <Textarea id="excerpt" value={formData.excerpt || ''} onChange={e => handleChange('excerpt', e.target.value)} rows={3} />
                    </div>
                </div>
            </div>
            
            <div>
                <Label>İçerik</Label>
                <div className="min-h-[400px]">
                    <RichTextEditor
                        content={formData.content || ''}
                        onChange={handleContentChange}
                        onImageUpload={handleImageUpload}
                        onEditorInstance={setEditorInstance}
                    />
                </div>
            </div>
            
            <div className="flex items-center space-x-2 pt-4">
                <Switch id="published" checked={formData.published} onCheckedChange={value => handleChange('published', value)} />
                <Label htmlFor="published">Yayında mı?</Label>
            </div>
        </form>
    </AdminModal>
  );
};

export default NewsModal;
