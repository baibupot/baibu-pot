import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2, AlertTriangle } from 'lucide-react';
import { modalStyles, spacing, cn } from '@/shared/design-system';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  itemName?: string;
  itemType?: string;
  variant?: 'danger' | 'warning' | 'info';
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  className?: string;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
  itemType = 'öğe',
  variant = 'danger',
  confirmLabel,
  cancelLabel = 'İptal',
  isLoading = false,
  className
}) => {
  const variantConfig = {
    danger: {
      icon: <Trash2 className="h-5 w-5" />,
      iconBg: 'bg-red-100 dark:bg-red-900/20',
      iconColor: 'text-red-600 dark:text-red-400',
      titleColor: 'text-red-600',
      confirmButton: 'bg-red-600 hover:bg-red-700',
      defaultTitle: `${itemType} Sil`,
      defaultDescription: 'Bu işlem geri alınamaz. Seçili öğe kalıcı olarak silinecektir.',
      defaultConfirmLabel: 'Sil'
    },
    warning: {
      icon: <AlertTriangle className="h-5 w-5" />,
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/20',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      titleColor: 'text-yellow-600',
      confirmButton: 'bg-yellow-600 hover:bg-yellow-700',
      defaultTitle: 'Dikkat',
      defaultDescription: 'Bu işlemi gerçekleştirmek istediğinizden emin misiniz?',
      defaultConfirmLabel: 'Devam Et'
    },
    info: {
      icon: <AlertTriangle className="h-5 w-5" />,
      iconBg: 'bg-blue-100 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      titleColor: 'text-blue-600',
      confirmButton: 'bg-blue-600 hover:bg-blue-700',
      defaultTitle: 'Onay',
      defaultDescription: 'Bu işlemi onaylıyor musunuz?',
      defaultConfirmLabel: 'Onayla'
    }
  };

  const config = variantConfig[variant];
  const finalTitle = title || config.defaultTitle;
  const finalDescription = description || config.defaultDescription;
  const finalConfirmLabel = confirmLabel || config.defaultConfirmLabel;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(modalStyles.sizes.sm, className)}>
        <DialogHeader>
          <DialogTitle className={cn(
            'text-xl font-bold flex items-center gap-2',
            config.titleColor
          )}>
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center',
              config.iconBg
            )}>
              <span className={config.iconColor}>
                {config.icon}
              </span>
            </div>
            {finalTitle}
          </DialogTitle>
          <DialogDescription className="mt-2">
            {finalDescription}
          </DialogDescription>
        </DialogHeader>
        
        {itemName && (
          <div className={cn(
            'p-4 rounded-lg border mt-4',
            variant === 'danger' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
            variant === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' :
            'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
          )}>
            <h4 className={cn(
              'font-medium mb-2',
              variant === 'danger' ? 'text-red-800 dark:text-red-300' :
              variant === 'warning' ? 'text-yellow-800 dark:text-yellow-300' :
              'text-blue-800 dark:text-blue-300'
            )}>
              Etkilenecek {itemType}:
            </h4>
            <p className="text-sm font-semibold">{itemName}</p>
          </div>
        )}
        
        <div className="flex gap-3 justify-end mt-6">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
          >
            ❌ {cancelLabel}
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              'text-white',
              config.confirmButton
            )}
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                İşleniyor...
              </>
            ) : (
              <>
                {variant === 'danger' && <Trash2 className="h-4 w-4 mr-2" />}
                {finalConfirmLabel}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 