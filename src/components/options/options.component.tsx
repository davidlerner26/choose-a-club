import { Button } from '@/components/ui/button';
import type { Option } from '@/types';

export default function Options({ selectOption, optionSelected }) {
  const options: Option[] = [
    { value: 'Desejando', selected: false, bought: false },
    { value: 'Já comprei', selected: false, bought: true },
  ];

  return (
    <div className="flex gap-1 rounded-full bg-muted p-1">
      {options.map((option) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => selectOption(option)}
          key={option.value}
          className={
            option.bought === optionSelected
              ? 'rounded-full bg-card text-primary shadow-sm hover:bg-card'
              : 'rounded-full text-muted-foreground hover:bg-transparent'
          }
        >
          {option.value}
        </Button>
      ))}
    </div>
  );
}
