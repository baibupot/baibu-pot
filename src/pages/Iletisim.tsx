import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, MapPin, Send, CheckCircle, MessageCircle, Instagram, Facebook, Linkedin, Youtube } from 'lucide-react';
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
  const [isSubmitted, setIsSubmitted] = useState(false);
  
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
      
      setIsSubmitted(true);
      toast.success('🎉 Mesajınız başarıyla gönderildi! Teşekkür ederiz.');
      
      // 4 saniye sonra formu sıfırla ve normal haline döndür
      setTimeout(() => {
        setFormData({ name: '', email: '', subject: '', message: '' });
        setIsSubmitted(false);
      }, 4000);
      
    } catch (error) {
      toast.error('❌ Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
      console.error('Contact form error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <PageContainer background="gradient">
      {/* Hero Section */}
      <PageHero
        title="Bize Ulaşın"
        description="Sorularınız, önerileriniz veya görüşleriniz için bizimle iletişime geçin. Size en kısa sürede geri dönüş yapmaya çalışacağız."
        icon={MessageCircle}
        gradient="cyan"
      >
        <div className="flex justify-center mt-8">
          <div className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm rounded-xl p-6 text-center">
            <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
              ⚡
            </div>
            <div className="text-lg font-semibold text-slate-900 dark:text-white">
              Hızlı Yanıt
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-300">
              Oranı
            </div>
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
                    <p className="text-slate-600 dark:text-slate-400">
                      <a href="mailto:baibupsikolojitoplulugu@gmail.com" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                        baibupsikolojitoplulugu@gmail.com
                      </a>
                    </p>
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
                      Fen Edebiyat Fakültesi<br />
                      Psikoloji Bölümü<br />
                      14030 Gölköy/Bolu
                    </p>
                  </div>
                </div>
                

              </CardContent>
            </Card>

            {/* Social Media */}
            <Card 
              className="card-hover group overflow-hidden border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
              data-social-media-card
            >
              <CardHeader>
                <CardTitle className="text-xl">Sosyal Medyada Bizi Takip Edin</CardTitle>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">
                  Güncel duyurular ve etkinliklerimizden haberdar olmak için sosyal medya hesaplarımızı takip edin.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className="group-hover:shadow-lg transition-all duration-200 h-14 justify-start"
                    onClick={() => window.open('https://www.instagram.com/baibupsikoloji', '_blank')}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-lg flex items-center justify-center">
                        <Instagram className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">Instagram</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">@baibupsikoloji</div>
                      </div>
                    </div>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="group-hover:shadow-lg transition-all duration-200 h-14 justify-start"
                    onClick={() => window.open('https://facebook.com/aibu.pot', '_blank')}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Facebook className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">Facebook</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">aibu.pot</div>
                      </div>
                    </div>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="group-hover:shadow-lg transition-all duration-200 h-14 justify-start"
                    onClick={() => window.open('https://twitter.com/baibupsikoloji', '_blank')}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-10 h-10 bg-black dark:bg-white rounded-lg flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="h-5 w-5 text-white dark:text-black">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">X (Twitter)</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">@baibupsikoloji</div>
                      </div>
                    </div>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="group-hover:shadow-lg transition-all duration-200 h-14 justify-start"
                    onClick={() => window.open('https://tr.linkedin.com/in/baibupsikoloji?trk=public_post_feed-actor-name', '_blank')}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center">
                        <Linkedin className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">LinkedIn</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">baibupsikoloji</div>
                      </div>
                    </div>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="group-hover:shadow-lg transition-all duration-200 h-14 justify-start"
                    onClick={() => window.open('https://www.youtube.com/channel/UCq_LNuabFO9CWm7dHFPxSHQ', '_blank')}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                        <Youtube className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">YouTube</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">BAİBÜ PÖT</div>
                      </div>
                    </div>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="group-hover:shadow-lg transition-all duration-200 h-14 justify-start"
                    onClick={() => window.open('https://open.spotify.com/user/chg73jv11emfnf66gt23hqm67?si=82f2e1622ee64249', '_blank')}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="h-5 w-5 text-white">
                          <path d="M12 0C5.371 0 0 5.371 0 12c0 6.627 5.371 12 12 12s12-5.373 12-12c0-6.629-5.371-12-12-12zm5.438 17.438c-.229.373-.708.49-1.08.26-2.953-1.807-6.675-2.213-11.06-1.209-.429.094-.859-.168-.953-.598-.094-.43.168-.859.598-.953 4.771-1.07 8.872-.617 12.174 1.318.373.229.49.708.261 1.082zm1.543-3.082c-.287.467-.893.617-1.359.33-3.381-2.08-8.547-2.684-12.547-1.463-.521.156-1.072-.137-1.229-.658-.156-.521.137-1.072.658-1.229 4.547-1.363 10.229-.707 14.047 1.684.467.287.617.893.33 1.336zm.146-3.146c-4.08-2.426-10.88-2.646-14.438-1.438-.635.199-1.318-.146-1.518-.781-.199-.635.146-1.318.781-1.518 4.08-1.281 11.453-1.027 16.02 1.646.573.344.76 1.094.416 1.668-.344.573-1.094.76-1.668.416z"/>
                        </svg>
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">Spotify</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Playlist'lerimiz</div>
                      </div>
                    </div>
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
                <Button variant="outline" className="w-full group-hover:shadow-lg transition-all duration-200" asChild>
                  <Link to="/sss">
                  ❓ SSS Sayfasını Ziyaret Et
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="card-hover group overflow-hidden border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                {isSubmitted ? (
                  <>
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    Mesaj Gönderildi
                  </>
                ) : (
                  <>
                    <Send className="h-6 w-6 text-cyan-500" />
                    Mesaj Gönder
                  </>
                )}
              </CardTitle>
              <p className="text-slate-600 dark:text-slate-400">
                {isSubmitted 
                  ? "Mesajınız başarıyla gönderildi! Size en kısa sürede geri dönüş yapacağız."
                  : "Aşağıdaki formu doldurarak bizimle iletişime geçebilirsiniz."
                }
              </p>
            </CardHeader>
            <CardContent>
              {isSubmitted ? (
                <div className="text-center py-12 space-y-6">
                  <div className="text-6xl mb-6">🎉</div>
                  <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">
                    Mesajınız Başarıyla Gönderildi!
                  </h3>
                  <div className="space-y-3 text-slate-600 dark:text-slate-400">
                    <p className="text-lg">
                      <strong>{formData.name}</strong>, mesajınız için teşekkür ederiz.
                    </p>
                    <p>
                      "<strong>{formData.subject}</strong>" konulu mesajınızı aldık ve en kısa sürede size geri dönüş yapacağız.
                    </p>
                    {formData.email && (
                      <p className="text-sm">
                        📧 Yanıtımızı <strong>{formData.email}</strong> adresine göndereceğiz.
                      </p>
                    )}
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mt-6">
                    <p className="text-sm text-green-700 dark:text-green-300">
                      ⏱️ Form birkaç saniye içinde sıfırlanacak...
                    </p>
                  </div>
                </div>
              ) : (
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
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
              )}
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
              Fen Edebiyat Fakültesi Konumu
            </CardTitle>
            <p className="text-slate-600 dark:text-slate-400">
              Psikoloji Bölümümüzün bulunduğu Fen Edebiyat Fakültesi'nin kampüs konumu
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-96 rounded-lg overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700">
              <iframe
                src="https://maps.google.com/maps?width=100%&height=600&hl=tr&q=40.71389916736156,31.514386464970723+(BAİBÜ+Fen+Edebiyat+Fakültesi)&t=&z=17&ie=UTF8&iwloc=B&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="BAİBÜ Fen Edebiyat Fakültesi - Psikoloji Bölümü Haritası"
                className="w-full h-full"
              />
            </div>
            
            {/* Harita Altında Bilgi Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">🚗</div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Araç ile</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Bolu merkezden 15 dk<br />
                  Gölköy yerleşkesi
                </p>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">🚌</div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Toplu Taşıma</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  30 | Kampüs İçi Ring<br />
                  7  | BAİBÜ Kampüs – Merkez<br />
                  15 | D-100 – BAİBÜ Kampüs – Merkez
                  </p>
                </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">📍</div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Koordinatlar</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  40.7139° N<br />
                  31.5144° E
                </p>
              </div>
            </div>
            
            {/* Navigasyon Butonları */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button 
                variant="outline" 
                className="flex-1 h-12 group"
                onClick={() => window.open('https://maps.app.goo.gl/x7uaXueh4oET54JYA', '_blank')}
              >
                <MapPin className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                Google Maps'te Aç
              </Button>
              
              <Button 
                variant="outline" 
                className="flex-1 h-12 group"
                onClick={() => window.open('https://maps.apple.com/?q=40.71389916736156,31.514386464970723', '_blank')}
              >
                <MapPin className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                Apple Maps'te Aç
              </Button>
              
              <Button 
                variant="outline" 
                className="flex-1 h-12 group"
                onClick={async () => {
                  const shareUrl = 'https://maps.app.goo.gl/x7uaXueh4oET54JYA';
                  const shareTitle = 'BAİBÜ Fen Edebiyat Fakültesi';
                  const shareText = 'Psikoloji Bölümü - Fen Edebiyat Fakültesi konumu';
                  
                  try {
                    // 1. Modern Web Share API deneyelim (mobil cihazlarda çalışır)
                    if (navigator.share && navigator.canShare && navigator.canShare({ url: shareUrl })) {
                      await navigator.share({
                        title: shareTitle,
                        text: shareText,
                        url: shareUrl
                      });
                      toast.success('📍 Konum başarıyla paylaşıldı!');
                      return;
                    }
                    
                    // 2. Modern Clipboard API deneyelim
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                      await navigator.clipboard.writeText(shareUrl);
                      toast.success('📍 Konum linki kopyalandı! Artık paylaşabilirsiniz.');
                      return;
                    }
                    
                    // 3. Fallback - Eski yöntem
                    const textArea = document.createElement('textarea');
                    textArea.value = shareUrl;
                    textArea.style.position = 'fixed';
                    textArea.style.left = '-999999px';
                    textArea.style.top = '-999999px';
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    
                    if (document.execCommand('copy')) {
                      toast.success('📍 Konum linki kopyalandı!');
                    } else {
                      throw new Error('Copy failed');
                    }
                    
                    document.body.removeChild(textArea);
                    
                  } catch (error) {
                    console.error('Share/Copy failed:', error);
                    // 4. Son çare - Kullanıcıya linki göster
                    toast.info(`📍 Konum linki: ${shareUrl}`, {
                      duration: 10000,
                      action: {
                        label: 'Kopyala',
                        onClick: () => {
                          try {
                            navigator.clipboard.writeText(shareUrl);
                            toast.success('Link kopyalandı!');
                          } catch {
                            alert(`Lütfen bu linki manuel olarak kopyalayın:\n${shareUrl}`);
                          }
                        }
                      }
                    });
                  }
                }}
              >
                <Send className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                Konumu Paylaş
              </Button>
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
              <Button 
                size="lg" 
                variant="outline" 
                className="group"
                onClick={() => {
                  // Sosyal medya kartına scroll yap
                  const socialMediaCard = document.querySelector('[data-social-media-card]');
                  if (socialMediaCard) {
                    socialMediaCard.scrollIntoView({ 
                      behavior: 'smooth', 
                      block: 'center' 
                    });
                  }
                }}
              >
                <MessageCircle className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                Sosyal Medya
              </Button>
              <Button size="lg" variant="outline" className="group" asChild>
                <Link to="/sss">
                <CheckCircle className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform duration-200" />
                SSS
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PageContainer>
  );
};

export default Iletisim;
