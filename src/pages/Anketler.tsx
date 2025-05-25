
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Calendar, Users, Clock, BarChart3 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';
import { useSurveys } from '@/hooks/useSupabaseData';

const Anketler = () => {
  const { data: surveys = [], isLoading, error } = useSurveys();

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

  if (isLoading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">Yükleniyor...</div>
          </main>
          <Footer />
        </div>
      </ThemeProvider>
    );
  }

  if (error) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-red-500">Anketler yüklenirken bir hata oluştu.</div>
          </main>
          <Footer />
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Anketler ve Geri Bildirimler
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Görüşleriniz bizim için çok değerli! Anketlerimize katılarak toplululuğumuzun 
              gelişimine katkı sağlayın ve sesini duyurulan olun.
            </p>
          </div>

          {/* Active Surveys */}
          {activeSurveys.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                Aktif Anketler
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {activeSurveys.map((survey) => (
                  <Card key={survey.id} className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-cyan-500">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 mb-2">
                            Aktif
                          </Badge>
                          <CardTitle className="text-xl text-slate-900 dark:text-white">
                            {survey.title}
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {survey.description && (
                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                          {survey.description}
                        </p>
                      )}
                      
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <Calendar className="h-4 w-4" />
                          <span>Son katılım: {formatDate(survey.end_date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <Clock className="h-4 w-4" />
                          <span>{getDaysRemaining(survey.end_date)} gün kaldı</span>
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full flex items-center gap-2"
                        onClick={() => window.open(survey.survey_link, '_blank')}
                      >
                        Ankete Katıl
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Completed Surveys */}
          {completedSurveys.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                Tamamlanan Anketler
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {completedSurveys.map((survey) => (
                  <Card key={survey.id} className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 mb-2 w-fit">
                        Tamamlandı
                      </Badge>
                      <CardTitle className="text-lg text-slate-900 dark:text-white">
                        {survey.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {survey.description && (
                        <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                          {survey.description}
                        </p>
                      )}
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(survey.start_date)} - {formatDate(survey.end_date)}</span>
                        </div>
                      </div>
                      
                      <Button variant="outline" className="w-full flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Sonuçları Görüntüle
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {surveys.length === 0 && (
            <div className="text-center py-12">
              <BarChart3 className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                Henüz anket bulunmuyor
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Yeni anketler eklendiğinde burada görünecek.
              </p>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default Anketler;
