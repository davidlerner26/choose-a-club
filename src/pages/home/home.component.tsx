import { Navigate } from 'react-router-dom';
import type { User } from 'firebase/auth';
import LoginPage from '@/components/login-page/login-page.component';
import type { UserProfile } from '@/types';

export default function HomePage({
  user,
  profile,
}: {
  user: User | null;
  profile: UserProfile | null;
}) {
  if (!user) {
    return <LoginPage />;
  }

  return <Navigate to={`/${profile!.username}`} replace />;
}
