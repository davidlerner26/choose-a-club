import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import type { User } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Field, FieldError, FieldGroup } from '@/components/ui/field';
import { createUserProfile, isUsernameAvailable } from '@/firebase/firebase';
import type { UserProfile } from '@/types';

const USERNAME_REGEX = /^[a-z0-9_.]{3,20}$/;

type FormValues = {
  username: string;
};

export default function ChooseUsernameDialog({
  user,
  onCreated,
}: {
  user: User;
  onCreated: (profile: UserProfile) => void;
}) {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();

  const onSubmit: SubmitHandler<FormValues> = async ({ username }) => {
    setError(null);
    const normalized = username.trim().toLowerCase();

    if (!USERNAME_REGEX.test(normalized)) {
      setError(
        'Use de 3 a 20 letras minúsculas, números, "." ou "_", sem espaços.',
      );
      return;
    }

    const available = await isUsernameAvailable(normalized);
    if (!available) {
      setError('Esse nome de usuário já está em uso.');
      return;
    }

    try {
      const profile = await createUserProfile({
        username: normalized,
        displayName: user.displayName ?? normalized,
        photoURL: user.photoURL,
      });
      onCreated(profile);
    } catch {
      setError('Esse nome de usuário já está em uso.');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <img className="w-14" src="favicon.svg" />
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-primary">
            Escolha o nome do seu clube
          </h1>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <Label htmlFor="username">Nome do clube</Label>
                <Input
                  id="username"
                  autoFocus
                  {...register('username', {
                    required: 'Nome do clube é obrigatório',
                  })}
                />
                <FieldError>{errors.username?.message}</FieldError>
              </Field>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting && <Spinner className="size-4" />}
                Continuar
              </Button>
            </FieldGroup>
          </form>
        </div>
      </div>
    </main>
  );
}
