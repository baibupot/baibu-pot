import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Building, 
  Clock, 
  ExternalLink,
  BookOpen,
  FileText,
  Users,
  Briefcase
} from 'lucide-react';
import PageContainer from '@/components/ui/page-container';
import PageHero from '@/components/ui/page-hero';
import EmptyState from '@/components/ui/empty-state';

// Mock data - bu veriler Supabase'den gelecek
const mockInternships = [
  {
    id: '1',
    title: 'Klinik Psikoloji Stajyeri',
    company: 'Bolu Devlet Hastanesi',
    location: 'Bolu',
    type: 'Tam Zamanlı',
    duration: '3 ay',
    application_deadline: '2024-04-15',
    start_date: '2024-05-01',
    description: 'Psikiyatri servisinde klinik deneyim kazanma fırsatı. Hasta değerlendirme, psikolojik test uygulama ve terapi süreçlerinde gözlem.',
    requirements: ['Psikoloji 3. veya 4. sınıf öğrencisi olma', 'Temel psikolojik test bilgisi', 'İletişim becerileri'],
    contact_email: 'staj@boludevlethastanesi.gov.tr',
    is_active: true
  },
  {
    id: '2',
    title: 'Rehberlik Stajyeri',
    company: 'Bolu Anadolu Lisesi',
    location: 'Bolu',
    type: 'Yarı Zamanlı',
    duration: '4 ay',
    application_deadline: '2024-04-20',
    start_date: '2024-05-15',
    description: 'Okul psikolojik danışmanlık hizmetleri kapsamında öğrencilerle bireysel ve grup çalışmaları.',
    requirements: ['Rehberlik ve Psikolojik Danışmanlık veya Psikoloji öğrencisi', 'Ergen psikolojisi bilgisi', 'Empati yeteneği'],
    contact_email: 'staj@boluanadolu.meb.gov.tr',
    is_active: true
  },
  {
    id: '3',
    title: 'Araştırma Stajyeri',
    company: 'BAİBÜ Psikoloji Bölümü',
    location: 'Bolu',
    type: 'Esnek Çalışma',
    duration: '6 ay',
    application_deadline: '2024-05-01',
    start_date: '2024-06-01',
    description: 'Akademik araştırma projelerinde veri toplama, analiz ve raporlama süreçlerinde deneyim kazanma.',
    requirements: ['Psikoloji 2. sınıf ve üzeri', 'SPSS bilgisi tercih edilir', 'Araştırma yöntemlerine ilgi'],
    contact_email: 'arastirma@ibu.edu.tr',
    is_active: true
  }
];

const mockExperiences = [
  {
    id: '1',
    student_name: 'Ayşe Y.',
    internship_place: 'Ankara Üniversitesi Hastanesi',
    year: '2023',
    experience: 'Klinik psikoloji stajım sırasında çok değerli deneyimler edindim. Hasta ile terapi süreçlerini gözlemleme ve psikolojik test uygulama fırsatı buldum.',
    rating: 5
  },
  {
    id: '2',
    student_name: 'Mehmet K.',
    internship_place: 'İstanbul Özel Rehabilitasyon Merkezi',
    year: '2023',
    experience: 'Özel eğitim alanında çalışma fırsatı buldum. Otizmli çocuklarla çalışmak çok öğretici oldu.',
    rating: 4
  }
];

const guides = [
  {
    id: '1',
    title: 'Staj Başvuru Rehberi',
    description: 'Staj başvuru sürecinde dikkat edilmesi gereken noktalar ve başvuru formu örnekleri.',
    download_url: '#'
  },
  {
    id: '2',
    title: 'CV Hazırlama Kılavuzu',
    description: 'Psikoloji stajları için etkili CV hazırlama teknikleri ve örnekler.',
    download_url: '#'
  },
  {
    id: '3',
    title: 'Mülakat Hazırlığı',
    description: 'Staj mülakatlarında karşılaşılabilecek sorular ve hazırlık önerileri.',
    download_url: '#'
  }
];

const Staj = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Tümü');
  const [selectedType, setSelectedType] = useState('Tümü');
  const [activeTab, setActiveTab] = useState('ilanlar');

  const locations = ['Tümü', 'Bolu', 'Ankara', 'İstanbul'];
  const types = ['Tümü', 'Tam Zamanlı', 'Yarı Zamanlı', 'Esnek Çalışma'];

  const filteredInternships = mockInternships.filter(internship => {
    const matchesSearch = 
      internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internship.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internship.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = selectedLocation === 'Tümü' || internship.location === selectedLocation;
    const matchesType = selectedType === 'Tümü' || internship.type === selectedType;
    return matchesSearch && matchesLocation && matchesType && internship.is_active;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Tam Zamanlı': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'Yarı Zamanlı': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'Esnek Çalışma': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  const totalInternships = mockInternships.length;
  const totalExperiences = mockExperiences.length;
  const totalGuides = guides.length;

  return (
    <PageContainer background="slate">
      {/* Hero Section */}
      <PageHero
        title="Staj Fırsatları ve Rehberi"
        description="Psikoloji eğitiminizi pratik deneyimlerle destekleyin. Güncel staj ilanları, deneyim paylaşımları ve başvuru rehberleri ile staj sürecinizde size yardımcı oluyoruz."
        icon={Briefcase}
        gradient="blue"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
          <div className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              {totalInternships}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-300">Aktif Staj İlanı</div>
          </div>
          <div className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              {totalExperiences}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-300">Deneyim Paylaşımı</div>
          </div>
          <div className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              {totalGuides}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-300">Rehber Doküman</div>
          </div>
        </div>
      </PageHero>

      {/* Tab Navigation */}
      <section className="py-8">
        <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              variant={activeTab === 'ilanlar' ? 'default' : 'outline'}
              onClick={() => setActiveTab('ilanlar')}
              className="group h-12 px-6"
            >
              <Building className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
              💼 Staj İlanları
            </Button>
            <Button
              variant={activeTab === 'deneyimler' ? 'default' : 'outline'}
              onClick={() => setActiveTab('deneyimler')}
              className="group h-12 px-6"
            >
              <Users className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
              👥 Deneyim Paylaşımları
            </Button>
            <Button
              variant={activeTab === 'rehber' ? 'default' : 'outline'}
              onClick={() => setActiveTab('rehber')}
              className="group h-12 px-6"
            >
              <BookOpen className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
              📚 Staj Rehberi
            </Button>
          </div>
        </div>
      </section>

      {/* Staj İlanları Tab */}
      {activeTab === 'ilanlar' && (
        <section className="pb-12">
          {/* Search and Filter Section */}
          <div className="mb-8 space-y-6">
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                    <Input
                      type="text"
                      placeholder="Staj ilanlarında ara... (şirket, pozisyon, açıklama)"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 h-12 text-base bg-white/80 dark:bg-slate-700/80"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                        🌍 Şehir Seçin
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {locations.map((location) => (
                          <Button
                            key={location}
                            variant={selectedLocation === location ? "default" : "outline"}
                            onClick={() => setSelectedLocation(location)}
                            size="sm"
                            className="h-10"
                          >
                            {location}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                        ⏰ Çalışma Türü
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {types.map((type) => (
                          <Button
                            key={type}
                            variant={selectedType === type ? "default" : "outline"}
                            onClick={() => setSelectedType(type)}
                            size="sm"
                            className="h-10"
                          >
                            {type}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Internship Listings */}
          <div className="space-y-6">
            {filteredInternships.length > 0 ? (
              filteredInternships.map((internship) => (
                <Card key={internship.id} className="card-hover border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge className={getTypeColor(internship.type)}>
                            {internship.type}
                          </Badge>
                          <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20">
                            ⏱️ {internship.duration}
                          </Badge>
                        </div>
                        <CardTitle className="text-2xl mb-3 text-slate-900 dark:text-white">
                          {internship.title}
                        </CardTitle>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">{internship.company}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-green-500" />
                            <span>{internship.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-red-500" />
                            <span>Son: {formatDate(internship.application_deadline)}</span>
                          </div>
                        </div>
                      </div>
                      <Button className="group bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                        <span className="mr-2">Detaylar ve Başvuru</span>
                        <ExternalLink className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                      {internship.description}
                    </p>
                    <div className="mb-6">
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-3 text-lg">
                        📋 Gereksinimler:
                      </h4>
                      <ul className="space-y-2">
                        {internship.requirements.map((req, index) => (
                          <li key={index} className="flex items-start gap-3 text-slate-600 dark:text-slate-400">
                            <span className="text-blue-500 font-bold mt-1">•</span>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-500 bg-slate-50 dark:bg-slate-700/30 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-green-500" />
                        <span className="font-medium">Başlangıç: {formatDate(internship.start_date)}</span>
                      </div>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">İletişim: {internship.contact_email}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <EmptyState
                icon={Building}
                title="Aradığınız Kriterlerde Staj İlanı Bulunamadı"
                description="Lütfen farklı arama terimleri deneyin veya filtreleri değiştirin."
                actionLabel="Filtreleri Temizle"
                onAction={() => {
                  setSearchTerm('');
                  setSelectedLocation('Tümü');
                  setSelectedType('Tümü');
                }}
                variant="search"
              />
            )}
          </div>
        </section>
      )}

      {/* Deneyim Paylaşımları Tab */}
      {activeTab === 'deneyimler' && (
        <section className="pb-12">
          <div className="space-y-6">
            {mockExperiences.map((experience) => (
              <Card key={experience.id} className="card-hover border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                        👤 {experience.student_name}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 font-medium">
                        🏥 {experience.internship_place} - {experience.year}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span 
                          key={i} 
                          className={`text-lg ${i < experience.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                          ⭐
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-base">
                    💭 "{experience.experience}"
                  </p>
                </CardContent>
              </Card>
            ))}
            
            <div className="text-center mt-12">
              <Button 
                variant="outline" 
                size="lg"
                className="group h-12 px-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-700 hover:shadow-lg"
              >
                <Users className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                Deneyimini Paylaş
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Staj Rehberi Tab */}
      {activeTab === 'rehber' && (
        <section className="pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide) => (
              <Card key={guide.id} className="card-hover border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm overflow-hidden">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full w-fit">
                    <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-xl">{guide.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                    {guide.description}
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full group h-12 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-700 hover:shadow-lg"
                  >
                    <FileText className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                    İndir
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </PageContainer>
  );
};

export default Staj;
