
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Mail, Linkedin, Users } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';
import { useTeamMembers } from '@/hooks/useSupabaseData';

const Ekipler = () => {
  const { data: teamMembers = [], isLoading, error } = useTeamMembers(true);

  const teamsByGroup = {
    yonetim: teamMembers.filter(member => member.team === 'yonetim'),
    teknik: teamMembers.filter(member => member.team === 'teknik'),
    etkinlik: teamMembers.filter(member => member.team === 'etkinlik'),
    iletisim: teamMembers.filter(member => member.team === 'iletisim'),
    dergi: teamMembers.filter(member => member.team === 'dergi')
  };

  const getTeamInfo = (teamKey: string) => {
    const teamInfo: Record<string, { name: string; description: string }> = {
      yonetim: {
        name: 'Yönetim Kurulu',
        description: 'Topluluğun genel yönetimi ve stratejik kararlarından sorumlu ekip'
      },
      teknik: {
        name: 'Teknik İşler',
        description: 'Web sitesi, sosyal medya ve teknik altyapı yönetimi'
      },
      etkinlik: {
        name: 'Etkinlik Organizasyonu',
        description: 'Tüm etkinliklerin planlanması ve yürütülmesi'
      },
      iletisim: {
        name: 'İletişim ve Medya',
        description: 'Dış iletişim, basın ilişkileri ve içerik üretimi'
      },
      dergi: {
        name: 'Dergi Ekibi',
        description: 'Psikolojiİbu dergisinin hazırlanması ve yayınlanması'
      }
    };
    return teamInfo[teamKey];
  };

  const getRoleColor = (role: string) => {
    if (role.includes('Koordinatör') || role.includes('Başkan')) {
      return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300';
    }
    return 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300';
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
            <div className="text-center text-red-500">Ekip bilgileri yüklenirken bir hata oluştu.</div>
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
            {Object.entries(teamsByGroup).map(([teamKey, members]) => {
              if (members.length === 0) return null;
              const teamInfo = getTeamInfo(teamKey);
              
              return (
                <div key={teamKey}>
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <Users className="h-6 w-6 text-cyan-500" />
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {teamInfo.name}
                      </h2>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 max-w-3xl">
                      {teamInfo.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {members.map((member) => (
                      <Card key={member.id} className="hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="text-center">
                          <div className="w-24 h-24 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden">
                            {member.profile_image ? (
                              <img 
                                src={member.profile_image} 
                                alt={member.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="h-12 w-12 text-slate-400" />
                            )}
                          </div>
                          <Badge className={getRoleColor(member.role)} style={{ marginBottom: '8px' }}>
                            {member.role}
                          </Badge>
                          <CardTitle className="text-lg">{member.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {member.bio && (
                            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-3">
                              {member.bio}
                            </p>
                          )}
                          <div className="flex items-center justify-center gap-2">
                            {member.email && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(`mailto:${member.email}`, '_blank')}
                              >
                                <Mail className="h-4 w-4" />
                              </Button>
                            )}
                            {member.linkedin_url && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(member.linkedin_url, '_blank')}
                              >
                                <Linkedin className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {teamMembers.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                Henüz ekip üyesi bulunmuyor
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Yeni ekip üyeleri eklendiğinde burada görünecek.
              </p>
            </div>
          )}

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
