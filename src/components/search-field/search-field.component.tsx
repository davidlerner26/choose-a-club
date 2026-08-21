import { Input } from '@/components/ui/input';
import { IconSearch } from '@tabler/icons-react';

export default function SearchField({
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: string;
  setSearchQuery: (searchQuery: string) => void;
}) {
  return (
    <div className="relative w-full sm:w-64">
      <IconSearch
        stroke={2}
        className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
      />
      <Input
        type="search"
        placeholder="Buscar peça..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-8"
      />
    </div>
  );
}
