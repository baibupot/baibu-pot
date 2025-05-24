import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Mail,  
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
      username: '@baibupsikoloji',
      link: 'https://www.instagram.com/baibupsikoloji',
      color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300'
    },
    {
      icon: Facebook,
      name: 'Facebook',
      username: 'aibu.pot',
      link: 'https://facebook.com/aibu.pot',
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    },
    {
      icon: Twitter,
      name: 'Twitter',
      username: '@baibupsikoloji',
      link: 'https://twitter.com/baibupsikoloji',
      color: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300'
    },
    {
      icon: null,
      name: 'LinkedIn',
      username: 'baibupsikoloji',
      link: 'https://tr.linkedin.com/in/baibupsikoloji?trk=public_post_feed-actor-name',
      color: 'bg-blue-200 text-blue-900 dark:bg-blue-950 dark:text-blue-200'
    },
    {
      icon: null,
      name: 'YouTube',
      username: 'BAİBÜ Psikoloji',
      link: 'https://www.youtube.com/channel/UCq_LNuabFO9CWm7dHFPxSHQ',
      color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    },
    {
      icon: null,
      name: 'Spotify',
      username: 'baibupsikoloji',
      link: 'https://open.spotify.com/user/chg73jv11emfnf66gt23hqm67?si=82f2e1622ee64249',
      color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
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
                          {social.icon ? (
                            <social.icon className="h-5 w-5" />
                          ) : social.name === 'LinkedIn' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="h-5 w-5"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.968v5.699h-3v-10h2.881v1.367h.041c.401-.761 1.379-1.563 2.838-1.563 3.034 0 3.595 1.997 3.595 4.59v5.606zm0 0"/></svg>
                          ) : social.name === 'YouTube' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="h-5 w-5"><path d="M23.498 6.186a2.994 2.994 0 0 0-2.112-2.112C19.425 3.5 12 3.5 12 3.5s-7.425 0-9.386.574A2.994 2.994 0 0 0 .502 6.186C0 8.147 0 12 0 12s0 3.853.502 5.814a2.994 2.994 0 0 0 2.112 2.112C4.575 20.5 12 20.5 12 20.5s7.425 0 9.386-.574a2.994 2.994 0 0 0 2.112-2.112C24 15.853 24 12 24 12s0-3.853-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                          ) : social.name === 'Spotify' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="h-5 w-5"><path d="M12 0C5.371 0 0 5.371 0 12c0 6.627 5.371 12 12 12s12-5.373 12-12c0-6.629-5.371-12-12-12zm5.438 17.438c-.229.373-.708.49-1.08.26-2.953-1.807-6.675-2.213-11.06-1.209-.429.094-.859-.168-.953-.598-.094-.43.168-.859.598-.953 4.771-1.07 8.872-.617 12.174 1.318.373.229.49.708.261 1.082zm1.543-3.082c-.287.467-.893.617-1.359.33-3.381-2.08-8.547-2.684-12.547-1.463-.521.156-1.072-.137-1.229-.658-.156-.521.137-1.072.658-1.229 4.547-1.363 10.229-.707 14.047 1.684.467.287.617.893.33 1.336zm.146-3.146c-4.08-2.426-10.88-2.646-14.438-1.438-.635.199-1.318-.146-1.518-.781-.199-.635.146-1.318.781-1.518 4.08-1.281 11.453-1.027 16.02 1.646.573.344.76 1.094.416 1.668-.344.573-1.094.76-1.668.416z"/></svg>
                          ) : null}
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
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="w-full md:w-2/3 h-64 rounded-lg overflow-hidden shadow-md border border-slate-200 dark:border-slate-700">
                    <iframe
                      title="BAİBÜ Psikoloji Bölümü Konum"
                      src="https://www.google.com/maps?q=40.713882609713245,31.514420231135357&z=16&output=embed"
                      width="100%"
                      height="100%"
                      style={{ border: 0, width: '100%', height: '100%' }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>
                  <div className="w-full md:w-1/3 flex flex-col items-center md:items-start text-center md:text-left">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-cyan-500" /> BAİBÜ Fen-Edebiyat Fakültesi
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-1">
                      Gölköy Kampüsü, Psikoloji Bölümü, 14030 Merkez/Bolu
                    </p>
                    
                    <a
                      href="https://maps.app.goo.gl/hCUbtZTWGJKEVpqX8"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200 hover:bg-cyan-200 dark:hover:bg-cyan-800 transition-colors text-sm font-medium mt-2 shadow-sm"
                    >
                      <MapPin className="h-4 w-4" /> Google Haritalar'da Aç
                    </a>
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
