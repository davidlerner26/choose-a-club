import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

export default function Options({
  selectOption,
  optionSelected,
}: {
  selectOption: (bought: boolean) => void;
  optionSelected: boolean | undefined;
}) {
  const { t } = useTranslation();
  const options: { value: string; bought: boolean }[] = [
    { value: t('options.wanted'), bought: false },
    { value: t('options.bought'), bought: true },
  ];

  return (
    <div className="flex h-9 gap-1 rounded-full bg-muted p-1">
      {options.map((option) => (
        <Button
          variant="ghost"
          onClick={() => selectOption(option.bought)}
          key={option.value}
          className={
            option.bought === optionSelected
              ? 'h-full rounded-full bg-card px-4 text-sm text-primary shadow-sm hover:bg-card'
              : 'h-full rounded-full px-4 text-sm text-muted-foreground hover:bg-transparent'
          }
        >
          {option.value}
        </Button>
      ))}
    </div>
  );
}
