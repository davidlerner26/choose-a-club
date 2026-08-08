import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Field, FieldError, FieldGroup, FieldLabel } from './ui/field';
import { Input } from './ui/input';
import { Label } from './ui/label';

import { Controller, useForm, type SubmitHandler } from 'react-hook-form';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import type { Product } from '@/types';

export default function AddProductDialog({ categories, setProducts }) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Product>();
  const onSubmit: SubmitHandler<Product> = (data) => {
    setProducts((products) => [
      ...products,
      { ...data, id: crypto.randomUUID(), price: Number(data.price) },
    ]);
  };

  return (
    <Dialog>
      <form>
        <DialogTrigger
          render={<Button variant="outline">Adicionar manualmente</Button>}
        />
        <DialogContent className="sm:max-w-sm">
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
                  name="link"
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
                  name="name"
                  placeholder="Vestido midi de linho"
                  {...register('name', {
                    required: 'Link da loja é obrigatório',
                  })}
                />
                <FieldError>{errors.name?.message}</FieldError>
              </Field>
              <Field>
                <Label htmlFor="price">Preço (R$)</Label>
                <Input
                  id="price"
                  name="price"
                  placeholder="189,90"
                  {...register('price', { required: 'Preço é obrigatório' })}
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
                    <Select
                      items={categories}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
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
                  name="store"
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
                  name="url"
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
        </DialogContent>
      </form>
    </Dialog>
  );
}
