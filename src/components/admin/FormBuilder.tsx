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
  Mail, Hash, Phone, Calendar, List, RadioIcon, CheckSquare, FileImage, Loader2, Users
} from 'lucide-react';
import { useCreateFormField, useUpdateFormField, useDeleteFormField, useFormFields } from '@/hooks/useSupabaseData';
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
      {/* Add New Field */}
      <Card className="border-2 border-blue-200 dark:border-blue-800 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Plus className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-lg">Yeni Form Alanı Ekle</div>
              <p className="text-sm text-muted-foreground font-normal mt-1">
                Kullanıcılardan toplamak istediğiniz bilgileri form alanı olarak ekleyin
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-6">
          <div>
            <Label className="text-base font-medium mb-3 block">Alan Türü Seçin</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {Object.entries(fieldTypes).map(([key, type]) => {
                const Icon = type.icon;
                const isSelected = newField.field_type === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setNewField(prev => ({ ...prev, field_type: key }))}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className={`h-5 w-5 mb-2 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                    <div className="font-medium text-sm mb-1">{type.name}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2">{type.desc}</div>
                  </button>
                );
              })}
            </div>
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
                <div className="mt-2 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-lg border-2 border-blue-200 dark:border-blue-700">
                  <div className="flex items-center gap-2 mb-3">
                    <Eye className="h-4 w-4 text-blue-600" />
                    <div className="font-semibold text-sm text-blue-900 dark:text-blue-200">
                      Önizleme: {options.split('\n').filter(opt => opt.trim()).length} Seçenek
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {options.split('\n').filter(opt => opt.trim()).map((option, index) => (
                      <Badge key={index} variant="secondary" className="text-xs font-medium">
                        {index + 1}. {option.trim()}
                      </Badge>
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
        <Card className="border-2 border-green-300 dark:border-green-700 shadow-lg animate-pulse-slow">
          <CardContent className="p-4 sm:p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <Save className="h-6 w-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-green-800 dark:text-green-300 flex items-center gap-2">
                    Form Alanlarını Kaydet
                    <Badge variant="destructive" className="text-xs animate-bounce">
                      {fields.filter(f => !f.id).length}
                    </Badge>
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    {fields.filter(f => !f.id).length} yeni alan kaydedilmeyi bekliyor
                  </p>
                </div>
              </div>
              <Button 
                type="button"
                onClick={saveForm}
                disabled={createFormField.isPending}
                className="bg-green-600 hover:bg-green-700 w-full sm:w-auto h-12 text-base font-semibold shadow-lg"
              >
                {createFormField.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
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
      <Card className="border-2 border-gray-200 dark:border-gray-700">
        <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-700 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  Form Alanları
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {fields.length > 0 ? (
                    <>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">{fields.length}</span> alan tanımlandı
                      {fields.filter(f => f.required).length > 0 && (
                        <> • <span className="font-semibold text-red-600 dark:text-red-400">{fields.filter(f => f.required).length}</span> zorunlu</>
                      )}
                    </>
                  ) : (
                    'Henüz alan eklenmemiş'
                  )}
                </p>
              </div>
            </div>
            {fields.length > 0 && (
          <Button
            type="button"
            variant={showPreview ? "default" : "outline"}
            onClick={() => setShowPreview(!showPreview)}
                className="w-full sm:w-auto"
          >
                <Eye className="h-4 w-4 mr-2" />
                {showPreview ? 'Önizlemeyi Gizle' : 'Formu Önizle'}
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
                    <div className="space-y-3">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              field.required ? 'bg-red-50 dark:bg-red-900/20' : 'bg-blue-50 dark:bg-blue-900/20'
                            }`}>
                              {React.createElement(fieldTypes[field.field_type as keyof typeof fieldTypes]?.icon || FileText, {
                                className: `h-5 w-5 ${field.required ? 'text-red-600' : 'text-blue-600'}`
                              })}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="font-semibold text-base">{field.field_label}</div>
                                {field.required && (
                                  <Badge variant="destructive" className="text-xs">Zorunlu</Badge>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  {fieldTypes[field.field_type as keyof typeof fieldTypes]?.name}
                                </Badge>
                                <Badge variant="outline" className="text-xs font-mono">
                                  {field.field_name}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          {field.options && field.options.length > 0 && (
                            <div className="mt-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg">
                              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                                Seçenekler ({field.options.length})
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {field.options.map((option, optIdx) => (
                                  <Badge key={optIdx} variant="outline" className="text-xs">
                                    {optIdx + 1}. {option}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 justify-end lg:justify-start flex-shrink-0">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditField(index)}
                            className="h-9 w-9 p-0 hover:bg-blue-100 hover:text-blue-600"
                            title="Düzenle"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => moveField(index, 'up')}
                            disabled={index === 0}
                            className="h-9 w-9 p-0 hover:bg-gray-100 disabled:opacity-30"
                            title="Yukarı Taşı"
                          >
                            <MoveUp className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => moveField(index, 'down')}
                            disabled={index === fields.length - 1}
                            className="h-9 w-9 p-0 hover:bg-gray-100 disabled:opacity-30"
                            title="Aşağı Taşı"
                          >
                            <MoveDown className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeField(index)}
                            className="text-red-600 hover:bg-red-100 hover:text-red-700 h-9 w-9 p-0"
                            title="Sil"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Form Preview */}
            {showPreview && (
                <div className="border-2 border-blue-300 rounded-xl p-6 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="font-bold text-lg flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Eye className="h-4 w-4 text-white" />
                      </div>
                      Form Önizlemesi
                    </h4>
                    <Badge variant="secondary" className="text-xs">
                      {fields.length} Alan • {fields.filter(f => f.required).length} Zorunlu
                    </Badge>
                  </div>
                  <div className="space-y-5 max-w-2xl mx-auto bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg">
                  {fields.map((field, index) => (
                    <div key={index} className="space-y-2">
                      <Label className="text-sm font-semibold flex items-center gap-2">
                        {React.createElement(fieldTypes[field.field_type as keyof typeof fieldTypes]?.icon || FileText, {
                          className: "h-4 w-4 text-gray-600"
                        })}
                        {field.field_label}
                        {field.required && <span className="text-red-500">*</span>}
                      </Label>
                      {field.field_type === 'textarea' ? (
                        <Textarea placeholder={`${field.field_label} giriniz...`} disabled className="resize-none" />
                      ) : field.field_type === 'select' ? (
                        <Select disabled>
                          <SelectTrigger>
                            <SelectValue placeholder="Seçiniz..." />
                          </SelectTrigger>
                        </Select>
                      ) : field.field_type === 'radio' && field.options ? (
                        <div className="space-y-2 pl-2">
                          {field.options.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50">
                              <input type="radio" disabled className="w-4 h-4" />
                              <span className="text-sm">{option}</span>
                            </div>
                          ))}
                        </div>
                      ) : field.field_type === 'checkbox' && field.options ? (
                        <div className="space-y-2 pl-2">
                          {field.options.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50">
                              <input type="checkbox" disabled className="w-4 h-4" />
                              <span className="text-sm">{option}</span>
                            </div>
                          ))}
                        </div>
                      ) : field.field_type === 'file' ? (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                          <FileImage className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">Dosya seçin veya sürükleyip bırakın</p>
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
                    <Button disabled className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12">
                      <Users className="h-4 w-4 mr-2" />
                      Kayıt Ol
                    </Button>
                </div>
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                    <p className="text-xs text-yellow-800 dark:text-yellow-300 text-center flex items-center justify-center gap-2">
                      <Eye className="h-3 w-3" />
                      Bu sadece önizleme - gerçek form etkinlik sayfasında kullanıcılara gösterilecek
                    </p>
                  </div>
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