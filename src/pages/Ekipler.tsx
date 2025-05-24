
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Mail, Linkedin, Users } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';

// Mock data - bu veriler Supabase'den gelecek
const mockTeams = [
  {
    id: 'management',
    name: 'Yönetim Kurulu',
    description: 'Topluluğun genel yönetimi ve stratejik kararlarından sorumlu ekip',
    members: [
      {
        id: '1',
        name: 'Ahmet Yılmaz',
        role: 'Başkan',
        bio: 'Psikoloji 4. sınıf öğrencisi. Topluluk liderliği ve etkinlik organizasyonu konularında deneyimli.',
        email: 'ahmet@example.com',
        linkedin: 'https://linkedin.com/in/ahmetyilmaz',
        photo: '/placeholder.svg'
      },
      {
        id: '2',
        name: 'Ayşe Demir',
        role: 'Başkan Yardımcısı',
        bio: 'Psikoloji 3. sınıf öğrencisi. Akademik etkinlikler ve öğrenci ilişkileri koordinatörü.',
        email: 'ayse@example.com',
        linkedin: 'https://linkedin.com/in/aysedemir',
        photo: '/placeholder.svg'
      }
    ]
  },
  {
    id: 'technical',
    name: 'Teknik İşler',
    description: 'Web sitesi, sosyal medya ve teknik altyapı yönetimi',
    members: [
      {
        id: '3',
        name: 'Mehmet Kaya',
        role: 'Teknik İşler Koordinatörü',
        bio: 'Psikoloji 3. sınıf öğrencisi. Web geliştirme ve dijital medya konularında uzman.',
        email: 'mehmet@example.com',
        linkedin: 'https://linkedin.com/in/mehmetkaya',
        photo: '/placeholder.svg'
      },
      {
        id: '4',
        name: 'Fatma Öz',
        role: 'Teknik İşler Ekip Üyesi',
        bio: 'Psikoloji 2. sınıf öğrencisi. Grafik tasarım ve sosyal medya yönetimi.',
        email: 'fatma@example.com',
        linkedin: 'https://linkedin.com/in/fatmaoz',
        photo: '/placeholder.svg'
      }
    ]
  },
  {
    id: 'events',
    name: 'Etkinlik Organizasyonu',
    description: 'Tüm etkinliklerin planlanması ve yürütülmesi',
    members: [
      {
        id: '5',
        name: 'Ali Çelik',
        role: 'Etkinlik Koordinatörü',
        bio: 'Psikoloji 4. sınıf öğrencisi. Etkinlik yönetimi ve sponsorluk ilişkileri uzmanı.',
        email: 'ali@example.com',
        linkedin: 'https://linkedin.com/in/alicelik',
        photo: '/placeholder.svg'
      },
      {
        id: '6',
        name: 'Zeynep Aydın',
        role: 'Etkinlik Ekip Üyesi',
        bio: 'Psikoloji 2. sınıf öğrencisi. Etkinlik planlama ve katılımcı koordinasyonu.',
        email: 'zeynep@example.com',
        linkedin: 'https://linkedin.com/in/zeynepaydın',
        photo: '/placeholder.svg'
      }
    ]
  },
  {
    id: 'communication',
    name: 'İletişim ve Medya',
    description: 'Dış iletişim, basın ilişkileri ve içerik üretimi',
    members: [
      {
        id: '7',
        name: 'Emre Yıldız',
        role: 'İletişim Koordinatörü',
        bio: 'Psikoloji 3. sınıf öğrencisi. Basın ilişkileri ve kurumsal iletişim uzmanı.',
        email: 'emre@example.com',
        linkedin: 'https://linkedin.com/in/emreyildiz',
        photo: '/placeholder.svg'
      },
      {
        id: '8',
        name: 'Selin Kara',
        role: 'İletişim Ekip Üyesi',
        bio: 'Psikoloji 1. sınıf öğrencisi. İçerik yazımı ve sosyal medya yönetimi.',
        email: 'selin@example.com',
        linkedin: 'https://linkedin.com/in/selinkara',
        photo: '/placeholder.svg'
      }
    ]
  },
  {
    id: 'magazine',
    name: 'Dergi Ekibi',
    description: 'Psikolojiİbu dergisinin hazırlanması ve yayınlanması',
    members: [
      {
        id: '9',
        name: 'Burak Şen',
        role: 'Dergi Koordinatörü',
        bio: 'Psikoloji 4. sınıf öğrencisi. Akademik yazım ve editörlük deneyimi.',
        email: 'burak@example.com',
        linkedin: 'https://linkedin.com/in/buraksen',
        photo: '/placeholder.svg'
      },
      {
        id: '10',
        name: 'Deniz Güneş',
        role: 'Dergi Ekip Üyesi',
        bio: 'Psikoloji 2. sınıf öğrencisi. Araştırma ve makale yazımı konularında ilgili.',
        email: 'deniz@example.com',
        linkedin: 'https://linkedin.com/in/denizgunes',
        photo: '/placeholder.svg'
      }
    ]
  }
];

const Ekipler = () => {
  const getRoleColor = (role: string) => {
    if (role.includes('Koordinatör') || role.includes('Başkan')) {
      return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300';
    }
    return 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300';
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Topluluk Yönetimi ve Ekiplerimiz
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              BAİBÜ Psikoloji Öğrencileri Topluluğu'nun başarılı çalışmalarının arkasında 
              bulunan değerli ekip üyelerimizi tanıyın. Her bir ekip üyemiz, topluluğumuzun 
              misyonunu gerçekleştirmek için gönüllü olarak çalışmaktadır.
            </p>
          </div>

          {/* Teams */}
          <div className="space-y-12">
            {mockTeams.map((team) => (
              <div key={team.id}>
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Users className="h-6 w-6 text-cyan-500" />
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {team.name}
                    </h2>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 max-w-3xl">
                    {team.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {team.members.map((member) => (
                    <Card key={member.id} className="hover:shadow-lg transition-shadow duration-300">
                      <CardHeader className="text-center">
                        <div className="w-24 h-24 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                          <User className="h-12 w-12 text-slate-400" />
                        </div>
                        <Badge className={getRoleColor(member.role)} style={{ marginBottom: '8px' }}>
                          {member.role}
                        </Badge>
                        <CardTitle className="text-lg">{member.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-3">
                          {member.bio}
                        </p>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`mailto:${member.email}`, '_blank')}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(member.linkedin, '_blank')}
                          >
                            <Linkedin className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Join Us Section */}
          <div className="mt-16 bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-950 dark:to-teal-950 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Ekibimize Katılmak İster Misiniz?
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-2xl mx-auto">
              Psikoloji alanında kendini geliştirmek, deneyim kazanmak ve topluluk çalışmalarına 
              katkı sağlamak istiyorsan ekibimizin bir parçası olabilirsin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button>
                Üyelik Başvurusu Yap
              </Button>
              <Button variant="outline">
                Detaylı Bilgi Al
              </Button>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default Ekipler;
