import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Save, 
  X, 
  Link,
  FileText,
  Eye,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  CloudDownload
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { validateDriveUrl, formatDriveUrlForUser, SAMPLE_DRIVE_URLS } from '@/utils/googleDriveHelper';

// Simple toast replacement
const toast = {
  success: (message: string) => alert(`✅ ${message}`),
  error: (message: string) => alert(`❌ ${message}`)
};

interface MagazineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

const MagazineModal: React.FC<MagazineModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [urlValidation, setUrlValidation] = useState<{
    isValidating: boolean;
    isValid: boolean;
    message: string;
  }>({
    isValidating: false,
    isValid: false,
    message: ''
  });

  // Form verileri
  const [formData, setFormData] = useState({
    issue_number: '',
    title: '',
    theme: '',
    description: '',
    cover_image: '',
    pdf_file: '',
    publication_date: '',
    published: true
  });

  // Form resetleme
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          issue_number: initialData.issue_number || '',
          title: initialData.title || '',
          theme: initialData.theme || '',
          description: initialData.description || '',
          cover_image: initialData.cover_image || '',
          pdf_file: initialData.pdf_file || '',
          publication_date: initialData.publication_date || '',
          published: initialData.published ?? true
        });
      } else {
        // Yeni dergi için varsayılan değerler
        const nextIssueNumber = Date.now().toString().slice(-2); // Son 2 rakam
        const currentDate = new Date().toISOString().split('T')[0];
        
        setFormData({
          issue_number: nextIssueNumber,
          title: '',
          theme: '',
          description: '',
          cover_image: '',
          pdf_file: '',
          publication_date: currentDate,
          published: true
        });
      }
      setError('');
      setUrlValidation({ isValidating: false, isValid: false, message: '' });
    }
  }, [isOpen, initialData]);

  // Google Drive URL validasyonu
  const validatePdfUrl = async (url: string) => {
    if (!url.trim()) {
      setUrlValidation({ isValidating: false, isValid: false, message: '' });
      return;
    }

    setUrlValidation({ isValidating: true, isValid: false, message: 'Kontrol ediliyor...' });

    try {
      if (url.includes('drive.google.com')) {
        const result = await validateDriveUrl(url);
        if (result.isValid) {
          setUrlValidation({
            isValidating: false,
            isValid: true,
            message: '✅ Google Drive URL geçerli! Otomatik olarak PDF okuyucuda açılacak.'
          });
          // URL'yi düzenli formata çevir
          setFormData(prev => ({ ...prev, pdf_file: formatDriveUrlForUser(url) }));
        } else {
          setUrlValidation({
            isValidating: false,
            isValid: false,
            message: `❌ ${result.error || 'Google Drive URL geçersiz'}`
          });
        }
      } else {
        // Normal PDF URL'si
        setUrlValidation({
          isValidating: false,
          isValid: true,
          message: '📄 Normal PDF URL olarak kaydedilecek.'
        });
      }
    } catch (error) {
      setUrlValidation({
        isValidating: false,
        isValid: false,
        message: '❌ URL kontrol edilemedi'
      });
    }
  };

  // PDF URL değişikliği
  const handlePdfUrlChange = (url: string) => {
    setFormData(prev => ({ ...prev, pdf_file: url }));
    
    // Debounce validation
    const timeoutId = setTimeout(() => {
      validatePdfUrl(url);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  // Slug oluştur
  const generateSlug = (title: string, issueNumber: string) => {
    const cleanTitle = title
      .toLowerCase()
      .replace(/[^a-z0-9ğüşıöçĞÜŞİÖÇ\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c');
    
    return `sayi-${issueNumber}-${cleanTitle}`.substring(0, 50);
  };

  // Form gönderimi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Dergi başlığı gereklidir');
      return;
    }

    if (!formData.issue_number) {
      setError('Dergi sayı numarası gereklidir');
      return;
    }

    if (!formData.pdf_file.trim()) {
      setError('PDF dosyası URL\'si gereklidir');
      return;
    }

    if (!urlValidation.isValid && formData.pdf_file.trim()) {
      setError('Lütfen geçerli bir PDF URL\'si girin');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const slug = generateSlug(formData.title, formData.issue_number);
      
      const magazineData = {
        ...formData,
        slug,
        issue_number: parseInt(formData.issue_number),
        publication_date: formData.publication_date
      };

      if (initialData) {
        // Güncelleme
        const { error: updateError } = await supabase
          .from('magazine_issues')
          .update(magazineData)
          .eq('id', initialData.id);

        if (updateError) throw updateError;
      } else {
        // Yeni ekleme
        const { error: insertError } = await supabase
          .from('magazine_issues')
          .insert(magazineData);

        if (insertError) throw insertError;
      }

      alert(`✅ Dergi başarıyla ${initialData ? 'güncellendi' : 'eklendi'}!`);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Magazine save error:', error);
      setError(error.message || 'Dergi kaydedilirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  // Örnek URL'yi kullan
  const useSampleUrl = () => {
    const sampleUrl = SAMPLE_DRIVE_URLS.valid[0];
    handlePdfUrlChange(sampleUrl);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="w-6 h-6 text-purple-600" />
            {initialData ? 'Dergi Düzenle' : 'Yeni Dergi Sayısı Ekle'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-red-700 dark:text-red-300">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sol Kolon: Temel Bilgiler */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📝 Temel Bilgiler</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="issue_number">Sayı Numarası *</Label>
                      <Input
                        id="issue_number"
                        type="number"
                        value={formData.issue_number}
                        onChange={(e) => setFormData(prev => ({ ...prev, issue_number: e.target.value }))}
                        placeholder="12"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="publication_date">Yayın Tarihi *</Label>
                      <Input
                        id="publication_date"
                        type="date"
                        value={formData.publication_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, publication_date: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="title">Dergi Başlığı *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Travma ve İyileşme"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="theme">Tema</Label>
                    <Input
                      id="theme"
                      value={formData.theme}
                      onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value }))}
                      placeholder="Post-travmatik Stres Bozukluğu"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Açıklama</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Bu sayıda travma ve iyileşme süreçleri..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="cover_image">Kapak Görseli URL</Label>
                    <Input
                      id="cover_image"
                      value={formData.cover_image}
                      onChange={(e) => setFormData(prev => ({ ...prev, cover_image: e.target.value }))}
                      placeholder="https://example.com/cover.jpg"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sağ Kolon: PDF ve Ayarlar */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CloudDownload className="w-5 h-5 text-blue-500" />
                    📄 PDF Dosyası
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="pdf_file" className="flex items-center gap-2">
                      PDF URL * 
                      <Badge variant="outline" className="text-xs">Google Drive Destekli</Badge>
                    </Label>
                    <Input
                      id="pdf_file"
                      value={formData.pdf_file}
                      onChange={(e) => handlePdfUrlChange(e.target.value)}
                      placeholder="https://drive.google.com/file/d/xxx/view"
                      required
                    />
                    
                    {/* URL Validation Status */}
                    {urlValidation.message && (
                      <div className={`mt-2 p-3 rounded-lg text-sm flex items-center gap-2 ${
                        urlValidation.isValidating ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' :
                        urlValidation.isValid ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' :
                        'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                      }`}>
                        {urlValidation.isValidating && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
                        {!urlValidation.isValidating && urlValidation.isValid && <CheckCircle className="w-4 h-4" />}
                        {!urlValidation.isValidating && !urlValidation.isValid && urlValidation.message && <AlertCircle className="w-4 h-4" />}
                        <span>{urlValidation.message}</span>
                      </div>
                    )}

                    <div className="flex gap-2 mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={useSampleUrl}
                        className="text-xs"
                      >
                        <Link className="w-3 h-3 mr-1" />
                        Örnek URL Kullan
                      </Button>
                      
                      {formData.pdf_file && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          asChild
                          className="text-xs"
                        >
                          <a href={formData.pdf_file} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Test Et
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Google Drive Yardım */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2">
                      <CloudDownload className="w-4 h-4" />
                      Google Drive Kullanımı
                    </h4>
                    <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                      <li>• PDF'yi Drive'a yükleyin</li>
                      <li>• "Paylaş" > "Bağlantı alan herkes görüntüleyebilir"</li>
                      <li>• URL'yi kopyalayıp buraya yapıştırın</li>
                      <li>• Sistem otomatik olarak uygun formata çevirecek</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">⚙️ Yayın Ayarları</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="published"
                      checked={formData.published}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, published: checked }))}
                    />
                    <Label htmlFor="published">Dergisi yayınla</Label>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Yayınlanan dergiler sitede görünür olacak
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Alt Butonlar */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              <X className="w-4 h-4 mr-2" />
              İptal
            </Button>

            <Button
              type="submit"
              disabled={loading || (formData.pdf_file.trim() && !urlValidation.isValid)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {loading ? 'Kaydediliyor...' : (initialData ? 'Güncelle' : 'Kaydet')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MagazineModal;
