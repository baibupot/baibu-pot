import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStatus } from '@/hooks/useAuth';
import LoadingPage from '@/components/ui/loading-page';
import { Shield } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: boolean; // Onaylı rol gerekli mi?
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireRole = true 
}) => {
  const { data: authStatus, isLoading } = useAuthStatus();

  // Yükleniyor durumu
  if (isLoading) {
    return (
      <LoadingPage
        title="Kimlik Doğrulanıyor..."
        message="Yetkiniz kontrol ediliyor, lütfen bekleyin."
        icon={Shield}
      />
    );
  }

  // Giriş yapmamış
  if (!authStatus?.isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  // Email doğrulanmamış
  if (!authStatus.emailConfirmed) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Email Doğrulaması Gerekli
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Admin paneline erişmek için email adresinizi doğrulamanız gerekiyor.
          </p>
          <button
            onClick={() => window.location.href = '/admin'}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Giriş sayfasına dön
          </button>
        </div>
      </div>
    );
  }

  // Rol gerekli ama onaylı rol yok
  if (requireRole && !authStatus.hasApprovedRole) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <Shield className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Rol Onayı Bekleniyor
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Admin paneline erişmek için rolünüzün onaylanmasını beklemeniz gerekiyor.
            Lütfen yöneticilerle iletişime geçin.
          </p>
          <button
            onClick={() => window.location.href = '/admin'}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Giriş sayfasına dön
          </button>
        </div>
      </div>
    );
  }

  // Tüm kontroller geçti, içeriği göster
  return <>{children}</>;
};

export default ProtectedRoute; 