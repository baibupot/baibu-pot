import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecentSession, setIsRecentSession] = useState<boolean | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  // Session zamanını kontrol et (Basitleştirilmiş versiyon)
  useEffect(() => {
    if (isOpen) {
      checkSessionAge();
    }
  }, [isOpen]);

  const checkSessionAge = async () => {
    setCheckingSession(true);
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        setIsRecentSession(false);
        setCheckingSession(false);
        return;
      }

      // Supabase Secure Password Change özelliği backend'de çalışıyor
      // Frontend'de her zaman mevcut şifreyi isteyeceğiz güvenlik için
      setIsRecentSession(false); // Her zaman mevcut şifre iste
      
    } catch (error) {
      console.error('Session check error:', error);
      setIsRecentSession(false);
    } finally {
      setCheckingSession(false);
    }
  };

  const handleReset = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    setLoading(false);
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const validatePasswords = () => {
    // 24 saat içindeki session'lar için mevcut şifre kontrolü atlanabilir
    if (!isRecentSession && !currentPassword.trim()) {
      setError('Lütfen mevcut şifrenizi girin');
      return false;
    }

    if (!newPassword.trim()) {
      setError('Lütfen yeni şifrenizi girin');
      return false;
    }

    if (newPassword.length < 6) {
      setError('Yeni şifre en az 6 karakter olmalıdır');
      return false;
    }

    if (newPassword !== confirmPassword) {
      setError('Yeni şifreler eşleşmiyor');
      return false;
    }

    if (!isRecentSession && newPassword === currentPassword) {
      setError('Yeni şifre mevcut şifreden farklı olmalıdır');
      return false;
    }

    return true;
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswords()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Recent session'lar için mevcut şifre doğrulaması atlanır
      if (!isRecentSession) {
        // Önce mevcut şifreyi doğrula (kullanıcının email'ini al)
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        // Mevcut şifreyi doğrulamak için signIn denemesi yap
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: userData.user.email!,
          password: currentPassword,
        });

        if (signInError) {
          setError('Mevcut şifreniz yanlış');
          return;
        }
      }

      // Şifreyi güncelle
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        throw updateError;
      }

      toast.success('✅ Şifre başarıyla değiştirildi! Güvenlik için tüm cihazlardan çıkış yapılıyor...');
      
      // 2 saniye bekleyip tüm cihazlardan çıkış yap
      setTimeout(async () => {
        await supabase.auth.signOut({ scope: 'global' });
        window.location.href = '/admin/login';
      }, 2000);
      
      handleClose();
    } catch (error: any) {
      console.error('Şifre değiştirme hatası:', error);
      setError('Şifre değiştirilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Şifre Değiştir
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleChangePassword} className="space-y-4">
          {/* Loading state */}
          {checkingSession && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">Session kontrol ediliyor...</span>
            </div>
          )}

          {/* Recent Session Info */}
          {!checkingSession && isRecentSession && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Son Giriş Yakın Zamanda
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    24 saat içinde giriş yaptığınız için mevcut şifrenizi girmenize gerek yok.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Mevcut Şifre - Sadece recent session değilse göster */}
          {!checkingSession && !isRecentSession && (
            <div className="space-y-2">
              <Label htmlFor="current-password">Mevcut Şifre</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Mevcut şifreniz"
                  className="pl-10 pr-10"
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  disabled={loading}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Yeni Şifre */}
          <div className="space-y-2">
            <Label htmlFor="new-password">Yeni Şifre</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Yeni şifreniz (en az 6 karakter)"
                className="pl-10 pr-10"
                disabled={loading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowNewPassword(!showNewPassword)}
                disabled={loading}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          {/* Yeni Şifre Tekrar */}
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Yeni Şifre (Tekrar)</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Yeni şifrenizi tekrar girin"
                className="pl-10 pr-10"
                disabled={loading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Güvenlik Önlemi
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Yeni şifreniz otomatik olarak bilinen zayıf şifreler listesiyle kontrol edilir (HaveIBeenPwned.org). 
                  Şifre değişikliği sonrasında güvenlik için tüm cihazlardan çıkış yapılacaktır.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              İptal
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Değiştiriliyor...
                </>
              ) : (
                'Şifreyi Değiştir'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordModal; 