import { useTranslation } from 'react-i18next';
import { IconHanger } from '@tabler/icons-react';

export default function NoProductsFound() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center gap-3 w-full h-100 rounded-xl border-2 border-dashed border-border bg-muted/30 text-center px-6">
      <IconHanger className="text-muted-foreground" size={40} stroke={1.5} />
      <p className="text-lg font-semibold">{t('noProductsFound.title')}</p>
      <p className="max-w-sm text-muted-foreground">
        {t('noProductsFound.subtitle')}
      </p>
      {/* <Button
        size="lg"
        className="bg-red-700 hover:bg-red-800"
        onClick={() => focusInput()}
      >
        Colar o primeiro link
      </Button> */}
    </div>
  );
}
