import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Controller, useForm, type SubmitHandler } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Product } from '@/types';
import { createProduct, getProduct, updateProduct } from '@/firebase/firebase';
import { useEffect, useState } from 'react';
import { Spinner } from '@/components/ui/spinner';

function formatCentsToPtBr(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function AddProductDialog({
  categories,
  open,
  setOpen,
  id,
  setId,
  updateProducts,
}: {
  categories: string[];
  open: boolean;
  setOpen: (open: boolean) => void;
  id: string | null;
  setId: (id: string | null) => void;
  updateProducts: () => Promise<void>;
}) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [priceDisplay, setPriceDisplay] = useState<string>('0,00');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<Product>();

  const onSubmit: SubmitHandler<Product> = async (data) => {
    const product: Product = {
      ...data,
      price: Number(data.price),
      bought: false,
    };
    if (id) {
      await updateProduct(id, product);
    } else {
      await createProduct(product);
    }
    resetFields(false);
    await updateProducts();
  };

  const resetFields = (open: boolean) => {
    setOpen(open);
    if (!open) {
      setId(null);
      reset();
      setPriceDisplay('0,00');
    }
  };

  const setFieldsDefaultValues = (product: Product) => {
    const { link, name, price, category, store, url } = product;
    reset({
      link: link || '',
      name: name || '',
      price: price || 0,
      category: category || '',
      store: store || '',
      url: url || '',
    });
    setPriceDisplay(formatCentsToPtBr(Math.round((price || 0) * 100)));
  };

  useEffect(() => {
    async function fetchProduct() {
      if (id) {
        setIsLoading(true);
        const response = await getProduct(id);
        if (response) {
          setFieldsDefaultValues(response);
        }
      }
      setIsLoading(false);
    }
    fetchProduct();
  }, [id]);

  return (
    <Dialog open={open} onOpenChange={resetFields}>
      <DialogContent className="sm:max-w-sm">
        {isLoading ? (
          <div className="flex items-center justify-center w-screen h-screen">
            <Spinner />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Nova peça</DialogTitle>
              <DialogDescription className="mb-4">
                Cole o link e aguarde: o app busca nome, preço e foto sozinho.
              </DialogDescription>
            </DialogHeader>
            <FieldGroup className="mb-8">
              <Field>
                <Label htmlFor="link">Link da loja</Label>
                <Input
                  id="link"
                  placeholder="https://loja.com.br/vestido..."
                  {...register('link', {
                    required: 'Link da loja é obrigatório',
                  })}
                />
                <FieldError>{errors.link?.message}</FieldError>
              </Field>
              <Field>
                <Label htmlFor="name">Nome da peça</Label>
                <Input
                  id="name"
                  placeholder="Vestido midi de linho"
                  {...register('name', {
                    required: 'Link da loja é obrigatório',
                  })}
                />
                <FieldError>{errors.name?.message}</FieldError>
              </Field>
              <Field>
                <Label htmlFor="price">Preço (R$)</Label>
                <Controller
                  name="price"
                  control={control}
                  rules={{
                    validate: (value) =>
                      Number(value) > 0 || 'Preço é obrigatório',
                  }}
                  render={({ field }) => (
                    <Input
                      id="price"
                      inputMode="numeric"
                      placeholder="0,00"
                      value={priceDisplay}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '');
                        const cents = digits ? parseInt(digits, 10) : 0;
                        setPriceDisplay(formatCentsToPtBr(cents));
                        field.onChange(cents / 100);
                      }}
                      onBlur={field.onBlur}
                    />
                  )}
                />
                <FieldError>{errors.price?.message}</FieldError>
              </Field>
              <Field>
                <FieldLabel>Categoria</FieldLabel>
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: 'Categoria é obrigatória' }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Escolhe uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {categories.map((item) => (
                            <SelectItem key={item} value={item}>
                              {item}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError>{errors?.category?.message}</FieldError>
              </Field>
              <Field>
                <Label htmlFor="store">Loja</Label>
                <Input
                  id="store"
                  {...register('store', {
                    required: 'Nome da loja é obrigatório',
                  })}
                />
                <FieldError>{errors.store?.message}</FieldError>
              </Field>
              {/* <Field>
                <FieldLabel htmlFor="picture">Foto da peça</FieldLabel>
                <Input id="picture" type="file" />
              </Field> */}
              <Field>
                <Label htmlFor="url">URL da imagem</Label>
                <Input
                  id="url"
                  placeholder="Cole aqui a URL da imagem"
                  {...register('url', {
                    required: 'URL da imagem é obrigatório',
                  })}
                />
                <FieldError>{errors.url?.message}</FieldError>
              </Field>
            </FieldGroup>
            <DialogFooter>
              <DialogClose render={<Button variant="outline">Cancel</Button>} />
              <Button type="submit">Adicionar à wishlist</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
