import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useFormFields, useCreateFormResponse } from '@/hooks/useSupabaseData';
import { toast } from 'sonner';
import { Calendar, UserPlus, CheckCircle2, AlertCircle } from 'lucide-react';

interface FormData {
  [key: string]: string | string[] | File | null;
}

interface EventRegistrationFormProps {
  eventId: string;
  eventTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const EventRegistrationForm = ({ 
  eventId, 
  eventTitle, 
  isOpen, 
  onClose, 
  onSuccess 
}: EventRegistrationFormProps) => {
  const [formData, setFormData] = useState<FormData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { data: formFields = [] } = useFormFields(eventId, 'event_registration');
  const createFormResponse = useCreateFormResponse();

  const handleInputChange = (fieldName: string, value: string | string[] | File | null) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleFileChange = (fieldName: string, file: File | null) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: file
    }));
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

    if (errors.length > 0) {
      toast.error(`❌ Lütfen şu alanları doldurun: ${errors.join(', ')}`);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // JSON uyumlu formData oluştur (File tiplerini string'e çevir)
      const jsonFormData: Record<string, any> = {};
      Object.entries(formData).forEach(([key, value]) => {
        if (value instanceof File) {
          jsonFormData[key] = value.name; // Dosya adını sakla
        } else {
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
      onSuccess?.();
      
      setTimeout(() => {
        onClose();
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
            />
            <p className="text-xs text-gray-500">
              Maksimum dosya boyutu: 5MB
            </p>
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
            className="h-12"
            required={field.required}
          />
        );
    }
  };

  if (submitted) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-2">
              🎉 Kayıt Tamamlandı!
            </h3>
            <p className="text-green-600 dark:text-green-400 mb-4">
              <strong>{eventTitle}</strong> etkinliğine başarıyla kayıt oldunuz.
            </p>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-300">
                📧 Etkinlik öncesi size bilgilendirme e-postası gönderilecektir.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
            {eventTitle} - Kayıt Formu
          </DialogTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Etkinliğe katılmak için aşağıdaki formu eksiksiz doldurun.
          </p>
        </DialogHeader>

        {formFields.length === 0 ? (
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
                disabled={isSubmitting || formFields.length === 0}
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