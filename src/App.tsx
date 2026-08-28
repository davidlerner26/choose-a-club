import { Fragment } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import { Spinner } from '@/components/ui/spinner';
import { Toaster } from '@/components/ui/sonner';
import { useAuth } from './hooks/use-auth';
import { useOwnProfile } from './hooks/use-own-profile';
import { LocaleProvider } from '@/components/locale-provider/locale-provider.component';
import { LOCALES, PREFIXED_LOCALE_CODES } from '@/i18n/locales';
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
    return (
      <LocaleProvider locale="pt-BR">
        <ChooseUsernameDialog user={user} onCreated={setProfile} />
        <Toaster />
      </LocaleProvider>
    );
  }

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <LocaleProvider locale="pt-BR">
              <HomePage user={user} profile={profile} />
            </LocaleProvider>
          }
        />
        <Route
          path="/:username"
          element={
            <LocaleProvider locale="pt-BR">
              <ProfilePage />
            </LocaleProvider>
          }
        />
        {PREFIXED_LOCALE_CODES.map((code) => (
          <Fragment key={code}>
            <Route
              path={`/${LOCALES[code].urlPrefix}`}
              element={
                <LocaleProvider locale={code}>
                  <HomePage user={user} profile={profile} />
                </LocaleProvider>
              }
            />
            <Route
              path={`/${LOCALES[code].urlPrefix}/:username`}
              element={
                <LocaleProvider locale={code}>
                  <ProfilePage />
                </LocaleProvider>
              }
            />
          </Fragment>
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </>
  );
}
