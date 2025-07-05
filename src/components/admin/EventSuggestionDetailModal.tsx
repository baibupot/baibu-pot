import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  User, 
  Mail, 
  Phone, 
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  Building2,
  Target
} from 'lucide-react';
import { EVENT_TYPES } from '@/constants/eventConstants';

interface EventSuggestionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestion: any;
  onStatusChange?: (id: string, status: 'approved' | 'rejected') => Promise<void>;
}

const EventSuggestionDetailModal = ({ 
  isOpen, 
  onClose, 
  suggestion, 
  onStatusChange 
}: EventSuggestionDetailModalProps) => {
  if (!suggestion) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'under_review': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'implemented': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'under_review': return <MessageSquare className="h-4 w-4" />;
      case 'implemented': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    const colors = {
      'atolye': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
      'konferans': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'sosyal': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      'egitim': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'seminer': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
    };
    return colors[type as keyof typeof colors] || colors.seminer;
  };

  const handleStatusChange = async (status: 'approved' | 'rejected') => {
    if (onStatusChange) {
      await onStatusChange(suggestion.id, status);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Etkinlik Önerisi Detayı
              </DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getStatusColor(suggestion.status)}>
                  {getStatusIcon(suggestion.status)}
                  <span className="ml-1 capitalize">
                    {suggestion.status === 'pending' && 'Beklemede'}
                    {suggestion.status === 'approved' && 'Onaylandı'}
                    {suggestion.status === 'rejected' && 'Reddedildi'}
                    {suggestion.status === 'under_review' && 'İncelemede'}
                    {suggestion.status === 'implemented' && 'Uygulandı'}
                  </span>
                </Badge>
                <span className="text-sm text-gray-500">
                  {new Date(suggestion.created_at).toLocaleDateString('tr-TR')}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Etkinlik Bilgileri */}
          <Card className="bg-blue-50 dark:bg-blue-900/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300">
                  Etkinlik Bilgileri
                </h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-lg mb-2">{suggestion.title}</h4>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {suggestion.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Etkinlik Türü</p>
                      <Badge className={getEventTypeColor(suggestion.event_type)}>
                        {EVENT_TYPES[suggestion.event_type as keyof typeof EVENT_TYPES] || suggestion.event_type}
                      </Badge>
                    </div>
                  </div>

                  {suggestion.suggested_date && (
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Önerilen Tarih</p>
                        <p className="font-medium">
                          {new Date(suggestion.suggested_date).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    </div>
                  )}

                  {suggestion.suggested_location && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Önerilen Mekan</p>
                        <p className="font-medium">{suggestion.suggested_location}</p>
                      </div>
                    </div>
                  )}

                  {suggestion.estimated_participants && (
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Tahmini Katılımcı</p>
                        <p className="font-medium">{suggestion.estimated_participants} kişi</p>
                      </div>
                    </div>
                  )}

                  {suggestion.estimated_budget && (
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Tahmini Bütçe</p>
                        <p className="font-medium">{suggestion.estimated_budget.toLocaleString('tr-TR')} TL</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* İletişim Bilgileri */}
          <Card className="bg-green-50 dark:bg-green-900/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-300">
                  İletişim Bilgileri
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Ad Soyad</p>
                    <p className="font-medium">{suggestion.contact_name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">E-posta</p>
                    <p className="font-medium">{suggestion.contact_email}</p>
                  </div>
                </div>

                {suggestion.contact_phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Telefon</p>
                      <p className="font-medium">{suggestion.contact_phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Ek Notlar */}
          {suggestion.additional_notes && (
            <Card className="bg-yellow-50 dark:bg-yellow-900/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-yellow-600" />
                  <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300">
                    Ek Notlar
                  </h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {suggestion.additional_notes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Admin Notları */}
          {suggestion.reviewer_notes && (
            <Card className="bg-red-50 dark:bg-red-900/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="h-5 w-5 text-red-600" />
                  <h3 className="text-lg font-semibold text-red-800 dark:text-red-300">
                    Admin Notları
                  </h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {suggestion.reviewer_notes}
                </p>
                {suggestion.reviewed_at && (
                  <p className="text-sm text-gray-500 mt-2">
                    İncelendi: {new Date(suggestion.reviewed_at).toLocaleDateString('tr-TR')}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Aksiyon Butonları */}
          {suggestion.status === 'pending' && onStatusChange && (
            <div className="flex gap-3 pt-6 border-t">
              <Button 
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => handleStatusChange('approved')}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Onayla
              </Button>
              <Button 
                variant="destructive" 
                className="flex-1"
                onClick={() => handleStatusChange('rejected')}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reddet
              </Button>
            </div>
          )}

          {/* Kapat Butonu */}
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={onClose}>
              Kapat
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventSuggestionDetailModal; 