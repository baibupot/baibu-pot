import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, MessageCircle } from 'lucide-react';
import { useCreateContactMessage } from '@/hooks/useSupabaseData';
import { toast } from 'sonner';
import PageContainer from '@/components/ui/page-container';
import PageHero from '@/components/ui/page-hero';
import LoadingPage from '@/components/ui/loading-page';

const Iletisim = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const createContactMessage = useCreateContactMessage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.subject.trim() || !formData.message.trim()) {
      toast.error('Lütfen zorunlu alanları doldurun.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await createContactMessage.mutateAsync({
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        status: 'unread'
      });
      
      toast.success('Mesajınız başarıyla gönderildi!');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error('Mesaj gönderilirken bir hata oluştu.');
      console.error('Contact form error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (isSubmitting) {
    return (
      <PageContainer>
        <LoadingPage 
          title="Mesaj Gönderiliyor"
          message="Mesajınız iletiliyor, lütfen bekleyin..."
          icon={Send}
          variant="minimal"
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer background="gradient">
      {/* Hero Section */}
      <PageHero
        title="Bize Ulaşın"
        description="Sorularınız, önerileriniz veya görüşleriniz için bizimle iletişime geçin. Size en kısa sürede geri dönüş yapmaya çalışacağız."
        icon={MessageCircle}
        gradient="cyan"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
          <div className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              24
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-300">Saat İçinde Yanıt</div>
          </div>
          <div className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              7/24
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-300">Sosyal Medya</div>
          </div>
          <div className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              100%
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-300">Yanıt Oranı</div>
          </div>
        </div>
      </PageHero>

      <section className="py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <Card className="card-hover group overflow-hidden border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Mail className="h-6 w-6 text-cyan-500" />
                  İletişim Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
                    <Mail className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 dark:text-white mb-1">E-posta</p>
                    <p className="text-slate-600 dark:text-slate-400">pot@baibu.edu.tr</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">Resmi başvurular için</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 dark:text-white mb-1">Adres</p>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      Bolu Abant İzzet Baysal Üniversitesi<br />
                      İnsan ve Toplum Bilimleri Fakültesi<br />
                      Psikoloji Bölümü<br />
                      14030 Bolu/Türkiye
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                    <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 dark:text-white mb-1">Çalışma Saatleri</p>
                    <p className="text-slate-600 dark:text-slate-400">
                      Pazartesi - Cuma: 09:00 - 17:00<br />
                      Hafta Sonu: Kapalı
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">Sosyal medyadan her zaman ulaşabilirsiniz</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card className="card-hover group overflow-hidden border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl">Sosyal Medyada Bizi Takip Edin</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="group-hover:shadow-lg transition-all duration-200 h-12">
                    <span className="text-base">📱 Instagram</span>
                  </Button>
                  <Button variant="outline" className="group-hover:shadow-lg transition-all duration-200 h-12">
                    <span className="text-base">🐦 Twitter</span>
                  </Button>
                  <Button variant="outline" className="group-hover:shadow-lg transition-all duration-200 h-12">
                    <span className="text-base">📘 Facebook</span>
                  </Button>
                  <Button variant="outline" className="group-hover:shadow-lg transition-all duration-200 h-12">
                    <span className="text-base">💼 LinkedIn</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Link */}
            <Card className="card-hover group overflow-hidden border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl">Sıkça Sorulan Sorular</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                  Merak ettiğiniz soruların cevapları zaten hazır olabilir. 
                  Bize yazmadan önce SSS sayfamıza göz atın.
                </p>
                <Button variant="outline" className="w-full group-hover:shadow-lg transition-all duration-200">
                  ❓ SSS Sayfasını Ziyaret Et
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="card-hover group overflow-hidden border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Send className="h-6 w-6 text-cyan-500" />
                Mesaj Gönder
              </CardTitle>
              <p className="text-slate-600 dark:text-slate-400">
                Aşağıdaki formu doldurarak bizimle iletişime geçebilirsiniz.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-base font-medium">
                    Adınız Soyadınız <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Adınızı ve soyadınızı girin"
                    className="mt-2 h-12 bg-white/80 dark:bg-slate-700/80"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-base font-medium">E-posta Adresiniz</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="ornek@email.com (isteğe bağlı)"
                    className="mt-2 h-12 bg-white/80 dark:bg-slate-700/80"
                  />
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                    E-posta adresinizi girmek isteğe bağlıdır, ancak yanıt verebilmemiz için önerilir.
                  </p>
                </div>

                <div>
                  <Label htmlFor="subject" className="text-base font-medium">
                    Konu <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Mesajınızın konusunu girin"
                    className="mt-2 h-12 bg-white/80 dark:bg-slate-700/80"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="text-base font-medium">
                    Mesajınız <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Mesajınızı buraya yazın... Detaylı bilgi vermeniz, size daha iyi yardımcı olmamızı sağlar."
                    rows={6}
                    className="mt-2 bg-white/80 dark:bg-slate-700/80 resize-none"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-base group-hover:shadow-lg transition-all duration-200"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                      Gönderiliyor...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Mesaj Gönder
                    </>
                  )}
                </Button>

                <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                  <span className="text-red-500">*</span> işaretli alanlar zorunludur.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16">
        <Card className="card-hover overflow-hidden border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <MapPin className="h-6 w-6 text-emerald-500" />
              Kampüs Konumu
            </CardTitle>
            <p className="text-slate-600 dark:text-slate-400">
              Bolu Abant İzzet Baysal Üniversitesi kampüsümüzün konumu
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-80 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900 dark:to-teal-900 rounded-lg flex items-center justify-center relative overflow-hidden">
              <div className="text-center space-y-4">
                <div className="text-6xl">🗺️</div>
                <div>
                  <p className="text-slate-700 dark:text-slate-300 font-medium text-lg">
                    Interaktif Harita
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">
                    Yakında eklenecek
                  </p>
                </div>
              </div>
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer"></div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Quick Contact CTA */}
      <section className="py-16">
        <div className="bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 dark:from-cyan-950 dark:via-blue-950 dark:to-indigo-950 rounded-2xl p-12 text-center relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-1/4 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          </div>
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-8">
            <div className="text-6xl mb-6">🚀</div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
              Hızlı İletişim
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Acil durumlar için sosyal medya hesaplarımızdan ulaşabilir, 
              genel sorularınız için SSS sayfamızı ziyaret edebilirsiniz.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="outline" className="group">
                <MessageCircle className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                Sosyal Medya
              </Button>
              <Button size="lg" variant="outline" className="group">
                <CheckCircle className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform duration-200" />
                SSS
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PageContainer>
  );
};

export default Iletisim;
