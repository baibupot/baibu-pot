import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import PageContainer from '@/components/ui/page-container';
import PageHero from '@/components/ui/page-hero';
import LoadingPage from '@/components/ui/loading-page';
import ErrorState from '@/components/ui/error-state';
import EmptyState from '@/components/ui/empty-state';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, User, Mail, Linkedin, Shield, Calendar, Users2 } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

// Veritabanından dönecek olan kompleks tipi tanımlayalım
type TeamMember = Database['public']['Tables']['team_members']['Row'];
type Team = Database['public']['Tables']['teams']['Row'] & { team_members: TeamMember[] };
type Period = Database['public']['Tables']['periods']['Row'] & { teams: Team[] };

// Üye kartı bileşeni
const MemberCard = ({ member }: { member: TeamMember }) => {
    const socialLinks = member.social_links as { email?: string; linkedin?: string } | null;

    return (
        <Card className="text-center transition-all duration-300 hover:shadow-xl hover:scale-105 border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
                <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden">
                    {member.profile_image ? (
                        <img src={member.profile_image} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                        <User className="h-12 w-12 text-slate-400" />
                    )}
                </div>
                <CardTitle className="text-lg">{member.name}</CardTitle>
                <p className="text-sm text-cyan-600 dark:text-cyan-400 font-semibold">{member.role}</p>
                    </CardHeader>
                    <CardContent>
                      {member.bio && (
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-3 leading-relaxed">
                          {member.bio}
                        </p>
                      )}
                <div className="flex items-center justify-center gap-2">
                    {socialLinks?.email && (
                        <Button asChild variant="outline" size="icon" className="rounded-full">
                            <a href={`mailto:${socialLinks.email}`} target="_blank" rel="noopener noreferrer">
                            <Mail className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                    {socialLinks?.linkedin && (
                        <Button asChild variant="outline" size="icon" className="rounded-full">
                            <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                            <Linkedin className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
    );
};

const Ekipler = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['teams_by_period'],
        queryFn: async () => {
            const { data: periodsData, error: periodsError } = await supabase
                .from('periods')
                .select(`
                    *,
                    teams (
                        *,
                        team_members (
                            *
                        )
                    )
                `)
                .order('name', { ascending: false });

            if (periodsError) throw periodsError;
            
            // Veriyi işleyerek aktif ve geçmiş dönemleri ayıralım
            const activePeriod = periodsData.find(p => p.is_active) as Period | undefined;
            const pastPeriods = periodsData.filter(p => !p.is_active) as Period[];

            return { activePeriod, pastPeriods };
        }
    });

    if (isLoading) {
        return (
          <PageContainer>
            <LoadingPage
              title="Ekipler Yükleniyor..."
              message="Topluluk üyelerimizi sizin için listeliyoruz."
              icon={Users}
            />
          </PageContainer>
        );
    }

    if (error) {
        return (
          <PageContainer>
            <ErrorState
              title="Ekipler Yüklenemedi"
              message={error.message as string}
              onRetry={() => window.location.reload()}
            />
          </PageContainer>
        );
    }

    if (!data?.activePeriod) {
        return (
          <PageContainer>
            <EmptyState
              title="Aktif Dönem Bulunamadı"
              description="Henüz aktif bir yönetim dönemi tanımlanmamış."
              icon={Calendar}
            />
          </PageContainer>
        );
    }

    const { activePeriod, pastPeriods } = data;
    const board = activePeriod.teams.find(t => t.is_board);
    const otherTeams = activePeriod.teams.filter(t => !t.is_board && t.team_members.length > 0);

    return (
        <PageContainer>
            <PageHero
                title="Ekiplerimiz"
                description={`Topluluğumuza güç veren ${activePeriod.name} Yönetim Kadrosu ve değerli ekip üyelerimizle tanışın.`}
                icon={Users2}
            />

            {/* Aktif Dönem Yönetim Kurulu */}
            {board && board.team_members.length > 0 && (
                <section className="py-12">
                    <div className="text-center mb-10">
                        <Badge variant="default" className="text-sm py-2 px-4 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200">
                           {activePeriod.name} Yönetim Kurulu
                        </Badge>
                        <h2 className="text-3xl font-bold mt-4">Topluluğun Liderleri</h2>
                        <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-2xl mx-auto">Stratejik kararları alan ve topluluğun genel vizyonunu belirleyen yönetim kurulumuz.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {board.team_members.sort((a,b) => (a.sort_order || 0) - (b.sort_order || 0)).map(member => (
                            <MemberCard key={member.id} member={member} />
                ))}
              </div>
            </section>
            )}

            {/* Aktif Dönem Diğer Ekipler */}
            {otherTeams.length > 0 && (
                <section className="py-12 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                    <div className="container mx-auto">
                         <div className="text-center mb-10">
                            <h2 className="text-3xl font-bold">Koordinatörlükler ve Ekipleri</h2>
                            <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-2xl mx-auto">Projelerimizi ve etkinliklerimizi hayata geçiren dinamik ekiplerimiz.</p>
          </div>
                        <Accordion type="single" collapsible className="w-full max-w-4xl mx-auto">
                            {otherTeams.sort((a,b) => (a.sort_order || 0) - (b.sort_order || 0)).map(team => (
                                <AccordionItem key={team.id} value={team.id}>
                                    <AccordionTrigger className="text-xl font-semibold hover:no-underline">
                                        <div className="flex items-center gap-4">
                                            <span>{team.name}</span>
                                            <Badge variant="secondary">{team.team_members.length} Üye</Badge>
            </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pt-4">
                                        <p className="text-slate-600 dark:text-slate-400 mb-6">{team.description}</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {team.team_members.sort((a,b) => (a.sort_order || 0) - (b.sort_order || 0)).map(member => (
                                                <MemberCard key={member.id} member={member} />
                                            ))}
          </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
        </div>
      </section>
            )}

            {/* Geçmiş Dönemler */}
            {pastPeriods.length > 0 && (
                <section className="py-12">
                     <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold">Geçmiş Dönem Yönetim Kurulları</h2>
                        <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-2xl mx-auto">Topluluğumuzun bugünlere gelmesinde emeği geçen geçmiş dönem liderlerimiz.</p>
                    </div>
                     <Accordion type="single" collapsible className="w-full max-w-4xl mx-auto">
                        {pastPeriods.map(period => {
                            const pastBoard = period.teams.find(t => t.is_board);
                            if (!pastBoard || pastBoard.team_members.length === 0) return null;

                            return (
                                <AccordionItem key={period.id} value={period.id}>
                                    <AccordionTrigger className="text-xl font-semibold hover:no-underline">
                                        <div className='flex items-center gap-4'>
                                            <Calendar className="h-5 w-5 text-slate-500" />
                                            <span>{period.name}</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pt-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {pastBoard.team_members.sort((a,b) => (a.sort_order || 0) - (b.sort_order || 0)).map(member => (
                                                <MemberCard key={member.id} member={member} />
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            );
                        })}
                    </Accordion>
                </section>
            )}
    </PageContainer>
  );
};

export default Ekipler;
