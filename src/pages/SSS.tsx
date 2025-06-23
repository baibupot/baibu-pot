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
      title: "🌟 Genel Sorular",
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
      title: "🎉 Etkinlikler",
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
      title: "📖 Dergi",
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
      title: "💼 Stajlar",
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
      title: "👥 Üyelik ve Roller",
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
      <section className="py-8">
        <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Soru ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/80 dark:bg-slate-700/80 h-12 text-base"
            />
          </div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="pb-12">
        <div className="space-y-8">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category, categoryIndex) => (
              <Card key={categoryIndex} className="card-hover overflow-hidden border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                    <span className="text-3xl">{category.emoji}</span>
                    {category.title}
                  </h2>
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((faq, faqIndex) => (
                      <AccordionItem key={faqIndex} value={`item-${categoryIndex}-${faqIndex}`} className="border-slate-200 dark:border-slate-700">
                        <AccordionTrigger className="text-left hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200 text-lg font-medium py-6">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-slate-600 dark:text-slate-400 leading-relaxed text-base pb-6">
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
      <section className="py-16">
        <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950 dark:via-teal-950 dark:to-cyan-950 rounded-2xl p-12 text-center relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-1/4 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          </div>
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-8">
            <div className="text-6xl mb-6">🤔</div>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
              Sorunuzun Yanıtını Bulamadınız mı?
            </h3>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Size yardımcı olmaktan mutluluk duyarız. Sorularınızı bizimle paylaşın, 
              en kısa sürede size geri dönüş yapalım.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="group">
                <Link to="/iletisim" className="flex items-center gap-3">
                  <Mail className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                  Soru Sor
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="group">
                <Link to="/iletisim" className="flex items-center gap-3">
                  <MessageCircle className="h-5 w-5 group-hover:rotate-12 transition-transform duration-200" />
                  Canlı Destek
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PageContainer>
  );
};

export default SSS;
