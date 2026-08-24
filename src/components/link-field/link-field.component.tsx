import type {
  FieldErrors,
  UseFormGetValues,
  UseFormRegister,
} from 'react-hook-form';
import { Field, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
        if (response) {
          onProductFetched({
            id: crypto.randomUUID(),
            name: response.name,
            store: response.marca,
            price: response.price,
            url: response.imagem,
            link: response.link,
            category: response.categoria,
            priceFrom: response.precoDe,
          });
        }
      } catch (error) {
        console.error(error);
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
        {displayLabel && <Label htmlFor="link">Link da loja</Label>}
        <Input
          className={`${displayLabel ? 'mb-3' : ''}`}
          id="link"
          placeholder={placeholder}
          {...register('link', {
            required: 'Link da loja é obrigatório',
          })}
        />
        <FieldError>{errors.link?.message}</FieldError>
      </Field>
      <Button
        size="lg"
        className="bg-red-700 hover:bg-red-800"
        onClick={() => search()}
      >
        Adicionar
      </Button>
    </div>
  );
}
