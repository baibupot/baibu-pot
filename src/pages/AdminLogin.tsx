import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LogIn, UserPlus, Eye, EyeOff, Shield, Lock, Mail, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCreateUserRole } from '@/hooks/useSupabaseData';
import { useAuthStatus } from '@/hooks/useAuth';
import PageContainer from '@/components/ui/page-container';
import { logUserLogin } from '@/utils/activityLogger';
import PasswordResetModal from '@/components/ui/PasswordResetModal';

// Props tipi tanımı
interface AdminLoginProps {
  resetMode?: boolean;
}

const AdminLogin = ({ resetMode = false }: AdminLoginProps) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState('teknik_ekip');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [isPasswordResetMode, setIsPasswordResetMode] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  // 🚨 Enhanced Error & Success State Management
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const createUserRole = useCreateUserRole();
  const { data: authStatus } = useAuthStatus();

  useEffect(() => {
    checkUserAndResetMode();
  }, []);

  const checkUserAndResetMode = async () => {
    // Props'dan reset mode kontrolü
    if (resetMode) {
      // Şifre sıfırlama modunda
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsPasswordResetMode(true);
        return;
      } else {
        // Session yoksa normal giriş sayfasına dön
        navigate('/admin/login');
        return;
      }
    }

    // URL parametrelerini kontrol et (eski uyumluluk için)
    const urlParams = new URLSearchParams(window.location.search);
    const isReset = urlParams.get('reset') === 'true';
    
    if (isReset) {
      // Şifre sıfırlama modunda
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsPasswordResetMode(true);
        return;
      } else {
        // Session yoksa normal giriş sayfasına dön
        navigate('/admin/login');
        return;
      }
    }

    // Normal kullanıcı kontrolü
    const { data: { user } } = await supabase.auth.getUser();
    if (user && !isReset && !resetMode) {
      navigate('/admin/dashboard');
    }
  };

  // 🔒 Enhanced Login with Email & Role Validation
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    try {
      // Basic email/password validation
      if (!email.trim() || !password.trim()) {
        throw new Error('E-posta ve şifre gereklidir');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Enhanced error messages
        if (error.message === 'Invalid login credentials') {
          throw new Error('🚫 E-posta veya şifre hatalı');
        }
        // Email confirmation artık gerekli değil
        throw new Error(error.message);
      }

      if (data.user) {
        // 🎯 Sadece rol onayı kontrolü 
        // Role approval kontrolü
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role, is_approved')
          .eq('user_id', data.user.id)
          .eq('is_approved', true);

        if (!roleData || roleData.length === 0) {
          setAuthError('⏳ Hesabınız henüz yönetici tarafından onaylanmamış');
          toast.error('⏳ Hesap onayı bekleniyor. Lütfen yönetici ile iletişime geçin.');
          return;
        }

        // Success! 
        const roleNames = roleData.map(r => getRoleDisplayName(r.role)).join(', ');
        
        // Giriş logu kaydet
        try {
          // Kullanıcı adını users tablosundan al
          const { data: userProfile } = await supabase
            .from('users')
            .select('name')
            .eq('id', data.user.id)
            .single();
          
          const userName = userProfile?.name || data.user.email?.split('@')[0] || 'Bilinmeyen Kullanıcı';
          const userRole = roleData[0]?.role || 'Kullanıcı';
          await logUserLogin(userName, userRole);
        } catch (error) {
          console.error('Giriş logu kaydedilemedi:', error);
        }
        
        toast.success(`🎉 Hoş geldiniz! (${roleNames})`);
        navigate('/admin/dashboard');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Giriş yapılırken beklenmeyen bir hata oluştu';
      setAuthError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Şifre Sıfırlama
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    try {
      if (!newPassword.trim()) {
        throw new Error('Lütfen yeni şifrenizi girin');
      }

      if (newPassword.length < 6) {
        throw new Error('Şifre en az 6 karakter olmalıdır');
      }

      if (newPassword !== confirmNewPassword) {
        throw new Error('Şifreler eşleşmiyor');
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }

      toast.success('🎉 Şifreniz başarıyla güncellendi! Giriş yapabilirsiniz.');
      
      // Reset mode'dan çık ve normal giriş sayfasına dön
      setIsPasswordResetMode(false);
      setNewPassword('');
      setConfirmNewPassword('');
      window.history.replaceState({}, '', '/admin/login');
      
    } catch (error: any) {
      const errorMessage = error.message || 'Şifre güncellenirken bir hata oluştu';
      setAuthError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 💪 Password Strength Checker
  const getPasswordStrength = (password: string) => {
    let score = 0;
    const checks = {
      length: password.length >= 6,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    score += checks.length ? 20 : 0;
    score += checks.uppercase ? 20 : 0;
    score += checks.lowercase ? 20 : 0;
    score += checks.numbers ? 20 : 0;
    score += checks.special ? 20 : 0;

    let strength = 'Çok Zayıf';
    let color = 'bg-red-500';
    
    if (score >= 80) { strength = 'Çok Güçlü'; color = 'bg-green-500'; }
    else if (score >= 60) { strength = 'Güçlü'; color = 'bg-blue-500'; }
    else if (score >= 40) { strength = 'Orta'; color = 'bg-yellow-500'; }
    else if (score >= 20) { strength = 'Zayıf'; color = 'bg-orange-500'; }

    return { score, strength, color, checks };
  };

  // 🔒 Enhanced Signup with Comprehensive Validation
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    try {
      // Form validation
      if (!name.trim()) {
        throw new Error('👤 Ad Soyad gereklidir');
      }
      if (!email.trim()) {
        throw new Error('📧 E-posta adresi gereklidir');
      }
      if (!email.includes('@')) {
        throw new Error('📧 Geçerli bir e-posta adresi girin');
      }
      
      // Password strength validation
      const passwordStrength = getPasswordStrength(password);
      if (passwordStrength.score < 60) {
        throw new Error('🔒 Şifreniz çok zayıf. En az 8 karakter, büyük/küçük harf, rakam içermelidir');
      }

      // 🎯 Üniversite e-posta kontrolü kaldırıldı - herhangi bir e-posta kabul edilir

      // Önce kullanıcıyı Supabase Auth'a kaydet
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          }
        }
      });

      if (authError) {
        if (authError.message === 'User already registered') {
          throw new Error('📧 Bu e-posta adresi zaten kayıtlı');
        }
        throw new Error(authError.message);
      }

      if (authData.user) {
        // Kullanıcıyı users tablosuna ekle
        const { error: userError } = await supabase
          .from('users')
          .insert([
            {
              id: authData.user.id,
              email: authData.user.email!,
              name: name,
            }
          ]);

        if (userError && !userError.message.includes('duplicate key')) {
          console.error('User creation error:', userError);
        }

        // Seçilen rolü ekle (onay bekleyecek)
        try {
          await createUserRole.mutateAsync({
            user_id: authData.user.id,
            role: selectedRole,
            is_approved: false
          });
        } catch (roleError) {
          console.error('Role creation error:', roleError);
        }

        setSignupSuccess(true);
        toast.success(`🎉 Kayıt başarılı! ${getRoleDisplayName(selectedRole)} rolü için başkan onayı bekleniyor.`);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Kayıt olurken beklenmeyen bir hata oluştu';
      setAuthError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplayName = (role: string) => {
    const roleNames: Record<string, string> = {
      'baskan': 'Başkan',
      'baskan_yardimcisi': 'Başkan Yardımcısı',
      'teknik_koordinator': 'Teknik Koordinatör',
      'teknik_ekip': 'Teknik Ekip',
      'etkinlik_koordinator': 'Etkinlik Koordinatör',
      'etkinlik_ekip': 'Etkinlik Ekip',
      'iletisim_koordinator': 'İletişim Koordinatör',
      'iletisim_ekip': 'İletişim Ekip',
      'dergi_koordinator': 'Dergi Koordinatör',
      'dergi_ekip': 'Dergi Ekip',
    };
    return roleNames[role] || role;
  };

  return (
    <PageContainer background="gradient">
      {/* Centered Admin Login */}
      <div className="min-h-screen flex items-center justify-center py-12">
        <div className="w-full max-w-md">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm rounded-2xl">
                <Shield className="h-12 w-12 text-orange-500" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Admin Paneli
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Yönetim paneline erişim için giriş yapın
            </p>
          </div>

          {/* Login Card */}
          <Card className="border-0 shadow-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg overflow-hidden">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                {isPasswordResetMode ? '🔄 Yeni Şifre Belirle' : '🔐 Güvenli Giriş'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              {isPasswordResetMode ? (
                // Şifre Sıfırlama Formu
                <div className="space-y-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-blue-600 dark:text-blue-400 mt-0.5">ℹ️</div>
                      <div>
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                          Şifre Sıfırlama
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                          E-postanızdaki bağlantıya tıkladığınız için teşekkürler. Şimdi yeni şifrenizi belirleyebilirsiniz.
                        </p>
                      </div>
                    </div>
                  </div>

                  {authError && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-red-600 dark:text-red-400 mt-0.5">❌</div>
                        <div>
                          <p className="text-sm font-medium text-red-800 dark:text-red-200">
                            Şifre Güncelleme Hatası
                          </p>
                          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                            {authError}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handlePasswordReset} className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="new-password" className="text-base font-medium">
                        🔒 Yeni Şifre
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                        <Input
                          id="new-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Yeni şifreniz (en az 6 karakter)"
                          value={newPassword}
                          onChange={(e) => {
                            setNewPassword(e.target.value);
                            setAuthError(null);
                          }}
                          className="pl-12 pr-12 h-12 text-base bg-white/80 dark:bg-slate-700/80"
                          required
                          minLength={6}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="confirm-new-password" className="text-base font-medium">
                        🔒 Yeni Şifre (Tekrar)
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                        <Input
                          id="confirm-new-password"
                          type="password"
                          placeholder="Yeni şifrenizi tekrar girin"
                          value={confirmNewPassword}
                          onChange={(e) => {
                            setConfirmNewPassword(e.target.value);
                            setAuthError(null);
                          }}
                          className="pl-12 h-12 text-base bg-white/80 dark:bg-slate-700/80"
                          required
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12 text-base font-semibold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl transition-all duration-300" 
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Şifre güncelleniyor...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Lock className="h-5 w-5" />
                          Şifreyi Güncelle
                        </div>
                      )}
                    </Button>

                    <div className="text-center">
                      <Button
                        type="button"
                        variant="link"
                        className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 p-0 h-auto"
                        onClick={() => {
                          setIsPasswordResetMode(false);
                          window.history.replaceState({}, '', '/admin/login');
                        }}
                      >
                        ← Giriş sayfasına dön
                      </Button>
                    </div>
                  </form>
                </div>
              ) : (
                <Tabs defaultValue="login" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 h-12">
                  <TabsTrigger value="login" className="text-base font-medium">
                    Giriş Yap
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="text-base font-medium">
                    Kayıt Ol
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="space-y-6">
                  {/* 🚨 Error Message Display */}
                  {authError && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-red-600 dark:text-red-400 mt-0.5">❌</div>
                        <div>
                          <p className="text-sm font-medium text-red-800 dark:text-red-200">
                            Giriş Hatası
                          </p>
                          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                            {authError}
                          </p>

                        </div>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-base font-medium">
                        📧 E-posta
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="admin@baibu.edu.tr"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setAuthError(null); // Clear error on input change
                          }}
                          className={`pl-12 h-12 text-base bg-white/80 dark:bg-slate-700/80 ${
                            authError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                          }`}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="password" className="text-base font-medium">
                        🔒 Şifre
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setAuthError(null); // Clear error on input change
                          }}
                          className={`pl-12 pr-12 h-12 text-base bg-white/80 dark:bg-slate-700/80 ${
                            authError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                          }`}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-12 text-base font-semibold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl transition-all duration-300" 
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Giriş yapılıyor...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <LogIn className="h-5 w-5" />
                          Giriş Yap
                        </div>
                      )}
                    </Button>
                    
                    <div className="text-center">
                      <Button
                        type="button"
                        variant="link"
                        className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 p-0 h-auto"
                        onClick={() => setShowPasswordResetModal(true)}
                      >
                        🔑 Şifremi Unuttum
                      </Button>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="space-y-6">
                  {/* 🎉 Success Message Display */}
                  {signupSuccess && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-green-600 dark:text-green-400 mt-0.5">🎉</div>
                        <div>
                          <p className="text-sm font-medium text-green-800 dark:text-green-200">
                            Kayıt Başarılı!
                          </p>
                          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                            Hesabınız oluşturuldu. Başkan onayını bekleyin.
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                            🏛️ Başkan tarafından rol onaylandıktan sonra giriş yapabilirsiniz.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 🚨 Error Message Display */}
                  {authError && !signupSuccess && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-red-600 dark:text-red-400 mt-0.5">❌</div>
                        <div>
                          <p className="text-sm font-medium text-red-800 dark:text-red-200">
                            Kayıt Hatası
                          </p>
                          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                            {authError}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSignUp} className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="signup-name" className="text-base font-medium">
                        👤 Ad Soyad
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="Ad Soyad"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="pl-12 h-12 text-base bg-white/80 dark:bg-slate-700/80"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="signup-email" className="text-base font-medium">
                        📧 E-posta
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="email@baibu.edu.tr"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-12 h-12 text-base bg-white/80 dark:bg-slate-700/80"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="signup-password" className="text-base font-medium">
                        🔒 Şifre
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                        <Input
                          id="signup-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setAuthError(null); // Clear error on input change
                          }}
                          className={`pl-12 pr-12 h-12 text-base bg-white/80 dark:bg-slate-700/80 ${
                            authError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                          }`}
                          required
                          minLength={6}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      
                      {/* 💪 Password Strength Indicator */}
                      {password && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-600 dark:text-slate-400">Şifre Gücü:</span>
                            <span className={`text-xs font-medium ${
                              getPasswordStrength(password).score >= 80 ? 'text-green-600 dark:text-green-400' :
                              getPasswordStrength(password).score >= 60 ? 'text-blue-600 dark:text-blue-400' :
                              getPasswordStrength(password).score >= 40 ? 'text-yellow-600 dark:text-yellow-400' :
                              getPasswordStrength(password).score >= 20 ? 'text-orange-600 dark:text-orange-400' :
                              'text-red-600 dark:text-red-400'
                            }`}>
                              {getPasswordStrength(password).strength}
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrength(password).color}`}
                              style={{ width: `${getPasswordStrength(password).score}%` }}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className={`flex items-center gap-1 ${getPasswordStrength(password).checks.length ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}`}>
                              <span>{getPasswordStrength(password).checks.length ? '✅' : '❌'}</span>
                              <span>6+ karakter</span>
                            </div>
                            <div className={`flex items-center gap-1 ${getPasswordStrength(password).checks.uppercase ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}`}>
                              <span>{getPasswordStrength(password).checks.uppercase ? '✅' : '❌'}</span>
                              <span>Büyük harf</span>
                            </div>
                            <div className={`flex items-center gap-1 ${getPasswordStrength(password).checks.lowercase ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}`}>
                              <span>{getPasswordStrength(password).checks.lowercase ? '✅' : '❌'}</span>
                              <span>Küçük harf</span>
                            </div>
                            <div className={`flex items-center gap-1 ${getPasswordStrength(password).checks.numbers ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}`}>
                              <span>{getPasswordStrength(password).checks.numbers ? '✅' : '❌'}</span>
                              <span>Rakam</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="role" className="text-base font-medium">
                        🎯 Rol Seçin
                      </Label>
                      <Select value={selectedRole} onValueChange={setSelectedRole}>
                        <SelectTrigger className="h-12 text-base bg-white/80 dark:bg-slate-700/80">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baskan">🏆 Başkan</SelectItem>
                          <SelectItem value="baskan_yardimcisi">🥈 Başkan Yardımcısı</SelectItem>
                          <SelectItem value="teknik_koordinator">⚙️ Teknik Koordinatör</SelectItem>
                          <SelectItem value="teknik_ekip">💻 Teknik Ekip</SelectItem>
                          <SelectItem value="etkinlik_koordinator">🎉 Etkinlik Koordinatör</SelectItem>
                          <SelectItem value="etkinlik_ekip">🎪 Etkinlik Ekip</SelectItem>
                          <SelectItem value="iletisim_koordinator">📢 İletişim Koordinatör</SelectItem>
                          <SelectItem value="iletisim_ekip">📞 İletişim Ekip</SelectItem>
                          <SelectItem value="dergi_koordinator">📚 Dergi Koordinatör</SelectItem>
                          <SelectItem value="dergi_ekip">📖 Dergi Ekip</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-300" 
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Kayıt oluşturuluyor...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <UserPlus className="h-5 w-5" />
                          Kayıt Ol
                        </div>
                      )}
                    </Button>
                    
                    <div className="space-y-3">
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <p className="text-sm text-blue-800 dark:text-blue-200 text-center leading-relaxed">
                          🛡️ <strong>Güvenlik:</strong> Şifreniz otomatik olarak bilinen zayıf şifreler listesiyle kontrol edilir (HaveIBeenPwned.org)
                        </p>
                      </div>
                      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                        <p className="text-sm text-amber-800 dark:text-amber-200 text-center leading-relaxed">
                          ⚠️ Kayıt olduktan sonra seçtiğiniz rol için admin onayı gereklidir.
                        </p>
                      </div>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
              )}
            </CardContent>
          </Card>

          {/* Info Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              🔒 Güvenli bağlantı ile korunmaktadır
            </p>
          </div>
        </div>
      </div>

      {/* Background Decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Password Reset Modal */}
      <PasswordResetModal
        isOpen={showPasswordResetModal}
        onClose={() => setShowPasswordResetModal(false)}
      />
    </PageContainer>
  );
};

export default AdminLogin;
