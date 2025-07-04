import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import PageContainer from '@/components/ui/page-container';
import LoadingPage from '@/components/ui/loading-page';
import ErrorState from '@/components/ui/error-state';
import { Badge } from '@/components/ui/badge';
import { Calendar, User } from 'lucide-react';
import DOMPurify from 'dompurify';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const HaberDetay = () => {
  const { slug } = useParams<{ slug: string }>();

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
    return <PageContainer><LoadingPage title="Haber Yükleniyor..." /></PageContainer>;
  }

  if (error || !news) {
    return <PageContainer><ErrorState title="Haber Bulunamadı" message={error?.message || 'Bu haber mevcut değil.'} /></PageContainer>;
  }

  // Sanitize the HTML content
  const sanitizedContent = DOMPurify.sanitize(news.content, {
      ADD_TAGS: ['iframe'], // Allow iframes for YouTube
      ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'src', 'title'] // Allow necessary iframe attributes
  });

  return (
    <PageContainer>
      <article className="max-w-4xl mx-auto py-8">
        <header className="mb-8 text-center">
            {news.featured_image && <img src={news.featured_image} alt={news.title} className="w-full h-auto max-h-[500px] object-cover rounded-lg mb-8" />}
            <div className="flex justify-center items-center gap-4 mb-4">
                <Badge variant="secondary">{news.category}</Badge>
            </div>
          <h1 className="text-4xl font-bold tracking-tight">{news.title}</h1>
          <div className="mt-4 flex justify-center items-center gap-6 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>{new Date(news.created_at).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            {news.author && (
                <div className="flex items-center gap-2">
                    <User size={16} />
                    <span>{news.author.name}</span>
                </div>
            )}
          </div>
        </header>

        <div 
          className="prose dark:prose-invert max-w-full"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />

        <footer className="mt-12 pt-8 border-t">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Bu Haberi Paylaş</h3>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        toast.success("Haber linki kopyalandı!");
                    }}>
                        Linki Kopyala
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                        <a href={`https://twitter.com/intent/tweet?url=${window.location.href}&text=${news.title}`} target="_blank" rel="noopener noreferrer">
                            Twitter'da Paylaş
                        </a>
                    </Button>
                     <Button variant="outline" size="sm" asChild>
                        <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${window.location.href}&title=${news.title}`} target="_blank" rel="noopener noreferrer">
                            LinkedIn'de Paylaş
                        </a>
                    </Button>
                </div>
            </div>
        </footer>

      </article>
    </PageContainer>
  );
};

export default HaberDetay; 