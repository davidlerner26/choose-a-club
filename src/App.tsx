import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from './hooks/use-auth';
import { useOwnProfile } from './hooks/use-own-profile';
import ChooseUsernameDialog from './components/choose-username-dialog/choose-username-dialog.component';
import HomePage from './pages/home/home.component';
import ProfilePage from './pages/profile/profile.component';

export default function App() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { profile, isLoading: isProfileLoading, setProfile } =
    useOwnProfile(user);

  if (isAuthLoading || (user && isProfileLoading)) {
    return (
      <div className="flex items-center justify-center w-screen h-screen">
        <Spinner className="text-primary" />
      </div>
    );
  }

  if (user && !profile) {
    return <ChooseUsernameDialog user={user} onCreated={setProfile} />;
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage user={user} profile={profile} />} />
      <Route path="/:username" element={<ProfilePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
