import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { SortOption } from '@/types';

export default function SortSelect({
  sortBy,
  setSortBy,
}: {
  sortBy: SortOption;
  setSortBy: (sortBy: SortOption) => void;
}) {
  const { t } = useTranslation();
  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'recent', label: t('sort.recent') },
    { value: 'price-asc', label: t('sort.priceAsc') },
    { value: 'price-desc', label: t('sort.priceDesc') },
  ];

  return (
    <Select
      value={sortBy}
      onValueChange={(value) => setSortBy(value as SortOption)}
    >
      <SelectTrigger className="w-full sm:w-44">
        <SelectValue placeholder={t('sort.placeholder')}>
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
