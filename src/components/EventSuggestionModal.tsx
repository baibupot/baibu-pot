import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { EVENT_TYPES } from '@/constants/eventConstants';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';

interface EventSuggestionData {
  title: string;
  description: string;
  suggested_date: string;
  suggested_location: string;
  event_type: string;
  estimated_participants: number | null;
  estimated_budget: number | null;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  additional_notes: string;
}

interface EventSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EventSuggestionData) => Promise<void>;
}

const EventSuggestionModal = ({ isOpen, onClose, onSubmit }: EventSuggestionModalProps) => {
  const [formData, setFormData] = useState<EventSuggestionData>({
    title: '',
    description: '',
    suggested_date: '',
    suggested_location: '',
    event_type: 'seminer',
    estimated_participants: null,
    estimated_budget: null,
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    additional_notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return; // Çoklu gönderimi engelle
    
    if (!formData.title.trim() || !formData.description.trim() || !formData.contact_name.trim() || !formData.contact_email.trim()) {
      toast.error('❌ Lütfen zorunlu alanları doldurun');
      return;
    }

    if (formData.contact_email && !formData.contact_email.includes('@')) {
      toast.error('❌ Lütfen geçerli bir e-posta adresi girin');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Boş string'leri temizle
      const cleanedFormData = {
        ...formData,
        suggested_date: formData.suggested_date || null,
        suggested_location: formData.suggested_location || null,
        estimated_participants: formData.estimated_participants || null,
        estimated_budget: formData.estimated_budget || null,
        contact_phone: formData.contact_phone || null,
        additional_notes: formData.additional_notes || null
      };
      
      await onSubmit(cleanedFormData);
      setIsSubmitted(true);
      toast.success('🎉 Etkinlik öneriniz başarıyla gönderildi!');
      
      // 4 saniye sonra modal'ı kapat ve formu resetle
      setTimeout(() => {
        onClose();
        setIsSubmitted(false);
        setFormData({
          title: '',
          description: '',
          suggested_date: '',
          suggested_location: '',
          event_type: 'seminer',
          estimated_participants: null,
          estimated_budget: null,
          contact_name: '',
          contact_email: '',
          contact_phone: '',
          additional_notes: ''
        });
      }, 4000);
    } catch (error) {
      console.error('Error submitting suggestion:', error);
      toast.error('❌ Öneriniz gönderilirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEventTypeColor = (type: string) => {
    const colors = {
      'atolye': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
      'konferans': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'sosyal': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      'egitim': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'seminer': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
    };
    return colors[type as keyof typeof colors] || colors.seminer;
  };

  const today = new Date().toISOString().split('T')[0];

  // 🎉 Başarı Ekranı
  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md mx-auto">
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-green-800 dark:text-green-300">
                🎉 Öneriniz Alındı!
              </h3>
              <div className="space-y-3">
                <p className="text-green-600 dark:text-green-400 text-lg">
                  <strong>"{formData.title}"</strong> etkinlik öneriniz başarıyla gönderildi.
                </p>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-700">
                  <div className="text-sm text-green-700 dark:text-green-300 space-y-2">
                    <p className="flex items-center gap-2">
                      <span>📝</span>
                      <span>Öneriniz admin ekibimiz tarafından değerlendirilecek</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span>📧</span>
                      <span>Sonuç hakkında <strong>{formData.contact_email}</strong> adresine bilgi verilecek</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span>⏱️</span>
                      <span>Değerlendirme süreci genellikle 2-3 gün sürer</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Otomatik Kapanma Göstergesi */}
            <div className="mt-6 pt-4 border-t border-green-200 dark:border-green-700">
              <p className="text-xs text-green-600 dark:text-green-400 flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Bu pencere 4 saniye içinde otomatik olarak kapanacak...
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[98vw] sm:max-w-3xl max-h-[98vh] overflow-y-auto p-0">
        <DialogHeader className="text-center p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-b">
          <div className="space-y-2 sm:space-y-3">
            <div className="text-4xl sm:text-5xl">💡</div>
            <DialogTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Etkinlik Önerisi Gönder
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-md mx-auto leading-relaxed">
              Aklınızdaki harika etkinlik fikrini bizimle paylaşın! 🚀
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <span className="text-2xl">🎯</span>
              <h3 className="text-lg font-semibold">Etkinlik Bilgileri</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title" className="text-base font-medium flex items-center gap-2">
                📝 Etkinlik Başlığı *
                <Badge variant="destructive" className="text-xs">Zorunlu</Badge>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Örnek: Stres Yönetimi Atölyesi"
                className="h-12 text-base border-2 rounded-xl"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-base font-medium flex items-center gap-2">
                📄 Açıklama *
                <Badge variant="destructive" className="text-xs">Zorunlu</Badge>
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Etkinlik içeriği, hedef kitle..."
                rows={4}
                className="text-base border-2 rounded-xl resize-none"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-base font-medium">🎪 Etkinlik Türü</Label>
              <Select value={formData.event_type} onValueChange={(value) => setFormData(prev => ({ ...prev, event_type: value }))}>
                <SelectTrigger className="h-12 text-base border-2 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EVENT_TYPES).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      <Badge className={getEventTypeColor(key)}>{value}</Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <span className="text-2xl">📅</span>
              <h3 className="text-lg font-semibold">Tarih ve Yer</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="suggested_date" className="text-base font-medium">📅 Önerilen Tarih</Label>
                <Input
                  id="suggested_date"
                  type="date"
                  value={formData.suggested_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, suggested_date: e.target.value }))}
                  min={today}
                  className="h-12 text-base border-2 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="suggested_location" className="text-base font-medium">📍 Önerilen Mekan</Label>
                <Input
                  id="suggested_location"
                  value={formData.suggested_location}
                  onChange={(e) => setFormData(prev => ({ ...prev, suggested_location: e.target.value }))}
                  placeholder="Amfi tiyatro, Kütüphane..."
                  className="h-12 text-base border-2 rounded-xl"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <span className="text-2xl">📊</span>
              <h3 className="text-lg font-semibold">Tahmini Bilgiler</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimated_participants" className="text-base font-medium">👥 Tahmini Katılımcı</Label>
                <Input
                  id="estimated_participants"
                  type="number"
                  value={formData.estimated_participants || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimated_participants: e.target.value ? Number(e.target.value) : null }))}
                  placeholder="25"
                  min="1"
                  className="h-12 text-base border-2 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimated_budget" className="text-base font-medium">💰 Tahmini Bütçe (TL)</Label>
                <Input
                  id="estimated_budget"
                  type="number"
                  value={formData.estimated_budget || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimated_budget: e.target.value ? Number(e.target.value) : null }))}
                  placeholder="500"
                  min="0"
                  className="h-12 text-base border-2 rounded-xl"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <span className="text-2xl">📞</span>
              <h3 className="text-lg font-semibold">İletişim</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_name" className="text-base font-medium flex items-center gap-2">
                  👤 Ad Soyad *
                  <Badge variant="destructive" className="text-xs">Zorunlu</Badge>
                </Label>
                <Input
                  id="contact_name"
                  value={formData.contact_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
                  placeholder="Adınız ve soyadınız"
                  className="h-12 text-base border-2 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_phone" className="text-base font-medium">📱 Telefon</Label>
                <Input
                  id="contact_phone"
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                  placeholder="05XX XXX XX XX"
                  className="h-12 text-base border-2 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_email" className="text-base font-medium flex items-center gap-2">
                📧 E-posta *
                <Badge variant="destructive" className="text-xs">Zorunlu</Badge>
              </Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                placeholder="ornek@email.com"
                className="h-12 text-base border-2 rounded-xl"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <span className="text-2xl">📋</span>
              <h3 className="text-lg font-semibold">Ek Notlar</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additional_notes" className="text-base font-medium">💭 Eklemek İstedikleriniz</Label>
              <Textarea
                id="additional_notes"
                value={formData.additional_notes}
                onChange={(e) => setFormData(prev => ({ ...prev, additional_notes: e.target.value }))}
                placeholder="Özel talepleriniz, önerileriniz..."
                rows={3}
                className="text-base border-2 rounded-xl resize-none"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="h-12 px-6 text-base border-2 rounded-xl order-2 sm:order-1"
            >
              ❌ İptal
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="h-12 px-8 text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg rounded-xl order-1 sm:order-2 flex-1"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Gönderiliyor...
                </>
              ) : (
                <>🚀 Önerimi Gönder</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventSuggestionModal;
