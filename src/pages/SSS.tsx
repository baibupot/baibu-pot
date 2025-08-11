import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Search, Mail, HelpCircle, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageContainer from '@/components/ui/page-container';
import PageHero from '@/components/ui/page-hero';
import EmptyState from '@/components/ui/empty-state';

const SSS = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const faqCategories = [
    {
      title: "Genel Sorular",
      emoji: "🌟",
      questions: [
        {
          question: "BAİBÜ Psikoloji Öğrencileri Topluluğu nedir?",
          answer: "Bolu Abant İzzet Baysal Üniversitesi Psikoloji Bölümü öğrencilerinin oluşturduğu akademik ve sosyal bir topluluktur. Psikoloji alanında eğitim, araştırma ve sosyal etkinlikler düzenleyen aktif bir öğrenci topluluğudur."
        },
        {
          question: "Topluluğa nasıl üye olabilirim?",
          answer: "Psikoloji Bölümü öğrencisi olmak koşuluyla topluluğumuza üye olabilirsiniz. Üyelik başvurusu için iletişim sayfamızdan bizimle iletişime geçebilir veya etkinliklerimize katılarak tanışabilirsiniz."
        },
        {
          question: "Topluluk hangi etkinlikleri düzenliyor?",
          answer: "Seminerler, konferanslar, atölyeler, sosyal etkinlikler, kitap kulübü buluşmaları, akademik araştırma projeleri ve psikoloji günleri gibi çeşitli etkinlikler düzenliyoruz."
        }
      ]
    },
    {
      title: "Etkinlikler",
      emoji: "🎉",
      questions: [
        {
          question: "Etkinliklere nasıl kayıt olabilirim?",
          answer: "Etkinlikler sayfamızdan güncel etkinliklerimizi görebilir ve 'Kayıt Ol' butonuna tıklayarak kayıt formunu doldurabilirsiniz. Bazı etkinlikler için ön kayıt gerekebilir."
        },
        {
          question: "Etkinlikler ücretli mi?",
          answer: "Çoğu etkinliğimiz ücretsizdir. Özel atölyeler veya dış konuşmacıların yer aldığı etkinlikler için sembolik bir katılım ücreti alınabilir. Ücret bilgileri etkinlik detaylarında belirtilir."
        },
        {
          question: "Etkinlik iptal olursa ne oluyor?",
          answer: "Etkinlik iptal durumunda kayıtlı katılımcılar e-posta ve web sitesi üzerinden bilgilendirilir. Ücretli etkinlikler için ücret iadesi yapılır."
        }
      ]
    },
    {
      title: "Dergi",
      emoji: "📖",
      questions: [
        {
          question: "Psikolojiİbu dergisine nasıl makale gönderebilirim?",
          answer: "Dergi sayfamızda yayın ilkeleri ve makale gönderim kılavuzu bulunmaktadır. Makalelerinizi belirtilen formatta hazırlayıp dergi editörlüğüne e-posta ile gönderebilirsiniz."
        },
        {
          question: "Dergi ne sıklıkla yayınlanıyor?",
          answer: "Psikolojiİbu dergisi yılda 2 sayı olarak (Bahar ve Güz dönemleri) yayınlanmaktadır. Özel sayılar da çıkarılabilir."
        },
        {
          question: "Dergiye katkıda bulunmak için psikoloji öğrencisi olmak şart mı?",
          answer: "Öncelik psikoloji öğrencilerine verilmekle birlikte, psikoloji alanıyla ilgili kaliteli çalışmalar diğer disiplinlerden de kabul edilebilir."
        }
      ]
    },
    {
      title: " Stajlar",
      emoji: "💼",
      questions: [
        {
          question: "Staj fırsatları nereden takip edebilirim?",
          answer: "Stajlar sayfamızda güncel staj ilanları paylaşılmaktadır. Ayrıca sosyal medya hesaplarımızdan da duyurular yapılır."
        },
        {
          question: "Staj başvurusu için yardım alabilir miyim?",
          answer: "Evet, CV hazırlama, mülakat teknikleri ve staj sürecine dair rehberlik hizmetleri sunuyoruz. İletişim sayfamızdan randevu alabilirsiniz."
        },
        {
          question: "Zorunlu staj için nasıl destek alabilirim?",
          answer: "Zorunlu staj sürecinde gerekli evrakların hazırlanması, staj yerinin bulunması ve değerlendirme sürecinde destek sağlıyoruz."
        }
      ]
    },
    {
      title: "Üyelik ve Roller",
      emoji: "👥",
      questions: [
        {
          question: "Toplulukta aktif rol almak için ne yapmalıyım?",
          answer: "Etkinliklere düzenli katılım gösterdikten sonra, ilgilendiğiniz komite (etkinlik, dergi, sosyal medya, vs.) için başvuruda bulunabilirsiniz."
        },
        {
          question: "Yönetim kuruluna nasıl başvuru yapabilirim?",
          answer: "Yönetim kurulu seçimleri her akademik yıl sonunda yapılır. Adaylık süreci ve koşulları seçim döneminde duyurulur."
        },
        {
          question: "Mezun olduktan sonra da toplulukla bağım devam eder mi?",
          answer: "Evet, mezun üyelerimizle iletişimimiz devam eder. Alumni ağımız sayesinde deneyim paylaşımı ve mentorluk faaliyetleri sürdürülür."
        }
      ]
    }
  ];

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  const totalQuestions = faqCategories.reduce((total, category) => total + category.questions.length, 0);

  return (
    <PageContainer background="slate">
      {/* Hero Section */}
      <PageHero
        title="Sıkça Sorulan Sorular"
        description="Topluluk hakkında merak ettiğiniz soruların yanıtlarını burada bulabilirsiniz. Aradığınızı bulamadıysanız bizimle iletişime geçin."
        icon={HelpCircle}
        gradient="emerald"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
          <div className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              {totalQuestions}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-300">Toplam Soru</div>
          </div>
          <div className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              {faqCategories.length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-300">Kategori</div>
          </div>
          <div className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              24
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-300">Saat Yanıt</div>
          </div>
        </div>
      </PageHero>

      {/* Search */}
      <section className="py-6 sm:py-8">
        <Card variant="modern" className="animate-fade-in-up animation-delay-100">
          <CardContent className="p-4 sm:p-6">
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-500 h-5 w-5" />
              <Input
                placeholder="🔍 Hangi konuda yardıma ihtiyacınız var..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 sm:h-14 text-base bg-white/90 dark:bg-slate-700/90 border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-500 dark:focus:border-emerald-400 rounded-xl transition-all duration-200"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
                >
                  ✕
                </Button>
              )}
            </div>
            {searchTerm && (
              <div className="text-center mt-4 text-sm text-emerald-600 dark:text-emerald-400 font-medium animate-fade-in">
                "{searchTerm}" için {filteredCategories.reduce((total, cat) => total + cat.questions.length, 0)} sonuç bulundu
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* FAQ Categories */}
      <section className="pb-12">
        <div className="space-y-8">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category, categoryIndex) => (
              <Card 
                key={categoryIndex} 
                variant="modern" 
                className="animate-fade-in-up"
                style={{ animationDelay: `${categoryIndex * 200}ms` }}
              >
                <CardContent className="p-6 sm:p-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-6 sm:mb-8 flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl">
                      <span className="text-2xl sm:text-3xl">{category.emoji}</span>
                    </div>
                    {category.title}
                  </h2>
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((faq, faqIndex) => (
                      <AccordionItem 
                        key={faqIndex} 
                        value={`item-${categoryIndex}-${faqIndex}`} 
                        className="border-slate-200/50 dark:border-slate-700/50 animate-fade-in-up"
                        style={{ animationDelay: `${(categoryIndex * 200) + (faqIndex * 100)}ms` }}
                      >
                        <AccordionTrigger className="text-left hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200 text-base sm:text-lg font-medium py-4 sm:py-6 group">
                          <span className="group-hover:translate-x-1 transition-transform duration-200">
                            {faq.question}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm sm:text-base pb-4 sm:pb-6 animate-fade-in">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))
          ) : (
            <EmptyState
              icon={Search}
              title="Aradığınız Soru Bulunamadı"
              description="Farklı kelimeler deneyebilir veya bizimle iletişime geçebilirsiniz."
              actionLabel="İletişime Geç"
              onAction={() => window.location.href = '/iletisim'}
              variant="search"
            />
          )}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-12 sm:py-16">
        <Card variant="modern" className="bg-gradient-to-br from-emerald-50/80 via-teal-50/80 to-cyan-50/80 dark:from-emerald-950/50 dark:via-teal-950/50 dark:to-cyan-950/50 border-emerald-200/50 dark:border-emerald-800/50 animate-fade-in-up animation-delay-500">
          <CardContent className="p-8 sm:p-12 text-center relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-1/4 w-48 sm:w-72 h-48 sm:h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
              <div className="absolute bottom-0 right-1/4 w-48 sm:w-72 h-48 sm:h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
            </div>
            
            <div className="relative z-10 max-w-2xl mx-auto space-y-6 sm:space-y-8">
              <div className="text-5xl sm:text-6xl mb-4 sm:mb-6 animate-bounce">🤔</div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">
                Sorunuzun Yanıtını Bulamadınız mı?
              </h3>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                Size yardımcı olmaktan mutluluk duyarız. Sorularınızı bizimle paylaşın, 
                en kısa sürede size geri dönüş yapalım. 💬
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button 
                  asChild 
                  size="touch" 
                  className="group bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold shadow-xl hover:shadow-2xl interactive-scale"
                >
                  <Link to="/iletisim" className="flex items-center gap-3">
                    <Mail className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                    📧 Soru Sor
                  </Link>
                </Button>
                <Button 
                  asChild 
                  variant="outline" 
                  size="touch" 
                  className="group border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white font-semibold interactive-scale"
                >
                  <Link to="/iletisim" className="flex items-center gap-3">
                    <MessageCircle className="h-5 w-5 group-hover:rotate-12 transition-transform duration-200" />
                    💬 Canlı Destek
                  </Link>
                </Button>
              </div>
              
              {/* Quick stats */}
              <div className="pt-6 sm:pt-8 border-t border-emerald-200/50 dark:border-emerald-800/50">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      24 Saat
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      ⚡ Ortalama Yanıt
                    </div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      %95
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      😊 Memnuniyet
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </PageContainer>
  );
};

export default SSS;
