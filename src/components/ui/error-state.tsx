import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showHomeButton?: boolean;
  variant?: 'default' | 'network' | 'permission' | 'notfound';
}

const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  onRetry,
  showHomeButton = true,
  variant = 'default'
}) => {
  const navigate = useNavigate();

  const getVariantContent = () => {
    switch (variant) {
      case 'network':
        return {
          title: title || 'Bağlantı Hatası',
          message: message || 'İnternet bağlantınızı kontrol edip tekrar deneyin.',
          icon: AlertTriangle,
          color: 'text-orange-500'
        };
      case 'permission':
        return {
          title: title || 'Yetkisiz Erişim',
          message: message || 'Bu sayfayı görüntülemek için yetkiniz bulunmuyor.',
          icon: AlertTriangle,
          color: 'text-red-500'
        };
      case 'notfound':
        return {
          title: title || 'Sayfa Bulunamadı',
          message: message || 'Aradığınız sayfa mevcut değil veya kaldırılmış olabilir.',
          icon: AlertTriangle,
          color: 'text-purple-500'
        };
      default:
        return {
          title: title || 'Bir Hata Oluştu',
          message: message || 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.',
          icon: AlertTriangle,
          color: 'text-red-500'
        };
    }
  };

  const { title: errorTitle, message: errorMessage, icon: Icon, color } = getVariantContent();

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="text-center space-y-8 max-w-md mx-auto px-4">
        {/* Error Icon with Animation */}
        <div className="relative">
          <div className="w-24 h-24 mx-auto bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center border-2 border-red-200 dark:border-red-800 relative overflow-hidden">
            {/* Pulse Animation */}
            <div className="absolute inset-0 bg-red-100 dark:bg-red-800/30 rounded-full animate-ping opacity-20"></div>
            <div className="absolute inset-2 bg-red-100 dark:bg-red-800/20 rounded-full animate-ping opacity-30 animation-delay-100"></div>
            
            <Icon className={`h-12 w-12 ${color} relative z-10 animate-pulse`} />
          </div>
        </div>

        {/* Error Content */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            {errorTitle}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            {errorMessage}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <Button 
              onClick={onRetry}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Tekrar Dene
            </Button>
          )}
          
          {showHomeButton && (
            <Button 
              variant="outline"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Ana Sayfaya Dön
            </Button>
          )}
        </div>

        {/* Status Code or Additional Info */}
        <div className="text-xs text-slate-400 dark:text-slate-500 space-y-1">
          <p>Sorun devam ederse lütfen bize bildirin.</p>
          <p className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded inline-block">
            Hata Kodu: {variant.toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorState; 