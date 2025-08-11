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
import { CheckCircle, Clock, Loader2, ArrowLeft, FileText, Calendar, AlertCircle } from 'lucide-react';

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
    return (
      <PageContainer background="gradient">
        <LoadingPage 
          title="Anket Detayı Yükleniyor"
          message="Anket formu hazırlanıyor..."
          icon={FileText}
        />
      </PageContainer>
    );
  }

  if (surveyError || !survey) {
    return (
      <PageContainer background="gradient">
        <ErrorState 
          title="Anket Bulunamadı"
          message="Aradığınız anket bulunamadı veya kaldırılmış olabilir."
          onRetry={() => navigate('/anketler')}
          variant="notfound"
        />
      </PageContainer>
    );
  }

  const isSurveyActive = () => {
    const now = new Date();
    const startDate = new Date(survey.start_date);
    const endDate = new Date(survey.end_date);
    endDate.setHours(23, 59, 59, 999);
    return survey.active && now >= startDate && now <= endDate;
  };

  return (
    <PageContainer background="gradient">
      {/* Mobile-First Header */}
      <div className="mb-6 sm:mb-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/anketler')}
          className="mb-4 h-12 px-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border border-white/20 dark:border-slate-700/20 hover:bg-white/80 dark:hover:bg-slate-800/80 interactive-scale"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          <span className="font-medium">Anketlere Dön</span>
        </Button>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card variant="modern" className="overflow-hidden animate-fade-in-up">
          <CardHeader className="text-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/30 dark:to-purple-950/30">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl shadow-lg">
                <FileText className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text-primary mb-4">
              {survey.title}
            </CardTitle>
            {survey.description && (
              <CardDescription className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
                {survey.description}
              </CardDescription>
            )}
            <div className="flex items-center justify-center gap-2 mt-6 text-sm sm:text-base">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-slate-600 dark:text-slate-400 font-medium">
                📅 Son Katılım: {format(new Date(survey.end_date), 'dd MMMM yyyy', { locale: tr })}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 lg:p-8">
            {isSurveyActive() ? (
              isSubmitted ? (
                // Success Screen - Modern Design
                <div className="text-center py-12 sm:py-16 space-y-6 animate-fade-in-up">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg animate-fade-in-scale">
                    <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl sm:text-3xl font-bold gradient-text-primary">
                      ✅ Anketiniz Başarıyla Gönderildi!
                    </h3>
                    <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
                      Değerli yanıtınız için teşekkür ederiz. Katkınız bizim için çok önemli.
                    </p>
                  </div>
                  <Card variant="modern" className="bg-gradient-to-br from-blue-50/80 to-cyan-50/80 dark:from-blue-950/50 dark:to-cyan-950/50 border-blue-200/50 dark:border-blue-800/50 max-w-md mx-auto">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-center gap-2 text-blue-700 dark:text-blue-300">
                        <Clock className="h-4 w-4 animate-pulse" />
                        <span className="text-sm font-medium">
                          🔄 Anketler sayfasına yönlendiriliyorsunuz...
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                // Modern Form Design
                <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                  {formFields?.sort((a,b) => (a.sort_order || 0) - (b.sort_order || 0)).map((field, index) => (
                    <Card key={field.id} variant="modern" className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                      <CardContent className="p-4 sm:p-6">
                        <Label htmlFor={field.field_name} className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-3 block">
                          {field.field_label}
                          {field.required && <span className="text-red-500 ml-1 text-lg">*</span>}
                        </Label>
                        <div className="space-y-2">
                          {renderField(field)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {formError && (
                    <Card variant="modern" className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50">
                      <CardContent className="p-4 flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                        <p className="text-red-700 dark:text-red-300 font-medium">{formError}</p>
                      </CardContent>
                    </Card>
                  )}
                  
                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      disabled={isSubmitting} 
                      size="touch"
                      variant="gradient"
                      className="w-full font-bold shadow-xl hover:shadow-2xl"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          📤 Yanıtlar Gönderiliyor...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-5 w-5 mr-2" />
                          ✅ Anketi Tamamla ve Gönder
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )
            ) : (
              // Inactive Survey State
              <div className="text-center py-12 sm:py-16 animate-fade-in-up">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto shadow-lg mb-6">
                  <Clock className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3">
                  ⏰ Bu Anket Şu Anda Aktif Değil
                </h3>
                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto mb-6">
                  Anket süresi dolmuş olabilir veya henüz başlamamış olabilir. İlginiz için teşekkür ederiz.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/anketler')}
                  className="interactive-scale"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  🔙 Diğer Anketleri Görüntüle
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};

export default AnketDetay; 