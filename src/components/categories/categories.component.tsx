import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { ALL_CATEGORIES } from '@/lib/constants';

export default function Categories({
  selectedCategory,
  selectCategory,
  categories,
  counts,
}: {
  selectedCategory: string;
  selectCategory: (category: string) => void;
  categories: string[];
  counts?: Record<string, number>;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <Badge
          variant={selectedCategory === category ? 'default' : 'outline'}
          key={category}
          onClick={() => selectCategory(category)}
          className="h-9 cursor-pointer select-none px-4 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground data-[selected=true]:hover:bg-primary/90"
          data-selected={selectedCategory === category}
        >
          {category === ALL_CATEGORIES ? t('categories.all') : category}
          {counts && <span className="opacity-70">({counts[category] ?? 0})</span>}
        </Badge>
      ))}
    </div>
  );
}
