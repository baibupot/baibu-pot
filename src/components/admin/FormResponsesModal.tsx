import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Users, FileImage, Eye, Maximize2, Image, ExternalLink, Trash2, AlertTriangle } from 'lucide-react';
import { useFormFields, useFormResponses, useDeleteFormResponse } from '@/hooks/useSupabaseData';
import { exportToExcel, formatFormResponsesForExcel } from '@/utils/excelExport';
import { toast } from 'sonner';

// 🔒 File helper functions
const downloadBase64File = (base64Data: string, fileName: string) => {
  try {
    const link = document.createElement('a');
    link.href = base64Data;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`📥 ${fileName} indirildi`);
  } catch (error) {
    toast.error('❌ Dosya indirilemedi');
    console.error('File download error:', error);
  }
};

const openBase64FileInNewTab = (base64Data: string, fileName: string) => {
  try {
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head><title>${fileName}</title></head>
          <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f5f5f5;">
            <img src="${base64Data}" style="max-width:100%;max-height:100%;object-fit:contain;" alt="${fileName}" />
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  } catch (error) {
    toast.error('❌ Dosya görüntülenemedi');
    console.error('File preview error:', error);
  }
};

const getFileIcon = (fileName: string) => {
  const extension = fileName?.split('.').pop()?.toLowerCase();
  const fileIcons = {
    pdf: '📄', doc: '📝', docx: '📝', txt: '📃',
    jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️', svg: '🖼️',
    mp4: '🎥', avi: '🎥', mov: '🎥', mkv: '🎥',
    mp3: '🎵', wav: '🎵', flac: '🎵',
    zip: '📦', rar: '📦', '7z': '📦'
  };
  return fileIcons[extension as keyof typeof fileIcons] || '📎';
};

interface FormResponsesModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
}

const FormResponsesModal: React.FC<FormResponsesModalProps> = ({
  isOpen,
  onClose,
  eventId,
  eventTitle
}) => {
  const { data: existingFields } = useFormFields(eventId, 'event_registration');
  const { data: formResponses = [] } = useFormResponses(eventId, 'event_registration');
  const deleteFormResponse = useDeleteFormResponse();
  
  // 🖼️ Image preview modal state
  const [previewImage, setPreviewImage] = useState<{src: string, name: string} | null>(null);
  
  // 🗑️ Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{id: string, name: string} | null>(null);

  // 🎨 Helper function to check if file is image
  const isImageFile = (fileName: string) => {
    const extension = fileName?.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension || '');
  };

  // 📋 Get all unique form fields for table headers
  const getAllFormFields = () => {
    const fieldSet = new Set<string>();
    formResponses.forEach(response => {
      Object.keys(response.response_data).forEach(key => {
        if (!key.endsWith('_file')) {
          fieldSet.add(key);
        }
      });
    });
    return Array.from(fieldSet);
  };

  const exportResponses = () => {
    if (formResponses.length === 0) {
      toast.error('❌ Dışa aktarılacak yanıt bulunamadı');
      return;
    }

    try {
      const formattedData = formatFormResponsesForExcel(formResponses, existingFields || []);
      const now = new Date();
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const filename = `${eventTitle}_yanitlari_${dateStr}`;
      exportToExcel(formattedData, filename);
      toast.success('🎉 Excel dosyası başarıyla indirildi! Dosya ve dosya bilgileri dahil edildi.');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('❌ Dosya indirme sırasında hata oluştu');
    }
  };

  // 🗑️ Handle delete response
  const handleDeleteResponse = async (id: string) => {
    try {
      await deleteFormResponse.mutateAsync(id);
      toast.success('✅ Kayıt başarıyla silindi');
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('❌ Kayıt silinirken hata oluştu');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto" aria-describedby="responses-description">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            {eventTitle} - Kayıt Yanıtları
          </DialogTitle>
          <DialogDescription id="responses-description">
            Bu etkinlik için alınan kayıt yanıtlarını görüntüleyin ve yönetin.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5" />
                Etkinlik Kayıtları
              </h3>
              <p className="text-sm text-muted-foreground">
                {formResponses.length} kayıt alındı
              </p>
            </div>
            <Button
              type="button"
              onClick={exportResponses}
              disabled={formResponses.length === 0}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <Download className="h-4 w-4 mr-2" />
              Excel'e Aktar
            </Button>
          </div>

          {/* Content */}
          {formResponses.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold mb-2">Henüz kayıt yok</h4>
                <p className="text-muted-foreground">
                  Bu etkinlik için henüz kimse kayıt olmamış
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* 📊 İstatistik Kartları */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{formResponses.length}</div>
                  <div className="text-sm text-muted-foreground">Toplam Kayıt</div>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-sm font-medium">
                    {formResponses.length > 0 ? new Date(formResponses[0]?.submitted_at).toLocaleDateString('tr-TR') : '-'}
                  </div>
                  <div className="text-sm text-muted-foreground">Son Kayıt</div>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-sm font-medium">
                    {formResponses.length > 0 ? new Date(formResponses[0]?.submitted_at).toLocaleTimeString('tr-TR') : '-'}
                  </div>
                  <div className="text-sm text-muted-foreground">Son Kayıt Saati</div>
                </div>
              </div>

              {/* 📋 Tablo */}
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="sticky left-0 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300 border-r">#</th>
                          <th className="sticky left-10 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300 border-r min-w-[150px]">Katılımcı</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300 min-w-[120px]">Kayıt Tarihi</th>
                          {getAllFormFields().map(field => (
                            <th key={field} className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300 min-w-[100px]">
                              {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </th>
                          ))}
                          <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Dosyalar</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300 w-20">İşlemler</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formResponses.map((response, index) => {
                          const fileFields = existingFields?.filter(field => field.field_type === 'file') || [];
                          const responseFiles = fileFields.map(field => ({
                            fieldName: field.field_name,
                            fieldLabel: field.field_label,
                            fileName: response.response_data[field.field_name],
                            base64Data: response.response_data[`${field.field_name}_file`]
                          })).filter(file => file.fileName && file.base64Data);

                          return (
                            <tr key={response.id} className="border-t hover:bg-gray-50 dark:hover:bg-gray-700/50">
                              {/* Sıra No */}
                              <td className="sticky left-0 bg-white dark:bg-gray-900 px-4 py-3 border-r">
                                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                                  {index + 1}
                                </div>
                              </td>
                              
                              {/* Katılımcı */}
                              <td className="sticky left-10 bg-white dark:bg-gray-900 px-4 py-3 border-r">
                                 <div className="font-medium text-gray-900 dark:text-gray-100">
                                  {response.user_name || 'Anonim'}
                                </div>
                              </td>
                              
                              {/* Kayıt Tarihi */}
                              <td className="px-4 py-3">
                                <div className="text-gray-900 dark:text-gray-100">
                                  {new Date(response.submitted_at).toLocaleDateString('tr-TR')}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(response.submitted_at).toLocaleTimeString('tr-TR')}
                                </div>
                              </td>
                              
                              {/* Form Alanları */}
                              {getAllFormFields().map(field => (
                                <td key={field} className="px-4 py-3">
                                  <div className="text-gray-900 dark:text-gray-100 truncate max-w-[200px]" title={
                                    Array.isArray(response.response_data[field]) 
                                      ? response.response_data[field]?.join(', ') 
                                      : String(response.response_data[field] || '')
                                  }>
                                    {Array.isArray(response.response_data[field]) 
                                      ? response.response_data[field]?.join(', ') 
                                      : String(response.response_data[field] || '-')}
                                  </div>
                                </td>
                              ))}
                              
                              {/* Dosyalar */}
                              <td className="px-4 py-3">
                                {responseFiles.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {responseFiles.map((file, fileIndex) => (
                                      <div key={fileIndex} className="flex items-center gap-1">
                                        {isImageFile(file.fileName) ? (
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setPreviewImage({src: file.base64Data, name: file.fileName})}
                                            className="h-8 w-8 p-0 hover:bg-blue-100"
                                            title={`${file.fieldLabel}: ${file.fileName}`}
                                          >
                                            <Image className="h-4 w-4 text-blue-600" />
                                          </Button>
                                        ) : (
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => openBase64FileInNewTab(file.base64Data, file.fileName)}
                                            className="h-8 w-8 p-0 hover:bg-green-100"
                                            title={`${file.fieldLabel}: ${file.fileName}`}
                                          >
                                            <span className="text-sm">{getFileIcon(file.fileName)}</span>
                                          </Button>
                                        )}
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => downloadBase64File(file.base64Data, file.fileName)}
                                          className="h-8 w-8 p-0 hover:bg-purple-100"
                                          title={`İndir: ${file.fileName}`}
                                        >
                                          <Download className="h-3 w-3 text-purple-600" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>

                              {/* İşlemler */}
                              <td className="px-4 py-3">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeleteConfirm({
                                    id: response.id, 
                                    name: response.user_name || 'Anonim'
                                  })}
                                  className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                                  title="Kayıt Sil"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* 🖼️ Görüntü Önizleme Modali */}
        {previewImage && (
          <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
            <DialogContent className="max-w-4xl max-h-[95vh] p-0" aria-describedby="image-preview-description">
              <DialogHeader className="p-6 pb-0">
                <DialogTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Görüntü Önizleme
                </DialogTitle>
                <DialogDescription id="image-preview-description">
                  {previewImage.name}
                </DialogDescription>
              </DialogHeader>
              <div className="p-6 flex items-center justify-center min-h-[400px] bg-gray-50 dark:bg-gray-800">
                <img 
                  src={previewImage.src} 
                  alt={previewImage.name}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                />
              </div>
              <div className="p-6 pt-0 flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => openBase64FileInNewTab(previewImage.src, previewImage.name)}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Yeni Sekmede Aç
                </Button>
                <Button
                  type="button"
                  onClick={() => downloadBase64File(previewImage.src, previewImage.name)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  İndir
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* 🗑️ Silme Onayı Modali */}
        {deleteConfirm && (
          <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
            <DialogContent className="max-w-md" aria-describedby="delete-confirm-description">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Kayıt Silinsin Mi?
                </DialogTitle>
                <DialogDescription id="delete-confirm-description">
                  Bu işlem geri alınamaz. Kayıt kalıcı olarak silinecektir.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-red-600" />
                    <span className="font-medium text-red-800 dark:text-red-300">
                      {deleteConfirm.name}
                    </span>
                  </div>
                  <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                    Bu katılımcının kaydı ve tüm form bilgileri silinecek
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1"
                  >
                    İptal
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => handleDeleteResponse(deleteConfirm.id)}
                    disabled={deleteFormResponse.isPending}
                    className="flex-1"
                  >
                    {deleteFormResponse.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Siliniyor...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Sil
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FormResponsesModal; 