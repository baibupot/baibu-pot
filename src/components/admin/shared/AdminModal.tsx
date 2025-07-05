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
  hideFooter = false
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("max-h-[90vh] flex flex-col p-0", sizeClasses[size])}>
        <DialogHeader className="p-6 flex-shrink-0 border-b">
          <div className="flex items-center gap-4">
            {icon && (
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                {icon}
              </div>
            )}
            <div>
              <DialogTitle className="text-xl md:text-2xl font-bold">
                {title}
              </DialogTitle>
              {description && (
                <DialogDescription className="text-sm md:text-base">
                  {description}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {children}
        </div>

        {!hideFooter && (
          <DialogFooter className="flex-shrink-0 flex justify-end space-x-2 p-4 bg-muted/50 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              <X className="h-4 w-4 mr-2" />
              {cancelLabel}
            </Button>
            {onSave && (
              <Button type="submit" onClick={onSave} disabled={isSaving || !isFormValid}>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isSaving ? 'Kaydediliyor...' : saveLabel}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}; 