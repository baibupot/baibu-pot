import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  FileText, 
  User, 
  Mail, 
  Calendar, 
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  Tag,
  Hash,
  Eye,
  Download,
  ExternalLink
} from 'lucide-react';

interface ArticleSubmissionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: any;
  onStatusChange?: (id: string, status: string) => Promise<void>;
}

const ArticleSubmissionDetailModal = ({ 
  isOpen, 
  onClose, 
  submission, 
  onStatusChange 
}: ArticleSubmissionDetailModalProps) => {
  if (!submission) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'under_review': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'revision_requested': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'accepted': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'published': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return <Clock className="h-4 w-4" />;
      case 'under_review': return <Eye className="h-4 w-4" />;
      case 'revision_requested': return <MessageSquare className="h-4 w-4" />;
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'published': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    const categories = {
      'arastirma': 'Araştırma',
      'derleme': 'Derleme',
      'vaka_sunumu': 'Vaka Sunumu',
      'kitap_inceleme': 'Kitap İncelemesi',
      'roportaj': 'Röportaj'
    };
    return categories[category as keyof typeof categories] || category;
  };

  const getStatusLabel = (status: string) => {
    const statuses = {
      'submitted': 'Gönderildi',
      'under_review': 'İncelemede',
      'revision_requested': 'Revizyon İstendi',
      'accepted': 'Kabul Edildi',
      'rejected': 'Reddedildi',
      'published': 'Yayınlandı'
    };
    return statuses[status as keyof typeof statuses] || status;
  };

  const handleStatusChange = async (status: string) => {
    if (onStatusChange) {
      await onStatusChange(submission.id, status);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Makale Başvurusu Detayı
              </DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getStatusColor(submission.status)}>
                  {getStatusIcon(submission.status)}
                  <span className="ml-1">
                    {getStatusLabel(submission.status)}
                  </span>
                </Badge>
                <span className="text-sm text-gray-500">
                  {new Date(submission.created_at).toLocaleDateString('tr-TR')}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Makale Bilgileri */}
          <Card className="bg-purple-50 dark:bg-purple-900/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300">
                  Makale Bilgileri
                </h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-lg mb-2">{submission.title}</h4>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-purple-600 border-purple-600">
                      {getCategoryLabel(submission.category)}
                    </Badge>
                    {submission.word_count && (
                      <Badge variant="outline" className="text-gray-600">
                        <Hash className="h-3 w-3 mr-1" />
                        {submission.word_count} kelime
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {submission.submission_date && (
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Başvuru Tarihi</p>
                        <p className="font-medium">
                          {new Date(submission.submission_date).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    </div>
                  )}

                  {submission.target_issue && (
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Hedef Sayı</p>
                        <p className="font-medium">Sayı #{submission.target_issue}</p>
                      </div>
                    </div>
                  )}

                  {submission.review_deadline && (
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">İnceleme Son Tarihi</p>
                        <p className="font-medium">
                          {new Date(submission.review_deadline).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    </div>
                  )}

                  {submission.decision_date && (
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Karar Tarihi</p>
                        <p className="font-medium">
                          {new Date(submission.decision_date).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* İçerik */}
                <div>
                  <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">İçerik</h5>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {submission.abstract}
                    </p>
                  </div>
                </div>

                {/* Anahtar Kelimeler */}
                {submission.keywords && submission.keywords.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Anahtar Kelimeler</h5>
                    <div className="flex flex-wrap gap-2">
                      {submission.keywords.map((keyword: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Yazar Bilgileri */}
          <Card className="bg-blue-50 dark:bg-blue-900/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300">
                  Yazar Bilgileri
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Ad Soyad</p>
                    <p className="font-medium">{submission.author_name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">E-posta</p>
                    <p className="font-medium">{submission.author_email}</p>
                  </div>
                </div>

                {submission.author_affiliation && (
                  <div className="flex items-center gap-3 md:col-span-2">
                    <Building2 className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Kurum/Affiliation</p>
                      <p className="font-medium">{submission.author_affiliation}</p>
                    </div>
                  </div>
                )}

                {submission.co_authors && submission.co_authors.length > 0 && (
                  <div className="flex items-center gap-3 md:col-span-2">
                    <User className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Ortak Yazarlar</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {submission.co_authors.map((author: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {author}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Dosya Bilgileri */}
          {submission.file_url && (
            <Card className="bg-green-50 dark:bg-green-900/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Download className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-green-800 dark:text-green-300">
                    Dosya Bilgileri
                  </h3>
                </div>
                
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Makale Dosyası</p>
                    <p className="font-medium">{submission.file_url.split('/').pop()}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(submission.file_url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Görüntüle
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Editör Notları */}
          {submission.reviewer_comments && (
            <Card className="bg-yellow-50 dark:bg-yellow-900/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="h-5 w-5 text-yellow-600" />
                  <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300">
                    Editör Notları
                  </h3>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {submission.reviewer_comments}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Aksiyon Butonları */}
          {submission.status === 'submitted' && onStatusChange && (
            <div className="flex gap-3 pt-6 border-t">
              <Button 
                className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                onClick={() => handleStatusChange('under_review')}
              >
                <Eye className="h-4 w-4 mr-2" />
                İncelemeye Al
              </Button>
              <Button 
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => handleStatusChange('accepted')}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Kabul Et
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

          {submission.status === 'under_review' && onStatusChange && (
            <div className="flex gap-3 pt-6 border-t">
              <Button 
                className="flex-1 bg-orange-600 hover:bg-orange-700"
                onClick={() => handleStatusChange('revision_requested')}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Revizyon İste
              </Button>
              <Button 
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => handleStatusChange('accepted')}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Kabul Et
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

export default ArticleSubmissionDetailModal; 