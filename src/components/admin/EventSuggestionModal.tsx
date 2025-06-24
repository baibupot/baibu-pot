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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      await onSubmit(formData);
      toast.success('🎉 Etkinlik öneriniz başarıyla gönderildi! Yakında değerlendirilecek.');
      onClose();
      // Form'u sıfırla
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
    } catch (error) {
      console.error('Error submitting suggestion:', error);
      toast.error('❌ Öneriniz gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
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

  const today = new Date().toISOString().split('T')[0]; // Bugünden önceki tarihleri engelle

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[98vw] sm:max-w-3xl max-h-[98vh] overflow-y-auto p-0">
        {/* Header - Mobile Optimized */}
        <DialogHeader className="text-center p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-b">
          <div className="space-y-2 sm:space-y-3">
            <div className="text-4xl sm:text-5xl">💡</div>
            <DialogTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Etkinlik Önerisi Gönder
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-md mx-auto leading-relaxed">
              Aklınızdaki harika etkinlik fikrini bizimle paylaşın! 🚀<br />
              <span className="font-medium text-blue-600 dark:text-blue-400">Birlikte gerçekleştirelim</span>
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
          {/* ETKİNLİK BİLGİLERİ */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-2xl">🎯</span>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Etkinlik Bilgileri</h3>
            </div>

            {/* Etkinlik Başlığı */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base font-medium flex items-center gap-2">
                📝 Etkinlik Başlığı *
                <Badge variant="destructive" className="text-xs">Zorunlu</Badge>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Örnek: Stres Yönetimi ve Mindfulness Atölyesi"
                className="h-12 text-base border-2 rounded-xl focus:ring-2 focus:ring-blue-500"
                required
              />
              <div className="text-xs text-gray-500 dark:text-gray-400">
                💡 Çekici ve net bir başlık seçin
              </div>
            </div>

            {/* Etkinlik Açıklaması */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-base font-medium flex items-center gap-2">
                📄 Etkinlik Açıklaması *
                <Badge variant="destructive" className="text-xs">Zorunlu</Badge>
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Etkinliğin içeriği, hedef kitlesi, ne öğrenileceği gibi detayları açıklayın..."
                rows={4}
                className="text-base border-2 rounded-xl focus:ring-2 focus:ring-blue-500 resize-none"
                required
              />
              <div className="text-xs text-gray-500 dark:text-gray-400">
                💡 Ne öğretileceğini, nasıl işleneceğini ve kimler için olduğunu belirtin
              </div>
            </div>

            {/* Etkinlik Türü */}
            <div className="space-y-2">
              <Label className="text-base font-medium flex items-center gap-2">
                🎪 Etkinlik Türü
              </Label>
              <Select value={formData.event_type} onValueChange={(value) => setFormData(prev => ({ ...prev, event_type: value }))}>
                <SelectTrigger className="h-12 text-base border-2 rounded-xl">
                  <SelectValue placeholder="Etkinlik türünü seçin..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EVENT_TYPES).map(([key, value]) => (
                    <SelectItem key={key} value={key} className="p-3">
                      <div className="flex items-center gap-3">
                        <Badge className={getEventTypeColor(key)}>
                          {value}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.event_type && (
                <div className={`inline-flex px-3 py-1 rounded-lg text-sm font-medium ${getEventTypeColor(formData.event_type)}`}>
                  ✨ Seçili: {EVENT_TYPES[formData.event_type as keyof typeof EVENT_TYPES]}
                </div>
              )}
            </div>
          </div>

          {/* TARİH VE YER BİLGİLERİ */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-2xl">📅</span>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tarih ve Yer</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Önerilen Tarih */}
              <div className="space-y-2">
                <Label htmlFor="suggested_date" className="text-base font-medium flex items-center gap-2">
                  📅 Önerilen Tarih
                </Label>
                <Input
                  id="suggested_date"
                  type="date"
                  value={formData.suggested_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, suggested_date: e.target.value }))}
                  min={today}
                  className="h-12 text-base border-2 rounded-xl"
                />
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  📌 Yaklaşık bir tarih önerebilirsiniz
                </div>
              </div>

              {/* Önerilen Mekan */}
              <div className="space-y-2">
                <Label htmlFor="suggested_location" className="text-base font-medium flex items-center gap-2">
                  📍 Önerilen Mekan
                </Label>
                <Input
                  id="suggested_location"
                  value={formData.suggested_location}
                  onChange={(e) => setFormData(prev => ({ ...prev, suggested_location: e.target.value }))}
                  placeholder="Örnek: Amfi tiyatro, Kütüphane salonu..."
                  className="h-12 text-base border-2 rounded-xl"
                />
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  🏛️ Hangi mekanın uygun olacağını belirtin
                </div>
              </div>
            </div>
          </div>

          {/* TAHMİNİ BİLGİLER */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-2xl">📊</span>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tahmini Bilgiler</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tahmini Katılımcı */}
              <div className="space-y-2">
                <Label htmlFor="estimated_participants" className="text-base font-medium flex items-center gap-2">
                  👥 Tahmini Katılımcı Sayısı
                </Label>
                <Input
                  id="estimated_participants"
                  type="number"
                  value={formData.estimated_participants || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimated_participants: e.target.value ? Number(e.target.value) : null }))}
                  placeholder="Örnek: 25"
                  min="1"
                  max="500"
                  className="h-12 text-base border-2 rounded-xl"
                />
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  🎯 Kaç kişinin katılabileceğini tahmin edin
                </div>
              </div>

              {/* Tahmini Bütçe */}
              <div className="space-y-2">
                <Label htmlFor="estimated_budget" className="text-base font-medium flex items-center gap-2">
                  💰 Tahmini Bütçe (TL)
                </Label>
                <Input
                  id="estimated_budget"
                  type="number"
                  value={formData.estimated_budget || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimated_budget: e.target.value ? Number(e.target.value) : null }))}
                  placeholder="Örnek: 500"
                  min="0"
                  step="50"
                  className="h-12 text-base border-2 rounded-xl"
                />
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  💸 Malzeme, eğitmen ücreti gibi masraflar
                </div>
              </div>
            </div>
          </div>

          {/* İLETİŞİM BİLGİLERİ */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-2xl">📞</span>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">İletişim Bilgileri</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* İletişim Adı */}
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

              {/* Telefon */}
              <div className="space-y-2">
                <Label htmlFor="contact_phone" className="text-base font-medium flex items-center gap-2">
                  📱 Telefon
                </Label>
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

            {/* E-posta */}
            <div className="space-y-2">
              <Label htmlFor="contact_email" className="text-base font-medium flex items-center gap-2">
                📧 E-posta Adresi *
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
              <div className="text-xs text-gray-500 dark:text-gray-400">
                📩 Size geri dönüş yapmak için kullanacağız
              </div>
            </div>
          </div>

          {/* EK NOTLAR */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-2xl">📋</span>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ek Notlar</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additional_notes" className="text-base font-medium flex items-center gap-2">
                💭 Eklemek İstedikleriniz
              </Label>
              <Textarea
                id="additional_notes"
                value={formData.additional_notes}
                onChange={(e) => setFormData(prev => ({ ...prev, additional_notes: e.target.value }))}
                placeholder="Özel talepleriniz, önerileriniz veya dikkat edilmesi gereken hususlar..."
                rows={3}
                className="text-base border-2 rounded-xl resize-none"
              />
              <div className="text-xs text-gray-500 dark:text-gray-400">
                💡 Vurgulamak istediğiniz özel konular varsa buraya yazabilirsiniz
              </div>
            </div>
          </div>

          {/* BUTONLAR */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="h-12 px-6 text-base font-medium border-2 rounded-xl order-2 sm:order-1"
            >
              ❌ İptal
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="h-12 px-8 text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 rounded-xl order-1 sm:order-2 flex-1"
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