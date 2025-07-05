import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye, Download, ExternalLink } from 'lucide-react';
import { spacing, cn } from '@/shared/design-system';

interface ActionBarProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDownload?: () => void;
  onExternal?: () => void;
  viewLabel?: string;
  editLabel?: string;
  deleteLabel?: string;
  downloadLabel?: string;
  externalLabel?: string;
  disabled?: boolean;
  size?: 'sm' | 'lg' | 'default';
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  onView,
  onEdit,
  onDelete,
  onDownload,
  onExternal,
  viewLabel = 'Görüntüle',
  editLabel = 'Düzenle',
  deleteLabel = 'Sil',
  downloadLabel = 'İndir',
  externalLabel = 'Aç',
  disabled = false,
  size = 'sm',
  orientation = 'horizontal',
  className
}) => {
  const containerClass = orientation === 'horizontal' 
    ? 'flex flex-row gap-2' 
    : 'flex flex-col gap-2';

  const buttonSize = size;

  return (
    <div className={cn(containerClass, 'flex-shrink-0', className)}>
      {onView && (
        <Button 
          variant="outline" 
          size={buttonSize}
          onClick={onView}
          disabled={disabled}
          className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:border-blue-600 dark:hover:text-blue-400 transition-colors"
          title={viewLabel}
        >
          <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">{viewLabel}</span>
          <span className="sm:hidden">Gör</span>
        </Button>
      )}

      {onDownload && (
        <Button 
          variant="outline" 
          size={buttonSize}
          onClick={onDownload}
          disabled={disabled}
          className="hover:bg-green-50 hover:border-green-300 hover:text-green-600 dark:hover:bg-green-900/20 dark:hover:border-green-600 dark:hover:text-green-400 transition-colors"
          title={downloadLabel}
        >
          <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">{downloadLabel}</span>
          <span className="sm:hidden">İndir</span>
        </Button>
      )}

      {onExternal && (
        <Button 
          variant="outline" 
          size={buttonSize}
          onClick={onExternal}
          disabled={disabled}
          className="hover:bg-purple-50 hover:border-purple-300 hover:text-purple-600 dark:hover:bg-purple-900/20 dark:hover:border-purple-600 dark:hover:text-purple-400 transition-colors"
          title={externalLabel}
        >
          <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">{externalLabel}</span>
          <span className="sm:hidden">Aç</span>
        </Button>
      )}

      {onEdit && (
        <Button 
          variant="outline" 
          size={buttonSize}
          onClick={onEdit}
          disabled={disabled}
          className="hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20 dark:hover:border-blue-600 transition-colors"
          title={editLabel}
        >
          <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">{editLabel}</span>
          <span className="sm:hidden">Düzenle</span>
        </Button>
      )}

      {onDelete && (
        <Button 
          variant="outline" 
          size={buttonSize}
          onClick={onDelete}
          disabled={disabled}
          className="hover:bg-red-50 hover:border-red-300 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:border-red-600 dark:hover:text-red-400 transition-colors"
          title={deleteLabel}
        >
          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">{deleteLabel}</span>
          <span className="sm:hidden">Sil</span>
        </Button>
      )}
    </div>
  );
}; 