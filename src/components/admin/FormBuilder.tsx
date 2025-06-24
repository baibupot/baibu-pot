import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus, MoveUp, MoveDown, Download, Users, Eye, FileText, Settings, Clock, FileImage, ExternalLink } from 'lucide-react';
import { useCreateFormField, useFormFields, useFormResponses } from '@/hooks/useSupabaseData';
import { exportToExcel, formatFormResponsesForExcel } from '@/utils/excelExport';
import { toast } from 'sonner';

// 🔒 Admin file utilities - Güvenli dekont görüntüleme
const downloadBase64File = (base64Data: string, fileName: string) => {
  try {
    const link = document.createElement('a');
    link.href = base64Data;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`📎 ${fileName} başarıyla indirildi`);
  } catch (error) {
    toast.error('❌ Dosya indirilemedi');
    console.error('Download error:', error);
  }
};

const openBase64FileInNewTab = (base64Data: string, fileName: string) => {
  try {
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>${fileName}</title>
            <style>
              body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
              img { max-width: 100%; height: auto; }
              .header { background: #f5f5f5; padding: 10px; margin-bottom: 20px; border-radius: 5px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h3>📎 ${fileName}</h3>
              <button onclick="window.print()">🖨️ Yazdır</button>
              <button onclick="window.close()">❌ Kapat</button>
            </div>
            ${base64Data.startsWith('data:image/') 
              ? `<img src="${base64Data}" alt="${fileName}" />` 
              : `<iframe src="${base64Data}" width="100%" height="600px"></iframe>`
            }
          </body>
        </html>
      `);
    }
  } catch (error) {
    toast.error('❌ Dosya açılamadı');
    console.error('Preview error:', error);
  }
};

const getFileIcon = (fileName: string) => {
  const ext = fileName?.toLowerCase().split('.').pop();
  switch (ext) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return '🖼️';
    case 'pdf':
      return '📄';
    case 'doc':
    case 'docx':
      return '📝';
    default:
      return '📎';
  }
};

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

  // Alan türü bilgileri
  const fieldTypes = {
    text: { emoji: '📝', name: 'Kısa Metin', desc: 'Ad, soyad gibi kısa bilgiler için' },
    email: { emoji: '📧', name: 'E-posta', desc: 'E-posta adresi için (otomatik doğrulama)' },
    number: { emoji: '🔢', name: 'Sayı', desc: 'Yaş, miktar gibi sayısal değerler için' },
    tel: { emoji: '📱', name: 'Telefon', desc: 'Telefon numarası için' },
    textarea: { emoji: '📄', name: 'Uzun Metin', desc: 'Mesaj, açıklama gibi uzun metinler için' },
    select: { emoji: '📋', name: 'Açılır Liste', desc: 'Seçeneklerden birini seçebilir' },
    radio: { emoji: '🔘', name: 'Tekli Seçim', desc: 'Seçeneklerden sadece birini seçebilir' },
    checkbox: { emoji: '☑️', name: 'Çoklu Seçim', desc: 'Birden fazla seçenek seçilebilir' },
    file: { emoji: '📎', name: 'Dosya Yükleme', desc: 'CV, belge vs. dosya yükleyebilir' },
    date: { emoji: '📅', name: 'Tarih', desc: 'Doğum tarihi gibi tarih seçimi için' }
  };

  const addField = () => {
    if (!newField.field_label.trim()) {
      toast.error('❌ Lütfen alan adını giriniz');
      return;
    }

    if (['select', 'radio', 'checkbox'].includes(newField.field_type) && !options.trim()) {
      toast.error('❌ Bu alan türü için seçenekler girmelisiniz');
      return;
    }

    // Otomatik değişken adı oluştur
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
    toast.success('✅ Alan başarıyla eklendi!');
  };

  const removeField = (index: number) => {
    const newFields = fields.filter((_, i) => i !== index);
    setFields(newFields.map((field, i) => ({ ...field, sort_order: i })));
    toast.success('🗑️ Alan kaldırıldı');
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newFields = [...fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newFields.length) {
      [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
      setFields(newFields.map((field, i) => ({ ...field, sort_order: i })));
      toast.success(`⬆️ Alan ${direction === 'up' ? 'yukarı' : 'aşağı'} taşındı`);
    }
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
        toast.success(`🎉 ${savedCount} alan başarıyla kaydedildi! Form artık kullanıma hazır.`);
        // Modal kapatma sorununu çözmek için sayfa yenilemeyi kaldırdık
        // Bunun yerine react-query cache'ini yenileyelim
      } else {
        toast.info('ℹ️ Tüm alanlar zaten kaydedilmiş - form kullanıma hazır');
      }
      
      onSave?.();
    } catch (error) {
      console.error('Error saving form:', error);
      toast.error('❌ Form kaydedilirken hata oluştu: ' + (error as any)?.message);
    }
  };

  const exportResponses = () => {
    if (formResponses.length === 0) {
      toast.error('❌ Dışa aktarılacak yanıt bulunamadı');
      return;
    }

    const formattedData = formatFormResponsesForExcel(formResponses);
    const filename = `${formTitle || formType}_yanitlari_${new Date().toLocaleDateString('tr-TR')}`;
    exportToExcel(formattedData, filename);
    toast.success('📊 Yanıtlar Excel dosyası olarak indirildi!');
  };

  return (
    <div className="space-y-8">
      {/* FORM YANITLARI - Öncelikli Bölüm */}
      {existingFields && existingFields.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 p-8 rounded-2xl border-2 border-blue-200 dark:border-blue-700 shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div className="flex items-center gap-3 mb-4 lg:mb-0">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-blue-800 dark:text-blue-300">
                  📋 Etkinlik Kayıtları
                </h3>
                <p className="text-blue-600 dark:text-blue-400">Bu etkinlik için gelen form yanıtları</p>
              </div>
            </div>
              <Button
              type="button"
                onClick={exportResponses}
                disabled={formResponses.length === 0}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
              >
              <Download className="mr-2 h-5 w-5" />
              Excel'e Aktar ({formResponses.length})
              </Button>
          </div>

            {formResponses.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-blue-300 dark:border-blue-600">
              <div className="text-8xl mb-4">📝</div>
              <h4 className="text-xl font-semibold text-blue-800 dark:text-blue-300 mb-2">
                Henüz kayıt bulunmuyor
              </h4>
              <p className="text-blue-600 dark:text-blue-400 max-w-md mx-auto">
                Form alanlarını oluşturduktan sonra katılımcılar bu formla etkinliğinize kayıt olabilir
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* İstatistikler */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <span className="text-xl">📊</span>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{formResponses.length}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Toplam Kayıt</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <span className="text-xl">📅</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-green-600">
                        {formResponses.length > 0 ? new Date(formResponses[0]?.submitted_at).toLocaleDateString('tr-TR') : '-'}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Son Kayıt Tarihi</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <Clock className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-purple-600">
                        {formResponses.length > 0 ? new Date(formResponses[0]?.submitted_at).toLocaleTimeString('tr-TR') : '-'}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Son Kayıt Saati</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Son Kayıtlar */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm">
                <h4 className="font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <span className="text-xl">👥</span>
                  Son Kayıt Olanlar
                </h4>
                <div className="space-y-3">
                  {formResponses.slice(0, 5).map((response, index) => {
                    // 🔒 File fields'ları tespit et
                    const fileFields = existingFields?.filter(field => field.field_type === 'file') || [];
                    const responseFiles = fileFields.map(field => ({
                      fieldName: field.field_name,
                      fieldLabel: field.field_label,
                      fileName: response.response_data[field.field_name],
                      base64Data: response.response_data[`${field.field_name}_file`]
                    })).filter(file => file.fileName && file.base64Data);

                    return (
                      <div key={response.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                        {/* Kullanıcı Bilgileri */}
                        <div className="flex items-center gap-4 mb-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {response.user_name || 'Anonim Kullanıcı'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {response.user_email || 'E-posta belirtilmemiş'}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                              {new Date(response.submitted_at).toLocaleDateString('tr-TR')}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(response.submitted_at).toLocaleTimeString('tr-TR')}
                            </div>
                          </div>
                        </div>

                        {/* 🔒 File Attachments - Güvenli Dekont Görüntüleme */}
                        {responseFiles.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                            <div className="flex items-center gap-2 mb-2">
                              <FileImage className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                📎 Yüklenen Dosyalar ({responseFiles.length})
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {responseFiles.map((file, fileIndex) => (
                                <div key={fileIndex} className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded border">
                                  <span className="text-lg">{getFileIcon(file.fileName)}</span>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">
                                      {file.fieldLabel}
                                    </div>
                                    <div className="text-sm text-gray-900 dark:text-gray-100 truncate">
                                      {file.fileName}
                                    </div>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => openBase64FileInNewTab(file.base64Data, file.fileName)}
                                      className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                      title="Dosyayı Görüntüle"
                                    >
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => downloadBase64File(file.base64Data, file.fileName)}
                                      className="h-8 w-8 p-0 hover:bg-green-50 dark:hover:bg-green-900/20"
                                      title="Dosyayı İndir"
                                    >
                                      <Download className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {formResponses.length > 5 && (
                  <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    +{formResponses.length - 5} kayıt daha var
                  </div>
                )}
              </div>
              </div>
            )}
        </div>
      )}

      {/* YENİ ALAN EKLEME BÖLÜMÜ */}
      <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/10 dark:to-green-900/10 p-8 rounded-2xl border border-emerald-200 dark:border-emerald-700 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-md">
            <Plus className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-emerald-800 dark:text-emerald-300">
              ➕ Yeni Form Alanı Ekle
            </h3>
            <p className="text-emerald-600 dark:text-emerald-400">Katılımcılardan hangi bilgileri almak istiyorsunuz?</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm space-y-6">
          {/* Alan Türü Seçimi */}
            <div>
            <Label className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 block">
              🎯 Alan Türünü Seçin
            </Label>
              <Select value={newField.field_type} onValueChange={(value) => setNewField(prev => ({ ...prev, field_type: value }))}>
              <SelectTrigger className="h-14 text-base">
                <SelectValue placeholder="Hangi tür bilgi almak istiyorsunuz?" />
                </SelectTrigger>
              <SelectContent className="max-h-80">
                {Object.entries(fieldTypes).map(([key, type]) => (
                  <SelectItem key={key} value={key} className="p-4 cursor-pointer">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{type.emoji}</span>
                      <div>
                        <div className="font-medium">{type.name}</div>
                        <div className="text-sm text-gray-500">{type.desc}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
                </SelectContent>
              </Select>
            {newField.field_type && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <span className="text-xl">{fieldTypes[newField.field_type as keyof typeof fieldTypes]?.emoji}</span>
                  <span className="font-medium">
                    Seçili: {fieldTypes[newField.field_type as keyof typeof fieldTypes]?.name}
                  </span>
            </div>
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                  {fieldTypes[newField.field_type as keyof typeof fieldTypes]?.desc}
                </p>
            </div>
            )}
          </div>

          {/* Alan Adı */}
          <div>
            <Label htmlFor="field_label" className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 block">
              📝 Alan Adı (Katılımcıların göreceği isim)
            </Label>
            <Input
              id="field_label"
              value={newField.field_label}
              onChange={(e) => setNewField(prev => ({ ...prev, field_label: e.target.value }))}
              placeholder="Örnek: Ad Soyad, Telefon Numarası, Meslek, Doğum Tarihi..."
              className="h-12 text-base"
            />

          </div>

          {/* Seçenekler (eğer gerekirse) */}
          {['select', 'radio', 'checkbox'].includes(newField.field_type) && (
            <div>
              <Label htmlFor="options" className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 block">
                📋 Seçenekler (Her satıra bir seçenek yazın)
              </Label>
              <Textarea
                id="options"
                value={options}
                onChange={(e) => setOptions(e.target.value)}
                placeholder="Örnek:&#10;Seçenek 1&#10;Seçenek 2&#10;Seçenek 3&#10;&#10;Her satıra bir seçenek yazın..."
                rows={4}
                className="text-base"
              />
              {options && (
                <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 mb-2">
                    <span>👀</span>
                    <span className="font-medium">Önizleme:</span>
                  </div>
                  <div className="space-y-1">
                    {options.split('\n').filter(opt => opt.trim()).map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {index + 1}
                        </Badge>
                        <span className="text-sm">{option.trim()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Zorunlu Alan Switchi */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Switch
              id="required"
              checked={newField.required}
              onCheckedChange={(checked) => setNewField(prev => ({ ...prev, required: checked }))}
            />
            <div className="flex-1">
              <Label htmlFor="required" className="text-base font-medium cursor-pointer">
                ⚠️ Zorunlu Alan
              </Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Katılımcılar bu alanı doldurmak zorunda olsun mu?
              </p>
            </div>
          </div>

          {/* Alan Ekleme Butonu */}
          <Button 
            type="button" 
            onClick={addField} 
            size="lg"
            className="w-full h-14 text-lg bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg"
            disabled={!newField.field_label.trim()}
          >
            <Plus className="mr-3 h-6 w-6" />
            Alan Ekle
          </Button>
        </div>
      </div>

      {/* FORM KAYDET BÖLÜMÜ - ÖNEMLİ! */}
      {fields.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 p-8 rounded-2xl border-2 border-green-200 dark:border-green-700 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-md">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-green-800 dark:text-green-300">
                💾 Form Alanlarını Kaydet
              </h3>
              <p className="text-green-600 dark:text-green-400">
                Eklediğiniz {fields.length} alanı veritabanına kaydedin
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
                  ⚠️ <span className="font-semibold">Önemli:</span> Eklediğiniz form alanları henüz kaydedilmedi. 
                  Katılımcıların bu alanları görebilmesi için <span className="font-semibold text-green-600">mutlaka kaydedin!</span>
                </p>
              </div>
            </div>
            
            <Button 
              type="button" 
              onClick={saveForm} 
              size="lg"
              className="w-full h-16 text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-xl"
              disabled={createFormField.isPending}
            >
              {createFormField.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Settings className="mr-3 h-6 w-6" />
                  💾 Form Alanlarını Kaydet ({fields.filter(f => !f.id).length} yeni alan)
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* FORM ALANLARI LİSTESİ */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 p-8 rounded-2xl border border-purple-200 dark:border-purple-700 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div className="flex items-center gap-3 mb-4 lg:mb-0">
            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center shadow-md">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-purple-800 dark:text-purple-300">
                📝 Form Alanları
              </h3>
              <p className="text-purple-600 dark:text-purple-400">
                {fields.length > 0 ? `${fields.length} alan eklendi` : 'Henüz alan eklenmemiş'}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            disabled={fields.length === 0}
            className="border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-400 dark:hover:bg-purple-900/20"
          >
            <Eye className="mr-2 h-4 w-4" />
            {showPreview ? 'Önizlemeyi Gizle' : 'Form Önizlemesi'}
          </Button>
        </div>

          {fields.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-purple-300 dark:border-purple-600">
            <div className="text-8xl mb-4">📋</div>
            <h4 className="text-xl font-semibold text-purple-800 dark:text-purple-300 mb-2">
              Henüz form alanı eklenmemiş
            </h4>
            <p className="text-purple-600 dark:text-purple-400 max-w-md mx-auto">
              Yukarıdaki "Yeni Form Alanı Ekle" bölümünden katılımcılardan almak istediğiniz bilgileri tanımlayın
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Form Alanları Listesi */}
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{fieldTypes[field.field_type as keyof typeof fieldTypes]?.emoji}</span>
                        <div>
                          <div className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                            {field.field_label}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <Badge variant="secondary">
                              {fieldTypes[field.field_type as keyof typeof fieldTypes]?.name}
                            </Badge>
                            <Badge variant="outline" className="font-mono text-xs">
                              {field.field_name}
                            </Badge>
                            {field.required && (
                              <Badge variant="destructive" className="text-xs">
                                ⚠️ Zorunlu
                              </Badge>
                            )}
                          </div>
                    </div>
                    </div>
                    {field.options && field.options.length > 0 && (
                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Seçenekler:</div>
                          <div className="flex flex-wrap gap-1">
                            {field.options.map((option, optIndex) => (
                              <Badge key={optIndex} variant="outline" className="text-xs">
                                {option}
                              </Badge>
                            ))}
                          </div>
                      </div>
                    )}
                  </div>
                                        <div className="flex items-center gap-2">
                    <Button
                        type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => moveField(index, 'up')}
                      disabled={index === 0}
                        className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      <MoveUp className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => moveField(index, 'down')}
                      disabled={index === fields.length - 1}
                        className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      <MoveDown className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeField(index)}
                        className="hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Form Önizlemesi */}
            {showPreview && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border-2 border-dashed border-purple-300 dark:border-purple-600">
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <Eye className="h-5 w-5" />
                  👀 Form Önizlemesi
                </h4>
                <div className="space-y-4 max-w-md">
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
                  <Button disabled className="w-full mt-6">
                    Kayıt Ol
            </Button>
                </div>
                <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                  ℹ️ Bu sadece önizleme - gerçek form etkinlik sayfasında görünecek
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormBuilder;
