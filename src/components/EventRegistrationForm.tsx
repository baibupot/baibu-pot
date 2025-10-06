import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useFormFields, useCreateFormResponse, useEventBySlug, useFormResponses } from '@/hooks/useSupabaseData';
import { toast } from 'sonner';
import { Calendar, UserPlus, CheckCircle2, AlertCircle, Users, Clock, XCircle } from 'lucide-react';

interface FormData {
  [key: string]: string | string[] | File | null;
}

// 🔒 Güvenli dosya işleme utility fonksiyonu
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

interface EventRegistrationFormProps {
  eventId: string; // Bu aslında slug
  eventTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const EventRegistrationForm = ({ 
  eventId, // Bu aslında slug
  eventTitle, 
  isOpen, 
  onClose, 
  onSuccess 
}: EventRegistrationFormProps) => {
  const [formData, setFormData] = useState<FormData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { data: formFields = [] } = useFormFields(eventId, 'event_registration');
  const { data: eventData } = useEventBySlug(eventId);
  const { data: formResponses = [] } = useFormResponses(eventId, 'event_registration');
  const createFormResponse = useCreateFormResponse();

  // 🎯 Kayıt kontrol mantığı
  const registrationStatus = useMemo(() => {
    if (!eventData) return { canRegister: false, reason: 'Etkinlik bilgileri yükleniyor...' };

    // 1. Kayıt gerekli mi?
    if (!eventData.registration_required) {
      return { canRegister: false, reason: 'Bu etkinlik için kayıt gerekli değil' };
    }

    // 2. Manuel olarak kapatılmış mı?
    if (eventData.registration_enabled === false) {
      return { 
        canRegister: false, 
        reason: eventData.registration_closed_reason || 'Kayıtlar manuel olarak kapatıldı' 
      };
    }

    // 3. Etkinlik durumu kontrolü
    const now = new Date();
    const eventDate = new Date(eventData.event_date);
    const eventEndDate = eventData.end_date ? new Date(eventData.end_date) : null;

    // Etkinlik geçmiş mi?
    if (eventEndDate && eventEndDate < now) {
      return { canRegister: false, reason: 'Etkinlik sona ermiş' };
    } else if (!eventEndDate && eventDate < now) {
      return { canRegister: false, reason: 'Etkinlik sona ermiş' };
    }

    // Etkinlik durumu kontrolü
    if (eventData.status === 'cancelled') {
      return { canRegister: false, reason: 'Etkinlik iptal edilmiş' };
    }
    if (eventData.status === 'completed') {
      return { canRegister: false, reason: 'Etkinlik tamamlanmış' };
    }

    // 4. Kota kontrolü
    if (eventData.max_participants) {
      const currentCount = formResponses.length;
      if (currentCount >= eventData.max_participants) {
        return { 
          canRegister: false, 
          reason: `Kontenjan dolmuş (${currentCount}/${eventData.max_participants})` 
        };
      }
    }

    // ✅ Kayıt açık
    return { 
      canRegister: true, 
      reason: '',
      currentCount: formResponses.length,
      maxParticipants: eventData.max_participants
    };
  }, [eventData, formResponses]);

  const handleInputChange = (fieldName: string, value: string | string[] | File | null) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleFileChange = async (fieldName: string, file: File | null) => {
    if (file) {
      // 🎯 Dosya boyutu kontrolü (5MB limit - Base64 sonrası ~6.6MB olur)
      const maxSize = 5 * 1024 * 1024; // 5MB
              if (file.size > maxSize) {
          toast.error(`❌ ${fieldName} dosyası 5MB'dan küçük olmalıdır`);
          return;
        }

      try {
        // Dosyayı base64'e çevir
        const base64 = await fileToBase64(file);
        setFormData(prev => ({
          ...prev,
          [fieldName]: file.name, // Dosya adı (görüntüleme için)
          [`${fieldName}_file`]: base64 // Base64 içerik (güvenli saklama için)
        }));
        toast.success(`✅ ${file.name} başarıyla yüklendi`);
      } catch (error) {
        toast.error(`❌ ${file.name} yüklenirken hata oluştu`);
        console.error('File conversion error:', error);
      }
    } else {
    setFormData(prev => ({
      ...prev,
        [fieldName]: null,
        [`${fieldName}_file`]: null
    }));
    }
  };

  const handleMultiSelectChange = (fieldName: string, value: string, checked: boolean) => {
    setFormData(prev => {
      const currentValues = Array.isArray(prev[fieldName]) ? prev[fieldName] as string[] : [];
      if (checked) {
        return {
          ...prev,
          [fieldName]: [...currentValues, value]
        };
      } else {
        return {
          ...prev,
          [fieldName]: currentValues.filter(v => v !== value)
        };
      }
    });
  };

  const validateForm = () => {
    const requiredFields = formFields.filter(field => field.required);
    const errors = [];

    for (const field of requiredFields) {
      const value = formData[field.field_name];
      if (!value || (typeof value === 'string' && !value.trim()) || 
          (Array.isArray(value) && value.length === 0)) {
        errors.push(field.field_label);
      }
    }

    // Advanced validation for specific field types
    for (const [fieldName, value] of Object.entries(formData)) {
      const field = formFields.find(f => f.field_name === fieldName);
      if (!field || !value) continue;

      // Email validation
      if (field.field_type === 'email' && typeof value === 'string' && value.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors.push(`${field.field_label} geçerli bir e-posta adresi olmalıdır`);
        }
      }

      // Phone validation (Turkish format)
      if (field.field_type === 'tel' && typeof value === 'string' && value.trim()) {
        const phoneRegex = /^(\+90|0)?[5-9]\d{9}$/;
        if (!phoneRegex.test(value.replace(/\s/g, ''))) {
          errors.push(`${field.field_label} geçerli bir telefon numarası olmalıdır`);
        }
      }

      // Number validation
      if (field.field_type === 'number' && typeof value === 'string' && value.trim()) {
        if (isNaN(Number(value))) {
          errors.push(`${field.field_label} geçerli bir sayı olmalıdır`);
        }
      }

      // File validation - kontrol base64 field'ından yapılır
      if (field.field_type === 'file' && field.required) {
        const base64Value = formData[`${fieldName}_file`];
        if (!base64Value || typeof base64Value !== 'string') {
          errors.push(`${field.field_label} dosyası yüklenmelidir`);
        }
      }
    }

    if (errors.length > 0) {
      // Sadece ilk 3 hatayı göster
      const errorMessages = errors.slice(0, 3).map(err => `• ${err}`).join('\n');
      const remainingErrors = errors.length > 3 ? `\n... ve ${errors.length - 3} hata daha` : '';
      toast.error(`❌ Lütfen aşağıdaki alanları kontrol edin:\n${errorMessages}${remainingErrors}`, {
        duration: 5000
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || isSubmitting) return; // Çoklu gönderimi engelle

    setIsSubmitting(true);
    try {
      // 🔒 Güvenli JSON formData oluştur (base64 dosyalar dahil)
      const jsonFormData: Record<string, any> = {};
      Object.entries(formData).forEach(([key, value]) => {
        // File objelerini artık işlemiyoruz, base64'ler zaten string olarak gelir
        if (value !== null && value !== undefined) {
          jsonFormData[key] = value;
        }
      });

      await createFormResponse.mutateAsync({
        form_id: eventId,
        form_type: 'event_registration',
        response_data: jsonFormData,
        user_name: formData['ad_soyad'] as string || 'Anonim',
        user_email: formData['email'] as string || null
      });

      setSubmitted(true);
      toast.success('🎉 Kayıt başarıyla tamamlandı!');
      
      // ✅ Success modal'dan sonra callback çağır ve modal kapat
      setTimeout(() => {
        onSuccess?.();  // Parent'a bildir
        onClose();      // Modal'ı kapat
        setSubmitted(false);
        setFormData({});
      }, 3000);

    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('❌ Kayıt işlemi başarısız. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: any) => {
    const value = formData[field.field_name] || '';

    switch (field.field_type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'number':
        return (
          <Input
            type={field.field_type}
            value={value as string}
            onChange={(e) => handleInputChange(field.field_name, e.target.value)}
            placeholder={`${field.field_label} giriniz...`}
            className="h-12"
            required={field.required}
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={value as string}
            onChange={(e) => handleInputChange(field.field_name, e.target.value)}
            placeholder={`${field.field_label} giriniz...`}
            rows={4}
            required={field.required}
          />
        );

      case 'select':
        return (
          <Select
            value={value as string}
            onValueChange={(val) => handleInputChange(field.field_name, val)}
            required={field.required}
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Seçiniz..." />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: string, index: number) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'radio':
        return (
          <div className="space-y-3">
            {field.options?.map((option: string, index: number) => (
              <div key={index} className="flex items-center space-x-3">
                <input
                  type="radio"
                  id={`${field.field_name}_${index}`}
                  name={field.field_name}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleInputChange(field.field_name, e.target.value)}
                  className="w-4 h-4 text-blue-600"
                  required={field.required}
                />
                <label 
                  htmlFor={`${field.field_name}_${index}`}
                  className="text-sm font-medium cursor-pointer"
                >
                  {option}
                </label>
              </div>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-3">
            {field.options?.map((option: string, index: number) => (
              <div key={index} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id={`${field.field_name}_${index}`}
                  value={option}
                  checked={Array.isArray(value) && value.includes(option)}
                  onChange={(e) => handleMultiSelectChange(field.field_name, option, e.target.checked)}
                  className="w-4 h-4 text-blue-600"
                />
                <label 
                  htmlFor={`${field.field_name}_${index}`}
                  className="text-sm font-medium cursor-pointer"
                >
                  {option}
                </label>
              </div>
            ))}
          </div>
        );

      case 'file':
        return (
          <div className="space-y-2">
            <input
              type="file"
              onChange={(e) => handleFileChange(field.field_name, e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              required={field.required}
              accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar"
            />
            <p className="text-xs text-gray-500">
              📎 Maksimum dosya boyutu: 5MB | Desteklenen formatlar: Resim, PDF, Office, Arşiv dosyaları
            </p>
            {formData[field.field_name] && (
              <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                <p className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
                  <span>✅</span>
                  <span>{formData[field.field_name] as string} başarıyla yüklendi</span>
                </p>
              </div>
            )}
          </div>
        );

      case 'date':
        return (
          <Input
            type="date"
            value={value as string}
            onChange={(e) => handleInputChange(field.field_name, e.target.value)}
            className="h-12"
            required={field.required}
          />
        );

      default:
        return (
          <Input
            type="text"
            value={value as string}
            onChange={(e) => handleInputChange(field.field_name, e.target.value)}
            placeholder={`${field.field_label} giriniz...`}
            className="h-12 sm:h-11 text-base"
            required={field.required}
          />
        );
    }
  };

  if (submitted) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md" aria-describedby="success-description">
          <DialogDescription id="success-description" className="sr-only">
            Etkinlik kaydınız başarıyla tamamlanmıştır. Bu sayfada onay mesajı ve detayları görüntülenmektedir.
          </DialogDescription>
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-green-800 dark:text-green-300">
              🎉 Kayıt Tamamlandı!
            </h3>
              <div className="space-y-3">
                <p className="text-green-600 dark:text-green-400 text-lg">
              <strong>{eventTitle}</strong> etkinliğine başarıyla kayıt oldunuz.
            </p>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-700">
                  <div className="text-sm text-green-700 dark:text-green-300 space-y-2">
                    <p className="flex items-center gap-2">
                      <span>📧</span>
                      <span>Etkinlik öncesi bilgilendirme e-postası ya da mesajı alacaksınız</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span>📅</span>
                      <span>Etkinlik hatırlatması gönderilecek</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span>✅</span>
                      <span>Kayıt bilgileriniz güvenle saklandı</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Kapat Butonu */}
            <div className="mt-6 pt-4 border-t border-green-200 dark:border-green-700">
              <Button
                onClick={onClose}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl"
              >
                🏠 Ana Sayfaya Dön
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="form-description">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
            {eventTitle} - Kayıt Formu
          </DialogTitle>
          <DialogDescription id="form-description" className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Etkinliğe katılmak için aşağıdaki formu eksiksiz doldurun.
          </DialogDescription>
        </DialogHeader>

        {/* 🎯 Kayıt Durumu Göstergesi */}
        {eventData && (
          <div className="mt-4">
            {registrationStatus.canRegister ? (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <h4 className="font-medium text-green-800 dark:text-green-300">
                      ✅ Kayıtlar Açık
                    </h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-green-700 dark:text-green-400">
                      {registrationStatus.maxParticipants ? (
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {registrationStatus.currentCount || 0}/{registrationStatus.maxParticipants} Kayıt
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {registrationStatus.currentCount || 0} Kayıt (Sınırsız)
                        </span>
                      )}
                      {registrationStatus.maxParticipants && registrationStatus.currentCount && (
                        <span className="text-xs">
                          {registrationStatus.maxParticipants - registrationStatus.currentCount} kontenjan kaldı
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200">
                <div className="flex items-center gap-3">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <div className="flex-1">
                    <h4 className="font-medium text-red-800 dark:text-red-300">
                      ❌ Kayıtlar Kapalı
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                      {registrationStatus.reason}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 🚫 Kayıt Kapalıysa Form Gösterme */}
        {!registrationStatus.canRegister ? (
          <div className="text-center py-8">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Kayıt Yapılamıyor</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {registrationStatus.reason}
            </p>
            <Button
              onClick={onClose}
              variant="outline"
              className="mt-4"
            >
              Tamam
            </Button>
          </div>
        ) : formFields.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Form Bulunamadı</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Bu etkinlik için henüz kayıt formu oluşturulmamış.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            {formFields
              .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
              .map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.field_name} className="text-base font-medium">
                    {field.field_label}
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </Label>
                  {renderField(field)}
                </div>
              ))
            }

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <span className="text-red-500">*</span>
                Zorunlu alanları doldurmayı unutmayın
              </p>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                İptal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || formFields.length === 0 || !registrationStatus.canRegister}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Kayıt Ol
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EventRegistrationForm; 