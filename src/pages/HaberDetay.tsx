import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import PageContainer from '@/components/ui/page-container';
import LoadingPage from '@/components/ui/loading-page';
import ErrorState from '@/components/ui/error-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Calendar, 
  User, 
  ArrowLeft, 
  Share, 
  Facebook, 
  Instagram,
  ExternalLink
} from 'lucide-react';
import DOMPurify from 'dompurify';
import { toast } from 'sonner';

const HaberDetay = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: news, isLoading, error } = useQuery({
    queryKey: ['news', slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from('news')
        .select(`*, author:users(name)`)
        .eq('slug', slug)
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <PageContainer background="gradient">
        <LoadingPage 
          title="Haber Detayı Yükleniyor"
          message="Haber içeriği hazırlanıyor..."
          icon={Calendar}
        />
      </PageContainer>
    );
  }

  if (error || !news) {
    return (
      <PageContainer background="gradient">
        <ErrorState 
          title="Haber Bulunamadı"
          message={error?.message || 'Aradığınız haber bulunamadı veya silinmiş olabilir.'}
          onRetry={() => navigate('/haberler')}
          variant="notfound"
        />
      </PageContainer>
    );
  }

  // Sanitize the HTML content
  const sanitizedContent = DOMPurify.sanitize(news.content, {
      ADD_TAGS: ['iframe'], // Allow iframes for YouTube
      ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'src', 'title'] // Allow necessary iframe attributes
  });

  return (
    <PageContainer background="gradient">
      {/* Mobile-First Header */}
      <div className="mb-6 sm:mb-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/haberler')}
          className="mb-4 h-12 px-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border border-white/20 dark:border-slate-700/20 hover:bg-white/80 dark:hover:bg-slate-800/80 interactive-scale"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          <span className="font-medium">Haberlere Dön</span>
        </Button>
      </div>

      {/* Main Content */}
      <article className="max-w-4xl mx-auto">
        {/* Header Card */}
        <Card variant="modern" className="overflow-hidden mb-6 sm:mb-8 animate-fade-in-up">
          {/* Featured Image */}
          {news.featured_image && (
            <div className="relative">
              <div className="aspect-video sm:aspect-[21/9] w-full overflow-hidden">
                <img 
                  src={news.featured_image} 
                  alt={news.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
              </div>
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              
              {/* Category Badge */}
              <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg backdrop-blur-md border border-white/20 font-medium">
                  📰 {news.category}
                </Badge>
              </div>
            </div>
          )}
          
          {/* Header Content */}
          <CardContent className="p-4 sm:p-6 lg:p-8">
            {/* Category Badge - Only show if no featured image */}
            {!news.featured_image && (
              <div className="mb-4 sm:mb-6">
                <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium px-4 py-2">
                  📰 {news.category}
                </Badge>
              </div>
            )}
            
            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text-primary mb-4 sm:mb-6 leading-tight">
              {news.title}
            </h1>
            
            {/* Meta Information */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                  <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm sm:text-base font-medium">
                  📅 {new Date(news.created_at).toLocaleDateString('tr-TR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
              {news.author && (
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                    <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-sm sm:text-base font-medium">
                    ✍️ {news.author.name}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Content Card */}
        <Card variant="modern" className="mb-6 sm:mb-8 animate-fade-in-up animation-delay-200">
          <CardContent className="p-4 sm:p-6 lg:p-8">
            <div 
              className="prose dark:prose-invert max-w-none prose-headings:gradient-text-primary prose-headings:font-bold prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:leading-relaxed prose-a:text-cyan-600 hover:prose-a:text-cyan-700 prose-img:rounded-2xl prose-img:shadow-lg"
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />
          </CardContent>
        </Card>

        {/* Social Share Card */}
        <Card variant="modern" className="animate-fade-in-up animation-delay-400">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
              <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-xl">
                <Share className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              🚀 Bu Haberi Paylaş
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {/* Link Kopyala */}
              <Button
                variant="modern"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("🔗 Haber linki kopyalandı!");
                }}
                className="bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white border-0 shadow-lg hover:shadow-xl interactive-scale"
              >
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
                 Linki Kopyala
              </Button>

              {/* X (Twitter) */}
              <Button
                variant="modern"
                size="sm"
                onClick={() => {
                  const text = `${news.title} - ${window.location.href}`;
                  const xUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
                  window.open(xUrl, '_blank');
                }}
                className="bg-black hover:bg-gray-800 text-white border-0 shadow-lg hover:shadow-xl interactive-scale"
              >
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </Button>

              {/* Facebook */}
              <Button
                variant="modern"
                size="sm"
                onClick={() => {
                  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
                  window.open(facebookUrl, '_blank');
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-lg hover:shadow-xl interactive-scale"
              >
                <Facebook className="h-4 w-4 mr-2" />
              </Button>

              {/* LinkedIn */}
              <Button
                variant="modern"
                size="sm"
                onClick={() => {
                  const linkedinUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(news.title)}`;
                  window.open(linkedinUrl, '_blank');
                }}
                className="bg-blue-700 hover:bg-blue-800 text-white border-0 shadow-lg hover:shadow-xl interactive-scale"
              >
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.968v5.699h-3v-10h2.881v1.367h.041c.401-.761 1.379-1.563 2.838-1.563 3.034 0 3.595 1.997 3.595 4.59v5.606zm0 0"/>
                </svg>
              </Button>

              {/* WhatsApp */}
              <Button
                variant="modern"
                size="sm"
                onClick={() => {
                  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${news.title} - ${window.location.href}`)}`;
                  window.open(whatsappUrl, '_blank');
                }}
                className="bg-green-500 hover:bg-green-600 text-white border-0 shadow-lg hover:shadow-xl interactive-scale"
              >
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
              </Button>
            </div>
          </CardContent>
        </Card>
      </article>
    </PageContainer>
  );
};

export default HaberDetay; 