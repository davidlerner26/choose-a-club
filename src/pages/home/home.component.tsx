import { Navigate } from 'react-router-dom';
import type { User } from 'firebase/auth';
import LoginPage from '@/components/login-page/login-page.component';
import { useLocale } from '@/hooks/use-locale';
import type { UserProfile } from '@/types';

export default function HomePage({
  user,
  profile,
}: {
  user: User | null;
  profile: UserProfile | null;
}) {
  const { path } = useLocale();

  if (!user) {
    return <LoginPage />;
  }

  return <Navigate to={path(`/${profile!.username}`)} replace />;
}
