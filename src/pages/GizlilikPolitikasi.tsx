
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Eye, Lock, UserCheck, FileText, Calendar } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';

const GizlilikPolitikasi = () => {
  const lastUpdated = '15 Ocak 2024';

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <Header />
        
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-cyan-500 mr-3" />
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
                Gizlilik Politikası
              </h1>
            </div>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              BAİBÜ Psikoloji Öğrencileri Topluluğu olarak kişisel verilerinizin korunması 
              konusundaki yaklaşımımız ve uygulamalarımız.
            </p>
            <div className="flex items-center justify-center mt-4 text-sm text-slate-500 dark:text-slate-400">
              <Calendar className="h-4 w-4 mr-2" />
              Son güncelleme: {lastUpdated}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-8">
            {/* Introduction */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-cyan-500" />
                  Giriş
                </CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Bolu Abant İzzet Baysal Üniversitesi Psikoloji Öğrencileri Topluluğu (BAİBÜ PÖT) 
                  olarak, kişisel verilerinizin korunması konusunda hassasiyetle davranmakta ve 
                  6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ile Avrupa Birliği Genel 
                  Veri Koruma Tüzüğü (GDPR) hükümlerine uygun olarak hareket etmekteyiz.
                </p>
              </CardContent>
            </Card>

            {/* Data Collection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Eye className="h-6 w-6 text-cyan-500" />
                  Toplanan Veriler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                    İletişim Formu Verileri:
                  </h4>
                  <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-1">
                    <li>Ad Soyad (zorunlu)</li>
                    <li>E-posta adresi (isteğe bağlı)</li>
                    <li>Mesaj konusu ve içeriği (zorunlu)</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                    Etkinlik Kayıt Verileri:
                  </h4>
                  <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-1">
                    <li>Ad Soyad</li>
                    <li>Öğrenci numarası</li>
                    <li>Bölüm bilgisi</li>
                    <li>İletişim bilgileri</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                    Teknik Veriler:
                  </h4>
                  <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-1">
                    <li>IP adresi</li>
                    <li>Tarayıcı bilgileri</li>
                    <li>Ziyaret edilen sayfalar</li>
                    <li>Çerezler (cookies)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Data Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <UserCheck className="h-6 w-6 text-cyan-500" />
                  Verilerin Kullanım Amaçları
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-slate-600 dark:text-slate-400">
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-cyan-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    İletişim taleplerini yanıtlamak ve destek sağlamak
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-cyan-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Etkinlik organizasyonu ve katılımcı yönetimi
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-cyan-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Web sitesi performansını iyileştirmek
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-cyan-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Yasal yükümlülükleri yerine getirmek
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-cyan-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Topluluk faaliyetleri hakkında bilgilendirme (onay verilen durumlarda)
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Data Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Lock className="h-6 w-6 text-cyan-500" />
                  Veri Güvenliği
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-slate-600 dark:text-slate-400">
                  <p>
                    Kişisel verilerinizi korumak için aşağıdaki güvenlik önlemlerini almaktayız:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-cyan-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      SSL sertifikası ile şifreli veri iletimi
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-cyan-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Güvenli veritabanı sistemleri
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-cyan-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Sınırlı erişim yetkilendirmesi
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-cyan-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Düzenli güvenlik denetimleri
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* User Rights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <UserCheck className="h-6 w-6 text-cyan-500" />
                  Haklarınız
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-slate-600 dark:text-slate-400">
                  <p>KVKK kapsamında aşağıdaki haklara sahipsiniz:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        Bilgi Alma Hakkı
                      </h4>
                      <p className="text-sm">
                        Verilerinizin işlenip işlenmediğini öğrenebilirsiniz.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        Erişim Hakkı
                      </h4>
                      <p className="text-sm">
                        İşlenen verilerinize erişim talep edebilirsiniz.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        Düzeltme Hakkı
                      </h4>
                      <p className="text-sm">
                        Yanlış verilerin düzeltilmesini isteyebilirsiniz.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        Silme Hakkı
                      </h4>
                      <p className="text-sm">
                        Verilerinizin silinmesini talep edebilirsiniz.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cookies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-cyan-500" />
                  Çerezler (Cookies)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-slate-600 dark:text-slate-400">
                  <p>
                    Web sitemizde kullanıcı deneyimini iyileştirmek amacıyla çerezler kullanmaktayız:
                  </p>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        Zorunlu Çerezler:
                      </h4>
                      <p className="text-sm">
                        Web sitesinin temel işlevlerini yerine getirmek için gerekli çerezler.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        Tercih Çerezleri:
                      </h4>
                      <p className="text-sm">
                        Tema tercihi gibi kullanıcı ayarlarını hatırlamak için kullanılır.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-cyan-500" />
                  İletişim
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-slate-600 dark:text-slate-400">
                  <p>
                    Gizlilik politikamız hakkında sorularınız veya veri koruma haklarınızı 
                    kullanmak istiyorsanız bizimle iletişime geçebilirsiniz:
                  </p>
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
                    <p className="font-semibold text-slate-900 dark:text-white mb-2">
                      BAİBÜ Psikoloji Öğrencileri Topluluğu
                    </p>
                    <p>E-posta: gizlilik@baibupsikologitopluluğu.org</p>
                    <p>İletişim Formu: <a href="/iletisim" className="text-cyan-600 dark:text-cyan-400 hover:underline">www.baibupsikologitopluluğu.org/iletisim</a></p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Updates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Calendar className="h-6 w-6 text-cyan-500" />
                  Güncellemeler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400">
                  Bu gizlilik politikası düzenli olarak gözden geçirilmekte ve gerektiğinde 
                  güncellenebilmektedir. Yapılan değişiklikler bu sayfada yayınlanacak ve 
                  önemli değişiklikler için kullanıcılar bilgilendirilecektir.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default GizlilikPolitikasi;
