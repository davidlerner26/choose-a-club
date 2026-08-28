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
    <div className="flex gap-1 rounded-full bg-muted p-1">
      {options.map((option) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => selectOption(option.bought)}
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
