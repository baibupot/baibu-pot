import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Book, Download, Eye, Search, Calendar, BookOpen, Send, User, Mail, FileText, PenTool } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMagazineIssues } from '@/hooks/useSupabaseData';
import LazyImage from '@/components/LazyImage';
import PageContainer from '@/components/ui/page-container';
import PageHero from '@/components/ui/page-hero';
import LoadingPage from '@/components/ui/loading-page';
import ErrorState from '@/components/ui/error-state';
import EmptyState from '@/components/ui/empty-state';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const Dergi = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Modal state'leri
  const [articleModalOpen, setArticleModalOpen] = useState(false);
  
  // Makale gönderme formu state'leri
  const [articleForm, setArticleForm] = useState({
    title: '',
    author_name: '',
    author_email: '',
    author_bio: '',
    submission_type: 'article',
    category: 'Araştırma',
    content: '',
    anonymous: false
  });
  const [submittingArticle, setSubmittingArticle] = useState(false);

  const { data: magazines = [], isLoading, error } = useMagazineIssues(true);

  const filteredIssues = magazines.filter(issue =>
    issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (issue.description && issue.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (issue.theme && issue.theme.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: tr });
  };

  // Modal açma handler
  const handleOpenArticleModal = () => {
    toast.info('Makale gönderme formu yakında açılacak! Şu an test aşamasında.');
  };
  
  // Makale gönderme form handler
  const handleSubmitArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!articleForm.title.trim() || !articleForm.content.trim()) {
      toast.error('Başlık ve makale içeriği zorunludur');
      return;
    }
    
    if (!articleForm.anonymous && (!articleForm.author_name.trim() || !articleForm.author_email.trim())) {
      toast.error('Anonim değilse isim ve email zorunludur');
      return;
    }
    
    setSubmittingArticle(true);
    
    try {
      // Kategori mapping - Türkçe -> İngilizce database format
      const categoryMapping: Record<string, string> = {
        'Araştırma': 'arastirma',
        'Derleme': 'derleme', 
        'Vaka Sunumu': 'vaka_sunumu',
        'Editöre Mektup': 'kitab_inceleme',
        'Kitap İncelemesi': 'kitab_inceleme'
      };

      const submissionData = {
        title: articleForm.title.trim(),
        abstract: articleForm.content.trim(),
        author_name: articleForm.anonymous ? 'Anonim' : articleForm.author_name.trim(),
        author_email: articleForm.anonymous ? 'anonymous@email.com' : articleForm.author_email.trim(),
        author_affiliation: articleForm.author_bio.trim() || null,
        category: categoryMapping[articleForm.category] || 'arastirma',
        word_count: articleForm.content.trim().split(/\s+/).length,
        submission_date: new Date().toISOString().split('T')[0]
      };
      
      const { error } = await supabase
        .from('article_submissions')
        .insert([submissionData as any]);
      
      if (error) throw error;
      
      // Form'u sıfırla
      setArticleForm({
        title: '',
        author_name: '',
        author_email: '',
        author_bio: '',
        submission_type: 'article',
        category: 'Araştırma',
        content: '',
        anonymous: false
      });
      
      toast.success('✅ Makale başvurunuz başarıyla gönderildi! İnceleme sürecini bekleyin.');
      setArticleModalOpen(false);
      
    } catch (error: any) {
      toast.error('❌ Makale gönderilirken hata oluştu: ' + error.message);
    } finally {
      setSubmittingArticle(false);
    }
  };

  const handleFormInputChange = (field: string, value: any) => {
    setArticleForm(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <PageContainer background="slate">
        <LoadingPage 
          title="Dergi Sayıları Yükleniyor"
          message="Psikolojiİbu dergi arşivini hazırlıyoruz..."
          icon={Book}
        />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer background="slate">
        <ErrorState 
          title="Dergi Sayıları Yüklenemedi"
          message="Dergi arşivini yüklerken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
          onRetry={() => window.location.reload()}
          variant="network"
        />
      </PageContainer>
    );
  }

  return (
    <>
      <PageContainer background="slate">
        {/* Hero Section */}
        <PageHero
          title="Psikolojiİbu Dergi Arşivi"
          description="BAİBÜ Psikoloji Öğrencileri Topluluğu'nun akademik dergisi 'Psikolojiİbu'nun tüm sayılarına buradan ulaşabilirsiniz. Psikoloji alanındaki güncel konular, araştırmalar ve makaleler ile bilginizi genişletin."
          icon={Book}
          gradient="teal"
        >
          {magazines.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
              <div className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-slate-900 dark:text-white">
                  {magazines.length}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300">Toplam Sayı</div>
              </div>
              <div className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-slate-900 dark:text-white">
                  {new Date().getFullYear() - 2024 + 1}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300">Yıl</div>
              </div>
            </div>
          )}
        </PageHero>

        {/* Search Section */}
        <div className="mb-6 sm:mb-8">
          <Card variant="modern" className="animate-fade-in-up animation-delay-100">
            <CardContent className="p-4 sm:p-6">
              <div className="relative max-w-lg mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Dergi sayılarında ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 bg-white/90 dark:bg-slate-700/90 border-indigo-200 focus:border-indigo-400 dark:border-indigo-800 dark:focus:border-indigo-600"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics */}
        {magazines.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card variant="modern" className="animate-fade-in-up animation-delay-200 group">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="p-3 bg-gradient-to-br from-indigo-100 to-cyan-100 dark:from-indigo-900/50 dark:to-cyan-900/50 rounded-xl w-fit mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                  <Book className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                  {magazines.length}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Toplam Sayı</div>
              </CardContent>
            </Card>
            <Card variant="modern" className="animate-fade-in-up animation-delay-300 group">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="p-3 bg-gradient-to-br from-cyan-100 to-teal-100 dark:from-cyan-900/50 dark:to-teal-900/50 rounded-xl w-fit mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-cyan-600 dark:text-cyan-400 mb-1">
                  {new Date().getFullYear() - 2024 + 1}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Yayın Yılı</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* All Issues Grid */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Tüm Sayılar ({filteredIssues.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredIssues.map((issue, index) => (
              <Link key={issue.id} to={`/dergi/${issue.slug}`} className="block">
                <Card variant="modern" className={`group overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] animate-fade-in-up animation-delay-${400 + index * 100}`}>
                  <CardHeader>
                    <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                      {issue.cover_image ? (
                        <LazyImage
                          src={issue.cover_image}
                          alt={issue.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          fallback={
                            <Book className="h-12 w-12 text-slate-400" />
                          }
                        />
                      ) : (
                        <Book className="h-12 w-12 text-slate-400 group-hover:scale-110 transition-transform duration-300" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-gradient-to-r from-indigo-100 to-cyan-100 text-indigo-800 dark:from-indigo-900/50 dark:to-cyan-900/50 dark:text-indigo-300 border-0">
                        Sayı {issue.issue_number}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{issue.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-3">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(issue.publication_date)}</span>
                    </div>
                    {issue.theme && (
                      <div className="mb-3">
                        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700">
                          {issue.theme}
                        </Badge>
                      </div>
                    )}
                    {issue.description && (
                      <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-3 text-sm">
                        {issue.description}
                      </p>
                    )}
                    <div className="flex flex-col gap-2">
                      <Button 
                        asChild
                        variant="outline" 
                        className="w-full flex items-center gap-2"
                      >
                        <span>
                          <Eye className="h-4 w-4" />
                          Detayları Gör
                        </span>
                      </Button>

                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {filteredIssues.length === 0 && (
          <EmptyState
            icon={Book}
            title={searchTerm ? 'Aradığınız dergi sayısı bulunamadı' : 'Henüz dergi sayısı yok'}
            description={searchTerm ? 'Lütfen farklı arama terimleri deneyin.' : 'Yakında yeni sayılar eklenecek.'}
            variant={searchTerm ? 'search' : 'default'}
            actionLabel={searchTerm ? 'Tüm Sayıları Göster' : undefined}
            onAction={searchTerm ? () => setSearchTerm('') : undefined}
          />
        )}

        {/* CTA Section */}
        <section className="py-12 sm:py-16">
          <Card variant="modern" className="bg-gradient-to-br from-purple-50/80 via-blue-50/80 to-indigo-50/80 dark:from-purple-950/50 dark:via-blue-950/50 dark:to-indigo-950/50 border-purple-200/50 dark:border-purple-800/50 overflow-hidden animate-fade-in-up animation-delay-600">
            <CardContent className="p-8 sm:p-12 text-center relative">
              {/* Background decoration */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-1/4 w-48 sm:w-72 h-48 sm:h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-48 sm:w-72 h-48 sm:h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
              </div>
              
              <div className="relative z-10 max-w-2xl mx-auto space-y-6 sm:space-y-8">
                <div className="p-4 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/50 dark:to-indigo-900/50 rounded-full w-fit mx-auto">
                  <PenTool className="h-12 w-12 sm:h-16 sm:w-16 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                  Bize Yazı Göndermek İster Misiniz?
                </h2>
                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                  Akademik makalenizi, araştırmanızı veya yazınızı bizimle paylaşın. 
                  Dergimizde yayınlanması için editöryel incelemeden geçirecek ve 
                  kabul edilenler topluluğumuzla buluşacak.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <Button 
                    size="lg" 
                    className="group bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => setArticleModalOpen(true)}
                  >
                    <PenTool className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                    Yazı Gönder
                    <span className="ml-2 group-hover:translate-x-1 transition-transform duration-200">→</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </PageContainer>

      {/* Makale Gönderme Modal */}
      <Dialog open={articleModalOpen} onOpenChange={setArticleModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-purple-900 dark:text-purple-100 flex items-center gap-2">
              <PenTool className="w-6 h-6" />
              Bize Yazınızı Gönderin
            </DialogTitle>
            <DialogDescription className="text-purple-700 dark:text-purple-300">
              Akademik makalenizi, araştırmanızı veya yazınızı bizimle paylaşın. 
              İsteğe bağlı olarak anonim gönderebilirsiniz.
            </DialogDescription>
          </DialogHeader>
          
          <Card variant="modern" className="mt-6">
            <CardContent className="p-6">
              <form onSubmit={handleSubmitArticle} className="space-y-6">
            
            {/* Başlık */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Makale Başlığı *
              </label>
              <Input
                value={articleForm.title}
                onChange={(e) => handleFormInputChange('title', e.target.value)}
                placeholder="Makalenizin başlığını yazın..."
                className="w-full"
                disabled={submittingArticle}
              />
            </div>

            {/* Kategori ve Tip */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kategori *
                </label>
                <select
                  value={articleForm.category}
                  onChange={(e) => handleFormInputChange('category', e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  disabled={submittingArticle}
                >
                  <option value="Araştırma">Araştırma</option>
                  <option value="Derleme">Derleme</option>
                  <option value="Vaka Sunumu">Vaka Sunumu</option>
                  <option value="Editöre Mektup">Editöre Mektup</option>
                  <option value="Kitap İncelemesi">Kitap İncelemesi</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Makale Tipi *
                </label>
                <select
                  value={articleForm.submission_type}
                  onChange={(e) => handleFormInputChange('submission_type', e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  disabled={submittingArticle}
                >
                  <option value="article">Makale</option>
                  <option value="essay">Deneme</option>
                  <option value="review">İnceleme</option>
                  <option value="case_study">Vaka Çalışması</option>
                  <option value="research">Araştırma</option>
                </select>
              </div>
            </div>

            {/* Anonim Checkbox */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="anonymous"
                checked={articleForm.anonymous}
                onChange={(e) => handleFormInputChange('anonymous', e.target.checked)}
                className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                disabled={submittingArticle}
              />
              <label htmlFor="anonymous" className="text-sm text-gray-700 dark:text-gray-300">
                🎭 Anonim olarak gönder (İsmim görünmesin)
              </label>
            </div>

            {/* Yazar Bilgileri (Anonim değilse) */}
            {!articleForm.anonymous && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div>
                  <label className="block text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Adınız Soyadınız *
                  </label>
                  <Input
                    value={articleForm.author_name}
                    onChange={(e) => handleFormInputChange('author_name', e.target.value)}
                    placeholder="Ad Soyad"
                    disabled={submittingArticle}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Adresiniz *
                  </label>
                  <Input
                    type="email"
                    value={articleForm.author_email}
                    onChange={(e) => handleFormInputChange('author_email', e.target.value)}
                    placeholder="email@example.com"
                    disabled={submittingArticle}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                    Kısa Bio (Opsiyonel)
                  </label>
                  <Textarea
                    value={articleForm.author_bio}
                    onChange={(e) => handleFormInputChange('author_bio', e.target.value)}
                    placeholder="Kendiniz hakkında kısa bilgi..."
                    rows={2}
                    disabled={submittingArticle}
                  />
                </div>
              </div>
            )}

            {/* Makale İçeriği */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                📝 Makale İçeriği *
              </label>
              <Textarea
                value={articleForm.content}
                onChange={(e) => handleFormInputChange('content', e.target.value)}
                placeholder="Makalenizin tam metnini buraya yazın..."
                rows={10}
                className="w-full"
                disabled={submittingArticle}
              />
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {articleForm.content.trim() ? 
                  `${articleForm.content.trim().split(/\s+/).length} kelime` : 
                  '0 kelime'
                }
              </div>
            </div>

            {/* Bilgi Notu */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">💡 Önemli Bilgiler:</h4>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                <li>• Gönderdiğiniz makaleler editöryel incelemeden geçecektir</li>
                <li>• İnceleme süreci 1-2 hafta sürebilir</li>
                <li>• Makale kabul edilirse dergi sayısına dahil edilecektir</li>
                <li>• Anonim gönderimler de kabul edilmektedir</li>
              </ul>
            </div>

            {/* Modal Footer Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setArticleModalOpen(false)}
                disabled={submittingArticle}
              >
                ❌ İptal
              </Button>
              <Button 
                type="submit" 
                className="bg-purple-600 hover:bg-purple-700 text-white"
                disabled={submittingArticle || !articleForm.title.trim() || !articleForm.content.trim()}
              >
                {submittingArticle ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    📤 Makaleyi Gönder
                  </>
                )}
              </Button>
            </div>
          </form>
          </CardContent>
        </Card>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Dergi;
