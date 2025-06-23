import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Calendar, ExternalLink, Building2, Clock, Users, Briefcase } from 'lucide-react';
import { useInternships } from '@/hooks/useSupabaseData';
import PageContainer from '@/components/ui/page-container';
import PageHero from '@/components/ui/page-hero';
import LoadingPage from '@/components/ui/loading-page';
import ErrorState from '@/components/ui/error-state';
import EmptyState from '@/components/ui/empty-state';

const Stajlar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const { data: internships = [], isLoading, error } = useInternships(true);

  const filteredInternships = internships.filter(internship => {
    const matchesSearch = internship.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         internship.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         internship.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = locationFilter === 'all' || internship.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesType = typeFilter === 'all' || internship.internship_type === typeFilter;
    
    return matchesSearch && matchesLocation && matchesType;
  });

  const getTypeLabel = (type: string | null) => {
    if (!type) return 'Belirtilmemiş';
    const types: Record<string, string> = {
      'zorunlu': '📋 Zorunlu Staj',
      'gönüllü': '✨ Gönüllü Staj',
      'yaz': '☀️ Yaz Stajı',
      'donem': '📚 Dönem Stajı'
    };
    return types[type] || type;
  };

  const getTypeColor = (type: string | null) => {
    if (!type) return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    const colors: Record<string, string> = {
      'zorunlu': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'gönüllü': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
      'yaz': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'donem': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Belirtilmemiş';
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isDeadlinePassed = (deadline: string | null) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  // Loading state
  if (isLoading) {
    return (
      <PageContainer background="slate">
        <LoadingPage 
          title="Staj İlanları Yükleniyor"
          message="Kariyer fırsatlarınızı hazırlıyoruz..."
          icon={Briefcase}
        />
      </PageContainer>
    );
  }

  // Error state
  if (error) {
    return (
      <PageContainer background="slate">
        <ErrorState 
          title="Staj İlanları Yüklenemedi"
          message="Staj ilanlarını yüklerken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
          onRetry={() => window.location.reload()}
          variant="network"
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer background="gradient">
      {/* Hero Section */}
      <PageHero
        title="Staj Fırsatları ve Rehberi"
        description="Psikoloji alanındaki staj fırsatlarını keşfedin. Deneyim kazanın, network oluşturun ve kariyerinizin temellerini atın. Güncel staj ilanları ve başvuru rehberi burada."
        icon={Briefcase}
        gradient="blue"
      >
        {internships.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mt-8">
            <div className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {internships.length}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Toplam İlan</div>
            </div>
            <div className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {internships.filter(i => !isDeadlinePassed(i.application_deadline)).length}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Aktif İlan</div>
            </div>
            <div className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {new Set(internships.map(i => i.location)).size}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Şehir</div>
            </div>
            <div className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {new Set(internships.map(i => i.internship_type)).size}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Staj Türü</div>
            </div>
          </div>
        )}
      </PageHero>

      {/* Search and Filters */}
      <section className="py-8">
        <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Staj ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/80 dark:bg-slate-700/80"
              />
            </div>
            
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="bg-white/80 dark:bg-slate-700/80">
                <SelectValue placeholder="Şehir" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Şehirler</SelectItem>
                <SelectItem value="ankara">Ankara</SelectItem>
                <SelectItem value="istanbul">İstanbul</SelectItem>
                <SelectItem value="bolu">Bolu</SelectItem>
                <SelectItem value="izmir">İzmir</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="bg-white/80 dark:bg-slate-700/80">
                <SelectValue placeholder="Staj Türü" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Türler</SelectItem>
                <SelectItem value="zorunlu">Zorunlu Staj</SelectItem>
                <SelectItem value="gönüllü">Gönüllü Staj</SelectItem>
                <SelectItem value="yaz">Yaz Stajı</SelectItem>
                <SelectItem value="donem">Dönem Stajı</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              className="bg-white/80 dark:bg-slate-700/80 hover:bg-white dark:hover:bg-slate-600"
              onClick={() => {
                setSearchTerm('');
                setLocationFilter('all');
                setTypeFilter('all');
              }}
            >
              Filtreleri Temizle
            </Button>
          </div>
        </div>
      </section>

      {/* Internships Grid */}
      <section className="pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredInternships.length > 0 ? (
            filteredInternships.map((internship) => (
              <Card 
                key={internship.id} 
                className={`card-hover group overflow-hidden border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm ${
                  isDeadlinePassed(internship.application_deadline) ? 'opacity-60' : ''
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={getTypeColor(internship.internship_type)}>
                          {getTypeLabel(internship.internship_type)}
                        </Badge>
                        {isDeadlinePassed(internship.application_deadline) && (
                          <Badge variant="secondary">⏰ Süresi Doldu</Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                        {internship.position}
                      </CardTitle>
                      <p className="text-lg font-medium text-slate-700 dark:text-slate-300 mt-1">
                        {internship.company_name}
                      </p>
                    </div>
                    <Building2 className="h-10 w-10 text-slate-400 group-hover:scale-110 transition-transform duration-200" />
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <MapPin className="h-4 w-4 text-blue-500" />
                      <span>{internship.location}</span>
                    </div>
                    {internship.application_deadline && (
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className={isDeadlinePassed(internship.application_deadline) ? 'text-red-500' : 'font-medium text-blue-600 dark:text-blue-400'}>
                          Son Başvuru: {formatDate(internship.application_deadline)}
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="text-slate-600 dark:text-slate-400 mb-6 line-clamp-3 leading-relaxed">
                    {internship.description}
                  </p>

                  {internship.requirements && (
                    <div className="mb-6">
                      <h4 className="font-medium text-slate-900 dark:text-white mb-2">📋 Gereksinimler:</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {internship.requirements}
                      </p>
                    </div>
                  )}

                  {internship.contact_info && (
                    <div className="mb-6">
                      <h4 className="font-medium text-slate-900 dark:text-white mb-2">📞 İletişim:</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {internship.contact_info}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3">
                    {internship.application_link ? (
                      <Button 
                        className="flex items-center gap-2 group-hover:shadow-lg transition-all duration-200"
                        onClick={() => window.open(internship.application_link, '_blank')}
                        disabled={isDeadlinePassed(internship.application_deadline)}
                      >
                        <ExternalLink className="h-4 w-4" />
                        {isDeadlinePassed(internship.application_deadline) ? 'Başvuru Süresi Doldu' : 'Başvur'}
                      </Button>
                    ) : (
                      <Button variant="outline" disabled>
                        Başvuru Linki Yok
                      </Button>
                    )}
                    <Button variant="outline" size="sm" className="group-hover:shadow-lg transition-all duration-200">
                      <Users className="h-4 w-4 mr-2" />
                      Detayları Gör
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-2">
              <EmptyState
                icon={Briefcase}
                title="Staj İlanı Bulunamadı"
                description="Aradığınız kriterlere uygun staj ilanı bulunmuyor. Lütfen farklı filtreler deneyin."
                variant="search"
                actionLabel="Filtreleri Temizle"
                onAction={() => {
                  setSearchTerm('');
                  setLocationFilter('all');
                  setTypeFilter('all');
                }}
              />
            </div>
          )}
        </div>
      </section>

      {/* Internship Guide */}
      <section className="py-16">
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950 rounded-2xl p-12 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          </div>
          
          <div className="relative z-10">
            <div className="text-center mb-12">
              <div className="text-6xl mb-6">📚</div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Staj Başvuru Rehberi
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Başarılı bir staj süreci için detaylı rehberimizi inceleyin.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="card-hover bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="text-center">
                  <div className="text-4xl mb-4">📝</div>
                  <CardTitle className="text-xl">CV Hazırlama</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Etkili bir CV nasıl hazırlanır, hangi bilgiler yer almalı, 
                    format önerileri ve örnekler.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="card-hover bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="text-center">
                  <div className="text-4xl mb-4">💼</div>
                  <CardTitle className="text-xl">Mülakat İpuçları</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Mülakat sürecine nasıl hazırlanılır, sık sorulan sorular 
                    ve profesyonel görünüm önerileri.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="card-hover bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="text-center">
                  <div className="text-4xl mb-4">🎯</div>
                  <CardTitle className="text-xl">Staj Süreci</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Staj süresince dikkat edilmesi gerekenler, 
                    değerlendirme kriterleri ve başarı önerileri.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </PageContainer>
  );
};

export default Stajlar;
