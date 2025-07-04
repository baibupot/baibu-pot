import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { Database } from '@/integrations/supabase/types';
import { uploadFileObjectToGitHub } from '@/utils/githubStorageHelper';
import { getGitHubStorageConfig } from '@/integrations/github/config';
import { toast } from 'sonner';
import {
  Upload, Loader2, Building, LinkIcon, FileText, Palette, Hash, ToggleRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Tables = Database['public']['Tables'];
type SponsorData = Tables['sponsors']['Insert'];
type SponsorRow = Tables['sponsors']['Row'];

interface SponsorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sponsorData: SponsorData, id?: string) => void;
  initialData?: SponsorRow | null;
}

const SponsorModal = ({ isOpen, onClose, onSave, initialData }: SponsorModalProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState<SponsorData>({
    name: '',
    logo: '',
    website: '',
    description: '',
    sponsor_type: 'destekci',
    sort_order: 0,
    active: true,
  });
  
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        logo: initialData.logo || '',
        website: initialData.website || '',
        description: initialData.description || '',
        sponsor_type: initialData.sponsor_type || 'destekci',
        sort_order: initialData.sort_order || 0,
        active: initialData.active ?? true,
      });
    } else {
      // Yeni ekleme modu için formu sıfırla
      setFormData({
        name: '',
        logo: '',
        website: '',
        description: '',
        sponsor_type: 'destekci',
        sort_order: 0,
        active: true,
      });
    }
  }, [initialData, isOpen]);

  const handleLogoUpload = async (file: File) => {
    const config = getGitHubStorageConfig();
    if (!config) {
      toast.error('GitHub Storage yapılandırılmamış.');
      return;
    }

    setIsUploading(true);
    try {
      const safeName = formData.name.replace(/[^a-zA-Z0-9]/g, '-') || 'sponsor';
      const fileName = `logo-${safeName.toLowerCase()}-${Date.now()}.${file.name.split('.').pop()}`;
      const filePath = `sponsors/${fileName}`;
      
      const result = await uploadFileObjectToGitHub(config, file, filePath, `Upload sponsor logo for ${formData.name}`);
      
      if (result.success && result.rawUrl) {
        setFormData(prev => ({ ...prev, logo: result.rawUrl }));
        toast.success('Logo başarıyla yüklendi.');
      } else {
        throw new Error(result.error || 'Yükleme başarısız oldu.');
      }
    } catch (error: any) {
      toast.error(`Logo yüklenemedi: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData, initialData?.id);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 flex-shrink-0 border-b">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Building className="text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">
                {initialData ? 'Sponsor Düzenle' : 'Yeni Sponsor Ekle'}
              </DialogTitle>
              <DialogDescription>
                Sponsor bilgilerini girin veya mevcut bilgileri güncelleyin.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Temel Bilgiler */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Temel Bilgiler
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="name">Sponsor Adı *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="Örn: ABC Teknoloji"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="logo">Logo</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="logo"
                    value={formData.logo || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, logo: e.target.value }))}
                    placeholder="https://... veya dosya yükleyin"
                    className="flex-grow"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => document.getElementById('logo-upload')?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  </Button>
                  <input
                    type="file"
                    id="logo-upload"
                    className="hidden"
                    accept="image/*,.svg"
                    onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
                  />
                </div>
                {formData.logo && (
                  <div className="mt-2 p-2 border rounded-md bg-muted/40 flex justify-center items-center">
                    <img src={formData.logo} alt="Sponsor Logo Önizleme" className="max-h-24 object-contain" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="website"
                    value={formData.website || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://www.example.com"
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            {/* Ek Detaylar */}
            <div className="space-y-4 p-4 border rounded-lg">
               <h3 className="text-lg font-semibold flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Ek Detaylar
              </h3>

              <div className="space-y-2">
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  placeholder="Sponsor hakkında kısa bir açıklama..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sponsor_type">Sponsor Türü</Label>
                  <Select value={formData.sponsor_type} onValueChange={(value) => setFormData(prev => ({ ...prev, sponsor_type: value as any }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ana">Ana Sponsor</SelectItem>
                      <SelectItem value="destekci">Destekçi</SelectItem>
                      <SelectItem value="medya">Medya Sponsoru</SelectItem>
                      <SelectItem value="akademik">Akademik Sponsor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sort_order">Sıralama</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="sort_order"
                      type="number"
                      value={formData.sort_order || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
                />
                <Label htmlFor="active" className="flex items-center gap-2 cursor-pointer">
                  <ToggleRight className="w-5 h-5" />
                  <span>Sponsor Aktif mi?</span>
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-shrink-0 flex justify-end space-x-2 p-4 bg-muted/50 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              İptal
            </Button>
            <Button type="submit" disabled={isUploading || !formData.name}>
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Kaydediliyor...
                </>
              ) : (initialData ? 'Değişiklikleri Kaydet' : 'Sponsorü Ekle')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SponsorModal;
