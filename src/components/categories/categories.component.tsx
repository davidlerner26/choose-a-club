import { Badge } from '@/components/ui/badge';

export default function Categories({
  selectedCategory,
  selectCategory,
  categories,
}) {
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
          {category}
        </Badge>
      ))}
    </div>
  );
}
