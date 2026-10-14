import { useTranslation } from 'react-i18next';
import { IconCompass } from '@tabler/icons-react';

export default function ExplorePage() {
  const { t } = useTranslation();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          {t('nav.explore')}
        </h1>
        <p className="text-muted-foreground">{t('explore.subtitle')}</p>
      </div>

      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/30 px-6 py-20 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <IconCompass size={24} stroke={1.5} />
        </div>
        <p className="max-w-sm text-muted-foreground">{t('explore.comingSoon')}</p>
      </div>
    </div>
  );
}
