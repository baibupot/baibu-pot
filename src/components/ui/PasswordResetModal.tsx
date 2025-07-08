import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'email' | 'success';

const PasswordResetModal: React.FC<PasswordResetModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<Step>('email');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleReset = () => {
    setStep('email');
    setEmail('');
    setError(null);
    setLoading(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Lütfen email adresinizi girin');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });

      if (error) {
        throw error;
      }

      setStep('success');
      toast.success('Şifre sıfırlama bağlantısı gönderildi');
    } catch (error: any) {
      console.error('Şifre sıfırlama hatası:', error);
      if (error.message.includes('Email not confirmed')) {
        setError('Bu email adresi doğrulanmamış. Lütfen önce email adresinizi doğrulayın.');
      } else if (error.message.includes('User not found')) {
        setError('Bu email adresi ile kayıtlı bir kullanıcı bulunamadı.');
      } else {
        setError('Şifre sıfırlama bağlantısı gönderilemedi. Lütfen tekrar deneyin.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === 'email' ? (
              <>
                <Lock className="h-5 w-5 text-primary" />
                Şifre Sıfırlama
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                Email Gönderildi
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {step === 'email' && (
          <form onSubmit={handleSendResetEmail} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email Adresi</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@email.com"
                  className="pl-10"
                  disabled={loading}
                />
              </div>
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
                    Gönderiliyor...
                  </>
                ) : (
                  'Sıfırlama Bağlantısı Gönder'
                )}
              </Button>
            </div>
          </form>
        )}

        {step === 'success' && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Email Gönderildi!</h3>
              <p className="text-muted-foreground text-sm">
                <strong>{email}</strong> adresine şifre sıfırlama bağlantısı gönderildi. 
                Email'inizdeki bağlantıya tıklayarak yeni şifrenizi belirleyebilirsiniz.
              </p>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Email'i görmüyorsanız spam/junk klasörünüzü kontrol edin. 
                Bağlantının geçerlilik süresi 1 saattir.
              </AlertDescription>
            </Alert>

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

export default PasswordResetModal; 