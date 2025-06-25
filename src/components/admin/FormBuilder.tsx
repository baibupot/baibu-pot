import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Trash2, Plus, MoveUp, MoveDown, Eye, FileText, 
  Edit2, Save, X, 
  Mail, Hash, Phone, Calendar, List, RadioIcon, CheckSquare, FileImage, Loader2
} from 'lucide-react';
import { useCreateFormField, useUpdateFormField, useDeleteFormField, useFormFields } from '@/hooks/useSupabaseData';
import { toast } from 'sonner';

// ✅ File utilities FormResponsesModal'a taşındı

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
  const [showPreview, setShowPreview] = useState(false);
  const [editingField, setEditingField] = useState<number | null>(null);
  const [editOptions, setEditOptions] = useState('');

  const { data: existingFields } = useFormFields(formId, formType);
  const createFormField = useCreateFormField();
  const updateFormField = useUpdateFormField();
  const deleteFormField = useDeleteFormField();

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

  // 🎯 Farklı field type iconları
  const fieldTypes = {
    text: { icon: FileText, name: 'Kısa Metin', desc: 'Ad, soyad gibi kısa bilgiler' },
    email: { icon: Mail, name: 'E-posta', desc: 'E-posta adresi (otomatik doğrulama)' },
    number: { icon: Hash, name: 'Sayı', desc: 'Yaş, miktar gibi sayısal değerler' },
    tel: { icon: Phone, name: 'Telefon', desc: 'Telefon numarası' },
    textarea: { icon: FileText, name: 'Uzun Metin', desc: 'Mesaj, açıklama gibi uzun metinler' },
    select: { icon: List, name: 'Açılır Liste', desc: 'Seçeneklerden birini seç' },
    radio: { icon: RadioIcon, name: 'Tekli Seçim', desc: 'Sadece bir seçenek seçilebilir' },
    checkbox: { icon: CheckSquare, name: 'Çoklu Seçim', desc: 'Birden fazla seçenek seçilebilir' },
    file: { icon: FileImage, name: 'Dosya Yükleme', desc: 'CV, belge vs. dosya yükleyebilir' },
    date: { icon: Calendar, name: 'Tarih', desc: 'Tarih seçimi' }
  };

  const addField = () => {
    if (!newField.field_label.trim()) {
      toast.error('Lütfen alan adını giriniz');
      return;
    }

    if (['select', 'radio', 'checkbox'].includes(newField.field_type) && !options.trim()) {
      toast.error('Bu alan türü için seçenekler girmelisiniz');
      return;
    }

    const autoFieldName = generateFieldName(newField.field_label);
    const fieldToAdd = {
      ...newField,
      field_name: autoFieldName,
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
    toast.success('Alan eklendi');
  };

  const removeField = async (index: number) => {
    const fieldToRemove = fields[index];
    
    if (fieldToRemove.id) {
      try {
        await deleteFormField.mutateAsync({
          id: fieldToRemove.id,
          form_id: formId,
          form_type: formType
        });
        toast.success('Alan silindi');
      } catch (error) {
        toast.error('Alan silinemedi');
        return;
      }
    }
    
    const newFields = fields.filter((_, i) => i !== index);
    setFields(newFields.map((field, i) => ({ ...field, sort_order: i })));
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newFields = [...fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newFields.length) {
      [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
      setFields(newFields.map((field, i) => ({ ...field, sort_order: i })));
      toast.success(`Alan ${direction === 'up' ? 'yukarı' : 'aşağı'} taşındı`);
    }
  };

  const startEditField = (index: number) => {
    setEditingField(index);
    const field = fields[index];
    if (field.options) {
      setEditOptions(field.options.join('\n'));
    } else {
      setEditOptions('');
    }
  };

  const cancelEditField = () => {
    setEditingField(null);
    setEditOptions('');
  };

  const saveEditField = async (index: number) => {
    const field = fields[index];
    
    if (['select', 'radio', 'checkbox'].includes(field.field_type)) {
      field.options = editOptions.split('\n').filter(opt => opt.trim());
    }
    
    try {
      if (field.id) {
        await updateFormField.mutateAsync({
          id: field.id,
          field_type: field.field_type,
          field_label: field.field_label,
          field_name: field.field_name,
          required: field.required,
          options: field.options,
          sort_order: field.sort_order,
        });
        toast.success('Alan güncellendi');
      }
      
      const newFields = [...fields];
      newFields[index] = field;
      setFields(newFields);
      cancelEditField();
    } catch (error) {
      toast.error('Alan güncellenemedi');
    }
  };

  const updateFieldProperty = (index: number, property: string, value: any) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], [property]: value };
    if (property === 'field_label') {
      newFields[index].field_name = generateFieldName(value);
    }
    setFields(newFields);
  };

  const saveForm = async () => {
    try {
      let savedCount = 0;
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
          savedCount++;
        }
      }
      
      if (savedCount > 0) {
        toast.success(`${savedCount} alan kaydedildi`);
      }
      onSave?.();
    } catch (error) {
      toast.error('Form kaydedilirken hata oluştu');
    }
  };



  // 🎯 Unsaved fields kontrolü - manuel kaydetme için
  const hasUnsavedChanges = fields.some(f => !f.id);

  return (
    <div className="space-y-6">
      {/* ✅ Etkinlik Kayıtları bölümü AdminDashboard'a taşındı */}

      {/* Add New Field */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Yeni Form Alanı Ekle
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-6">
          <div>
            <Label className="text-base font-medium">Alan Türü</Label>
              <Select value={newField.field_type} onValueChange={(value) => setNewField(prev => ({ ...prev, field_type: value }))}>
              <SelectTrigger className="mt-2">
                <SelectValue />
                </SelectTrigger>
              <SelectContent>
                {Object.entries(fieldTypes).map(([key, type]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <type.icon className="h-4 w-4" />
                      <div className="hidden sm:block">
                        <div className="font-medium">{type.name}</div>
                        <div className="text-xs text-muted-foreground">{type.desc}</div>
                      </div>
                      <div className="sm:hidden">
                        <span className="font-medium">{type.name}</span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
                </SelectContent>
              </Select>
          </div>

          <div>
            <Label className="text-base font-medium">Alan Adı</Label>
            <Input
              value={newField.field_label}
              onChange={(e) => setNewField(prev => ({ ...prev, field_label: e.target.value }))}
              placeholder="Örnek: Ad Soyad, Telefon..."
              className="mt-2"
            />
          </div>

          {['select', 'radio', 'checkbox'].includes(newField.field_type) && (
            <div>
              <Label className="text-base font-medium">Seçenekler</Label>
              <Textarea
                value={options}
                onChange={(e) => setOptions(e.target.value)}
                placeholder="Her satıra bir seçenek yazın..."
                rows={4}
                className="mt-2"
              />
              {options && (
                <div className="mt-2 p-3 bg-muted rounded-lg">
                  <div className="font-medium text-sm mb-2">Önizleme:</div>
                  <div className="space-y-1">
                    {options.split('\n').filter(opt => opt.trim()).map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{index + 1}</Badge>
                        <span className="text-sm truncate">{option.trim()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <Switch
              checked={newField.required}
              onCheckedChange={(checked) => setNewField(prev => ({ ...prev, required: checked }))}
            />
            <div>
              <Label className="font-medium">Zorunlu Alan</Label>
              <p className="text-sm text-muted-foreground">Bu alan doldurulması zorunlu olsun mu?</p>
            </div>
          </div>

          <Button 
            type="button" 
            onClick={addField} 
            disabled={!newField.field_label.trim()}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Alan Ekle
          </Button>
        </CardContent>
      </Card>

      {/* 🎯 Manuel Form Kaydetme */}
      {hasUnsavedChanges && (
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Save className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-green-800">
                    Form Alanlarını Kaydet
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {fields.filter(f => !f.id).length} yeni alan kaydedilmeyi bekliyor
                  </p>
        </div>
      </div>
              <Button 
                type="button"
                onClick={saveForm}
                disabled={createFormField.isPending}
                className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
              >
                {createFormField.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Form Alanlarını Kaydet ({fields.filter(f => !f.id).length})</span>
                    <span className="sm:hidden">Kaydet ({fields.filter(f => !f.id).length})</span>
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Fields List */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Form Alanları
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {fields.length > 0 ? `${fields.length} alan tanımlandı` : 'Henüz alan eklenmemiş'}
              </p>
            </div>
            {fields.length > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
                className="w-full sm:w-auto"
          >
                <Eye className="h-4 w-4 mr-2" />
                {showPreview ? 'Önizlemeyi Gizle' : 'Önizleme'}
          </Button>
            )}
        </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {fields.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-2">Henüz alan eklenmemiş</h4>
              <p className="text-muted-foreground text-center">
                Yukarıdan yeni alan ekleyerek formu oluşturmaya başlayın
            </p>
          </div>
        ) : (
          <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={index} className="border rounded-lg p-3 sm:p-4">
                  {editingField === index ? (
                    <div className="space-y-4">
                      <div>
                        <Label>Alan Türü</Label>
                        <Select 
                          value={field.field_type} 
                          onValueChange={(value) => updateFieldProperty(index, 'field_type', value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(fieldTypes).map(([key, type]) => (
                              <SelectItem key={key} value={key}>
                                <div className="flex items-center gap-2">
                                  <type.icon className="h-4 w-4" />
                                  <span>{type.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Alan Adı</Label>
                        <Input
                          value={field.field_label}
                          onChange={(e) => updateFieldProperty(index, 'field_label', e.target.value)}
                          className="mt-1"
                        />
                      </div>

                      {['select', 'radio', 'checkbox'].includes(field.field_type) && (
                        <div>
                          <Label>Seçenekler</Label>
                          <Textarea
                            value={editOptions}
                            onChange={(e) => setEditOptions(e.target.value)}
                            placeholder="Her satıra bir seçenek..."
                            rows={3}
                            className="mt-1"
                          />
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                        <Switch
                          checked={field.required}
                          onCheckedChange={(checked) => updateFieldProperty(index, 'required', checked)}
                        />
                        <Label>Zorunlu Alan</Label>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button type="button" onClick={() => saveEditField(index)} size="sm" className="w-full sm:w-auto">
                          <Save className="h-4 w-4 mr-2" />
                          Kaydet
                        </Button>
                        <Button type="button" onClick={cancelEditField} variant="outline" size="sm" className="w-full sm:w-auto">
                          <X className="h-4 w-4 mr-2" />
                          İptal
                        </Button>
                      </div>
                          </div>
                  ) : (
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          {React.createElement(fieldTypes[field.field_type as keyof typeof fieldTypes]?.icon || FileText, {
                            className: "h-5 w-5 text-gray-600 flex-shrink-0"
                          })}
                          <div className="min-w-0 flex-1">
                            <div className="font-medium truncate">{field.field_label}</div>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                              {fieldTypes[field.field_type as keyof typeof fieldTypes]?.name}
                            </Badge>
                              <Badge variant="outline" className="text-xs font-mono">
                              {field.field_name}
                            </Badge>
                            {field.required && (
                                <Badge variant="destructive" className="text-xs">Zorunlu</Badge>
                            )}
                          </div>
                    </div>
                    </div>
                    {field.options && field.options.length > 0 && (
                          <div className="mt-2 p-2 bg-muted rounded text-sm">
                            <span className="font-medium">Seçenekler: </span>
                            <span className="break-words">{field.options.join(', ')}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 lg:gap-2 justify-end lg:justify-start">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditField(index)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                    <Button
                        type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => moveField(index, 'up')}
                      disabled={index === 0}
                          className="h-8 w-8 p-0"
                    >
                      <MoveUp className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => moveField(index, 'down')}
                      disabled={index === fields.length - 1}
                          className="h-8 w-8 p-0"
                    >
                      <MoveDown className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeField(index)}
                          className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    </div>
                  </div>
                  )}
                </div>
              ))}

              {/* Form Preview */}
            {showPreview && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6">
                  <h4 className="font-medium mb-4 flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                    Form Önizlemesi
                </h4>
                  <div className="space-y-4 max-w-md mx-auto">
                  {fields.map((field, index) => (
                    <div key={index} className="space-y-2">
                      <Label className="text-sm font-medium">
                        {field.field_label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      {field.field_type === 'textarea' ? (
                        <Textarea placeholder={`${field.field_label} giriniz...`} disabled />
                      ) : field.field_type === 'select' ? (
                        <Select disabled>
                          <SelectTrigger>
                            <SelectValue placeholder="Seçiniz..." />
                          </SelectTrigger>
                        </Select>
                      ) : field.field_type === 'radio' && field.options ? (
                        <div className="space-y-2">
                          {field.options.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center space-x-2">
                              <input type="radio" disabled />
                              <span className="text-sm">{option}</span>
                            </div>
                          ))}
                        </div>
                      ) : field.field_type === 'checkbox' && field.options ? (
                        <div className="space-y-2">
                          {field.options.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center space-x-2">
                              <input type="checkbox" disabled />
                              <span className="text-sm">{option}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <Input 
                          type={field.field_type} 
                          placeholder={`${field.field_label} giriniz...`} 
                          disabled 
                        />
                      )}
                    </div>
                  ))}
                    <Button disabled className="w-full">Kayıt Ol</Button>
                </div>
                  <p className="text-xs text-muted-foreground mt-4 text-center">
                    Bu sadece önizleme - gerçek form etkinlik sayfasında görünecek
                  </p>
              </div>
            )}
          </div>
        )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FormBuilder;
