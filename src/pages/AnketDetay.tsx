import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageContainer from '@/components/ui/page-container';
import LoadingPage from '@/components/ui/loading-page';
import ErrorState from '@/components/ui/error-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFormFields, useCreateFormResponse, useSurveyBySlug } from '@/hooks/useSupabaseData';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { CheckCircle, Clock, Loader2 } from 'lucide-react';

const AnketDetay = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: survey, isLoading: surveyLoading, error: surveyError } = useSurveyBySlug(slug);
  const { data: formFields, isLoading: fieldsLoading } = useFormFields(survey?.id, 'survey');
  const createFormResponse = useCreateFormResponse();

  const [responses, setResponses] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (fieldName: string, value: any) => {
    setResponses(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleCheckboxChange = (fieldName: string, option: string, checked: boolean) => {
    const currentValues = responses[fieldName] || [];
    const newValues = checked
      ? [...currentValues, option]
      : currentValues.filter((val: string) => val !== option);
    handleInputChange(fieldName, newValues);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!survey || isSubmitting) return; // Çoklu gönderimi engelle

    // Form validasyonu
    for (const field of formFields || []) {
      if (field.required) {
        const response = responses[field.field_name];
        if (!response || (Array.isArray(response) && response.length === 0)) {
           setFormError(`"${field.field_label}" alanı zorunludur.`);
           toast.error(`"${field.field_label}" alanı zorunludur.`);
           return;
        }
      }
    }
    setFormError('');
    setIsSubmitting(true);

    try {
      await createFormResponse.mutateAsync({
        form_id: survey.id,
        form_type: 'survey',
        response_data: responses,
      });
      
      // Başarılı gönderim
      setIsSubmitted(true);
      toast.success('Anket yanıtınız başarıyla gönderildi! Teşekkür ederiz.');
      
      // 3 saniye sonra anketler sayfasına yönlendir
      setTimeout(() => {
        navigate('/anketler');
      }, 3000);

    } catch (error) {
      toast.error('Yanıtınız gönderilirken bir hata oluştu.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (fieldName: string, file: File | null) => {
    handleInputChange(fieldName, file ? file.name : '');
    toast.info("Dosya seçildi. Gerçek yükleme özelliği henüz eklenmemiştir.");
  };

  const renderField = (field: NonNullable<typeof formFields>[0]) => {
    switch (field.field_type) {
      case 'text':
      case 'email':
      case 'number':
      case 'tel':
      case 'date':
        return (
          <Input
            id={field.field_name}
            type={field.field_type}
            onChange={(e) => handleInputChange(field.field_name, e.target.value)}
            required={field.required ?? false}
            placeholder={`${field.field_label}...`}
          />
        );
      case 'textarea':
        return (
          <Textarea
            id={field.field_name}
            onChange={(e) => handleInputChange(field.field_name, e.target.value)}
            required={field.required ?? false}
            placeholder={`${field.field_label}...`}
          />
        );
      case 'radio':
        return (
          <RadioGroup
            onValueChange={(value) => handleInputChange(field.field_name, value)}
            className="space-y-2"
          >
            {field.options?.map((option: string) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.field_name}-${option}`} />
                <Label htmlFor={`${field.field_name}-${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      case 'checkbox':
         return (
          <div className="space-y-2">
            {field.options?.map((option: string) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${field.field_name}-${option}`}
                  onCheckedChange={(checked) => handleCheckboxChange(field.field_name, option, !!checked)}
                />
                <Label htmlFor={`${field.field_name}-${option}`}>{option}</Label>
              </div>
            ))}
          </div>
        );
      case 'select':
        return (
          <Select
            onValueChange={(value) => handleInputChange(field.field_name, value)}
            required={field.required ?? false}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Lütfen bir ${field.field_label.toLowerCase()} seçin`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: string) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'file':
        return (
          <Input
            id={field.field_name}
            type="file"
            onChange={(e) => handleFileChange(field.field_name, e.target.files ? e.target.files[0] : null)}
            required={field.required ?? false}
          />
        );
      default:
        return <p className="text-sm text-red-500">Desteklenmeyen alan tipi: {field.field_type}</p>;
    }
  };

  if (surveyLoading || fieldsLoading) {
    return <LoadingPage title="Anket Yükleniyor..." />;
  }

  if (surveyError || !survey) {
    return <ErrorState title="Anket Bulunamadı" message="Aradığınız anket mevcut değil veya kaldırılmış olabilir." />;
  }

  const isSurveyActive = () => {
    const now = new Date();
    const startDate = new Date(survey.start_date);
    const endDate = new Date(survey.end_date);
    endDate.setHours(23, 59, 59, 999);
    return survey.active && now >= startDate && now <= endDate;
  };

  return (
    <PageContainer>
      <div className="py-12 md:py-20">
          <Card className="max-w-3xl mx-auto shadow-lg border">
              <CardHeader className="text-center p-6 md:p-8">
              <CardTitle className="text-2xl md:text-3xl font-bold">{survey.title}</CardTitle>
              {survey.description && <CardDescription className="pt-2 text-base md:text-lg">{survey.description}</CardDescription>}
              <div className="text-sm text-muted-foreground pt-4">
                  <span>Son Katılım Tarihi: {format(new Date(survey.end_date), 'dd MMMM yyyy', { locale: tr })}</span>
              </div>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
              {isSurveyActive() ? (
                isSubmitted ? (
                  // Başarılı gönderim ekranı
                  <div className="text-center py-12 space-y-6">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                        Anketiniz Başarıyla Gönderildi!
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-lg">
                        Değerli yanıtınız için teşekkür ederiz.
                      </p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        <Clock className="h-4 w-4 inline mr-2" />
                        Anketler sayfasına yönlendiriliyorsunuz...
                      </p>
                    </div>
                  </div>
                ) : (
                  // Normal form
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {formFields?.sort((a,b) => (a.sort_order || 0) - (b.sort_order || 0)).map(field => (
                      <div key={field.id} className="space-y-3 p-5 border rounded-lg bg-gray-50/50 dark:bg-gray-800/20">
                        <Label htmlFor={field.field_name} className="text-base font-semibold">
                          {field.field_label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        {renderField(field)}
                      </div>
                    ))}
                    {formError && <p className="text-red-500 text-sm text-center">{formError}</p>}
                    <Button 
                      type="submit" 
                      disabled={isSubmitting} 
                      size="lg" 
                      className="w-full text-lg"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Yanıtlar Gönderiliyor...
                        </>
                      ) : (
                        'Anketi Tamamla ve Gönder'
                      )}
                    </Button>
                  </form>
                )
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold">Bu anket şu anda aktif değil.</h3>
                  <p className="text-muted-foreground mt-2">İlginiz için teşekkür ederiz.</p>
                </div>
              )}
              </CardContent>
          </Card>
      </div>
    </PageContainer>
  );
};

export default AnketDetay; 