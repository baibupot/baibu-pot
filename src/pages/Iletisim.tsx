
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Instagram, 
  Facebook, 
  Twitter,
  Send,
  Clock,
  Users
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';

const Iletisim = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Form submit logic burada olacak - Supabase'e gönderilecek
    alert('Mesajınız gönderildi! En kısa sürede size dönüş yapacağız.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'E-posta',
      content: 'info@baibupot.org',
      link: 'mailto:info@baibupot.org'
    },
    {
      icon: Phone,
      title: 'Telefon',
      content: '+90 (374) 254 1000',
      link: 'tel:+903742541000'
    },
    {
      icon: MapPin,
      title: 'Adres',
      content: 'BAİBÜ Gölköy Kampüsü, Psikoloji Bölümü, Bolu',
      link: 'https://maps.google.com'
    }
  ];

  const socialMedia = [
    {
      icon: Instagram,
      name: 'Instagram',
      username: '@baibupot',
      link: 'https://instagram.com/baibupot',
      color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300'
    },
    {
      icon: Facebook,
      name: 'Facebook',
      username: 'BAİBÜ Psikoloji Öğrencileri Topluluğu',
      link: 'https://facebook.com/baibupot',
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    },
    {
      icon: Twitter,
      name: 'Twitter',
      username: '@baibupot',
      link: 'https://twitter.com/baibupot',
      color: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300'
    }
  ];

  const officeHours = [
    { day: 'Pazartesi - Cuma', hours: '09:00 - 17:00' },
    { day: 'Cumartesi', hours: '10:00 - 15:00' },
    { day: 'Pazar', hours: 'Kapalı' }
  ];

  const teamContacts = [
    {
      role: 'Başkan',
      name: 'Ahmet Yılmaz',
      email: 'baskan@baibupot.org',
      areas: ['Genel İletişim', 'İş Birlikleri', 'Yönetim']
    },
    {
      role: 'İletişim Koordinatörü',
      name: 'Emre Yıldız',
      email: 'iletisim@baibupot.org',
      areas: ['Medya İlişkileri', 'Etkinlik Duyuruları', 'Sosyal Medya']
    },
    {
      role: 'Etkinlik Koordinatörü',
      name: 'Ali Çelik',
      email: 'etkinlik@baibupot.org',
      areas: ['Etkinlik Önerileri', 'Sponsorluk', 'Organizasyon']
    }
  ];

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
              Sorularınız, önerileriniz veya iş birliği teklifleriniz için bizimle 
              iletişime geçmekten çekinmeyin. Size en kısa sürede dönüş yapmaya çalışacağız.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
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
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Adınız Soyadınız *
                      </label>
                      <Input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Adınızı ve soyadınızı girin"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        E-posta Adresiniz
                      </label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="E-posta adresinizi girin (isteğe bağlı)"
                      />
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                        Dönüş yapmamızı istiyorsanız e-posta adresinizi yazın
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Konu *
                      </label>
                      <Input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        placeholder="Mesajınızın konusunu girin"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Mesajınız *
                      </label>
                      <Textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        placeholder="Mesajınızı detaylı olarak yazın..."
                        rows={6}
                      />
                    </div>
                    
                    <Button type="submit" className="w-full">
                      <Send className="h-4 w-4 mr-2" />
                      Mesajı Gönder
                    </Button>
                  </form>
                  
                  <div className="mt-4 p-3 bg-cyan-50 dark:bg-cyan-950 rounded-lg">
                    <p className="text-sm text-cyan-800 dark:text-cyan-200">
                      <strong>Not:</strong> Formdan gelen mesajlar doğrudan topluluk yöneticilerine ulaşır. 
                      Genellikle 24-48 saat içinde yanıt verilir.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              {/* Contact Details */}
              <Card>
                <CardHeader>
                  <CardTitle>İletişim Bilgileri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {contactInfo.map((contact, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900 rounded-lg flex items-center justify-center">
                        <contact.icon className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {contact.title}
                        </p>
                        <a 
                          href={contact.link}
                          className="text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                        >
                          {contact.content}
                        </a>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Office Hours */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-cyan-500" />
                    Ofis Saatleri
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {officeHours.map((schedule, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-slate-700 dark:text-slate-300">{schedule.day}</span>
                        <span className="text-slate-600 dark:text-slate-400">{schedule.hours}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Social Media */}
              <Card>
                <CardHeader>
                  <CardTitle>Sosyal Medya</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {socialMedia.map((social, index) => (
                      <a
                        key={index}
                        href={social.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div className={`w-10 h-10 ${social.color} rounded-lg flex items-center justify-center`}>
                          <social.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {social.name}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {social.username}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Team Contacts */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
              <Users className="h-6 w-6 text-cyan-500" />
              Doğrudan İletişim
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamContacts.map((contact, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <Badge className="w-fit mb-2 bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300">
                      {contact.role}
                    </Badge>
                    <CardTitle className="text-lg">{contact.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <a
                        href={`mailto:${contact.email}`}
                        className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                      >
                        <Mail className="h-4 w-4" />
                        <span className="text-sm">{contact.email}</span>
                      </a>
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          İlgi Alanları:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {contact.areas.map((area, areaIndex) => (
                            <Badge key={areaIndex} variant="outline" className="text-xs">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Map Section */}
          <div className="mt-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-cyan-500" />
                  Konumumuz
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">
                      Google Maps entegrasyonu burada gösterilecek
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
                      BAİBÜ Gölköy Kampüsü, Psikoloji Bölümü, Bolu
                    </p>
                  </div>
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
