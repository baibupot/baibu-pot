import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, FileText, Package, Calendar, User, Mail, Phone, GraduationCap } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Tables = Database['public']['Tables'];
type ProductDesignRequest = Tables['product_design_requests']['Row'];

interface ProductDesignRequestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ProductDesignRequest | null;
}

const ProductDesignRequestDetailModal: React.FC<ProductDesignRequestDetailModalProps> = ({
  isOpen,
  onClose,
  request
}) => {
  if (!request) return null;

  const getCategoryColor = (category: string) => {
    const colors = {
      'kirtasiye': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'giyim': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'aksesuar': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
      'diger': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
    };
    return colors[category as keyof typeof colors] || colors.diger;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      'under_review': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      'approved': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      'in_design': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      'rejected': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      'completed': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'pending': '⏳ Beklemede',
      'under_review': '🔍 İnceleme Altında',
      'approved': '✅ Onaylandı',
      'in_design': '🎨 Tasarımda',
      'rejected': '❌ Reddedildi',
      'completed': '🎉 Tamamlandı'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      'kirtasiye': 'Kırtasiye',
      'giyim': 'Giyim',
      'aksesuar': 'Aksesuar',
      'diger': 'Diğer'
    };
    return labels[category as keyof typeof labels] || category;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Eye className="h-5 w-5" />
            🎨 Tasarım Talebi Detayları
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {/* Temel Bilgiler */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
              <Package className="h-5 w-5" />
              📝 Temel Bilgiler
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-blue-600 dark:text-blue-400">Tasarım Başlığı</label>
                <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">{request.design_title}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-blue-600 dark:text-blue-400">Kategori</label>
                <Badge className={getCategoryColor(request.product_category)}>
                  {getCategoryLabel(request.product_category)}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-blue-600 dark:text-blue-400">Durum</label>
                <Badge className={getStatusColor(request.status)}>
                  {getStatusLabel(request.status)}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-blue-600 dark:text-blue-400">Talep Tarihi</label>
                <p className="text-lg text-blue-900 dark:text-blue-100">
                  {new Date(request.created_at).toLocaleDateString('tr-TR')}
                </p>
              </div>
              {request.deadline_date && (
                <div>
                  <label className="text-sm font-medium text-blue-600 dark:text-blue-400">Son Teslim Tarihi</label>
                  <p className="text-lg text-blue-900 dark:text-blue-100">
                    {new Date(request.deadline_date).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              )}
              {request.priority_level && (
                <div>
                  <label className="text-sm font-medium text-blue-600 dark:text-blue-400">Öncelik</label>
                  <Badge variant="outline" className="capitalize">
                    {request.priority_level}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Tasarım Açıklaması */}
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-gray-300 mb-3">📖 Tasarım Açıklaması</h3>
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{request.design_description}</p>
            </div>
          </div>

          {/* Bütçe ve Miktar */}
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <h3 className="font-semibold text-green-800 dark:text-green-300 mb-3">💰 Bütçe ve Miktar</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {request.target_price_min && (
                <div>
                  <label className="text-sm font-medium text-green-600 dark:text-green-400">Minimum Fiyat</label>
                  <p className="text-lg text-green-900 dark:text-green-100">
                    {request.target_price_min} {request.currency}
                  </p>
                </div>
              )}
              {request.target_price_max && (
                <div>
                  <label className="text-sm font-medium text-green-600 dark:text-green-400">Maksimum Fiyat</label>
                  <p className="text-lg text-green-900 dark:text-green-100">
                    {request.target_price_max} {request.currency}
                  </p>
                </div>
              )}
              {request.quantity_needed && (
                <div>
                  <label className="text-sm font-medium text-green-600 dark:text-green-400">Adet</label>
                  <p className="text-lg text-green-900 dark:text-green-100">
                    {request.quantity_needed} adet
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Tasarım Tercihleri */}
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
            <h3 className="font-semibold text-purple-800 dark:text-purple-300 mb-3">🎨 Tasarım Tercihleri</h3>
            <div className="space-y-4">
              {request.usage_purpose && (
                <div>
                  <label className="text-sm font-medium text-purple-600 dark:text-purple-400">Kullanım Amacı</label>
                  <p className="text-purple-900 dark:text-purple-100">{request.usage_purpose}</p>
                </div>
              )}
              
              {request.color_preferences && request.color_preferences.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-purple-600 dark:text-purple-400">Renk Tercihleri</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {request.color_preferences.map((color, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        🌈 {color}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {request.size_preferences && request.size_preferences.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-purple-600 dark:text-purple-400">Boyut Tercihleri</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {request.size_preferences.map((size, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        📏 {size}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {request.design_preferences && (
                <div>
                  <label className="text-sm font-medium text-purple-600 dark:text-purple-400">Tasarım Detayları</label>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border mt-1">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{request.design_preferences}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* İletişim Bilgileri */}
          <div className="bg-cyan-50 dark:bg-cyan-900/20 p-4 rounded-lg border border-cyan-200 dark:border-cyan-800">
            <h3 className="font-semibold text-cyan-800 dark:text-cyan-300 mb-3 flex items-center gap-2">
              <User className="h-5 w-5" />
              👤 İletişim Bilgileri
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-cyan-600" />
                <div>
                  <label className="text-sm font-medium text-cyan-600 dark:text-cyan-400">Ad Soyad</label>
                  <p className="text-cyan-900 dark:text-cyan-100">{request.contact_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-cyan-600" />
                <div>
                  <label className="text-sm font-medium text-cyan-600 dark:text-cyan-400">E-posta</label>
                  <p className="text-cyan-900 dark:text-cyan-100">{request.contact_email}</p>
                </div>
              </div>
              {request.contact_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-cyan-600" />
                  <div>
                    <label className="text-sm font-medium text-cyan-600 dark:text-cyan-400">Telefon</label>
                    <p className="text-cyan-900 dark:text-cyan-100">{request.contact_phone}</p>
                  </div>
                </div>
              )}
              {request.contact_student_number && (
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-cyan-600" />
                  <div>
                    <label className="text-sm font-medium text-cyan-600 dark:text-cyan-400">Öğrenci No</label>
                    <p className="text-cyan-900 dark:text-cyan-100">{request.contact_student_number}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* İlham Görselleri */}
          {request.inspiration_images && request.inspiration_images.length > 0 && (
            <div className="bg-pink-50 dark:bg-pink-900/20 p-4 rounded-lg border border-pink-200 dark:border-pink-800">
              <h3 className="font-semibold text-pink-800 dark:text-pink-300 mb-3">📸 İlham Görselleri</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {request.inspiration_images.map((imageUrl, index) => (
                  <div key={index} className="group relative">
                    <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-pink-200 dark:border-pink-700">
                      <img
                        src={imageUrl}
                        alt={`İlham görseli ${index + 1}`}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        onError={(e) => {
                          // Fallback image
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />
                    </div>
                    {/* Click to view larger */}
                    <button
                      onClick={() => window.open(imageUrl, '_blank')}
                      className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100"
                      title="Büyük görüntüle"
                    >
                      <Eye className="h-6 w-6 text-white drop-shadow-lg" />
                    </button>
                    <div className="absolute bottom-1 left-1 right-1 bg-black/60 text-white text-xs p-1 rounded text-center">
                      İlham {index + 1}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-pink-600 dark:text-pink-400 mt-2">
                💡 Resimlere tıklayarak büyük görüntüleyebilirsiniz
              </p>
            </div>
          )}

          {/* Özel Gereksinimler */}
          {(request.special_requirements || request.additional_notes) && (
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
              <h3 className="font-semibold text-orange-800 dark:text-orange-300 mb-3">📋 Özel Gereksinimler & Notlar</h3>
              <div className="space-y-3">
                {request.special_requirements && (
                  <div>
                    <label className="text-sm font-medium text-orange-600 dark:text-orange-400">Özel Gereksinimler</label>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border mt-1">
                      <p className="text-sm leading-relaxed">{request.special_requirements}</p>
                    </div>
                  </div>
                )}
                {request.additional_notes && (
                  <div>
                    <label className="text-sm font-medium text-orange-600 dark:text-orange-400">Ek Notlar</label>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border mt-1">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{request.additional_notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* İnceleme Bilgileri */}
          {(request.reviewer_notes || request.reviewed_at || request.estimated_cost || request.estimated_time_days) && (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <h3 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-3">🔍 İnceleme Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {request.reviewed_at && (
                  <div>
                    <label className="text-sm font-medium text-indigo-600 dark:text-indigo-400">İnceleme Tarihi</label>
                    <p className="text-indigo-900 dark:text-indigo-100">
                      {new Date(request.reviewed_at).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                )}
                {request.estimated_cost && (
                  <div>
                    <label className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Tahmini Maliyet</label>
                    <p className="text-indigo-900 dark:text-indigo-100">
                      {request.estimated_cost} {request.currency}
                    </p>
                  </div>
                )}
                {request.estimated_time_days && (
                  <div>
                    <label className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Tahmini Süre</label>
                    <p className="text-indigo-900 dark:text-indigo-100">
                      {request.estimated_time_days} gün
                    </p>
                  </div>
                )}
              </div>
              {request.reviewer_notes && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-indigo-600 dark:text-indigo-400">İnceleme Notları</label>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border mt-1">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{request.reviewer_notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              ❌ Kapat
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDesignRequestDetailModal; 