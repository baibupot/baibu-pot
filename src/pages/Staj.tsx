
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
  Users
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';

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
              Psikoloji eğitiminizi pratik deneyimlerle destekleyin. Güncel staj ilanları, 
              deneyim paylaşımları ve başvuru rehberleri ile staj sürecinizde size yardımcı oluyoruz.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-200 dark:border-slate-700">
            <Button
              variant={activeTab === 'ilanlar' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('ilanlar')}
              className="mb-2"
            >
              <Building className="h-4 w-4 mr-2" />
              Staj İlanları
            </Button>
            <Button
              variant={activeTab === 'deneyimler' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('deneyimler')}
              className="mb-2"
            >
              <Users className="h-4 w-4 mr-2" />
              Deneyim Paylaşımları
            </Button>
            <Button
              variant={activeTab === 'rehber' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('rehber')}
              className="mb-2"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Staj Rehberi
            </Button>
          </div>

          {/* Staj İlanları Tab */}
          {activeTab === 'ilanlar' && (
            <div>
              {/* Search and Filter Section */}
              <div className="mb-8 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Staj ilanlarında ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex flex-wrap gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Şehir
                    </label>
                    <div className="flex gap-2">
                      {locations.map((location) => (
                        <Button
                          key={location}
                          variant={selectedLocation === location ? "default" : "outline"}
                          onClick={() => setSelectedLocation(location)}
                          size="sm"
                        >
                          {location}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Çalışma Türü
                    </label>
                    <div className="flex gap-2">
                      {types.map((type) => (
                        <Button
                          key={type}
                          variant={selectedType === type ? "default" : "outline"}
                          onClick={() => setSelectedType(type)}
                          size="sm"
                        >
                          {type}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Internship Listings */}
              <div className="space-y-6">
                {filteredInternships.map((internship) => (
                  <Card key={internship.id} className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getTypeColor(internship.type)}>
                              {internship.type}
                            </Badge>
                            <Badge variant="outline">
                              {internship.duration}
                            </Badge>
                          </div>
                          <CardTitle className="text-xl mb-2">{internship.title}</CardTitle>
                          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-1">
                              <Building className="h-4 w-4" />
                              <span>{internship.company}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{internship.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>Son başvuru: {formatDate(internship.application_deadline)}</span>
                            </div>
                          </div>
                        </div>
                        <Button className="flex items-center gap-2">
                          Detaylar ve Başvuru
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 dark:text-slate-400 mb-4">
                        {internship.description}
                      </p>
                      <div className="mb-4">
                        <h4 className="font-medium text-slate-900 dark:text-white mb-2">Gereksinimler:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-400">
                          {internship.requirements.map((req, index) => (
                            <li key={index}>{req}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Başlangıç: {formatDate(internship.start_date)}</span>
                        </div>
                        <span>•</span>
                        <span>İletişim: {internship.contact_email}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredInternships.length === 0 && (
                <div className="text-center py-12">
                  <Building className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                    Aradığınız kriterlerde staj ilanı bulunamadı
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Lütfen farklı arama terimleri deneyin veya filtreleri değiştirin.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Deneyim Paylaşımları Tab */}
          {activeTab === 'deneyimler' && (
            <div className="space-y-6">
              {mockExperiences.map((experience) => (
                <Card key={experience.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          {experience.student_name}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {experience.internship_place} - {experience.year}
                        </p>
                      </div>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span 
                            key={i} 
                            className={`text-sm ${i < experience.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">
                      {experience.experience}
                    </p>
                  </CardContent>
                </Card>
              ))}
              
              <div className="text-center">
                <Button variant="outline">
                  Deneyimini Paylaş
                </Button>
              </div>
            </div>
          )}

          {/* Staj Rehberi Tab */}
          {activeTab === 'rehber' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {guides.map((guide) => (
                  <Card key={guide.id} className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <FileText className="h-8 w-8 text-cyan-500 mb-2" />
                      <CardTitle className="text-lg">{guide.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 dark:text-slate-400 mb-4">
                        {guide.description}
                      </p>
                      <Button variant="outline" className="w-full">
                        İndir
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default Staj;
