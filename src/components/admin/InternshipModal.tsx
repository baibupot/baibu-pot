import React, { useState, useEffect } from 'react';
import { AdminModal } from '@/components/admin/shared/AdminModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useCreateInternship, useUpdateInternship } from '@/hooks/useSupabaseData';
import { toast } from 'sonner';
import { Loader2, Briefcase } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type InternshipInsert = Database['public']['Tables']['internships']['Insert'];
type InternshipRow = Database['public']['Tables']['internships']['Row'];

interface InternshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: InternshipRow | null;
}

const InternshipModal = ({ isOpen, onClose, initialData }: InternshipModalProps) => {
  const [formData, setFormData] = useState<Partial<InternshipInsert>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const createInternship = useCreateInternship();
  const updateInternship = useUpdateInternship();

  const isEditMode = !!initialData;

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && initialData) {
        setFormData(initialData);
      } else {
        setFormData({
            company_name: '',
            position: '',
            location: '',
            description: '',
            active: true,
            internship_type: 'gönüllü'
        });
      }
    }
  }, [isOpen, initialData, isEditMode]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsProcessing(true);
    const toastId = toast.loading(isEditMode ? 'İlan güncelleniyor...' : 'İlan oluşturuluyor...');

    try {
      if (isEditMode && initialData?.id) {
        await updateInternship.mutateAsync({ id: initialData.id, ...formData });
        toast.success('Staj ilanı başarıyla güncellendi.', { id: toastId });
      } else {
        await createInternship.mutateAsync(formData as InternshipInsert);
        toast.success('Staj ilanı başarıyla oluşturuldu.', { id: toastId });
      }
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu.', { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChange = (field: keyof InternshipInsert, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={handleSubmit}
      title={isEditMode ? 'Staj İlanı Düzenle' : 'Yeni Staj İlanı Ekle'}
      description="Öğrenciler için yeni bir staj fırsatı oluşturun veya mevcut bir ilanı düzenleyin."
      icon={<Briefcase className="w-6 h-6 text-white" />}
      isSaving={isProcessing}
      saveLabel={isEditMode ? 'Değişiklikleri Kaydet' : 'İlanı Oluştur'}
      size="2xl"
      compactHeader={true}
    >
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company_name">Şirket/Kurum Adı *</Label>
              <Input id="company_name" value={formData.company_name || ''} onChange={e => handleChange('company_name', e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="position">Pozisyon *</Label>
              <Input id="position" value={formData.position || ''} onChange={e => handleChange('position', e.target.value)} required />
            </div>
          </div>

          <div>
            <Label htmlFor="location">Konum (Şehir) *</Label>
            <Input id="location" value={formData.location || ''} onChange={e => handleChange('location', e.target.value)} required />
          </div>

          <div>
            <Label htmlFor="description">Açıklama *</Label>
            <Textarea id="description" value={formData.description || ''} onChange={e => handleChange('description', e.target.value)} required rows={4} />
          </div>

          <div>
            <Label htmlFor="requirements">Gereksinimler</Label>
            <Textarea id="requirements" value={formData.requirements || ''} onChange={e => handleChange('requirements', e.target.value)} rows={3} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="internship_type">Staj Türü</Label>
              <Select value={formData.internship_type || 'gönüllü'} onValueChange={value => handleChange('internship_type', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="gönüllü">Gönüllü</SelectItem>
                  <SelectItem value="zorunlu">Zorunlu</SelectItem>
                  <SelectItem value="yaz">Yaz Dönemi</SelectItem>
                  <SelectItem value="donem">Dönem İçi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="application_deadline">Son Başvuru Tarihi</Label>
              <Input id="application_deadline" type="date" value={formData.application_deadline || ''} onChange={e => handleChange('application_deadline', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label htmlFor="duration_months">Süre (Ay olarak)</Label>
                <Input id="duration_months" type="number" value={formData.duration_months || ''} onChange={e => handleChange('duration_months', parseInt(e.target.value, 10))} />
            </div>
            <div>
              <Label htmlFor="application_link">Başvuru Linki</Label>
              <Input id="application_link" value={formData.application_link || ''} onChange={e => handleChange('application_link', e.target.value)} placeholder="https://..." />
            </div>
          </div>

          <div>
            <Label htmlFor="contact_info">İletişim Bilgisi</Label>
            <Input id="contact_info" value={formData.contact_info || ''} onChange={e => handleChange('contact_info', e.target.value)} placeholder="email@example.com veya telefon..." />
          </div>

          <div>
            <Label htmlFor="salary_info">Maaş Bilgisi</Label>
            <Input id="salary_info" value={formData.salary_info || ''} onChange={e => handleChange('salary_info', e.target.value)} placeholder="Opsiyonel (örn: Asgari ücret, Karşılıksız vb.)" />
          </div>

          <div className="flex items-center space-x-2 pt-4">
            <Switch id="active" checked={formData.active} onCheckedChange={value => handleChange('active', value)} />
            <Label htmlFor="active">İlan Aktif mi?</Label>
          </div>
        </form>
    </AdminModal>
  );
};

export default InternshipModal;
