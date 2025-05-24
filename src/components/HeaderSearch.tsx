
import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const HeaderSearch = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="flex items-center">
      {isSearchOpen ? (
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Site içinde ara..."
            className="w-32 sm:w-48 h-8 sm:h-9 text-sm"
            autoFocus
            onBlur={() => setIsSearchOpen(false)}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSearchOpen(false)}
            className="p-1 sm:p-2"
          >
            <X className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsSearchOpen(true)}
          className="hidden sm:flex p-2"
        >
          <Search className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default HeaderSearch;
