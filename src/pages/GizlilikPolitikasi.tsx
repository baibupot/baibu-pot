import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Eye, Lock, UserCheck, FileText, Calendar, Settings } from 'lucide-react';
import PageContainer from '@/components/ui/page-container';
import PageHero from '@/components/ui/page-hero';

const GizlilikPolitikasi = () => {
  const lastUpdated = '23 Haziran 2025';

  return (
    <PageContainer background="slate">
      {/* Hero Section */}
      <PageHero
        title="Gizlilik Politikası"
        description="BAİBÜ Psikoloji Öğrencileri Topluluğu olarak kişisel verilerinizin korunması konusundaki yaklaşımımız ve uygulamalarımız."
        icon={Shield}
        gradient="purple"
      >
        <div className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm rounded-xl p-4 text-center mt-8">
          <div className="flex items-center justify-center text-slate-700 dark:text-slate-300">
            <Calendar className="h-5 w-5 mr-2" />
            <span className="font-medium">Son güncelleme: {lastUpdated}</span>
          </div>
        </div>
      </PageHero>

      {/* Content */}
      <section className="pb-12">
        <div className="space-y-6 sm:space-y-8">
          {/* Introduction */}
          <Card variant="modern" className="animate-fade-in-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-xl">
                  <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
                </div>
                Giriş
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm sm:text-base">
                Bolu Abant İzzet Baysal Üniversitesi Psikoloji Öğrencileri Topluluğu (BAİBÜ PÖT) 
                olarak, kişisel verilerinizin korunması konusunda hassasiyetle davranmakta ve 
                6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ile Avrupa Birliği Genel 
                Veri Koruma Tüzüğü (GDPR) hükümlerine uygun olarak hareket etmekteyiz. 🔒
              </p>
            </CardContent>
          </Card>

          {/* Data Collection */}
          <Card variant="modern" className="animate-fade-in-up animation-delay-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-xl">
                  <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
                </div>
                Toplanan Veriler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-3 text-lg">
                  İletişim Formu Verileri:
                </h4>
                <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2 ml-4">
                  <li>Ad Soyad (zorunlu)</li>
                  <li>E-posta adresi (isteğe bağlı)</li>
                  <li>Mesaj konusu ve içeriği (zorunlu)</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-3 text-lg">
                  Etkinlik Kayıt Verileri:
                </h4>
                <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2 ml-4">
                  <li>Ad Soyad</li>
                  <li>Öğrenci numarası</li>
                  <li>Bölüm bilgisi</li>
                  <li>İletişim bilgileri</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-3 text-lg">
                  Teknik Veriler:
                </h4>
                <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2 ml-4">
                  <li>IP adresi</li>
                  <li>Tarayıcı bilgileri</li>
                  <li>Ziyaret edilen sayfalar</li>
                  <li>Çerezler (cookies)</li>
                  <li>Kullanıcı etkileşim verileri (Microsoft Clarity)</li>
                  <li>Sayfa yükleme süreleri ve performans metrikleri</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Data Usage */}
          <Card variant="modern" className="animate-fade-in-up animation-delay-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-xl">
                  <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
                </div>
                Verilerin Kullanım Amaçları
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4 text-slate-600 dark:text-slate-400">
                <li className="flex items-start">
                  <span className="inline-block w-3 h-3 bg-purple-500 rounded-full mt-2 mr-4 flex-shrink-0"></span>
                  <span className="leading-relaxed">İletişim taleplerini yanıtlamak ve destek sağlamak</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-3 h-3 bg-purple-500 rounded-full mt-2 mr-4 flex-shrink-0"></span>
                  <span className="leading-relaxed">Etkinlik organizasyonu ve katılımcı yönetimi</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-3 h-3 bg-purple-500 rounded-full mt-2 mr-4 flex-shrink-0"></span>
                  <span className="leading-relaxed">Web sitesi performansını iyileştirmek ve kullanıcı deneyimini optimize etmek</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-3 h-3 bg-purple-500 rounded-full mt-2 mr-4 flex-shrink-0"></span>
                  <span className="leading-relaxed">Yasal yükümlülükleri yerine getirmek</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-3 h-3 bg-purple-500 rounded-full mt-2 mr-4 flex-shrink-0"></span>
                  <span className="leading-relaxed">Topluluk faaliyetleri hakkında bilgilendirme (onay verilen durumlarda)</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Analytics Services */}
          <Card variant="modern" className="animate-fade-in-up animation-delay-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-xl">
                  <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
                </div>
                Analitik Hizmetleri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-3 text-lg">
                  Google Analytics:
                </h4>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                  Web sitesi trafiğini ve kullanıcı davranışlarını analiz etmek için Google Analytics kullanmaktayız. 
                  Bu hizmet, anonim kullanım verilerini toplar ve site performansını iyileştirmemize yardımcı olur.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-3 text-lg">
                  Microsoft Clarity:
                </h4>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                  Kullanıcı deneyimini geliştirmek amacıyla Microsoft Clarity analitik hizmetini kullanmaktayız. 
                  Bu hizmet şunları içerir:
                </p>
                <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2 ml-4">
                  <li>Kullanıcı etkileşim kayıtları (session recordings)</li>
                  <li>Sayfa tıklama ve kaydırma analizleri (heatmaps)</li>
                  <li>Site performans metrikleri</li>
                  <li>Kullanıcı davranış analizleri</li>
                </ul>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-3 text-sm">
                  <strong>Önemli:</strong> Microsoft Clarity, kişisel tanımlayıcı bilgileri (ad, e-posta, telefon vb.) toplamaz. 
                  Sadece anonim kullanım verileri ve etkileşim analizleri yapılır.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card variant="modern" className="animate-fade-in-up animation-delay-400">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-xl">
                  <Lock className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
                </div>
                Veri Güvenliği
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-slate-600 dark:text-slate-400">
                <p className="leading-relaxed text-base">
                  Kişisel verilerinizi korumak için aşağıdaki güvenlik önlemlerini almaktayız:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="inline-block w-3 h-3 bg-purple-500 rounded-full mt-2 mr-4 flex-shrink-0"></span>
                    <span className="leading-relaxed">🔒 SSL sertifikası ile şifreli veri iletimi</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-3 h-3 bg-purple-500 rounded-full mt-2 mr-4 flex-shrink-0"></span>
                    <span className="leading-relaxed">🗄️ Güvenli veritabanı sistemleri</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-3 h-3 bg-purple-500 rounded-full mt-2 mr-4 flex-shrink-0"></span>
                    <span className="leading-relaxed">🔐 Sınırlı erişim yetkilendirmesi</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-3 h-3 bg-purple-500 rounded-full mt-2 mr-4 flex-shrink-0"></span>
                    <span className="leading-relaxed">🛡️ Düzenli güvenlik denetimleri</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* User Rights */}
          <Card variant="modern" className="animate-fade-in-up animation-delay-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-xl">
                  <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
                </div>
                Haklarınız
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 text-slate-600 dark:text-slate-400">
                <p className="leading-relaxed text-base">KVKK kapsamında aşağıdaki haklara sahipsiniz:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-slate-900 dark:text-white text-lg">
                      Bilgi Alma Hakkı
                    </h4>
                    <p className="leading-relaxed">
                      Verilerinizin işlenip işlenmediğini öğrenebilirsiniz.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-slate-900 dark:text-white text-lg">
                      Erişim Hakkı
                    </h4>
                    <p className="leading-relaxed">
                      İşlenen verilerinize erişim talep edebilirsiniz.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-slate-900 dark:text-white text-lg">
                      Düzeltme Hakkı
                    </h4>
                    <p className="leading-relaxed">
                      Yanlış verilerin düzeltilmesini isteyebilirsiniz.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-slate-900 dark:text-white text-lg">
                      Silme Hakkı
                    </h4>
                    <p className="leading-relaxed">
                      Verilerinizin silinmesini talep edebilirsiniz.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card variant="modern" className="bg-gradient-to-br from-purple-50/80 to-pink-50/80 dark:from-purple-950/50 dark:to-pink-950/50 border-purple-200/50 dark:border-purple-800/50 animate-fade-in-up animation-delay-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-xl">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
                </div>
                İletişim ve Başvuru
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 text-slate-600 dark:text-slate-400">
                <p className="leading-relaxed text-base">
                  Gizlilik politikamız hakkında sorularınız veya veri koruma haklarınızı 
                  kullanmak istiyorsanız bizimle iletişime geçebilirsiniz:
                </p>
                <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                  <p className="font-semibold text-slate-900 dark:text-white mb-4 text-lg">
                    BAİBÜ Psikoloji Öğrencileri Topluluğu
                  </p>
                  <div className="space-y-2">
                    <p><span className="font-medium">İletişim Formu:</span> <a href="/iletisim" className="text-purple-600 dark:text-purple-400 hover:underline font-medium">İletişim Sayfası</a></p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </PageContainer>
  );
};

export default GizlilikPolitikasi;
