import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { IconBell } from '@tabler/icons-react';
import { Menu, MenuContent, MenuItem, MenuTrigger } from '@/components/ui/menu';
import { markNotificationsRead, subscribeNotifications } from '@/firebase/firebase';
import { useLocale } from '@/hooks/use-locale';
import type { AppNotification } from '@/types';

function timeAgo(timestamp: number, t: TFunction) {
  const minutes = Math.floor((Date.now() - timestamp) / 60000);
  if (minutes < 1) return t('comments.now');
  if (minutes < 60) return t('comments.minutesAgo', { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t('comments.hoursAgo', { count: hours });
  return t('comments.daysAgo', { count: Math.floor(hours / 24) });
}

export default function NotificationBell({ uid }: { uid: string }) {
  const { t } = useTranslation();
  const { priceWithCurrency } = useLocale();
  const [items, setItems] = useState<AppNotification[]>([]);

  useEffect(() => subscribeNotifications(uid, setItems), [uid]);

  const unread = items.filter((item) => !item.read);

  // marca como lidas ao fechar, pra o destaque ainda aparecer enquanto aberto
  const handleOpenChange = (open: boolean) => {
    if (open || unread.length === 0) return;
    markNotificationsRead(
      uid,
      unread.map((item) => item.id),
    ).catch((error) => console.error(error));
  };

  return (
    <Menu onOpenChange={handleOpenChange}>
      <MenuTrigger
        render={
          <button
            type="button"
            aria-label={t('notifications.title')}
            className="relative flex size-9 cursor-pointer items-center justify-center rounded-full border-none bg-transparent outline-none hover:bg-accent/60 focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        }
      >
        <IconBell className="size-5" stroke={2} />
        {unread.length > 0 && (
          <span className="absolute top-0.5 right-0.5 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] leading-4 font-semibold text-primary-foreground">
            {unread.length}
          </span>
        )}
      </MenuTrigger>
      <MenuContent className="w-80 max-w-[calc(100vw-2rem)]">
        <p className="px-2 py-1.5 text-sm font-semibold">{t('notifications.title')}</p>
        {items.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">
            {t('notifications.empty')}
          </p>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {items.map((item) => (
              <MenuItem
                key={item.id}
                className="items-start gap-3 py-2"
              >
                {item.productUrl && (
                  <img
                    src={item.productUrl}
                    alt=""
                    className="size-10 shrink-0 rounded-md bg-muted object-contain"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.productName}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.type === 'restock'
                      ? t('notifications.restock')
                      : t('notifications.priceDrop', {
                          price: priceWithCurrency(item.price, item.currency),
                        })}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {timeAgo(item.createdAt, t)}
                  </p>
                </div>
                {!item.read && (
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                )}
              </MenuItem>
            ))}
          </div>
        )}
      </MenuContent>
    </Menu>
  );
}
