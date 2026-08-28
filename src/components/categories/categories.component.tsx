import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { ALL_CATEGORIES } from '@/lib/constants';

export default function Categories({
  selectedCategory,
  selectCategory,
  categories,
}: {
  selectedCategory: string;
  selectCategory: (category: string) => void;
  categories: string[];
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <Badge
          variant={selectedCategory === category ? 'default' : 'outline'}
          key={category}
          onClick={() => selectCategory(category)}
          className="cursor-pointer select-none transition-colors hover:bg-accent hover:text-accent-foreground data-[selected=true]:hover:bg-primary/90"
          data-selected={selectedCategory === category}
        >
          {category === ALL_CATEGORIES ? t('categories.all') : category}
        </Badge>
      ))}
    </div>
  );
}
