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
import PageContainer from '@/components/ui/page-container';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState('teknik_ekip');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const createUserRole = useCreateUserRole();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      navigate('/admin/dashboard');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        toast.success('Giriş başarılı!');
        navigate('/admin/dashboard');
      }
    } catch (error: any) {
      toast.error(error.message || 'Giriş yapılırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
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

      if (authError) throw authError;

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

        toast.success('Kayıt başarılı! E-posta adresinizi doğrulayın ve rol onayını bekleyin.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Kayıt olurken bir hata oluştu');
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
                🔐 Güvenli Giriş
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
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
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-12 h-12 text-base bg-white/80 dark:bg-slate-700/80"
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
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-12 pr-12 h-12 text-base bg-white/80 dark:bg-slate-700/80"
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
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="space-y-6">
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
                          onChange={(e) => setPassword(e.target.value)}
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
                    
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                      <p className="text-sm text-amber-800 dark:text-amber-200 text-center leading-relaxed">
                        ⚠️ Kayıt olduktan sonra seçtiğiniz rol için admin onayı gereklidir.
                      </p>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
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
    </PageContainer>
  );
};

export default AdminLogin;
