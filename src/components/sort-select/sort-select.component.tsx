import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { SortOption } from '@/types';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'recent', label: 'Mais recente' },
  { value: 'price-asc', label: 'Menor preço' },
  { value: 'price-desc', label: 'Maior preço' },
];

export default function SortSelect({
  sortBy,
  setSortBy,
}: {
  sortBy: SortOption;
  setSortBy: (sortBy: SortOption) => void;
}) {
  return (
    <Select
      value={sortBy}
      onValueChange={(value) => setSortBy(value as SortOption)}
    >
      <SelectTrigger className="w-full sm:w-44">
        <SelectValue placeholder="Ordenar por">
          {(value: SortOption) =>
            sortOptions.find((option) => option.value === value)?.label
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
