
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';
import { useCreateContactMessage } from '@/hooks/useSupabaseData';
import { toast } from 'sonner';

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

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Bize Ulaşın
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Sorularınız, önerileriniz veya görüşleriniz için bizimle iletişime geçin. 
              Size en kısa sürede geri dönüş yapmaya çalışacağız.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-cyan-500" />
                    İletişim Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-slate-600 dark:text-slate-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">E-posta</p>
                      <p className="text-slate-600 dark:text-slate-400">pot@baibu.edu.tr</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-slate-600 dark:text-slate-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Adres</p>
                      <p className="text-slate-600 dark:text-slate-400">
                        Bolu Abant İzzet Baysal Üniversitesi<br />
                        İnsan ve Toplum Bilimleri Fakültesi<br />
                        Psikoloji Bölümü<br />
                        14030 Bolu/Türkiye
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-slate-600 dark:text-slate-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Çalışma Saatleri</p>
                      <p className="text-slate-600 dark:text-slate-400">
                        Pazartesi - Cuma: 09:00 - 17:00<br />
                        Hafta Sonu: Kapalı
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Media */}
              <Card>
                <CardHeader>
                  <CardTitle>Sosyal Medyada Bizi Takip Edin</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    <Button variant="outline" className="flex items-center gap-2">
                      <span>Instagram</span>
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                      <span>Twitter</span>
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                      <span>Facebook</span>
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                      <span>LinkedIn</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* FAQ Link */}
              <Card>
                <CardHeader>
                  <CardTitle>Sıkça Sorulan Sorular</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Merak ettiğiniz soruların cevapları zaten hazır olabilir. 
                    Bize yazmadan önce SSS sayfamıza göz atın.
                  </p>
                  <Button variant="outline">
                    SSS Sayfasını Ziyaret Et
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-cyan-500" />
                  Mesaj Gönder
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">
                      Adınız Soyadınız <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Adınızı ve soyadınızı girin"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">E-posta Adresiniz</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="ornek@email.com (isteğe bağlı)"
                    />
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      E-posta adresinizi girmek isteğe bağlıdır, ancak yanıt verebilmemiz için önerilir.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="subject">
                      Konu <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="Mesajınızın konusunu girin"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">
                      Mesajınız <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Mesajınızı buraya yazın..."
                      rows={6}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full flex items-center gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Gönderiliyor...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
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

          {/* Map Section (Optional) */}
          <div className="mt-12">
            <Card>
              <CardHeader>
                <CardTitle>Kampüs Konumu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                  <p className="text-slate-500 dark:text-slate-400">
                    Harita burada gösterilecek
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default Iletisim;
