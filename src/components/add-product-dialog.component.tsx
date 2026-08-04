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
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Field, FieldGroup, FieldLabel } from './ui/field';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { Button } from './ui/button';

type IFormInput = {
  link: string;
  name: string;
  price: number;
  category: string;
  store: string;
};

export default function AddProductDialog({ categories, setProducts }) {
  const { register, handleSubmit } = useForm<IFormInput>();
  const onSubmit: SubmitHandler<IFormInput> = (data) => {
    setProducts((products) => [
      ...products,
      { ...data, id: crypto.randomUUID(), price: Number(data.price) },
    ]);
  };

  return (
    <Dialog>
      <form>
        <DialogTrigger
          render={<Button variant="outline">+ Colar link</Button>}
        />
        <DialogContent className="sm:max-w-sm">
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Nova peça</DialogTitle>
              <DialogDescription>
                Cole o link e aguarde — o app busca nome, preço e foto sozinho.
              </DialogDescription>
            </DialogHeader>
            <FieldGroup>
              <Field>
                <Label htmlFor="link">Link da loja</Label>
                <Input
                  id="link"
                  name="link"
                  placeholder="https://loja.com.br/vestido"
                  {...register('link')}
                />
              </Field>
              <Field>
                <Label htmlFor="name">Nome da peça</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="https://loja.com.br/vestido"
                  {...register('name')}
                />
              </Field>
              <Field>
                <Label htmlFor="price">Preço (R$)</Label>
                <Input
                  id="price"
                  name="price"
                  placeholder="https://loja.com.br/vestido"
                  {...register('price')}
                />
              </Field>
              <Field>
                <FieldLabel>Categoria</FieldLabel>
                <Select items={categories} {...register('category')}>
                  <SelectTrigger>
                    <SelectValue />
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
              </Field>
              <Field>
                <Label htmlFor="store">Loja</Label>
                <Input
                  id="store"
                  name="store"
                  placeholder="https://loja.com.br/vestido"
                  {...register('store')}
                />
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
