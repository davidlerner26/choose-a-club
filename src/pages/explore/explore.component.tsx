import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconCompass } from '@tabler/icons-react';
import { Spinner } from '@/components/ui/spinner';
import SearchField from '@/components/search-field/search-field.component';
import ProfilePreviewCard from '@/components/profile-preview-card/profile-preview-card.component';
import { getAllUserProfiles } from '@/firebase/firebase';
import { useAuth } from '@/hooks/use-auth';
import type { UserProfile } from '@/types';

// contas fixadas no topo da lista de Explorar, nessa ordem, antes de todo o
// resto (que segue a ordem de criação mais recente vinda do backend)
const PINNED_USERNAMES = ['thetziniutclub', 'thedavidlernerclub'];

function withPinnedFirst(profiles: UserProfile[]): UserProfile[] {
  const pinned = PINNED_USERNAMES.map((username) =>
    profiles.find((profile) => profile.username === username),
  ).filter((profile): profile is UserProfile => !!profile);
  const rest = profiles.filter(
    (profile) => !PINNED_USERNAMES.includes(profile.username),
  );
  return [...pinned, ...rest];
}

export default function ExplorePage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    getAllUserProfiles().then((result) => {
      if (cancelled) return;
      setProfiles(withPinnedFirst(result));
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProfiles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return profiles;
    return profiles.filter(
      (profile) =>
        profile.username.toLowerCase().includes(query) ||
        profile.displayName?.toLowerCase().includes(query),
    );
  }, [profiles, searchQuery]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            {t('nav.explore')}
          </h1>
          <p className="text-muted-foreground">{t('explore.subtitle')}</p>
        </div>
        <SearchField
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          placeholder={t('explore.searchPlaceholder')}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Spinner className="text-primary" />
        </div>
      ) : filteredProfiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/30 px-6 py-20 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <IconCompass size={24} stroke={1.5} />
          </div>
          <p className="text-muted-foreground">{t('explore.empty')}</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {filteredProfiles.map((profile) => (
            <li key={profile.uid}>
              <ProfilePreviewCard
                profile={profile}
                isCurrentUser={user?.uid === profile.uid}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
