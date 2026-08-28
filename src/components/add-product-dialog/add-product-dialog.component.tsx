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

import {
  Controller,
  useForm,
  useWatch,
  type SubmitHandler,
} from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import type { Category, Product } from '@/types';
import { createProduct, getProduct, updateProduct } from '@/firebase/firebase';
import { useEffect, useState } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { IconPlus } from '@tabler/icons-react';
import LinkField from '../link-field/link-field.component';

const NEW_CATEGORY_VALUE = '__new_category__';

function formatCentsToPtBr(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function AddProductDialog({
  categories,
  onAddCategory,
  open,
  setOpen,
  id,
  setId,
  updateProducts,
  product,
  setProduct,
  selectedCategory,
}: {
  categories: string[];
  onAddCategory: (name: string) => Promise<Category>;
  open: boolean;
  setOpen: (open: boolean) => void;
  id: string | null;
  setId: (id: string | null) => void;
  updateProducts: () => Promise<void>;
  product?: Product;
  setProduct?: (product: Product | undefined) => void;
  selectedCategory?: string;
}) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [priceDisplay, setPriceDisplay] = useState<string>('0,00');
  const [isAddingCategory, setIsAddingCategory] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [isSavingCategory, setIsSavingCategory] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    getValues,
    setValue,
  } = useForm<Product>();

  const imageUrl = useWatch({ control, name: 'url' });

  const onSubmit: SubmitHandler<Product> = async (data) => {
    const category = data.category.trim();
    const categoryExists = categories.some(
      (item) => item.toLowerCase() === category.toLowerCase(),
    );
    if (!categoryExists) {
      await onAddCategory(category);
    }

    const product: Product = {
      ...data,
      category,
      price: Number(data.price),
      bought: false,
    };
    try {
      if (id) {
        await updateProduct(id, product);
      } else {
        await createProduct(product);
      }
      resetFields(false);
      await updateProducts();
      toast.success(id ? 'Produto atualizado' : 'Produto adicionado');
    } catch (error) {
      console.error(error);
      toast.error(
        id ? 'Não consegui atualizar o produto' : 'Não consegui adicionar o produto',
        { description: product.name },
      );
    }
  };

  const handleCreateCategory = async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;

    setIsSavingCategory(true);
    const existing = categories.find(
      (item) => item.toLowerCase() === trimmed.toLowerCase(),
    );
    if (!existing) {
      await onAddCategory(trimmed);
    }
    setIsSavingCategory(false);
    setIsAddingCategory(false);
    setNewCategoryName('');
    setValue('category', existing ?? trimmed, { shouldValidate: true });
  };

  const cancelCreateCategory = () => {
    setIsAddingCategory(false);
    setNewCategoryName('');
  };

  const resetFields = (open: boolean) => {
    setOpen(open);
    if (!open) {
      setId(null);
      setProduct?.(undefined);
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
      if (product) {
        setFieldsDefaultValues(product);
      } else if (id) {
        setIsLoading(true);
        const response = await getProduct(id);
        if (response) {
          setFieldsDefaultValues(response);
        }
      } else if (selectedCategory && selectedCategory !== 'Tudo') {
        setValue('category', selectedCategory);
      }
      setIsLoading(false);
    }
    fetchProduct();
  }, [id, product]);

  return (
    <Dialog open={open} onOpenChange={resetFields}>
      <DialogContent className="sm:max-w-sm">
        {isLoading ? (
          <div className="flex items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Nova peça</DialogTitle>
              <DialogDescription className="mb-4">
                Cole o link, clique em Adicionar e aguarde: buscamos as
                informações do produto automaticamente.
              </DialogDescription>
            </DialogHeader>
            <FieldGroup className="mb-8">
              <LinkField
                register={register}
                errors={errors}
                getValues={getValues}
                setIsLoading={setIsLoading}
                placeholder="https://loja.com.br/vestido..."
                onProductFetched={(product) => {
                  setValue('name', product.name);
                  setValue('price', product.price);
                  setPriceDisplay(
                    formatCentsToPtBr(Math.round(product.price * 100)),
                  );
                  setValue('category', product.category);
                  setValue('store', product.store);
                  setValue('url', product.url);
                }}
                displayLabel={true}
              />
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
                {isAddingCategory ? (
                  <div className="flex gap-2">
                    <Input
                      autoFocus
                      placeholder="Nome da nova categoria"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleCreateCategory();
                        }
                        if (e.key === 'Escape') {
                          cancelCreateCategory();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      disabled={isSavingCategory || !newCategoryName.trim()}
                      onClick={handleCreateCategory}
                    >
                      {isSavingCategory ? <Spinner /> : 'Adicionar'}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={cancelCreateCategory}
                    >
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <Controller
                    name="category"
                    control={control}
                    rules={{ required: 'Categoria é obrigatória' }}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          if (value === NEW_CATEGORY_VALUE) {
                            setIsAddingCategory(true);
                            return;
                          }
                          field.onChange(value);
                        }}
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
                          <SelectSeparator />
                          <SelectGroup>
                            <SelectItem value={NEW_CATEGORY_VALUE}>
                              <IconPlus className="size-4" />
                              Adicionar categoria
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                )}
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
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt="Pré-visualização da imagem"
                    className="mt-2 h-40 w-full rounded-md object-cover"
                  />
                )}
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
