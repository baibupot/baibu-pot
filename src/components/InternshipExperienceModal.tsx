import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface InternshipExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InternshipExperienceModal: React.FC<InternshipExperienceModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    student_name: '',
    internship_place: '',
    internship_year: new Date().getFullYear(),
    experience_text: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Çoklu gönderimi engelle
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('internship_experiences').insert({ ...formData, is_approved: false });
      if (error) throw error;
      toast.success("Deneyiminiz başarıyla gönderildi! Onaylandıktan sonra yayınlanacaktır.");
      onClose(); // Modalı kapat
      setFormData({ student_name: '', internship_place: '', internship_year: new Date().getFullYear(), experience_text: '' }); // Formu sıfırla
    } catch (error) {
      toast.error("Deneyim gönderilirken bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Staj Deneyimini Paylaş</DialogTitle>
          <DialogDescription>
            Staj deneyimlerini paylaşarak senden sonraki öğrencilere yol göster. Onaylanan deneyimler bu sayfada yayınlanacaktır.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="student_name">Adın Soyadın</Label>
                    <Input id="student_name" value={formData.student_name} onChange={e => handleChange('student_name', e.target.value)} required />
                </div>
                 <div>
                    <Label htmlFor="internship_place">Staj Yaptığın Kurum</Label>
                    <Input id="internship_place" value={formData.internship_place} onChange={e => handleChange('internship_place', e.target.value)} required />
                </div>
            </div>
            <div>
                <Label htmlFor="internship_year">Staj Yılı</Label>
                <Input id="internship_year" type="number" value={formData.internship_year} onChange={e => handleChange('internship_year', parseInt(e.target.value))} required />
            </div>
            <div>
                <Label htmlFor="experience_text">Deneyimin</Label>
                <Textarea id="experience_text" placeholder="Staj deneyimini ve tavsiyelerini anlat..." value={formData.experience_text} onChange={e => handleChange('experience_text', e.target.value)} required rows={5} />
            </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>İptal</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Gönderiliyor...' : 'Deneyimimi Gönder'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InternshipExperienceModal; 