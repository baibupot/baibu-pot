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
  CheckCircle, AlertCircle, Loader2, Link, FileCheck, Folder, Plus, Building2 
} from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
import { 
  uploadFileObjectToGitHub, 
  createMagazinePaths,
  type GitHubUploadResult 
} from '../../utils/githubStorageHelper';
import { 
  processPdfToGitHubPages,
  type PageUploadResult 
} from '../../utils/pdfProcessor';
import { 
  getGitHubStorageConfig, 
  isGitHubStorageConfigured,
  getGitHubConfigStatus 
} from '../../integrations/github/config';
import { useSponsors } from '../../hooks/useSupabaseData';

interface Magazine {
  id?: string;
  title: string;
  description: string;
  theme?: string;
  issue_number: number;
  publication_date: string;
  cover_image: string;
  pdf_file: string;
  slug: string;
  published: boolean;
}

interface Contributor {
  name: string;
  role: 'editor' | 'author' | 'illustrator' | 'designer' | 'translator';
  bio?: string;
  profile_image?: string;
  social_links?: Record<string, string>;
}

interface MagazineSponsor {
  sponsor_name: string;
  sponsorship_type: string;
  logo_url?: string;
  website_url?: string;
  selectedLogoFile?: File;
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
    theme: '',
    issue_number: 1,
    publication_date: new Date().toISOString().split('T')[0],
    cover_image: '',
    pdf_file: '',
    slug: '',
    published: true
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [magazineSponsors, setMagazineSponsors] = useState<MagazineSponsor[]>([]);
  
  // Tüm sponsorları çek
  const { data: allSponsors = [] } = useSponsors(false);
  
  // Upload State
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [githubConfigured, setGithubConfigured] = useState(false);
  const [githubConfig, setGithubConfig] = useState<any>(null);
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<{pdf?: string, cover?: string}>({});
  
  // 🆕 PDF her zaman sayfa sayfa yüklenir - 25MB limit yok, gerçek lazy loading

  useEffect(() => {
    const loadData = async () => {
      if (initialData) {
        setFormData(initialData);
        
        // Mevcut contributors'ları yükle
        if (initialData.id) {
          try {
            const { data } = await supabase
              .from('magazine_contributors')
              .select('*')
              .eq('magazine_issue_id', initialData.id)
              .order('sort_order', { ascending: true });
            
            if (data) {
              const existingContributors: Contributor[] = data.map(c => ({
                name: c.name,
                role: c.role as Contributor['role'],
                bio: c.bio || undefined,
                profile_image: c.profile_image || undefined,
                social_links: undefined // Şimdilik undefined, ileride geliştirilebilir
              }));
              setContributors(existingContributors);
            }
          } catch (error) {
            console.error('Contributors yüklenemedi:', error);
          }
          
          // Mevcut magazine sponsors'ları yükle
          try {
            const { data: sponsorsData } = await supabase
              .from('magazine_sponsors')
              .select('*')
              .eq('magazine_issue_id', initialData.id);
            
            if (sponsorsData) {
              const existingSponsors: MagazineSponsor[] = sponsorsData.map((s: any) => ({
                sponsor_name: s.sponsor_name || s.name || '', // Eski data için fallback
                sponsorship_type: s.sponsorship_type || '',
                logo_url: s.logo_url || '',
                website_url: s.website_url || '',
                selectedLogoFile: undefined
              }));
              setMagazineSponsors(existingSponsors);
            }
          } catch (error) {
            console.error('Magazine sponsors yüklenemedi:', error);
          }
        }
      } else {
        const newData = {
          title: '',
          description: '',
          theme: '',
          issue_number: 1,
          publication_date: new Date().toISOString().split('T')[0],
          cover_image: '',
          pdf_file: '',
          slug: '',
          published: true
        };
        setFormData(newData);
        setContributors([]);
        setMagazineSponsors([]);
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
    };
    
    loadData();
  }, [initialData, isOpen]);

  const handleInputChange = (field: keyof Magazine, value: any) => {
    // Issue number için özel kontrol - sadece pozitif sayılara izin ver
    if (field === 'issue_number') {
      const numValue = parseInt(value, 10);
      // Boş değer ise 1 yap, geçerli sayı ise o sayıyı kullan
      if (value === '' || value === null || value === undefined) {
        setFormData(prev => ({ ...prev, [field]: 1 }));
      } else if (!isNaN(numValue) && numValue > 0) {
        setFormData(prev => ({ ...prev, [field]: numValue }));
      }
      // Geçersiz değer ise hiçbir şey yapma (önceki değer korunur)
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
      newErrors.cover_image = 'Kapak resmi gerekli';
    }
    if (!formData.pdf_file.trim() && !selectedPdfFile) {
      newErrors.pdf_file = 'PDF dosya URL\'si veya dosyası gerekli';
    }
    if (!formData.issue_number || formData.issue_number < 1) {
      newErrors.issue_number = 'Sayı numarası 1\'den büyük olmalı';
    }

    // Sponsor validasyonu - Eğer sponsor eklenmiş ise zorunlu alanları kontrol et
    magazineSponsors.forEach((sponsor, index) => {
      if (sponsor.sponsor_name.trim() && !sponsor.sponsorship_type.trim()) {
        newErrors[`sponsor_${index}_type`] = `Sponsor ${index + 1} için sponsorluk türü seçin`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // PDF sayfa sayfa yükleme fonksiyonu
  const uploadPdfAsPages = async (pdfFile: File): Promise<string> => {
    if (!githubConfig) {
      throw new Error('Dosya depolama sistemi yapılandırılmamış');
    }

    // PDF özel kontrolü
    if (!pdfFile.type.includes('pdf')) {
      throw new Error('Sadece PDF dosyaları kabul edilir');
    }

    const fileSizeMB = (pdfFile.size / 1024 / 1024).toFixed(2);

    // PDF'i sayfa sayfa GitHub'a yükle
    const result = await processPdfToGitHubPages(
      pdfFile,
      formData.issue_number,
      formData.title || 'Dergi',
      githubConfig,
      uploadFileObjectToGitHub,
      (progress, status) => {
        setUploadProgress(25 + (progress * 0.5)); // %25-75 arası
        setUploadStatus(status);
      }
    );

    if (result.success && result.uploadedPages.length > 0) {
      // Metadata URL'ini return et (frontend bundan sayfa URL'lerini okuyacak)
      const metadataUrl = `https://raw.githubusercontent.com/${githubConfig.owner}/${githubConfig.repo}/${githubConfig.branch}/magazines/issue-${formData.issue_number}/metadata.json`;
      return metadataUrl;
    } else {
      throw new Error(result.error || 'PDF sayfa ayırma başarısız');
    }
  };

  // Kapak resmi yükleme fonksiyonu  
  const uploadCoverImage = async (file: File): Promise<string> => {
    if (!githubConfig) {
      throw new Error('Dosya depolama sistemi yapılandırılmamış');
    }

    const safePath = createMagazinePaths(formData.issue_number);
    const result = await uploadFileObjectToGitHub(githubConfig, file, safePath.coverPath);
    
    if (result.success && result.rawUrl) {
      return result.rawUrl;
    } else {
      throw new Error(result.error || 'Kapak resmi yükleme başarısız');
    }
  };

  // Sponsor logo yükleme fonksiyonu
  const uploadSponsorLogo = async (file: File, sponsorIndex: number): Promise<string> => {
    if (!githubConfig) {
      throw new Error('Dosya depolama sistemi yapılandırılmamış');
    }

    // Sponsor logo için özel path oluştur
    const fileName = `sponsor-${sponsorIndex + 1}-${Date.now()}.${file.name.split('.').pop()}`;
    const targetPath = `magazines/issue-${formData.issue_number}/sponsors/${fileName}`;
    
    const result = await uploadFileObjectToGitHub(githubConfig, file, targetPath);
    
    if (result.success && result.rawUrl) {
      return result.rawUrl;
    } else {
      throw new Error(result.error || 'Sponsor logo yükleme başarısız');
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
          setUploadProgress(10);
          
          const coverUrl = await uploadCoverImage(selectedCoverFile);
          finalFormData.cover_image = coverUrl;
          setUploadedFiles(prev => ({ ...prev, cover: coverUrl }));
          
          setUploadProgress(25);
        }

        // PDF sayfa sayfa yükleme - YENİ SİSTEM!
        if (selectedPdfFile) {
          setUploadStatus('📄 PDF sayfa sayfa işleniyor...');
          
          const metadataUrl = await uploadPdfAsPages(selectedPdfFile);
          finalFormData.pdf_file = metadataUrl; // Metadata URL'ini saklıyoruz
          setUploadedFiles(prev => ({ ...prev, pdf: metadataUrl }));
          
          setUploadProgress(75);
        }

        // Sponsor logoları yükleme - YENİ
        if (magazineSponsors.some(s => s.selectedLogoFile)) {
          setUploadStatus('🏢 Sponsor logoları yükleniyor...');
          setUploadProgress(80);
          
          for (let i = 0; i < magazineSponsors.length; i++) {
            const sponsor = magazineSponsors[i];
            if (sponsor.selectedLogoFile) {
              try {
                const logoUrl = await uploadSponsorLogo(sponsor.selectedLogoFile, i);
                const updated = [...magazineSponsors];
                updated[i].logo_url = logoUrl;
                updated[i].selectedLogoFile = undefined; // Temizle
                setMagazineSponsors(updated);
              } catch (error) {
                console.warn(`Sponsor ${i + 1} logosu yüklenemedi:`, error);
                // Logo yükleme hatası ana işlemi durdurmasın
              }
            }
          }
        }
      }

      // Veritabanına kaydetme
      setUploadStatus('💾 Veritabanına kaydediliyor...');
      setUploadProgress(85);

      const cleanedData = {
        title: finalFormData.title.trim(),
        description: finalFormData.description.trim(),
        theme: finalFormData.theme?.trim() || null,
        issue_number: Number(finalFormData.issue_number), 
        publication_date: finalFormData.publication_date,
        cover_image: finalFormData.cover_image.trim(),
        pdf_file: finalFormData.pdf_file.trim(),
        slug: finalFormData.slug.trim(),
        published: Boolean(finalFormData.published),
        updated_at: new Date().toISOString()
      };

      let magazineId = initialData?.id;

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
        const { data: newMagazine, error } = await supabase
          .from('magazine_issues')
          .insert([{
            ...cleanedData,
            created_by: null 
          }])
          .select()
          .single();

        if (error) throw error;
        magazineId = newMagazine.id;
        setUploadStatus('✅ Yeni dergi başarıyla eklendi!');
      }

      // Contributors kaydetme
      if (contributors.length > 0 && magazineId) {
        setUploadStatus('👥 Katkıda bulunanlar kaydediliyor...');
        setUploadProgress(90);

        // Önce mevcut contributors'ları sil (güncelleme durumunda)
        if (initialData?.id) {
          await supabase
            .from('magazine_contributors')
            .delete()
            .eq('magazine_issue_id', magazineId);
        }

        // Yeni contributors'ları ekle
        const contributorsData = contributors
          .filter(c => c.name.trim()) // Boş isimli olanları filtrele
          .map((contributor, index) => ({
            magazine_issue_id: magazineId,
            name: contributor.name.trim(),
            role: contributor.role,
            bio: contributor.bio?.trim() || null,
            profile_image: contributor.profile_image?.trim() || null,
            social_links: contributor.social_links || null,
            sort_order: index + 1
          }));

        if (contributorsData.length > 0) {
          const { error: contributorsError } = await supabase
            .from('magazine_contributors')
            .insert(contributorsData);

          if (contributorsError) {
            console.warn('Contributors kaydedilemedi:', contributorsError);
            // Contributors hatası dergi kaydını etkilemesin
          }
        }
      }

      // Magazine Sponsors kaydetme
      if (magazineSponsors.length > 0 && magazineId) {
        setUploadStatus('🏢 Sponsorlar kaydediliyor...');
        setUploadProgress(95);

        // Önce mevcut sponsors'ları sil (güncelleme durumunda)
        if (initialData?.id) {
          await supabase
            .from('magazine_sponsors')
            .delete()
            .eq('magazine_issue_id', magazineId);
        }

        // Yeni sponsors'ları ekle
        const sponsorsData = magazineSponsors
          .filter(s => s.sponsor_name.trim() && s.sponsorship_type.trim()) // Boş sponsor_name VE sponsorship_type olanları filtrele
          .map((sponsor, index) => ({
            magazine_issue_id: magazineId,
            sponsor_name: sponsor.sponsor_name.trim(),
            sponsorship_type: sponsor.sponsorship_type.trim(),
            logo_url: sponsor.logo_url?.trim() || null,
            website_url: sponsor.website_url?.trim() || null,
            sort_order: index + 1
          }));

        if (sponsorsData.length > 0) {
          const { error: sponsorsError } = await supabase
            .from('magazine_sponsors')
            .insert(sponsorsData as any);

          if (sponsorsError) {
            console.warn('Magazine sponsors kaydedilemedi:', sponsorsError);
            // Sponsors hatası dergi kaydını etkilemesin
          }
        }
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
            <Label htmlFor="theme">Tema</Label>
            <Input
              id="theme"
              value={formData.theme || ''}
              onChange={(e) => handleInputChange('theme', e.target.value)}
              placeholder="Ör: Travma ve İyileşme, Psikoloji ve Teknoloji..."
              disabled={isUploading}
            />
            <p className="text-xs text-gray-500 mt-1">Bu sayının ana teması (opsiyonel)</p>
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
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    if (file && file.size > 25 * 1024 * 1024) {
                      alert(`Dosya çok büyük! Maksimum 25MB olmalı. Seçilen dosya: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
                      e.target.value = '';
                      return;
                    }
                    setSelectedCoverFile(file);
                  }}
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  disabled={isUploading}
                />
                {selectedCoverFile && (
                  <p className={`text-xs ${selectedCoverFile.size > 25 * 1024 * 1024 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    ✓ {selectedCoverFile.name} seçildi ({(selectedCoverFile.size / 1024 / 1024).toFixed(2)} MB)
                    {selectedCoverFile.size > 25 * 1024 * 1024 && ' ⚠️ Çok büyük!'}
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  💡 Maksimum dosya boyutu: 25MB
                </p>
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
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    // Sayfa-sayfa upload sisteminde boyut sınırı yok!
                    // GitHub'a her sayfa ayrı küçük dosya olarak yükleniyor
                    setSelectedPdfFile(file);
                  }}
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  disabled={isUploading}
                />
                {selectedPdfFile && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    ✓ {selectedPdfFile.name} seçildi ({(selectedPdfFile.size / 1024 / 1024).toFixed(2)} MB)
                    <span className="block text-blue-600 dark:text-blue-400 mt-1">
                      📄 Sayfa sayfa işlenecek (boyut sınırı yok!)
                    </span>
                  </p>
                )}
                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <p>💡 <strong>Yeni Sistem:</strong> PDF sayfa sayfa işlenir</p>
                  <p>🚀 Avantajlar: Boyut sınırı yok, hızlı yükleme, çok daha iyi performans</p>
                  <p>⚡ Her sayfa ayrı resim olarak yüklenir ve anında görüntülenir</p>
                </div>
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
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  📄 PDF dosyası hazır
                </p>
              </div>
            )}
          </div>

          {/* Contributors Bölümü - YENİ ÖZELLİK */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-base font-medium">
                👥 Katkıda Bulunanlar
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setContributors([...contributors, { name: '', role: 'author' }])}
                disabled={isUploading}
              >
                <Plus className="w-4 h-4 mr-1" />
                Ekle
              </Button>
            </div>
            
            {contributors.length === 0 && (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                <div className="text-2xl mb-2">👥</div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Bu sayıya katkıda bulunanları ekleyin
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setContributors([{ name: '', role: 'author' }])}
                  disabled={isUploading}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  İlk Katkıda Bulunanı Ekle
                </Button>
              </div>
            )}
            
            {contributors.map((contributor, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-3 border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Katkıda Bulunan #{index + 1}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {contributor.role === 'editor' ? 'Editör' :
                       contributor.role === 'author' ? 'Yazar' :
                       contributor.role === 'illustrator' ? 'İllüstratör' :
                       contributor.role === 'designer' ? 'Tasarımcı' :
                       contributor.role === 'translator' ? 'Çevirmen' : contributor.role}
                    </Badge>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setContributors(contributors.filter((_, i) => i !== index))}
                    disabled={isUploading}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">İsim *</Label>
                    <Input
                      value={contributor.name}
                      onChange={(e) => {
                        const updated = [...contributors];
                        updated[index].name = e.target.value;
                        setContributors(updated);
                      }}
                      placeholder="Katkıda bulunanın adı"
                      className="text-sm"
                      disabled={isUploading}
                    />
                  </div>
                  
                  <div>
                    <Label className="text-xs">Rol *</Label>
                    <select
                      value={contributor.role}
                      onChange={(e) => {
                        const updated = [...contributors];
                        updated[index].role = e.target.value as Contributor['role'];
                        setContributors(updated);
                      }}
                      className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800"
                      disabled={isUploading}
                    >
                      <option value="author">Yazar</option>
                      <option value="editor">Editör</option>
                      <option value="illustrator">İllüstratör</option>
                      <option value="designer">Tasarımcı</option>
                      <option value="translator">Çevirmen</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <Label className="text-xs">Kısa Bio (Opsiyonel)</Label>
                  <Textarea
                    value={contributor.bio || ''}
                    onChange={(e) => {
                      const updated = [...contributors];
                      updated[index].bio = e.target.value;
                      setContributors(updated);
                    }}
                    placeholder="Katkıda bulunan hakkında kısa bilgi..."
                    rows={2}
                    className="text-sm"
                    disabled={isUploading}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Magazine Sponsors Bölümü - YENİ ÖZELLİK */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-base font-medium">
                <Building2 className="w-5 h-5" />
                Dergi Sponsorları
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setMagazineSponsors([...magazineSponsors, { 
                  sponsor_name: '', 
                  sponsorship_type: '',
                  logo_url: '',
                  website_url: '',
                  selectedLogoFile: undefined
                }])}
                disabled={isUploading}
              >
                <Plus className="w-4 h-4 mr-1" />
                Sponsor Ekle
              </Button>
            </div>
            
            {magazineSponsors.length === 0 && (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                <div className="text-2xl mb-2">🏢</div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Bu sayıya sponsor ekleyiniz
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setMagazineSponsors([{ 
                    sponsor_name: '', 
                    sponsorship_type: '',
                    logo_url: '',
                    website_url: '',
                    selectedLogoFile: undefined
                  }])}
                  disabled={isUploading}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  İlk Sponsoru Ekle
                </Button>
              </div>
            )}
            
            {magazineSponsors.map((sponsor, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-3 border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Sponsor #{index + 1}
                    </span>
                    {sponsor.sponsor_name && (
                      <Badge variant="outline" className="text-xs">
                        {sponsor.sponsor_name}
                      </Badge>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setMagazineSponsors(magazineSponsors.filter((_, i) => i !== index))}
                    disabled={isUploading}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Sponsor İsmi *</Label>
                    <Input
                      value={sponsor.sponsor_name}
                      onChange={(e) => {
                        const updated = [...magazineSponsors];
                        updated[index].sponsor_name = e.target.value;
                        setMagazineSponsors(updated);
                      }}
                      placeholder="Sponsor şirket ismi..."
                      className="text-sm"
                      disabled={isUploading}
                    />
                  </div>
                  
                  <div>
                    <Label className="text-xs">Sponsorluk Tipi *</Label>
                    <select
                      value={sponsor.sponsorship_type}
                      onChange={(e) => {
                        const updated = [...magazineSponsors];
                        updated[index].sponsorship_type = e.target.value;
                        setMagazineSponsors(updated);
                      }}
                      className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800"
                      disabled={isUploading}
                    >
                      <option value="">Sponsorluk türü seçin...</option>
                      <option value="main_sponsor">Ana Sponsor</option>
                      <option value="sponsor">Sponsor</option>
                      <option value="supporter">Destekçi</option>
                      <option value="media_partner">Medya Partneri</option>
                    </select>
                    {errors[`sponsor_${index}_type`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`sponsor_${index}_type`]}</p>
                    )}
                  </div>
                </div>
                
                {/* Logo Upload - YENİ */}
                <div className="space-y-3">
                  <Label className="text-xs flex items-center gap-2">
                    <Image className="w-3 h-3" />
                    Sponsor Logosu (Opsiyonel)
                  </Label>
                  
                  {/* Logo Dosya Seçme */}
                  {githubConfigured && (
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 space-y-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Upload className="w-3 h-3" />
                        <span className="text-xs font-medium">Bilgisayarımdan Seç</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          const updated = [...magazineSponsors];
                          updated[index].selectedLogoFile = file;
                          setMagazineSponsors(updated);
                        }}
                        className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                        disabled={isUploading}
                      />
                      {sponsor.selectedLogoFile && (
                        <p className="text-xs text-green-600 dark:text-green-400">
                          ✓ {sponsor.selectedLogoFile.name} seçildi
                        </p>
                      )}
                    </div>
                  )}
                  
                  {/* Manuel Logo URL */}
                  <div>
                    <Label className="text-xs text-gray-600 dark:text-gray-400">
                      {githubConfigured ? 'Veya Logo URL Gir' : 'Logo URL'}
                    </Label>
                    <Input
                      value={sponsor.logo_url || ''}
                      onChange={(e) => {
                        const updated = [...magazineSponsors];
                        updated[index].logo_url = e.target.value;
                        setMagazineSponsors(updated);
                      }}
                      placeholder="https://example.com/logo.png"
                      className="text-sm"
                      disabled={isUploading}
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="text-xs">Web Sitesi / Sosyal Medya (Opsiyonel)</Label>
                  <Input
                    value={sponsor.website_url || ''}
                    onChange={(e) => {
                      const updated = [...magazineSponsors];
                      updated[index].website_url = e.target.value;
                      setMagazineSponsors(updated);
                    }}
                    placeholder="https://www.example.com"
                    className="text-sm"
                    disabled={isUploading}
                  />
                </div>
                
                {/* Sponsor Önizleme */}
                {(sponsor.sponsor_name || sponsor.logo_url) && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border">
                    {sponsor.logo_url && (
                      <img 
                        src={sponsor.logo_url} 
                        alt={sponsor.sponsor_name}
                        className="w-12 h-12 object-contain rounded border bg-white"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                    )}
                    <div className="flex-1">
                      <div className="font-medium text-sm text-blue-800 dark:text-blue-200">
                        {sponsor.sponsor_name || 'İsimsiz Sponsor'}
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-300">
                        {sponsor.sponsorship_type || 'Tür belirtilmemiş'} 
                        {sponsor.website_url && ` • ${sponsor.website_url}`}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
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

          {/* Büyük Dosya Uyarısı - YENİ */}
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-2 flex items-center gap-2">
              ⚠️ Büyük PDF Dosyaları (25MB+)
            </h4>
            <div className="text-sm text-orange-700 dark:text-orange-300 space-y-2">
              <p><strong>Problem:</strong> GitHub API limiti 25MB</p>
              <p><strong>Çözüm:</strong> PDF Sıkıştırma</p>
              
              <div className="bg-orange-100 dark:bg-orange-900/50 p-3 rounded border border-orange-200 dark:border-orange-700">
                <p className="font-medium mb-1">🔧 Önerilen Araçlar:</p>
                <div className="space-y-1">
                  <p>• <a href="https://smallpdf.com/compress-pdf" target="_blank" className="text-blue-600 dark:text-blue-400 underline">SmallPDF</a> - En popüler</p>
                  <p>• <a href="https://www.ilovepdf.com/compress_pdf" target="_blank" className="text-blue-600 dark:text-blue-400 underline">ILovePDF</a> - Güçlü sıkıştırma</p>
                  <p>• <a href="https://tools.pdf24.org/compress-pdf" target="_blank" className="text-blue-600 dark:text-blue-400 underline">PDF24</a> - Ücretsiz</p>
                </div>
              </div>
              
              <p className="text-orange-600 dark:text-orange-400 font-medium">
                ✅ 65MB → 15-20MB (Kalite kaybı yok!)
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar ve Status - Upload sırasında göster */}
        {isUploading && (
          <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span className="font-medium text-blue-800 dark:text-blue-200">
                {uploadStatus || 'İşleniyor...'}
              </span>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-sm text-blue-700 dark:text-blue-300">
                <span>İlerleme</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress 
                value={uploadProgress} 
                className="h-2 bg-blue-100 dark:bg-blue-900/50"
              />
            </div>
            
            <div className="text-xs text-blue-600 dark:text-blue-400">
              💡 Lütfen sayfayı kapatmayın, dosyalar yükleniyor...
            </div>
          </div>
        )}

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
