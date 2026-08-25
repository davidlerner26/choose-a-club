import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { FirebaseError } from 'firebase/app';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldSeparator,
} from '@/components/ui/field';
import {
  signInWithApple,
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
} from '@/firebase/firebase';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.54 5.54 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3a7.4 7.4 0 0 1-4.07 1.14c-3.13 0-5.78-2.11-6.73-4.96H1.25v3.1A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54v-3.1H1.25a12 12 0 0 0 0 10.74l4.02-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.25 6.63l4.02 3.1C6.22 6.88 8.87 4.77 12 4.77Z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.88-1.99 1.56-2.987 1.56-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-.13.09-2.383 1.31-2.383 4.02 0 3.21 2.856 4.34 2.955 4.37z" />
    </svg>
  );
}

function firebaseErrorMessage(error: unknown): string {
  const code = error instanceof FirebaseError ? error.code : '';
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Este e-mail já está cadastrado.';
    case 'auth/invalid-email':
      return 'E-mail inválido.';
    case 'auth/weak-password':
      return 'A senha precisa ter pelo menos 6 caracteres.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'E-mail ou senha incorretos.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Tente novamente mais tarde.';
    case 'auth/popup-closed-by-user':
      return '';
    default:
      return 'Algo deu errado. Tente novamente.';
  }
}

type EmailFormValues = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmailFormValues>();

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(firebaseErrorMessage(err));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setIsAppleLoading(true);
    setError(null);
    try {
      await signInWithApple();
    } catch (err) {
      setError(firebaseErrorMessage(err));
    } finally {
      setIsAppleLoading(false);
    }
  };

  const onSubmit: SubmitHandler<EmailFormValues> = async ({
    email,
    password,
  }) => {
    setError(null);
    try {
      if (mode === 'signup') {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err) {
      setError(firebaseErrorMessage(err));
    }
  };

  const toggleMode = () => {
    setMode((current) => (current === 'signin' ? 'signup' : 'signin'));
    setError(null);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <img className="w-14" src="favicon.svg" />
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-primary">
            Choose a Club
          </h1>
          <p className="text-muted-foreground">
            Guarde os produtos que você ama e nunca perca de vista o que deseja
            comprar
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <Button
            variant="outline"
            size="lg"
            className="w-full mb-3"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isAppleLoading || isSubmitting}
          >
            {isGoogleLoading ? <Spinner className="size-4" /> : <GoogleIcon />}
            Continuar com o Google
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full mb-6"
            onClick={handleAppleSignIn}
            disabled={isGoogleLoading || isAppleLoading || isSubmitting}
          >
            {isAppleLoading ? <Spinner className="size-4" /> : <AppleIcon />}
            Continuar com a Apple
          </Button>

          <FieldSeparator className="mb-2">ou</FieldSeparator>

          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="voce@exemplo.com"
                  {...register('email', {
                    required: 'E-mail é obrigatório',
                  })}
                />
                <FieldError>{errors.email?.message}</FieldError>
              </Field>
              <Field>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register('password', {
                    required: 'Senha é obrigatória',
                    minLength: {
                      value: 6,
                      message: 'A senha precisa ter pelo menos 6 caracteres',
                    },
                  })}
                />
                <FieldError>{errors.password?.message}</FieldError>
              </Field>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isSubmitting || isGoogleLoading || isAppleLoading}
              >
                {isSubmitting && <Spinner className="size-4" />}
                {mode === 'signup' ? 'Criar conta' : 'Entrar'}
              </Button>
            </FieldGroup>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            {mode === 'signup' ? 'Já tem uma conta?' : 'Ainda não tem conta?'}{' '}
            <button
              type="button"
              className="font-medium text-primary hover:underline"
              onClick={toggleMode}
            >
              {mode === 'signup' ? 'Entrar' : 'Criar conta'}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}
