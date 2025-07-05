import React, { useState, useEffect } from 'react';
import { AdminModal } from '@/components/admin/shared/AdminModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, FileText, Settings, FormInput, ClipboardList } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';
import FormBuilder from './FormBuilder';

type Tables = Database['public']['Tables'];
type SurveyData = Tables['surveys']['Insert'];
type SurveyRow = Tables['surveys']['Row'];

interface SurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (surveyData: SurveyData, id?: string) => void;
  initialData?: SurveyRow | null;
}

const SurveyModal = ({ isOpen, onClose, onSave, initialData }: SurveyModalProps) => {
  const [formData, setFormData] = useState<Partial<SurveyData>>({
    title: '',
    description: '',
    slug: '',
    survey_link: null,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 week later
    active: true,
    has_custom_form: false,
  });

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        slug: initialData.slug || '',
        survey_link: initialData.survey_link || null,
        start_date: initialData.start_date,
        end_date: initialData.end_date,
        active: initialData.active ?? true,
        has_custom_form: initialData.has_custom_form ?? false,
      });
    } else if (isOpen && !initialData) {
      // Yeni anket için formu sıfırla
      setFormData({
        title: '',
        description: '',
        slug: '',
        survey_link: null,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        active: true,
        has_custom_form: false,
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    // has_custom_form true ise survey_link'i null yap
    const finalData = {
      ...formData,
      survey_link: formData.has_custom_form ? null : formData.survey_link,
    };
    onSave(finalData as SurveyData, initialData?.id);
    onClose();
  };

  const handleFormTypeChange = (useCustom: boolean) => {
    setFormData(prev => ({
      ...prev,
      has_custom_form: useCustom,
      // Değişim olduğunda ilgili alanı temizle
      survey_link: useCustom ? null : (prev?.survey_link || ''),
    }));
  };

  const handleTitleChange = (title: string) => {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    setFormData(prev => ({ ...prev, title, slug }));
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={handleSubmit}
      title={initialData ? 'Anket Düzenle' : 'Yeni Anket Oluştur'}
      description="Harici bir link veya dahili özel form kullanarak anket yayınlayın."
      icon={<ClipboardList className="h-6 w-6 text-white" />}
      isSaving={false}
      saveLabel={initialData ? 'Değişiklikleri Kaydet' : 'Anketi Oluştur'}
      size="4xl"
      compactHeader={true}
    >
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
        <Tabs defaultValue="content" className="mt-[-1rem] pt-0">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="content">
              <FileText className="mr-2 h-4 w-4" /> İçerik
            </TabsTrigger>
            <TabsTrigger value="form" disabled={!formData.has_custom_form}>
              <FormInput className="mr-2 h-4 w-4" /> Form Oluşturucu
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="content" className="mt-6 space-y-6">
             <div className="space-y-2">
              <Label htmlFor="title">Anket Başlığı *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
              />
              {formData.slug && (
                <p className="text-xs text-muted-foreground">
                  URL: /anketler/{formData.slug}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            
            <div className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <Label>Anket Türü</Label>
                <div className="flex items-center gap-2">
                  <Link className="h-4 w-4 text-muted-foreground"/>
                  <Switch
                    checked={formData.has_custom_form}
                    onCheckedChange={handleFormTypeChange}
                  />
                  <FormInput className="h-4 w-4 text-muted-foreground"/>
                </div>
              </div>
              
              {!formData.has_custom_form ? (
                <div className="space-y-2">
                  <Label htmlFor="survey_link">Harici Anket Linki</Label>
                  <Input
                    id="survey_link"
                    value={formData.survey_link || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, survey_link: e.target.value }))}
                    placeholder="https://forms.google.com/..."
                    required={!formData.has_custom_form}
                  />
                </div>
              ) : (
                <div className="text-sm text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                  Form alanlarını "Form Oluşturucu" sekmesinden ekleyebilirsiniz.
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Başlangıç Tarihi</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">Bitiş Tarihi</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                    required
                  />
                </div>
            </div>

            <div className="flex items-center space-x-2 pt-4">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
              />
              <Label htmlFor="active">Anketi Aktif Olarak Yayınla</Label>
            </div>
          </TabsContent>

          <TabsContent value="form" className="mt-6">
            {initialData?.id && formData.has_custom_form ? (
              <FormBuilder formId={initialData.id} formType="survey" />
            ) : (
              <div className="text-center text-muted-foreground py-10">
                Özel form oluşturmak için önce anketi kaydetmelisiniz.
              </div>
            )}
          </TabsContent>
        </Tabs>
        </form>
    </AdminModal>
  );
};

export default SurveyModal;
