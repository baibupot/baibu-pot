
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Calendar, ExternalLink, Building2, Clock, Users } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';
import { useInternships } from '@/hooks/useSupabaseData';

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
      'zorunlu': 'Zorunlu Staj',
      'gönüllü': 'Gönüllü Staj',
      'yaz': 'Yaz Stajı',
      'donem': 'Dönem Stajı'
    };
    return types[type] || type;
  };

  const getTypeColor = (type: string | null) => {
    if (!type) return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    const colors: Record<string, string> = {
      'zorunlu': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'gönüllü': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
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
            <div className="text-center text-red-500">Staj ilanları yüklenirken bir hata oluştu.</div>
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
              Staj Fırsatları ve Rehberi
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Psikoloji alanındaki staj fırsatlarını keşfedin. Deneyim kazanın, network oluşturun 
              ve kariyerinizin temellerini atın. Güncel staj ilanları ve başvuru rehberi burada.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Staj ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
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
                <SelectTrigger>
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

              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setLocationFilter('all');
                setTypeFilter('all');
              }}>
                Filtreleri Temizle
              </Button>
            </div>
          </div>

          {/* Internships Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            {filteredInternships.map((internship) => (
              <Card key={internship.id} className={`hover:shadow-lg transition-shadow duration-300 ${isDeadlinePassed(internship.application_deadline) ? 'opacity-60' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getTypeColor(internship.internship_type)}>
                          {getTypeLabel(internship.internship_type)}
                        </Badge>
                        {isDeadlinePassed(internship.application_deadline) && (
                          <Badge variant="secondary">Süresi Doldu</Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl text-slate-900 dark:text-white">
                        {internship.position}
                      </CardTitle>
                      <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
                        {internship.company_name}
                      </p>
                    </div>
                    <Building2 className="h-8 w-8 text-slate-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <MapPin className="h-4 w-4" />
                      <span>{internship.location}</span>
                    </div>
                    {internship.application_deadline && (
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Clock className="h-4 w-4" />
                        <span>Son Başvuru: {formatDate(internship.application_deadline)}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
                    {internship.description}
                  </p>

                  {internship.requirements && (
                    <div className="mb-4">
                      <h4 className="font-medium text-slate-900 dark:text-white mb-2">Gereksinimler:</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                        {internship.requirements}
                      </p>
                    </div>
                  )}

                  {internship.contact_info && (
                    <div className="mb-4">
                      <h4 className="font-medium text-slate-900 dark:text-white mb-2">İletişim:</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {internship.contact_info}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2">
                    {internship.application_link ? (
                      <Button 
                        className="flex items-center gap-2"
                        onClick={() => window.open(internship.application_link, '_blank')}
                        disabled={isDeadlinePassed(internship.application_deadline)}
                      >
                        <ExternalLink className="h-4 w-4" />
                        Başvur
                      </Button>
                    ) : (
                      <Button variant="outline" disabled>
                        Başvuru Linki Yok
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      Detayları Gör
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredInternships.length === 0 && (
            <div className="text-center py-12 mb-12">
              <Building2 className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                Staj ilanı bulunamadı
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Aradığınız kriterlere uygun staj ilanı bulunmuyor.
              </p>
            </div>
          )}

          {/* Internship Guide */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              Staj Başvuru Rehberi
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">CV Hazırlama</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Etkili bir CV nasıl hazırlanır, hangi bilgiler yer almalı, 
                    format önerileri ve örnekler.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Mülakat İpuçları</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Mülakat sürecine nasıl hazırlanılır, sık sorulan sorular 
                    ve profesyonel görünüm önerileri.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Staj Süreci</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Staj süresince dikkat edilmesi gerekenler, 
                    değerlendirme kriterleri ve başarı önerileri.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default Stajlar;
