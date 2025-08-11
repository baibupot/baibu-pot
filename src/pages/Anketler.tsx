import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Calendar, Users, Clock, BarChart3 } from 'lucide-react';
import { useSurveys } from '@/hooks/useSupabaseData';
import PageContainer from '@/components/ui/page-container';
import PageHero from '@/components/ui/page-hero';
import LoadingPage from '@/components/ui/loading-page';
import ErrorState from '@/components/ui/error-state';
import EmptyState from '@/components/ui/empty-state';
import { useNavigate } from 'react-router-dom';

const Anketler = () => {
  const { data: surveys = [], isLoading, error } = useSurveys();
  const navigate = useNavigate();

  const activeSurveys = surveys.filter(survey => survey.active);
  const completedSurveys = surveys.filter(survey => !survey.active);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const handleSurveyClick = (survey: typeof surveys[0]) => {
    if (survey.has_custom_form) {
      // `slug` alanı varsa onu kullan, yoksa `id`'yi kullan
      const targetSlug = survey.slug || survey.id;
      navigate(`/anketler/${targetSlug}`);
    } else if (survey.survey_link) {
      window.open(survey.survey_link, '_blank', 'noopener,noreferrer');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <PageContainer background="slate">
        <LoadingPage 
          title="Anketler Yükleniyor"
          message="Geri bildirim formlarını hazırlıyoruz..."
          icon={BarChart3}
        />
      </PageContainer>
    );
  }

  // Error state
  if (error) {
    return (
      <PageContainer background="slate">
        <ErrorState 
          title="Anketler Yüklenemedi"
          message="Anketleri yüklerken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
          onRetry={() => window.location.reload()}
          variant="network"
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer background="slate">
      {/* Hero Section */}
      <PageHero
        title="Anketler ve Geri Bildirimler"
        gradient="emerald"
      />

      {/* Stats Cards */}
      {surveys.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-12">
          <Card variant="modern" className="text-center p-4 sm:p-6 animate-fade-in-up">
            <div className="space-y-1 sm:space-y-2">
              <div className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {activeSurveys.length}
              </div>
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                ✨ Aktif Anket
              </div>
            </div>
          </Card>
          
          <Card variant="modern" className="text-center p-4 sm:p-6 animate-fade-in-up animation-delay-100">
            <div className="space-y-1 sm:space-y-2">
              <div className="text-2xl sm:text-3xl font-bold text-slate-600 dark:text-slate-400">
                {completedSurveys.length}
              </div>
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                📊 Tamamlanan
              </div>
            </div>
          </Card>
          
          <Card variant="modern" className="col-span-2 lg:col-span-1 text-center p-4 sm:p-6 animate-fade-in-up animation-delay-200">
            <div className="space-y-1 sm:space-y-2">
              <div className="text-2xl sm:text-3xl font-bold gradient-text-primary">
                {surveys.length}
              </div>
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                📋 Toplam Anket
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Active Surveys */}
      {activeSurveys.length > 0 && (
        <section className="mb-8 sm:mb-12 animate-fade-in-up">
          {/* Section Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-1 w-12 sm:w-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
                ✨ Aktif Anketler
              </h2>
            </div>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
              Şu anda katılım bekleyen anketlerimiz. Görüşlerinizi paylaşarak topluluğumuzun gelişimine katkıda bulunun!
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {activeSurveys.map((survey, index) => (
              <Card 
                key={survey.id} 
                variant="interactive"
                className="group border-l-4 border-l-emerald-500 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => handleSurveyClick(survey)}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-4">
                    <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300 text-xs font-medium">
                      ✨ Aktif
                    </Badge>
                    {getDaysRemaining(survey.end_date) <= 3 && (
                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 text-xs font-medium">
                        ⏰ Son günler
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="font-bold text-lg sm:text-xl text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-200 mb-3 line-clamp-2">
                    {survey.title}
                  </h3>
                  
                  {survey.description && (
                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4 line-clamp-3 leading-relaxed">
                      {survey.description}
                    </p>
                  )}
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-500" />
                      <span>Son katılım: {formatDate(survey.end_date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-500" />
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">
                        {getDaysRemaining(survey.end_date)} gün kaldı
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-medium group-hover:gap-3 transition-all duration-200">
                      <Users className="h-4 w-4" />
                      <span>{survey.has_custom_form ? 'Ankete Katıl' : 'Ankete Git'}</span>
                      {!survey.has_custom_form && <ExternalLink className="h-3 w-3" />}
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Completed Surveys */}
      {completedSurveys.length > 0 && (
        <section className="mb-8 sm:mb-12 animate-fade-in-up">
          {/* Section Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-1 w-12 sm:w-16 bg-gradient-to-r from-slate-400 to-slate-600 rounded-full"></div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
                📊 Tamamlanan Anketler
              </h2>
            </div>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
              Geçmiş anketlerimizin sonuçlarını inceleyebilir ve katkılarınızı görebilirsiniz.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {completedSurveys.map((survey, index) => (
              <Card 
                key={survey.id} 
                variant="modern"
                className="group animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Badge className="bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300 text-xs font-medium">
                      📊 Tamamlandı
                    </Badge>
                  </div>
                  
                  <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-colors duration-200 mb-3 line-clamp-2">
                    {survey.title}
                  </h3>
                  
                  {survey.description && (
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-3 leading-relaxed">
                      {survey.description}
                    </p>
                  )}
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>{formatDate(survey.start_date)} - {formatDate(survey.end_date)}</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full group-hover:shadow-lg transition-all duration-200"
                    size="sm"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Sonuçları Görüntüle
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {surveys.length === 0 && (
        <EmptyState
          icon={BarChart3}
          title="Henüz Anket Bulunmuyor"
          description="Yeni anketler eklendiğinde burada görünecek. Geri bildirimleriniz için takipte kalın!"
          actionLabel="Ana Sayfaya Dön"
          onAction={() => window.location.href = '/'}
        />
      )}

    </PageContainer>
  );
};

export default Anketler;
