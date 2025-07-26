import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, AlertCircle, CheckCircle, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ChangeEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'current-password' | 'new-email' | 'success';

const ChangeEmailModal: React.FC<ChangeEmailModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<Step>('current-password');
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [currentEmail, setCurrentEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleReset = () => {
    setStep('current-password');
    setCurrentPassword('');
    setNewEmail('');
    setCurrentEmail('');
    setError(null);
    setLoading(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handlePasswordVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword.trim()) {
      setError('Lütfen mevcut şifrenizi girin');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Kullanıcının mevcut email'ini al
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const userEmail = userData.user.email!;
      setCurrentEmail(userEmail);

      // Mevcut şifreyi doğrulamak için signIn denemesi yap
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: currentPassword,
      });

      if (signInError) {
        throw new Error('Mevcut şifreniz yanlış');
      }

      // Doğrulama başarılı, email adımına geç
      setStep('new-email');
      toast.success('✅ Şifre doğrulandı, yeni email adresinizi girebilirsiniz');
      
    } catch (error: any) {
      console.error('Şifre doğrulama hatası:', error);
      setError(error.message || 'Şifre doğrulanırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newEmail.trim()) {
      setError('Lütfen yeni email adresinizi girin');
      return;
    }

    if (newEmail === currentEmail) {
      setError('Yeni email adresi mevcut adresinizle aynı olamaz');
      return;
    }

    // Email format kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setError('Geçerli bir email adresi girin');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Supabase secure email change with proper redirect
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      }, {
        emailRedirectTo: `${window.location.origin}/admin/login?emailChangeSuccess=true`
      });

      if (error) {
        throw error;
      }

      setStep('success');
      toast.success('🎉 Email değiştirme işlemi başlatıldı!');
      
    } catch (error: any) {
      console.error('Email değiştirme hatası:', error);
      if (error.message.includes('Email address already in use')) {
        setError('Bu email adresi zaten kullanımda');
      } else if (error.message.includes('Invalid email')) {
        setError('Geçersiz email adresi');
      } else {
        setError('Email değiştirilirken bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'current-password': return '🔐 Güvenlik Doğrulaması';
      case 'new-email': return '📧 Yeni Email Adresi';
      case 'success': return '✅ İşlem Başlatıldı';
      default: return 'Email Değiştir';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            {getStepTitle()}
          </DialogTitle>
        </DialogHeader>

        {/* Step 1: Password Verification */}
        {step === 'current-password' && (
          <form onSubmit={handlePasswordVerification} className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Güvenlik Önlemi
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Email adresinizi değiştirmek için önce kimliğinizi doğrulamamız gerekiyor.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="current-password">Mevcut Şifreniz</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Mevcut şifrenizi girin"
                disabled={loading}
                autoFocus
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

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
                    Doğrulanıyor...
                  </>
                ) : (
                  'Devam Et'
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Step 2: New Email */}
        {step === 'new-email' && (
          <form onSubmit={handleEmailChange} className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Mevcut Email: {currentEmail}
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    Şifreniz doğrulandı. Şimdi yeni email adresinizi girebilirsiniz.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-email">Yeni Email Adresi</Label>
              <Input
                id="new-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="yeni@email.com"
                disabled={loading}
                autoFocus
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col-reverse sm:flex-row gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('current-password')}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                Geri
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
                  'Email Değiştir'
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Step 3: Success */}
        {step === 'success' && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Email Değiştirme Başlatıldı!</h3>
              <p className="text-muted-foreground text-sm">
                <strong>{currentEmail}</strong> ve <strong>{newEmail}</strong> adreslerine 
                onay email'leri gönderildi.
              </p>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Önemli:</strong> Email değişikliği için her iki adresteki linklere tıklamanız gerekiyor.
                <br />• Eski email: Değişikliği onaylayın
                <br />• Yeni email: Yeni adresinizi doğrulayın
              </AlertDescription>
            </Alert>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Güvenlik Uyarısı
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    Onay işlemi tamamlanana kadar mevcut email adresinizle giriş yapmaya devam edin.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <Button onClick={handleClose} className="w-full sm:w-auto">
                Tamam
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ChangeEmailModal; 