import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  X, Upload, Image, FileText, Save,
  CheckCircle, AlertCircle, Loader2, Link, FileCheck, Folder 
} from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
import { 
  uploadFileObjectToGitHub, 
  createMagazinePaths,
  type GitHubUploadResult 
} from '../../utils/githubStorageHelper';
import { 
  getGitHubStorageConfig, 
  isGitHubStorageConfigured,
  getGitHubConfigStatus 
} from '../../integrations/github/config';

interface Magazine {
  id?: string;
  title: string;
  description: string;
  issue_number: number;
  publication_date: string;
  cover_image: string;
  pdf_file: string;
  slug: string;
  published: boolean;
}

interface MagazineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (magazineData: Magazine) => void;
  initialData?: Magazine | null;
}

const MagazineModal = ({ isOpen, onClose, onSave, initialData }: MagazineModalProps) => {
  const [formData, setFormData] = useState<Magazine>({
    title: '',
    description: '',
    issue_number: 1,
    publication_date: new Date().toISOString().split('T')[0],
    cover_image: '',
    pdf_file: '',
    slug: '',
    published: true
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Upload State
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [githubConfigured, setGithubConfigured] = useState(false);
  const [githubConfig, setGithubConfig] = useState<any>(null);
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<{pdf?: string, cover?: string}>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      const newData = {
        title: '',
        description: '',
        issue_number: 1,
        publication_date: new Date().toISOString().split('T')[0],
        cover_image: '',
        pdf_file: '',
        slug: '',
        published: true
      };
      setFormData(newData);
    }
    setErrors({});
    setUploadedFiles({});
    setSelectedPdfFile(null);
    setSelectedCoverFile(null);
    setUploadProgress(0);
    setUploadStatus('');
    
    // Storage config kontrol et (arka planda)
    const configured = isGitHubStorageConfigured();
    const config = getGitHubStorageConfig();
    
    setGithubConfigured(configured);
    setGithubConfig(config);
  }, [initialData, isOpen]);

  const handleInputChange = (field: keyof Magazine, value: any) => {
    // Issue number için özel kontrol
    if (field === 'issue_number') {
      const numValue = parseInt(value, 10);
      if (isNaN(numValue) || numValue < 1) {
        setFormData(prev => ({ ...prev, [field]: 1 }));
      } else {
        setFormData(prev => ({ ...prev, [field]: numValue }));
      }
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Başlıktan otomatik slug oluştur
    if (field === 'title') {
      const slug = value.toLowerCase()
        .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
        .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
        .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Dergi başlığı gerekli';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Açıklama gerekli';
    }
    if (!formData.cover_image.trim() && !selectedCoverFile) {
      newErrors.cover_image = 'Kapak resmi URL\'si veya dosyası gerekli';
    }
    if (!formData.pdf_file.trim() && !selectedPdfFile) {
      newErrors.pdf_file = 'PDF dosya URL\'si veya dosyası gerekli';
    }
    if (!formData.issue_number || formData.issue_number < 1) {
      newErrors.issue_number = 'Sayı numarası 1\'den büyük olmalı';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Dosya yükleme fonksiyonu (GitHub arka planda)
  const uploadFile = async (file: File, type: 'pdf' | 'cover'): Promise<string> => {
    if (!githubConfig) {
      throw new Error('Dosya depolama sistemi yapılandırılmamış');
    }

    const paths = createMagazinePaths(formData.issue_number);
    const targetPath = type === 'pdf' ? paths.pdfPath : paths.coverPath;
    
    const result = await uploadFileObjectToGitHub(githubConfig, file, targetPath);
    
    if (result.success && result.rawUrl) {
      return result.rawUrl;
    } else {
      throw new Error(result.error || 'Dosya yükleme başarısız');
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus('İşlem başlıyor...');

    try {
      let finalFormData = { ...formData };
      let currentProgress = 0;

      // Dosya yükleme işlemleri
      if (githubConfigured && githubConfig) {
        // Kapak resmi yükleme
        if (selectedCoverFile) {
          setUploadStatus('📷 Kapak resmi yükleniyor...');
          setUploadProgress(25);
          
          const coverUrl = await uploadFile(selectedCoverFile, 'cover');
          finalFormData.cover_image = coverUrl;
          setUploadedFiles(prev => ({ ...prev, cover: coverUrl }));
          
          currentProgress = 50;
          setUploadProgress(currentProgress);
        }

        // PDF dosyası yükleme
        if (selectedPdfFile) {
          setUploadStatus('📄 PDF dosyası yükleniyor...');
          setUploadProgress(currentProgress + 25);
          
          const pdfUrl = await uploadFile(selectedPdfFile, 'pdf');
          finalFormData.pdf_file = pdfUrl;
          setUploadedFiles(prev => ({ ...prev, pdf: pdfUrl }));
          
          setUploadProgress(75);
        }
      }

      // Veritabanına kaydetme
      setUploadStatus('💾 Veritabanına kaydediliyor...');
      setUploadProgress(85);

      const cleanedData = {
        title: finalFormData.title.trim(),
        description: finalFormData.description.trim(),
        issue_number: Number(finalFormData.issue_number), 
        publication_date: finalFormData.publication_date,
        cover_image: finalFormData.cover_image.trim(),
        pdf_file: finalFormData.pdf_file.trim(),
        slug: finalFormData.slug.trim(),
        published: Boolean(finalFormData.published),
        updated_at: new Date().toISOString()
      };

      if (initialData?.id) {
        // Güncelleme
        const { error } = await supabase
          .from('magazine_issues')
          .update(cleanedData)
          .eq('id', initialData.id);

        if (error) throw error;
        setUploadStatus('✅ Dergi başarıyla güncellendi!');
      } else {
        // Yeni kayıt
        const { error } = await supabase
          .from('magazine_issues')
          .insert([{
            ...cleanedData,
            created_by: null 
          }]);

        if (error) throw error;
        setUploadStatus('✅ Yeni dergi başarıyla eklendi!');
      }

      setUploadProgress(100);
      onSave(cleanedData);
      
      // Success mesajını göster ve modal'ı kapat
      setTimeout(() => {
        onClose();
        setUploadStatus('');
        setUploadProgress(0);
      }, 1500);
      
    } catch (error: any) {
      const errorMessage = error.message || 'Kaydetme işlemi başarısız';
      setUploadStatus(`❌ Hata: ${errorMessage}`);
      setUploadProgress(0);
      
      setTimeout(() => {
        setUploadStatus('');
      }, 5000);
    } finally {
      setLoading(false);
      setIsUploading(false);
    }
  };

  const getFileTypeIcon = (url: string) => {
    return <Folder className="w-4 h-4" />;
  };

  const getFileTypeBadge = (url: string) => {
    return <Badge variant="outline" className="text-xs">Yüklendi</Badge>;
  };

  const hasSelectedFiles = selectedPdfFile || selectedCoverFile;
  
  // Form validasyonunu sadece burada kontrol et (infinite loop'u önlemek için)
  const canSubmit = () => {
    return formData.title.trim() !== '' && 
           formData.description.trim() !== '' &&
           (formData.cover_image.trim() !== '' || selectedCoverFile) &&
           (formData.pdf_file.trim() !== '' || selectedPdfFile) &&
           formData.issue_number && formData.issue_number >= 1;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-primary" />
            {initialData ? 'Dergi Düzenle' : 'Yeni Dergi Ekle'}
          </DialogTitle>
          <DialogDescription>
            {initialData ? 'Mevcut dergi sayısını düzenleyin' : 'Yeni bir dergi sayısı ekleyin'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          
          {/* Upload Progress & Status */}
          {(uploadStatus || isUploading) && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                ) : uploadStatus.includes('✅') ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : uploadStatus.includes('❌') ? (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                ) : (
                  <Upload className="w-4 h-4 text-blue-600" />
                )}
                <p className="text-sm font-medium">{uploadStatus}</p>
              </div>
              {uploadProgress > 0 && (
                <Progress value={uploadProgress} className="h-2" />
              )}
            </div>
          )}
          
          {/* Temel Bilgiler */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Dergi Başlığı *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Ör: BAİBÜ PÖT Dergisi"
                className={errors.title ? 'border-red-500' : ''}
                disabled={isUploading}
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>

            <div>
              <Label htmlFor="issue_number">Sayı Numarası *</Label>
              <Input
                id="issue_number"
                type="number"
                min="1"
                step="1"
                value={formData.issue_number}
                onChange={(e) => handleInputChange('issue_number', e.target.value)}
                className={errors.issue_number ? 'border-red-500' : ''}
                placeholder="1"
                disabled={isUploading}
              />
              {errors.issue_number && <p className="text-red-500 text-xs mt-1">{errors.issue_number}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="description">Açıklama *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Dergi hakkında kısa açıklama..."
              rows={3}
              className={errors.description ? 'border-red-500' : ''}
              disabled={isUploading}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          <div>
            <Label htmlFor="publication_date">Yayın Tarihi</Label>
            <Input
              id="publication_date"
              type="date"
              value={formData.publication_date}
              onChange={(e) => handleInputChange('publication_date', e.target.value)}
              disabled={isUploading}
            />
          </div>

          {/* Kapak Resmi */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2 text-base font-medium">
              <Image className="w-5 h-5" />
              Kapak Resmi *
            </Label>
            
            {/* Dosya Seç Seçeneği */}
            {githubConfigured && (
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm font-medium">Bilgisayarımdan Seç</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedCoverFile(e.target.files?.[0] || null)}
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  disabled={isUploading}
                />
                {selectedCoverFile && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    ✓ {selectedCoverFile.name} seçildi ({(selectedCoverFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
            )}
            
            {/* Manuel URL Girişi */}
            <div className="space-y-2">
              <Label className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Link className="w-3 h-3" />
                {githubConfigured ? 'Veya İnternet Adresini Gir' : 'Resim İnternet Adresi'}
              </Label>
              <Input
                value={formData.cover_image}
                onChange={(e) => handleInputChange('cover_image', e.target.value)}
                placeholder="https://example.com/image.jpg"
                className={errors.cover_image ? 'border-red-500' : ''}
                disabled={isUploading}
              />
              {errors.cover_image && <p className="text-red-500 text-xs mt-1">{errors.cover_image}</p>}
            </div>
            
            {/* Kapak Önizleme */}
            {formData.cover_image && (
              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  {getFileTypeIcon(formData.cover_image)}
                  {getFileTypeBadge(formData.cover_image)}
                  {uploadedFiles.cover === formData.cover_image && (
                    <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                      <FileCheck className="w-3 h-3 mr-1" />
                      Bu oturumda yüklendi
                    </Badge>
                  )}
                </div>
                <img 
                  src={formData.cover_image} 
                  alt="Kapak önizleme"
                  className="max-w-40 h-auto rounded border shadow-sm"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              </div>
            )}
          </div>

          {/* PDF Dosyası */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2 text-base font-medium">
              <FileText className="w-5 h-5" />
              PDF Dosyası *
            </Label>
            
            {/* Dosya Seç Seçeneği */}
            {githubConfigured && (
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm font-medium">Bilgisayarımdan Seç</span>
                </div>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setSelectedPdfFile(e.target.files?.[0] || null)}
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  disabled={isUploading}
                />
                {selectedPdfFile && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    ✓ {selectedPdfFile.name} seçildi ({(selectedPdfFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
            )}
            
            {/* Manuel URL Girişi */}
            <div className="space-y-2">
              <Label className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Link className="w-3 h-3" />
                {githubConfigured ? 'Veya İnternet Adresini Gir' : 'PDF İnternet Adresi'}
              </Label>
              <Input
                value={formData.pdf_file}
                onChange={(e) => handleInputChange('pdf_file', e.target.value)}
                placeholder="https://example.com/document.pdf"
                className={errors.pdf_file ? 'border-red-500' : ''}
                disabled={isUploading}
              />
              {errors.pdf_file && <p className="text-red-500 text-xs mt-1">{errors.pdf_file}</p>}
            </div>
            
            {/* PDF Bilgi */}
            {formData.pdf_file && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {getFileTypeIcon(formData.pdf_file)}
                  {getFileTypeBadge(formData.pdf_file)}
                  {uploadedFiles.pdf === formData.pdf_file && (
                    <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                      <FileCheck className="w-3 h-3 mr-1" />
                      Bu oturumda yüklendi
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  📖 PDF dosyası flipbook okuma için hazır
                </p>
              </div>
            )}
          </div>

          {/* Yayın Durumu */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <input
              type="checkbox"
              id="published"
              checked={formData.published}
              onChange={(e) => handleInputChange('published', e.target.checked)}
              className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
              disabled={isUploading}
            />
            <Label htmlFor="published" className="text-sm font-medium">
              Hemen yayınla
            </Label>
          </div>

          {/* Bilgi Notu */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">💡 İpuçları:</h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Dosyalar seçildikten sonra "Kaydet" butonuna basın</li>
              <li>• Dosyalar güvenli bir şekilde saklanır ve organize edilir</li>
              <li>• PDF'ler modern flipbook formatında okuyuculara sunulur</li>
              <li>• Yayınlanan dergiler anında web sitesinde görünür</li>
            </ul>
          </div>
        </div>

        {/* Alt Butonlar */}
        <div className="flex gap-3 pt-6 border-t">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={loading || isUploading}
            className="flex-1"
          >
            <X className="w-4 h-4 mr-2" />
            İptal
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || isUploading || !canSubmit()} 
            className="flex-1"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isUploading ? 'İşleniyor...' : (initialData ? 'Güncelle' : 'Kaydet')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MagazineModal;
