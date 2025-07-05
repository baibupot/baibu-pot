import React, { useState } from 'react';
import { AdminModal } from '@/components/admin/shared/AdminModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Upload, FileText, Loader2, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';
import { 
  uploadAcademicDocumentToGitHub, 
  detectDocumentType,
  GitHubStorageConfig 
} from '@/utils/githubStorageHelper';
import { getGitHubStorageConfig } from '@/integrations/github/config';

type Tables = Database['public']['Tables'];
type AcademicDocumentData = Tables['academic_documents']['Insert'];
type AcademicDocumentRow = Tables['academic_documents']['Row'];

interface AcademicDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (documentData: AcademicDocumentData) => void;
  initialData?: AcademicDocumentRow;
}

const AcademicDocumentModal = ({ isOpen, onClose, onSave, initialData }: AcademicDocumentModalProps) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || 'ders_programlari',
    file_url: initialData?.file_url || '',
    file_type: initialData?.file_type || '',
    file_size: initialData?.file_size?.toString() || '',
    tags: initialData?.tags ? initialData.tags.join(', ') : '',
    author: initialData?.author || '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Dosya seçildiğinde form bilgilerini otomatik doldur
      if (!formData.title) {
        setFormData(prev => ({ ...prev, title: file.name.replace(/\.[^/.]+$/, '') }));
      }
      setFormData(prev => ({ 
        ...prev, 
        file_type: detectDocumentType(file.name),
        file_size: file.size.toString()
      }));
    }
  };

  const uploadFileToGitHub = async (): Promise<string | null> => {
    if (!selectedFile) return null;

    const config = getGitHubStorageConfig();
    if (!config) {
      toast.error('GitHub storage yapılandırılmamış');
      return null;
    }

    setIsUploading(true);
    try {
      const result = await uploadAcademicDocumentToGitHub(
        config,
        selectedFile,
        formData.category,
        formData.title,
        initialData?.id
      );

      if (result.success && result.rawUrl) {
        toast.success('Dosya başarıyla yüklendi');
        return result.rawUrl;
      } else {
        toast.error(result.error || 'Dosya yükleme hatası');
        return null;
      }
    } catch (error) {
      toast.error('Dosya yükleme sırasında hata oluştu');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    let fileUrl = formData.file_url;
    
    // Eğer dosya seçilmişse önce GitHub'a yükle
    if (uploadMode === 'file' && selectedFile) {
      const uploadedUrl = await uploadFileToGitHub();
      if (!uploadedUrl) return; // Upload başarısızsa işlemi durdur
      fileUrl = uploadedUrl;
    }

    // URL modunda file_url boş olmamalı
    if (uploadMode === 'url' && !fileUrl) {
      toast.error('Dosya URL\'si gerekli');
      return;
    }

    const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    const documentData: AcademicDocumentData = {
      ...formData,
      file_url: fileUrl,
      tags: tagsArray,
      file_size: formData.file_size ? parseInt(formData.file_size) : null,
    };
    
    onSave(documentData);
    onClose();
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={handleSubmit}
      title={initialData ? 'Belge Düzenle' : 'Yeni Belge Ekle'}
      description="Akademik bir belge yükleyin veya mevcut bir belgeyi güncelleyin."
      icon={<GraduationCap className="h-6 w-6 text-white" />}
      isSaving={isUploading}
      isFormValid={!(uploadMode === 'file' && !selectedFile && !initialData)}
      saveLabel={initialData ? 'Güncelle' : 'Kaydet'}
      size="2xl"
    >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Belge Başlığı</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="category">Kategori</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ders_programlari">Ders Programları</SelectItem>
                <SelectItem value="staj_belgeleri">Staj Belgeleri</SelectItem>
                <SelectItem value="sinav_programlari">Sınav Programları</SelectItem>
                <SelectItem value="ogretim_planlari">Öğretim Planları/Müfredat</SelectItem>
                <SelectItem value="ders_kataloglari">Ders Katalogları</SelectItem>
                <SelectItem value="basvuru_formlari">Başvuru Formları</SelectItem>
                <SelectItem value="resmi_belgeler">Resmi Belgeler</SelectItem>
                <SelectItem value="rehber_dokumanlari">Rehber Dokümanları</SelectItem>
                <SelectItem value="diger">Diğer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Upload Mode Toggle */}
          <div className="space-y-3">
            <Label>Dosya Yükleme Yöntemi</Label>
            <div className="flex space-x-4">
              <Button
                type="button"
                variant={uploadMode === 'file' ? 'default' : 'outline'}
                onClick={() => setUploadMode('file')}
                className="flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>Dosya Yükle</span>
              </Button>
              <Button
                type="button"
                variant={uploadMode === 'url' ? 'default' : 'outline'}
                onClick={() => setUploadMode('url')}
                className="flex items-center space-x-2"
              >
                <FileText className="h-4 w-4" />
                <span>URL Gir</span>
              </Button>
            </div>
          </div>

          {/* File Upload Section */}
          {uploadMode === 'file' && (
            <div className="space-y-3">
              <Label htmlFor="file-upload">Dosya Seç</Label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                {selectedFile ? (
                  <div className="space-y-2">
                    <FileText className="h-8 w-8 mx-auto text-green-500" />
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {selectedFile.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Kaldır
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-gray-400" />
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      PDF, Word, Excel, PowerPoint dosyalarını sürükleyip bırakın
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      Maksimum 25MB
                    </div>
                  </div>
                )}
                <input
                  id="file-upload"
                  type="file"
                  className="sr-only"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                />
                {!selectedFile && (
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-2"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    Dosya Seç
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* URL Input Section */}
          {uploadMode === 'url' && (
            <div>
              <Label htmlFor="file_url">Dosya URL</Label>
              <Input
                id="file_url"
                value={formData.file_url}
                onChange={(e) => setFormData(prev => ({ ...prev, file_url: e.target.value }))}
                placeholder="https://example.com/document.pdf"
                required
              />
            </div>
          )}

          <div>
            <Label htmlFor="file_type">Dosya Türü</Label>
            <Input
              id="file_type"
              value={formData.file_type}
              onChange={(e) => setFormData(prev => ({ ...prev, file_type: e.target.value }))}
              placeholder="PDF, DOC, PPT, vb."
              required
            />
          </div>

          <div>
            <Label htmlFor="author">Yazar</Label>
            <Input
              id="author"
              value={formData.author}
              onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
              placeholder="Belge yazarı"
            />
          </div>

          <div>
            <Label htmlFor="tags">Etiketler (virgülle ayırın)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="psikoloji, araştırma, yöntem"
            />
          </div>
        </form>
    </AdminModal>
  );
};

export default AcademicDocumentModal;
