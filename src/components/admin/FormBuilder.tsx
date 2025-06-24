
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus, MoveUp, MoveDown, Download, Users } from 'lucide-react';
import { useCreateFormField, useFormFields, useFormResponses } from '@/hooks/useSupabaseData';
import { exportToExcel, formatFormResponsesForExcel } from '@/utils/excelExport';
import { toast } from 'sonner';

interface FormField {
  id?: string;
  field_type: string;
  field_label: string;
  field_name: string;
  required: boolean;
  options?: string[];
  sort_order: number;
}

interface FormBuilderProps {
  formId: string;
  formType: 'event_registration' | 'survey';
  onSave?: () => void;
  formTitle?: string;
}

const FormBuilder = ({ formId, formType, onSave, formTitle }: FormBuilderProps) => {
  const [fields, setFields] = useState<FormField[]>([]);
  const [newField, setNewField] = useState<FormField>({
    field_type: 'text',
    field_label: '',
    field_name: '',
    required: false,
    options: [],
    sort_order: 0,
  });
  const [options, setOptions] = useState('');

  const { data: existingFields } = useFormFields(formId, formType);
  const { data: formResponses = [] } = useFormResponses(formId, formType);
  const createFormField = useCreateFormField();

  React.useEffect(() => {
    if (existingFields) {
      setFields(existingFields.map(field => ({
        id: field.id,
        field_type: field.field_type,
        field_label: field.field_label,
        field_name: field.field_name,
        required: field.required || false,
        options: field.options || [],
        sort_order: field.sort_order || 0,
      })));
    }
  }, [existingFields]);

  // Otomatik değişken adı oluşturma
  const generateFieldName = (label: string): string => {
    return label
      .toLowerCase()
      .replace(/[çğıöşü]/g, (match) => {
        const map: { [key: string]: string } = {
          'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u'
        };
        return map[match] || match;
      })
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  };

  const addField = () => {
    if (!newField.field_label.trim()) {
      toast.error('Lütfen alan adını giriniz');
      return;
    }

    // Otomatik değişken adı oluştur
    const autoFieldName = generateFieldName(newField.field_label);

    const fieldToAdd = {
      ...newField,
      field_name: autoFieldName, // Otomatik oluşturulan değişken adı
      sort_order: fields.length,
      options: ['select', 'radio', 'checkbox'].includes(newField.field_type) 
        ? options.split('\n').filter(opt => opt.trim()) 
        : undefined,
    };

    setFields([...fields, fieldToAdd]);
    setNewField({
      field_type: 'text',
      field_label: '',
      field_name: '',
      required: false,
      options: [],
      sort_order: 0,
    });
    setOptions('');
  };

  const removeField = (index: number) => {
    const newFields = fields.filter((_, i) => i !== index);
    setFields(newFields.map((field, i) => ({ ...field, sort_order: i })));
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newFields = [...fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newFields.length) {
      [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
      setFields(newFields.map((field, i) => ({ ...field, sort_order: i })));
    }
  };

  const saveForm = async () => {
    try {
      for (const field of fields) {
        if (!field.id) {
          await createFormField.mutateAsync({
            form_id: formId,
            form_type: formType,
            field_type: field.field_type,
            field_label: field.field_label,
            field_name: field.field_name,
            required: field.required,
            options: field.options,
            sort_order: field.sort_order,
          });
        }
      }
      toast.success('Form başarıyla kaydedildi');
      onSave?.();
    } catch (error) {
      console.error('Error saving form:', error);
      toast.error('Form kaydedilirken hata oluştu');
    }
  };

  const exportResponses = () => {
    if (formResponses.length === 0) {
      toast.error('Dışa aktarılacak yanıt bulunamadı');
      return;
    }

    const formattedData = formatFormResponsesForExcel(formResponses);
    const filename = `${formTitle || formType}_yanitlari_${new Date().toLocaleDateString('tr-TR')}`;
    exportToExcel(formattedData, filename);
    toast.success('Yanıtlar Excel dosyası olarak indirildi');
  };

  return (
    <div className="space-y-6">
      {/* Form Responses Section - ÖNE ÇIKARILDI */}
      {existingFields && existingFields.length > 0 && (
        <Card className="border-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center text-blue-800 dark:text-blue-300">
                <Users className="mr-2 h-5 w-5" />
                📋 Bu Etkinliğin Form Yanıtları ({formResponses.length})
              </span>
              <Button
                onClick={exportResponses}
                variant="outline"
                size="sm"
                disabled={formResponses.length === 0}
                className="bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
              >
                <Download className="mr-2 h-4 w-4" />
                Excel'e Aktar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {formResponses.length === 0 ? (
              <div className="text-center py-6">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-blue-600 dark:text-blue-400 font-medium">
                  Henüz bu etkinlik için kayıt bulunmuyor
                </p>
                <p className="text-sm text-blue-500 dark:text-blue-500 mt-2">
                  Form alanları oluşturduktan sonra katılımcılar kayıt olabilir
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="bg-blue-100 dark:bg-blue-900/30 px-3 py-2 rounded-lg">
                    <span className="font-medium text-blue-800 dark:text-blue-300">
                      📊 Toplam Yanıt: {formResponses.length}
                    </span>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900/30 px-3 py-2 rounded-lg">
                    <span className="font-medium text-green-800 dark:text-green-300">
                      📅 Son Yanıt: {new Date(formResponses[0]?.submitted_at).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                  <div className="bg-purple-100 dark:bg-purple-900/30 px-3 py-2 rounded-lg">
                    <span className="font-medium text-purple-800 dark:text-purple-300">
                      ⏰ Son Yanıt: {new Date(formResponses[0]?.submitted_at).toLocaleTimeString('tr-TR')}
                    </span>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border">
                  <h4 className="font-medium mb-3 text-slate-900 dark:text-slate-100">Son 3 Kayıt:</h4>
                  <div className="space-y-2">
                    {formResponses.slice(0, 3).map((response, index) => (
                      <div key={response.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700 rounded">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </span>
                          <span className="font-medium">{response.user_name || 'Anonim'}</span>
                          <span className="text-xs text-slate-500">{response.user_email}</span>
                        </div>
                        <span className="text-xs text-slate-500">
                          {new Date(response.submitted_at).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Form Builder Section */}
      <Card>
        <CardHeader>
          <CardTitle>Yeni Alan Ekle</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="field_type">Alan Türü</Label>
              <Select value={newField.field_type} onValueChange={(value) => setNewField(prev => ({ ...prev, field_type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Metin</SelectItem>
                  <SelectItem value="email">E-posta</SelectItem>
                  <SelectItem value="number">Sayı</SelectItem>
                  <SelectItem value="tel">Telefon</SelectItem>
                  <SelectItem value="textarea">Uzun Metin</SelectItem>
                  <SelectItem value="select">Seçim Listesi</SelectItem>
                  <SelectItem value="radio">Tekli Seçim</SelectItem>
                  <SelectItem value="checkbox">Çoklu Seçim</SelectItem>
                  <SelectItem value="file">Dosya Yükleme</SelectItem>
                  <SelectItem value="date">Tarih</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="field_label">Alan Adı (Kullanıcıların Göreceği İsim)</Label>
              <Input
                id="field_label"
                value={newField.field_label}
                onChange={(e) => setNewField(prev => ({ ...prev, field_label: e.target.value }))}
                placeholder="Örnek: Ad Soyad, Telefon Numarası, Meslek..."
              />
              {newField.field_label && (
                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                  <span className="text-blue-700 dark:text-blue-300">
                    ✨ Otomatik değişken adı: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">{generateFieldName(newField.field_label)}</code>
                  </span>
                </div>
              )}
            </div>
          </div>

          {['select', 'radio', 'checkbox'].includes(newField.field_type) && (
            <div>
              <Label htmlFor="options">Seçenekler (Her satıra bir seçenek)</Label>
              <textarea
                id="options"
                className="w-full p-2 border rounded"
                rows={3}
                value={options}
                onChange={(e) => setOptions(e.target.value)}
                placeholder="Seçenek 1&#10;Seçenek 2&#10;Seçenek 3"
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id="required"
              checked={newField.required}
              onCheckedChange={(checked) => setNewField(prev => ({ ...prev, required: checked }))}
            />
            <Label htmlFor="required">Zorunlu Alan</Label>
          </div>

          <Button type="button" onClick={addField} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Alan Ekle
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Form Alanları ({fields.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {fields.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Henüz alan eklenmemiş</p>
          ) : (
            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1">
                    <div className="font-medium">{field.field_label}</div>
                    <div className="text-sm text-muted-foreground">
                      {field.field_type} • {field.field_name} {field.required && '• Zorunlu'}
                    </div>
                    {field.options && field.options.length > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Seçenekler: {field.options.join(', ')}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveField(index, 'up')}
                      disabled={index === 0}
                    >
                      <MoveUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveField(index, 'down')}
                      disabled={index === fields.length - 1}
                    >
                      <MoveDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeField(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {fields.length > 0 && (
            <Button onClick={saveForm} className="w-full mt-4" disabled={createFormField.isPending}>
              {createFormField.isPending ? 'Kaydediliyor...' : 'Formu Kaydet'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FormBuilder;
