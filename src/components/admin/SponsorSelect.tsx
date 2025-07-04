import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSponsors } from '@/hooks/useSupabaseData';
import { Search } from 'lucide-react';

interface SponsorSelectProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

const SponsorSelect = ({ selectedIds, onChange }: SponsorSelectProps) => {
  const { data: sponsors = [], isLoading } = useSponsors(true);
  const [search, setSearch] = useState('');
  const [filteredSponsors, setFilteredSponsors] = useState<typeof sponsors>([]);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredSponsors(sponsors);
    } else {
      const lowercasedFilter = search.toLowerCase();
      setFilteredSponsors(
        sponsors.filter((sponsor) =>
          sponsor.name.toLowerCase().includes(lowercasedFilter)
        )
      );
    }
  }, [search, sponsors]);

  const handleToggle = (id: string) => {
    const newSelectedIds = selectedIds.includes(id)
      ? selectedIds.filter((sponsorId) => sponsorId !== id)
      : [...selectedIds, id];
    onChange(newSelectedIds);
  };

  return (
    <div className="space-y-3 rounded-lg border bg-gray-50 dark:bg-gray-900/50 p-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Sponsor ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
        {isLoading && <p className="text-sm text-center text-muted-foreground">Sponsorlar yükleniyor...</p>}
        
        {!isLoading && filteredSponsors.length === 0 && (
          <p className="text-sm text-center text-muted-foreground py-4">
            {sponsors.length === 0 ? "Henüz hiç sponsor eklenmemiş." : "Aramayla eşleşen sponsor bulunamadı."}
          </p>
        )}

        {filteredSponsors.map((sponsor) => (
          <Label
            key={sponsor.id}
            className="flex items-center gap-3 cursor-pointer rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
          >
            <input
              type="checkbox"
              checked={selectedIds.includes(sponsor.id)}
              onChange={() => handleToggle(sponsor.id)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            {sponsor.logo && (
              <img src={sponsor.logo} alt={sponsor.name} className="w-8 h-8 object-contain rounded-md border bg-white" />
            )}
            <span className="font-medium">{sponsor.name}</span>
          </Label>
        ))}
      </div>
    </div>
  );
};

export default SponsorSelect; 