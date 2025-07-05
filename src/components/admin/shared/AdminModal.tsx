import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, X, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onSave?: () => void;
  saveLabel?: string;
  cancelLabel?: string;
  isSaving?: boolean;
  isFormValid?: boolean;
  size?: ModalSize;
  hideFooter?: boolean;
  compactHeader?: boolean;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  '2xl': 'sm:max-w-2xl',
  '3xl': 'sm:max-w-3xl',
  '4xl': 'sm:max-w-4xl',
  '5xl': 'sm:max-w-5xl',
  '6xl': 'sm:max-w-6xl',
};

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  icon,
  children,
  onSave,
  saveLabel = 'Kaydet',
  cancelLabel = 'İptal',
  isSaving = false,
  isFormValid = true,
  size = '2xl',
  hideFooter = false,
  compactHeader = false
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("max-h-[95vh] flex flex-col p-0", sizeClasses[size])}>
        <DialogHeader className={cn(
          "flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
          compactHeader ? "p-2" : "p-3 sm:p-4"
        )}>
          <div className="flex items-center gap-2 sm:gap-3">
            {icon && (
              <div className={cn(
                "bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0",
                compactHeader ? "w-6 h-6 sm:w-8 sm:h-8" : "w-8 h-8 sm:w-10 sm:h-10"
              )}>
                <div className={cn(
                  "text-white",
                  compactHeader ? "w-3 h-3 sm:w-4 sm:h-4" : "w-4 h-4 sm:w-5 sm:h-5"
                )}>
                  {icon}
                </div>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <DialogTitle className={cn(
                "font-semibold truncate",
                compactHeader ? "text-sm sm:text-base" : "text-base sm:text-lg md:text-xl"
              )}>
                {title}
              </DialogTitle>
              {description && !compactHeader && (
                <DialogDescription className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                  {description}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className={cn(
          "flex-1 overflow-y-auto min-h-0",
          compactHeader ? "px-2 py-2 sm:px-3 sm:py-3" : "px-3 sm:px-4 py-3 sm:py-4"
        )}>
          {children}
        </div>

        {!hideFooter && (
          <DialogFooter className={cn(
            "flex-shrink-0 flex flex-col sm:flex-row gap-2 bg-muted/30 border-t",
            compactHeader ? "p-2 sm:p-3" : "p-3 sm:p-4"
          )}>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose} 
                disabled={isSaving}
                className="flex-1 sm:flex-none"
                size={compactHeader ? "sm" : "default"}
              >
                <X className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{cancelLabel}</span>
                <span className="sm:hidden">İptal</span>
              </Button>
              {onSave && (
                <Button 
                  type="submit" 
                  onClick={onSave} 
                  disabled={isSaving || !isFormValid}
                  className="flex-1 sm:flex-none"
                  size={compactHeader ? "sm" : "default"}
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-1 sm:mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-1 sm:mr-2" />
                  )}
                  <span className="hidden sm:inline">
                    {isSaving ? 'Kaydediliyor...' : saveLabel}
                  </span>
                  <span className="sm:hidden">
                    {isSaving ? '...' : 'Kaydet'}
                  </span>
                </Button>
              )}
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}; 