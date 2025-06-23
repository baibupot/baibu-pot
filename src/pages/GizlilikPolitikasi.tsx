import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Eye, Lock, UserCheck, FileText, Calendar } from 'lucide-react';
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
        <div className="space-y-8">
          {/* Introduction */}
          <Card className="card-hover overflow-hidden border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <FileText className="h-6 w-6 text-purple-500" />
                Giriş
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-base">
                Bolu Abant İzzet Baysal Üniversitesi Psikoloji Öğrencileri Topluluğu (BAİBÜ PÖT) 
                olarak, kişisel verilerinizin korunması konusunda hassasiyetle davranmakta ve 
                6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ile Avrupa Birliği Genel 
                Veri Koruma Tüzüğü (GDPR) hükümlerine uygun olarak hareket etmekteyiz.
              </p>
            </CardContent>
          </Card>

          {/* Data Collection */}
          <Card className="card-hover overflow-hidden border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Eye className="h-6 w-6 text-purple-500" />
                Toplanan Veriler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-3 text-lg">
                  📋 İletişim Formu Verileri:
                </h4>
                <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2 ml-4">
                  <li>Ad Soyad (zorunlu)</li>
                  <li>E-posta adresi (isteğe bağlı)</li>
                  <li>Mesaj konusu ve içeriği (zorunlu)</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-3 text-lg">
                  🎉 Etkinlik Kayıt Verileri:
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
                  💻 Teknik Veriler:
                </h4>
                <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2 ml-4">
                  <li>IP adresi</li>
                  <li>Tarayıcı bilgileri</li>
                  <li>Ziyaret edilen sayfalar</li>
                  <li>Çerezler (cookies)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Data Usage */}
          <Card className="card-hover overflow-hidden border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <UserCheck className="h-6 w-6 text-purple-500" />
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
                  <span className="leading-relaxed">Web sitesi performansını iyileştirmek</span>
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

          {/* Data Security */}
          <Card className="card-hover overflow-hidden border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Lock className="h-6 w-6 text-purple-500" />
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
          <Card className="card-hover overflow-hidden border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <UserCheck className="h-6 w-6 text-purple-500" />
                Haklarınız
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 text-slate-600 dark:text-slate-400">
                <p className="leading-relaxed text-base">KVKK kapsamında aşağıdaki haklara sahipsiniz:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-slate-900 dark:text-white text-lg">
                      📊 Bilgi Alma Hakkı
                    </h4>
                    <p className="leading-relaxed">
                      Verilerinizin işlenip işlenmediğini öğrenebilirsiniz.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-slate-900 dark:text-white text-lg">
                      👁️ Erişim Hakkı
                    </h4>
                    <p className="leading-relaxed">
                      İşlenen verilerinize erişim talep edebilirsiniz.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-slate-900 dark:text-white text-lg">
                      ✏️ Düzeltme Hakkı
                    </h4>
                    <p className="leading-relaxed">
                      Yanlış verilerin düzeltilmesini isteyebilirsiniz.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-slate-900 dark:text-white text-lg">
                      🗑️ Silme Hakkı
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
          <Card className="card-hover overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Shield className="h-6 w-6 text-purple-500" />
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
                    📧 BAİBÜ Psikoloji Öğrencileri Topluluğu
                  </p>
                  <div className="space-y-2">
                    <p><span className="font-medium">E-posta:</span> gizlilik@baibupsikologitopluluğu.org</p>
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
