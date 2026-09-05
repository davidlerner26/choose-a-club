import type {
  FieldErrors,
  UseFormGetValues,
  UseFormRegister,
} from 'react-hook-form';
import { Field, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import type { Product } from '@/types';
import { extractProduct } from '../api/api';

type LinkFieldProps = {
  placeholder: string;
  register: UseFormRegister<Product>;
  errors: FieldErrors<Product>;
  getValues: UseFormGetValues<Product>;
  setIsLoading: (isLoading: boolean) => void;
  onProductFetched: (product: Product) => void;
  displayLabel: boolean;
};

export default function LinkField({
  register,
  errors,
  placeholder,
  getValues,
  setIsLoading,
  onProductFetched,
  displayLabel,
}: LinkFieldProps) {
  const { t } = useTranslation();

  const focusInput = () => {
    const input = document.getElementById('link');
    input?.focus();
  };

  const search = async () => {
    const link = getValues('link');
    if (link) {
      setIsLoading(true);
      try {
        const response = await extractProduct(link);
        if ('manual' in response) {
          toast.error(t('linkField.toasts.notFound'), {
            description: response.motivo || t('linkField.toasts.manualFallback'),
          });
        } else {
          onProductFetched({
            id: crypto.randomUUID(),
            name: response.name ?? '',
            store: response.marca ?? '',
            price: response.price ?? 0,
            url: response.imagem ?? '',
            link: response.link,
            category: response.categoria ?? '',
            priceFrom: response.precoDe,
            currency: response.currency,
          });
          toast.success(t('linkField.toasts.found'), {
            description: response.name,
          });
        }
      } catch (error) {
        console.error(error);
        toast.error(t('linkField.toasts.notFound'), {
          description: t('linkField.toasts.manualFallback'),
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      focusInput();
    }
  };

  return (
    <div className={`${displayLabel ? '' : 'flex gap-3'}`}>
      <Field className="flex-1">
        {displayLabel && <Label htmlFor="link">{t('linkField.label')}</Label>}
        <Input
          className={`${displayLabel ? 'mb-3' : ''}`}
          id="link"
          placeholder={placeholder}
          {...register('link', {
            required: t('linkField.required'),
          })}
        />
        <FieldError>{errors.link?.message}</FieldError>
      </Field>
      <Button
        size="lg"
        className="bg-red-700 hover:bg-red-800"
        onClick={() => search()}
      >
        {t('common.add')}
      </Button>
    </div>
  );
}
