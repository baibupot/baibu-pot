import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useInternships, useInternshipGuides, useInternshipExperiences, useAcademics } from '@/hooks/useSupabaseData';
import PageContainer from '@/components/ui/page-container';
import PageHero from '@/components/ui/page-hero';
import LoadingPage from '@/components/ui/loading-page';
import EmptyState from '@/components/ui/empty-state';
import { Briefcase, User, MapPin, Building2, Clock, ExternalLink, Send, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InternshipExperienceModal from '@/components/InternshipExperienceModal';

const Stajlar = () => {
    const { data: guides, isLoading: guidesLoading } = useInternshipGuides();
    const { data: internships, isLoading: internshipsLoading } = useInternships(true);
    const { data: experiences, isLoading: experiencesLoading } = useInternshipExperiences(true);
    const { data: academics, isLoading: academicsLoading } = useAcademics();

    const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);

    // Filters State
    const [searchTerm, setSearchTerm] = useState('');
    const [locationFilter, setLocationFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');

    const isLoading = guidesLoading || internshipsLoading || experiencesLoading || academicsLoading;

    // YouTube URL'sinden video ID'sini çıkaran yardımcı fonksiyon
    const getYouTubeVideoId = (url: string) => {
        try {
            const urlObj = new URL(url);
            if (urlObj.hostname.includes('youtube.com')) {
                return urlObj.searchParams.get('v');
            } else if (urlObj.hostname.includes('youtu.be')) {
                return urlObj.pathname.slice(1);
            }
        } catch (error) {
            console.error('YouTube URL parse hatası:', error);
        }
        return null;
    };

    const filteredInternships = useMemo(() => {
        if (!internships) return [];
        return internships.filter(internship => {
            const matchesSearch = internship.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 internship.company_name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesLocation = locationFilter === 'all' || internship.location.toLowerCase() === locationFilter.toLowerCase();
            const matchesType = typeFilter === 'all' || internship.internship_type === typeFilter;
            return matchesSearch && matchesLocation && matchesType;
        });
    }, [internships, searchTerm, locationFilter, typeFilter]);



    if (isLoading) {
        return <PageContainer><LoadingPage title="Staj Sayfası Yükleniyor..." icon={Briefcase} /></PageContainer>;
    }

    const uniqueLocations = internships ? [...new Set(internships.map(i => i.location))] : [];
    const internshipTypes = internships ? [...new Set(internships.map(i => i.internship_type).filter(Boolean))] : [];

    return (
        <PageContainer background="slate">
            <PageHero
                title="Staj Fırsatları ve Rehberi"
                description="Psikoloji alanındaki staj fırsatlarını keşfedin, deneyimlerden öğrenin ve kariyerinize yön verin."
                icon={Briefcase}
                gradient="blue"
            >
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                <div className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold">{internships?.length || 0}</div>
                    <p className="text-sm text-muted-foreground">Toplam İlan</p>
                </div>
                 <div className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold">{experiences?.length || 0}</div>
                    <p className="text-sm text-muted-foreground">Paylaşılan Deneyim</p>
                </div>
                 <div className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold">{uniqueLocations.length}</div>
                    <p className="text-sm text-muted-foreground">Farklı Şehir</p>
                </div>
                 <div className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold">{academics?.length || 0}</div>
                    <p className="text-sm text-muted-foreground">Akademisyen</p>
                </div>
            </div>
            </PageHero>

            {/* Staj İlanları */}
            <section className="py-12">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold tracking-tight">Güncel Staj İlanları</h2>
                    <p className="mt-2 text-lg text-muted-foreground">Kariyerinize yön verecek en yeni fırsatlar.</p>
                </div>
                {/* Search and Filters */}
                <div className="mb-6 sm:mb-8">
                    <Card variant="modern" className="animate-fade-in-up animation-delay-100">
                        <CardContent className="p-4 sm:p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                                <div className="lg:col-span-2 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 h-4 w-4" />
                                    <Input 
                                        placeholder="Pozisyon veya şirket ara..." 
                                        value={searchTerm} 
                                        onChange={(e) => setSearchTerm(e.target.value)} 
                                        className="pl-10 h-12 bg-white/90 dark:bg-slate-700/90 border-purple-200 focus:border-purple-400 dark:border-purple-800 dark:focus:border-purple-600" 
                                    />
                                    {searchTerm && (
                                        <button
                                            onClick={() => setSearchTerm('')}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-purple-600 transition-colors"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                                <Select value={locationFilter} onValueChange={setLocationFilter}>
                                    <SelectTrigger className="h-12 border-purple-200 dark:border-purple-800 focus:border-purple-400 dark:focus:border-purple-600">
                                        <SelectValue placeholder="Konum" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tüm Konumlar</SelectItem>
                                        {uniqueLocations.map(loc => <SelectItem key={loc} value={loc.toLowerCase()}>{loc}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Select value={typeFilter} onValueChange={setTypeFilter}>
                                    <SelectTrigger className="h-12 border-purple-200 dark:border-purple-800 focus:border-purple-400 dark:focus:border-purple-600">
                                        <SelectValue placeholder="Staj Türü" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tüm Türler</SelectItem>
                                        {internshipTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {filteredInternships.map((internship, index) => (
                        <Card key={internship.id} variant="modern" className={`flex flex-col transition-all animate-fade-in-up animation-delay-${200 + index * 100}`}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-primary"/>{internship.company_name}</CardTitle>
                                <CardDescription>{internship.position}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow space-y-3">
                                <Badge variant="outline"><MapPin className="h-4 w-4 mr-1"/>{internship.location}</Badge>
                                <Badge variant="outline"><Briefcase className="h-4 w-4 mr-1"/>{internship.internship_type}</Badge>
                                {internship.application_deadline && <Badge variant="destructive"><Clock className="h-4 w-4 mr-1"/>Son Başvuru: {new Date(internship.application_deadline).toLocaleDateString()}</Badge>}
                                <p className="text-sm text-muted-foreground pt-2 line-clamp-4">{internship.description}</p>
                            </CardContent>
                            <CardFooter>
                                <Button asChild className="w-full">
                                    <a href={internship.application_link || '#'} target="_blank" rel="noopener noreferrer">
                                        Başvur <ExternalLink className="h-4 w-4 ml-2"/>
                                    </a>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
                {filteredInternships.length === 0 && <EmptyState title="Aradığınız Kriterlere Uygun İlan Bulunamadı" description="Filtrelerinizi değiştirmeyi deneyin." icon={Briefcase}/>}
            </section>

            {/* Deneyim Paylaşımları */}
            {experiences && experiences.length > 0 && 
            <section className="py-12 bg-slate-100 dark:bg-slate-900/50 rounded-2xl -mx-4 px-4">
                 <div className="container mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-10">Öğrenci Staj Deneyimleri</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {experiences.map((exp, index) => (
                            <Card key={exp.id} variant="modern" className={`animate-fade-in-up animation-delay-${300 + index * 100}`}>
                                <CardHeader className='flex-row items-center gap-4'>
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        <User className="h-6 w-6 text-primary"/>
                                    </div>
                                    <div>
                                        <CardTitle>{exp.student_name}</CardTitle>
                                        <CardDescription>{exp.internship_place} - {exp.internship_year}</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="italic text-muted-foreground">"{exp.experience_text}"</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
            }

            {/* Staj Rehberi */}
            {guides && guides.length > 0 &&
            <section className="py-12">
                {guides.map(guide => (
                    <div key={guide.id} className="mb-12">
                        {guide.youtube_video_url && (
                             <div className="aspect-video w-full max-w-4xl mx-auto rounded-lg overflow-hidden shadow-2xl mb-10 border-4 border-white dark:border-slate-800">
                                <iframe
                                    className="w-full h-full"
                                    src={`https://www.youtube.com/embed/${getYouTubeVideoId(guide.youtube_video_url)}?rel=0&modestbranding=1&disablekb=1`}
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    loading="lazy"
                                    onError={(e) => {
                                        console.warn('YouTube video yüklenemedi:', e);
                                    }}
                                ></iframe>
                            </div>
                        )}
                        <div className="text-center">
                            <h2 className="text-3xl font-bold tracking-tight mb-6">{guide.title}</h2>
                            <div className="prose prose-lg dark:prose-invert max-w-4xl mx-auto prose-headings:text-slate-900 dark:prose-headings:text-white prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-strong:text-slate-900 dark:prose-strong:text-white prose-a:text-primary hover:prose-a:text-primary/80">
                               <div dangerouslySetInnerHTML={{ __html: guide.content || '' }} />
                            </div>
                        </div>
                    </div>
                ))}
            </section>
            }

            {/* İlgili Akademisyenler */}
             {academics && academics.length > 0 &&
             <section className="py-12">
                 <div className="container mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-10">İlgili Akademisyenler</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                        {academics.map(academic => (
                            <div key={academic.id} className="text-center flex flex-col items-center">
                                <img src={academic.profile_image || `https://ui-avatars.com/api/?name=${academic.name}&background=random`} alt={academic.name} className="w-24 h-24 rounded-full mx-auto mb-4 object-cover shadow-lg"/>
                                <h3 className="font-semibold">{academic.name}</h3>
                                <p className="text-sm text-muted-foreground">{academic.title}</p>
                                <a href={`mailto:${academic.email}`} className="text-sm text-primary hover:underline">{academic.email}</a>
                            </div>
                        ))}
                    </div>
                 </div>
             </section>
             }

             {/* CTA Section */}
            <section className="py-12 sm:py-16">
                <Card variant="modern" className="bg-gradient-to-br from-purple-50/80 via-indigo-50/80 to-blue-50/80 dark:from-purple-950/50 dark:via-indigo-950/50 dark:to-blue-950/50 border-purple-200/50 dark:border-purple-800/50 overflow-hidden animate-fade-in-up animation-delay-600">
                    <CardContent className="p-8 sm:p-12 text-center relative">
                        {/* Background decoration */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-0 left-1/4 w-48 sm:w-72 h-48 sm:h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
                            <div className="absolute bottom-0 right-1/4 w-48 sm:w-72 h-48 sm:h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
                        </div>
                        
                        <div className="relative z-10 max-w-2xl mx-auto space-y-6 sm:space-y-8">
                            <div className="p-4 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/50 dark:to-indigo-900/50 rounded-full w-fit mx-auto">
                                <Send className="h-12 w-12 sm:h-16 sm:w-16 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                                Sen de Deneyimini Paylaş!
                            </h2>
                            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                                Staj deneyimlerini paylaşarak senden sonraki öğrencilere yol göster. Onaylanan deneyimler bu sayfada yayınlanacaktır.
                            </p>
                            <Button 
                                size="lg" 
                                onClick={() => setIsExperienceModalOpen(true)}
                                className="group bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                <Send className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200"/>
                                Deneyimini Paylaş
                                <span className="ml-2 group-hover:translate-x-1 transition-transform duration-200">→</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </section>

            <InternshipExperienceModal
                isOpen={isExperienceModalOpen}
                onClose={() => setIsExperienceModalOpen(false)}
            />
        </PageContainer>
    );
};

export default Stajlar;
