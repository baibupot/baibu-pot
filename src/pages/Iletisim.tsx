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
        gradient="cyan"
      />

      {/* Quick Contact Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-12">
        <Card variant="modern" className="text-center p-4 sm:p-6 animate-fade-in-up">
          <div className="space-y-1 sm:space-y-2">
            <div className="text-2xl sm:text-3xl font-bold text-cyan-600 dark:text-cyan-400">
              ⚡
            </div>
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
              Hızlı Yanıt
            </div>
          </div>
        </Card>
        
        <Card variant="modern" className="text-center p-4 sm:p-6 animate-fade-in-up animation-delay-100">
          <div className="space-y-1 sm:space-y-2">
            <div className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              📧
            </div>
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
              7/24 Mesaj
            </div>
          </div>
        </Card>
        
        <Card variant="modern" className="col-span-2 lg:col-span-1 text-center p-4 sm:p-6 animate-fade-in-up animation-delay-200">
          <div className="space-y-1 sm:space-y-2">
            <div className="text-2xl sm:text-3xl font-bold gradient-text-primary">
              🤝
            </div>
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
              Açık İletişim
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Contact Information */}
        <div className="space-y-6 animate-fade-in-up">
          {/* Contact Info Card */}
          <Card variant="modern">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-1 w-8 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full"></div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  📞 İletişim Bilgileri
                </h3>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4 group cursor-pointer" onClick={() => window.open('mailto:baibupsikolojitoplulugu@gmail.com')}>
                  <div className="w-12 h-12 bg-cyan-100/80 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <Mail className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 dark:text-white mb-1">E-posta Adresi</p>
                    <p className="text-sm sm:text-base text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors font-medium">
                      baibupsikolojitoplulugu@gmail.com
                    </p>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Resmi başvurular ve sorular için</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-emerald-100/80 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 dark:text-white mb-2">Kampüs Adresimiz</p>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                      Bolu Abant İzzet Baysal Üniversitesi<br />
                      Fen Edebiyat Fakültesi<br />
                      Psikoloji Bölümü<br />
                      <span className="font-medium">14030 Gölköy/Bolu</span>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Media */}
          <Card variant="modern">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-1 w-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"></div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  📱 Sosyal Medya
                </h3>
              </div>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                Güncel duyurular ve etkinliklerimizden haberdar olmak için bizi takip edin.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Button 
                  variant="outline" 
                  className="interactive-scale hover:border-pink-200 dark:hover:border-pink-800 h-12 sm:h-14 justify-start group"
                  onClick={() => window.open('https://www.instagram.com/baibupsikoloji', '_blank')}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Instagram className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">Instagram</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">@baibupsikoloji</div>
                    </div>
                  </div>
                </Button>
                  
                <Button 
                  variant="outline" 
                  className="interactive-scale hover:border-blue-200 dark:hover:border-blue-800 h-12 sm:h-14 justify-start group"
                  onClick={() => window.open('https://facebook.com/aibu.pot', '_blank')}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Facebook className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">Facebook</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">aibu.pot</div>
                    </div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="interactive-scale hover:border-slate-200 dark:hover:border-slate-700 h-12 sm:h-14 justify-start group"
                  onClick={() => window.open('https://twitter.com/baibupsikoloji', '_blank')}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-black dark:bg-white rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="h-4 w-4 sm:h-5 sm:w-5 text-white dark:text-black">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">X (Twitter)</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">@baibupsikoloji</div>
                    </div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="interactive-scale hover:border-blue-200 dark:hover:border-blue-800 h-12 sm:h-14 justify-start group"
                  onClick={() => window.open('https://tr.linkedin.com/in/baibupsikoloji', '_blank')}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-700 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Linkedin className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">LinkedIn</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">baibupsikoloji</div>
                    </div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="interactive-scale hover:border-red-200 dark:hover:border-red-800 h-12 sm:h-14 justify-start group"
                  onClick={() => window.open('https://www.youtube.com/@BAİBÜPsikolojiTopluluğu', '_blank')}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Youtube className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">YouTube</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">BAİBÜ PÖT</div>
                    </div>
                  </div>
                </Button>
                  
                <Button 
                  variant="outline" 
                  className="interactive-scale hover:border-green-200 dark:hover:border-green-800 h-12 sm:h-14 justify-start group col-span-1 sm:col-span-2"
                  onClick={() => window.open('https://open.spotify.com/user/chg73jv11emfnf66gt23hqm67', '_blank')}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="h-4 w-4 sm:h-5 sm:w-5 text-white">
                        <path d="M12 0C5.371 0 0 5.371 0 12c0 6.627 5.371 12 12 12s12-5.373 12-12c0-6.629-5.371-12-12-12zm5.438 17.438c-.229.373-.708.49-1.08.26-2.953-1.807-6.675-2.213-11.06-1.209-.429.094-.859-.168-.953-.598-.094-.43.168-.859.598-.953 4.771-1.07 8.872-.617 12.174 1.318.373.229.49.708.261 1.082zm1.543-3.082c-.287.467-.893.617-1.359.33-3.381-2.08-8.547-2.684-12.547-1.463-.521.156-1.072-.137-1.229-.658-.156-.521.137-1.072.658-1.229 4.547-1.363 10.229-.707 14.047 1.684.467.287.617.893.33 1.336zm.146-3.146c-4.08-2.426-10.88-2.646-14.438-1.438-.635.199-1.318-.146-1.518-.781-.199-.635.146-1.318.781-1.518 4.08-1.281 11.453-1.027 16.02 1.646.573.344.76 1.094.416 1.668-.344.573-1.094.76-1.668.416z"/>
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">Spotify</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">Playlist'lerimiz</div>
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* FAQ Link */}
          <Card variant="modern">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-1 w-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  ❓ SSS
                </h3>
              </div>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                Merak ettiğiniz soruların cevapları zaten hazır olabilir. Bize yazmadan önce SSS sayfamıza göz atın.
              </p>
              <Button variant="outline" className="w-full interactive-scale" asChild>
                <Link to="/sss">
                  ❓ SSS Sayfasını Ziyaret Et
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

                  {/* Contact Form */}
        <div className="animate-fade-in-up animation-delay-200">
          <Card variant="modern">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-1 w-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"></div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                  {isSubmitted ? (
                    <>
                      <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
                      ✅ Mesaj Gönderildi
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-500" />
                      📝 Mesaj Gönder
                    </>
                  )}
                </h3>
              </div>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                {isSubmitted 
                  ? "Mesajınız başarıyla gönderildi! Size en kısa sürede geri dönüş yapacağız."
                  : "Aşağıdaki formu doldurarak bizimle iletişime geçebilirsiniz."
                }
              </p>
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
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-slate-900 dark:text-white">
                    👤 Adınız Soyadınız <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Adınızı ve soyadınızı girin"
                    className="h-11 sm:h-12 rounded-xl border-slate-200 dark:border-slate-700 focus:border-cyan-500 bg-white/90 dark:bg-slate-800/90 focus-ring-modern"
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-slate-900 dark:text-white">
                    📧 E-posta Adresiniz
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="ornek@email.com (isteğe bağlı)"
                    className="h-11 sm:h-12 rounded-xl border-slate-200 dark:border-slate-700 focus:border-cyan-500 bg-white/90 dark:bg-slate-800/90 focus-ring-modern"
                    disabled={isSubmitting}
                  />
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    💡 E-posta adresinizi girmek isteğe bağlıdır, ancak yanıt verebilmemiz için önerilir.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-sm font-semibold text-slate-900 dark:text-white">
                    📋 Konu <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Mesajınızın konusunu girin"
                    className="h-11 sm:h-12 rounded-xl border-slate-200 dark:border-slate-700 focus:border-cyan-500 bg-white/90 dark:bg-slate-800/90 focus-ring-modern"
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-sm font-semibold text-slate-900 dark:text-white">
                    💬 Mesajınız <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Mesajınızı buraya yazın... Detaylı bilgi vermeniz, size daha iyi yardımcı olmamızı sağlar."
                    rows={6}
                    className="rounded-xl border-slate-200 dark:border-slate-700 focus:border-cyan-500 bg-white/90 dark:bg-slate-800/90 resize-none focus-ring-modern"
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  size="touch"
                  className="w-full gradient-primary text-white font-semibold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                      🚀 Gönderiliyor...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      📨 Mesaj Gönder
                    </>
                  )}
                </Button>

                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 text-center leading-relaxed">
                  <span className="text-red-500 font-medium">*</span> işaretli alanlar zorunludur. Mesajınızı 24 saat içinde yanıtlamaya çalışıyoruz.
                </p>
              </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>  

      {/* Map Section */}
      <Card variant="modern" className="animate-fade-in-up">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"></div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-500" />
              🗺️ Kampüs Konumumuz
            </h3>
          </div>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            Psikoloji Bölümümüzün bulunduğu Fen Edebiyat Fakültesi'nin kampüs konumu. Ziyaret etmek için haritayı kullanabilirsiniz.
          </p>
          
          <div className="h-80 sm:h-96 rounded-2xl overflow-hidden shadow-lg border border-slate-200/50 dark:border-slate-700/50">
            <iframe
              src="https://maps.google.com/maps?width=100%&height=600&hl=tr&q=40.71389916736156,31.514386464970723+(BAİBÜ+Fen+Edebiyat+Fakültesi)&t=&z=17&ie=UTF8&iwloc=B&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="BAİBÜ Fen Edebiyat Fakültesi - Psikoloji Bölümü Haritası"
              className="w-full h-full grayscale hover:grayscale-0 transition-all duration-500"
            />
          </div>
            
          {/* Harita Altında Bilgi Kartları */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-6">
            <Card variant="modern" className="text-center p-4 animate-fade-in-up animation-delay-100">
              <div className="text-2xl sm:text-3xl mb-2">🚗</div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-2 text-sm sm:text-base">Araç ile</h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Bolu merkezden 15 dk<br />
                <span className="font-medium">Gölköy yerleşkesi</span>
              </p>
            </Card>
            
            <Card variant="modern" className="text-center p-4 animate-fade-in-up animation-delay-200">
              <div className="text-2xl sm:text-3xl mb-2">🚌</div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-2 text-sm sm:text-base">Toplu Taşıma</h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                30 | Kampüs İçi Ring<br />
                7 | BAİBÜ Kampüs – Merkez<br />
                <span className="font-medium">15 | D-100 – Merkez</span>
              </p>
            </Card>
            
            <Card variant="modern" className="text-center p-4 animate-fade-in-up animation-delay-300">
              <div className="text-2xl sm:text-3xl mb-2">📍</div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-2 text-sm sm:text-base">Koordinatlar</h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                <span className="font-medium">40.7139° N</span><br />
                <span className="font-medium">31.5144° E</span>
              </p>
            </Card>
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
