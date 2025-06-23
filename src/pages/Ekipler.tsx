import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Mail, Linkedin, Users } from 'lucide-react';
import { useTeamMembers } from '@/hooks/useSupabaseData';
import PageContainer from '@/components/ui/page-container';
import PageHero from '@/components/ui/page-hero';
import LoadingPage from '@/components/ui/loading-page';
import ErrorState from '@/components/ui/error-state';
import EmptyState from '@/components/ui/empty-state';

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
    const teamInfo: Record<string, { name: string; description: string; color: string; emoji: string }> = {
      yonetim: {
        name: 'Yönetim Kurulu',
        description: 'Topluluğun genel yönetimi ve stratejik kararlarından sorumlu ekip',
        color: 'cyan',
        emoji: '👑'
      },
      teknik: {
        name: 'Teknik İşler',
        description: 'Web sitesi, sosyal medya ve teknik altyapı yönetimi',
        color: 'blue',
        emoji: '💻'
      },
      etkinlik: {
        name: 'Etkinlik Organizasyonu',
        description: 'Tüm etkinliklerin planlanması ve yürütülmesi',
        color: 'purple',
        emoji: '🎉'
      },
      iletisim: {
        name: 'İletişim ve Medya',
        description: 'Dış iletişim, basın ilişkileri ve içerik üretimi',
        color: 'emerald',
        emoji: '📢'
      },
      dergi: {
        name: 'Dergi Ekibi',
        description: 'Psikolojiİbu dergisinin hazırlanması ve yayınlanması',
        color: 'pink',
        emoji: '📚'
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

  // Loading state
  if (isLoading) {
    return (
      <PageContainer background="slate">
        <LoadingPage 
          title="Ekip Bilgileri Yükleniyor"
          message="Takım üyelerimizi tanıtmaya hazırlanıyoruz..."
          icon={Users}
        />
      </PageContainer>
    );
  }

  // Error state
  if (error) {
    return (
      <PageContainer background="slate">
        <ErrorState 
          title="Ekip Bilgileri Yüklenemedi"
          message="Ekip üyelerini yüklerken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
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
        title="Topluluk Yönetimi ve Ekiplerimiz"
        description="BAİBÜ Psikoloji Öğrencileri Topluluğu'nun başarılı çalışmalarının arkasında bulunan değerli ekip üyelerimizi tanıyın. Her bir ekip üyemiz, topluluğumuzun misyonunu gerçekleştirmek için gönüllü olarak çalışmaktadır."
        icon={Users}
        gradient="blue"
      >
        {teamMembers.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mt-8">
            <div className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {teamMembers.length}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Toplam Üye</div>
            </div>
            <div className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {Object.keys(teamsByGroup).filter(key => teamsByGroup[key as keyof typeof teamsByGroup].length > 0).length}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Aktif Ekip</div>
            </div>
            <div className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {teamMembers.filter(m => m.role.includes('Koordinatör') || m.role.includes('Başkan')).length}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Lider</div>
            </div>
            <div className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                5+
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Çalışma Alanı</div>
            </div>
          </div>
        )}
      </PageHero>

      {/* Teams */}
      <div className="space-y-16 py-12">
        {Object.entries(teamsByGroup).map(([teamKey, members]) => {
          if (members.length === 0) return null;
          const teamInfo = getTeamInfo(teamKey);
          
          return (
            <section key={teamKey}>
              <div className="mb-12">
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-4xl">{teamInfo.emoji}</div>
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                      {teamInfo.name}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-3xl">
                      {teamInfo.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {members.map((member) => (
                  <Card 
                    key={member.id} 
                    className="card-hover group overflow-hidden border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
                  >
                    <CardHeader className="text-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden relative">
                        {member.profile_image ? (
                          <img 
                            src={member.profile_image} 
                            alt={member.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <User className="h-12 w-12 text-slate-400 group-hover:scale-110 transition-transform duration-300" />
                        )}
                        {/* Online indicator */}
                        <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800"></div>
                      </div>
                      <Badge className={`${getRoleColor(member.role)} mb-3`}>
                        {member.role}
                      </Badge>
                      <CardTitle className="text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                        {member.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {member.bio && (
                        <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 line-clamp-3 leading-relaxed">
                          {member.bio}
                        </p>
                      )}
                      <div className="flex items-center justify-center gap-3">
                        {member.email && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="group-hover:shadow-lg transition-all duration-200"
                            onClick={() => window.open(`mailto:${member.email}`, '_blank')}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                        )}
                        {member.linkedin_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="group-hover:shadow-lg transition-all duration-200"
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
            </section>
          );
        })}
      </div>

      {/* Empty State */}
      {teamMembers.length === 0 && (
        <EmptyState
          icon={Users}
          title="Henüz Ekip Üyesi Bulunmuyor"
          description="Yeni ekip üyeleri eklendiğinde burada görünecek. Katılım için bizimle iletişime geçin!"
          actionLabel="İletişim"
          onAction={() => window.location.href = '/iletisim'}
        />
      )}

      {/* Join Us Section */}
      <section className="py-16">
        <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-blue-950 dark:via-cyan-950 dark:to-teal-950 rounded-2xl p-12 text-center relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          </div>
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-8">
            <div className="text-6xl mb-6">🚀</div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
              Ekibimize Katılmak İster Misiniz?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Psikoloji alanında kendini geliştirmek, deneyim kazanmak ve topluluk çalışmalarına 
              katkı sağlamak istiyorsan ekibimizin bir parçası olabilirsin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="group">
                <Users className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform duration-200" />
                Üyelik Başvurusu Yap
              </Button>
              <Button variant="outline" size="lg" className="group">
                <Mail className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                Detaylı Bilgi Al
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PageContainer>
  );
};

export default Ekipler;
