
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Search, HelpCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';

const SSS = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const faqCategories = [
    {
      category: 'Topluluk Üyeliği',
      questions: [
        {
          question: 'Topluluğa nasıl üye olabilirim?',
          answer: 'Topluluğumuzun üyelik süreçleri dönem başlarında açılmaktadır. Üyelik başvuruları için sosyal medya hesaplarımızı takip edebilir veya iletişim sayfamızdan bize ulaşabilirsiniz. Aktif öğrenci olmanız ve psikoloji bölümünde okuma şartlarımızdır.'
        },
        {
          question: 'Üyelik için herhangi bir ücret var mı?',
          answer: 'Hayır, topluluğumuzun üyeliği tamamen ücretsizdir. Sadece bazı özel etkinlikler için sembolik katılım ücretleri alınabilir.'
        },
        {
          question: 'Aktif olarak görev almak istiyorum, nasıl başvurabilirim?',
          answer: 'Ekip üyeliği için dönem içinde açılan başvuru dönemlerini bekleyebilir veya mevcut koordinatörlere doğrudan ulaşabilirsiniz. Motivasyon, sorumluluk sahibi olma ve takım çalışmasına yatkınlık aranan özelliklerdir.'
        }
      ]
    },
    {
      category: 'Etkinlikler',
      questions: [
        {
          question: 'Etkinliklere katılım için önden kayıt yaptırmam gerekiyor mu?',
          answer: 'Çoğu etkinliğimiz için ön kayıt gereklidir. Etkinlik detaylarında kayıt linki ve son kayıt tarihi belirtilir. Bazı açık etkinlikler için ise kayıt gerekmeyebilir.'
        },
        {
          question: 'Etkinlikler sadece psikoloji öğrencilerine mi açık?',
          answer: 'Hayır, etkinliklerimizin çoğu tüm üniversite öğrencilerine açıktır. Bazı özel workshop veya seminerler için bölüm kısıtlaması olabilir, bu durum etkinlik duyurusunda belirtilir.'
        },
        {
          question: 'Etkinlik önerilerimi nasıl iletebilirim?',
          answer: 'Etkinlik önerilerinizi iletişim formumuz üzerinden veya sosyal medya hesaplarımızdan Etkinlik Koordinatörümüze iletebilirsiniz. Tüm öneriler değerlendirilir ve geri dönüş yapılır.'
        }
      ]
    },
    {
      category: 'Dergi Hakkında',
      questions: [
        {
          question: 'Psikolojiİbu dergisine nasıl makale gönderebilirim?',
          answer: 'Dergi koordinatörümüze iletişim sayfamızdan ulaşabilir veya sosyal medya hesaplarımızdan makale gönderim süreçleri hakkında bilgi alabilirsiniz. Yazım kuralları ve değerlendirme süreci hakkında detaylı bilgi verilecektir.'
        },
        {
          question: 'Dergi ne sıklıkla yayınlanıyor?',
          answer: 'Psikolojiİbu dergimiz dönemde bir kez, yılda iki sayı olarak yayınlanmaktadır. Güz ve bahar dönemlerinde çıkan sayılarımızı web sitemizden takip edebilirsiniz.'
        },
        {
          question: 'Eski dergi sayılarına nereden ulaşabilirim?',
          answer: 'Tüm dergi sayılarımız web sitemizin "Dergi" bölümünde arşivlenmiştir. Buradan hem online okuyabilir hem de PDF olarak indirebilirsiniz.'
        }
      ]
    },
    {
      category: 'Genel Sorular',
      questions: [
        {
          question: 'Topluluk ne zaman kuruldu?',
          answer: 'BAİBÜ Psikoloji Öğrencileri Topluluğu 2018 yılında kurulmuş olup, aktif olarak faaliyetlerini sürdürmektedir.'
        },
        {
          question: 'Sosyal medya hesaplarınız hangileri?',
          answer: 'Instagram, Facebook ve X (Twitter) hesaplarımız bulunmaktadır. Tüm hesaplarımızın linklerini web sitemizin footer bölümünde bulabilirsiniz.'
        },
        {
          question: 'Toplulukla ilgili şikayetlerimi nereye iletebilirim?',
          answer: 'Şikayet ve önerilerinizi iletişim formumuz üzerinden iletebilir veya doğrudan topluluk yöneticilerimize ulaşabilirsiniz. Tüm geri bildirimler ciddi olarak değerlendirilir.'
        }
      ]
    }
  ];

  const filteredFAQs = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => 
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <Header />
        
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <HelpCircle className="h-8 w-8 text-cyan-500 mr-3" />
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
                Sıkça Sorulan Sorular
              </h1>
            </div>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Topluluğumuz, etkinliklerimiz ve hizmetlerimiz hakkında merak ettiğiniz 
              soruların cevaplarını burada bulabilirsiniz.
            </p>
          </div>

          {/* Search */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Sorular arasında arama yapın..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* FAQ Categories */}
          <div className="space-y-8">
            {filteredFAQs.map((category) => (
              <Card key={category.category}>
                <CardHeader>
                  <CardTitle className="text-xl text-cyan-600 dark:text-cyan-400">
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="space-y-2">
                    {category.questions.map((faq, index) => (
                      <AccordionItem key={index} value={`${category.category}-${index}`}>
                        <AccordionTrigger className="text-left hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors duration-200">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-slate-600 dark:text-slate-400 leading-relaxed">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* No Results */}
          {searchTerm && filteredFAQs.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <HelpCircle className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  Aradığınız soru bulunamadı
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Farklı anahtar kelimeler deneyebilir veya bize doğrudan ulaşabilirsiniz.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Contact CTA */}
          <div className="mt-16 bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-950 dark:to-teal-950 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Sorunuz Burada Yok mu?
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Merak ettiğiniz başka sorular varsa, bize doğrudan ulaşmaktan çekinmeyin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/iletisim" 
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 transition-colors duration-200"
              >
                Bize Ulaşın
              </a>
              <a 
                href="mailto:info@baibupsikologitopluluğu.org" 
                className="inline-flex items-center justify-center px-6 py-3 border border-slate-300 dark:border-slate-600 text-base font-medium rounded-md text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200"
              >
                E-posta Gönder
              </a>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default SSS;
