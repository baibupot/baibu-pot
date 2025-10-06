import React, { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSponsors } from '@/hooks/useSupabaseData';
import { Search, Building2, Check } from 'lucide-react';

interface SponsorSelectProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  maxSelection?: number;
}

const SponsorSelect = ({ selectedIds, onChange, maxSelection }: SponsorSelectProps) => {
  const { data: sponsors = [], isLoading } = useSponsors(true);
  const [search, setSearch] = useState('');
  
  const filteredSponsors = useMemo(() => {
    if (!search.trim()) {
      return sponsors;
    } else {
      const lowercasedFilter = search.toLowerCase();
      return sponsors.filter((sponsor) =>
        sponsor.name.toLowerCase().includes(lowercasedFilter)
      );
    }
  }, [search, sponsors]);

  const handleToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      // Sponsor'ı kaldır
      onChange(selectedIds.filter((sponsorId) => sponsorId !== id));
    } else {
      // Maksimum seçim kontrolü
      if (maxSelection && selectedIds.length >= maxSelection) {
        return;
      }
      // Sponsor'ı ekle
      onChange([...selectedIds, id]);
    }
  };

  const selectedSponsors = sponsors.filter(sponsor => selectedIds.includes(sponsor.id));

  return (
    <div className="space-y-4">
      {/* Seçili Sponsorlar */}
      {selectedSponsors.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Check className="h-4 w-4 text-green-600" />
              <span className="font-medium text-sm">Seçili Sponsorlar ({selectedSponsors.length})</span>
              {maxSelection && (
                <Badge variant="outline" className="text-xs">
                  {selectedSponsors.length}/{maxSelection}
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedSponsors.map((sponsor) => (
                <div
                  key={sponsor.id}
                  className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2 sm:px-2 sm:py-1.5"
                >
                  {sponsor.logo && (
                    <img 
                      src={sponsor.logo} 
                      alt={sponsor.name} 
                      className="w-6 h-6 object-contain rounded border bg-white flex-shrink-0" 
                    />
                  )}
                  <span className="text-sm font-medium text-green-800 dark:text-green-200 truncate">
                    {sponsor.name}
                  </span>
                  <button
                    onClick={() => handleToggle(sponsor.id)}
                    className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200 p-1 flex-shrink-0 touch-manipulation"
                  >
                    <Check className="h-4 w-4 sm:h-3 sm:w-3" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sponsor Seçimi */}
      <Card>
        <CardContent className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            <Input
              placeholder="Sponsor ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 sm:pl-11 h-12 sm:h-11 text-base touch-manipulation"
            />
          </div>
          
          <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-sm text-muted-foreground">Sponsorlar yükleniyor...</span>
              </div>
            )}
            
            {!isLoading && filteredSponsors.length === 0 && (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  {sponsors.length === 0 ? "Henüz hiç sponsor eklenmemiş." : "Aramayla eşleşen sponsor bulunamadı."}
                </p>
              </div>
            )}

            {filteredSponsors.map((sponsor) => {
              const isSelected = selectedIds.includes(sponsor.id);
              const isDisabled = maxSelection && !isSelected && selectedIds.length >= maxSelection;
              
              return (
                <Label
                  key={sponsor.id}
                  className={`flex items-center gap-3 cursor-pointer rounded-md p-3 sm:p-4 transition-colors touch-manipulation ${
                    isSelected 
                      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
                      : isDisabled
                      ? 'bg-gray-50 dark:bg-gray-900/50 cursor-not-allowed opacity-50'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent active:bg-gray-100 dark:active:bg-gray-800'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggle(sponsor.id)}
                    disabled={isDisabled}
                    className="h-5 w-5 sm:h-4 sm:w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 flex-shrink-0"
                  />
                  {sponsor.logo ? (
                    <img 
                      src={sponsor.logo} 
                      alt={sponsor.name} 
                      className="w-8 h-8 object-contain rounded-md border bg-white flex-shrink-0" 
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-md border bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-4 w-4 text-gray-500" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <span className={`font-medium text-sm ${isSelected ? 'text-blue-800 dark:text-blue-200' : ''}`}>
                      {sponsor.name}
                    </span>
                    {sponsor.description && (
                      <p className="text-xs text-muted-foreground truncate">
                        {sponsor.description}
                      </p>
                    )}
                  </div>
                  {isSelected && (
                    <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  )}
                </Label>
              );
            })}
          </div>
          
          {maxSelection && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-muted-foreground text-center">
                Maksimum {maxSelection} sponsor seçebilirsiniz
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SponsorSelect; 