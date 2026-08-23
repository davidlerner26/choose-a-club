import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { getUserProfile } from '@/firebase/firebase';
import type { UserProfile } from '@/types';

export function useOwnProfile(user: User | null) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting state when the effect's dependency changes, per https://react.dev/learn/synchronizing-with-effects#fetching-data
      setProfile(null);
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    getUserProfile(user.uid).then((result) => {
      if (cancelled) return;
      setProfile(result);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  return { profile, isLoading, setProfile };
}
