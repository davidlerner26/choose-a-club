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
import { useTranslation } from 'react-i18next';
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
import { useLocale } from '@/hooks/use-locale';
import { CURRENCY_SYMBOLS, type Currency } from '@/i18n/locales';
import { ALL_CATEGORIES } from '@/lib/constants';
import LinkField from '../link-field/link-field.component';

const NEW_CATEGORY_VALUE = '__new_category__';

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
  const { t } = useTranslation();
  const { formatPrice, currency: localeCurrency } = useLocale();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [priceDisplay, setPriceDisplay] = useState<string>(formatPrice(0));
  // moeda em que o preço deste formulário está sendo digitado: ao editar,
  // segue a moeda já salva do produto; ao criar do zero, usa a do locale
  // atual; quando o link é colado e a API busca o preço, é sempre BRL (a
  // loja informa o preço em reais).
  const [formCurrency, setFormCurrency] = useState<Currency>(localeCurrency);
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
      currency: formCurrency,
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
      toast.success(
        id ? t('addProductDialog.toasts.updated') : t('addProductDialog.toasts.added'),
      );
    } catch (error) {
      console.error(error);
      toast.error(
        id
          ? t('addProductDialog.toasts.updateError')
          : t('addProductDialog.toasts.addError'),
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
      setPriceDisplay(formatPrice(0));
      setFormCurrency(localeCurrency);
    }
  };

  const setFieldsDefaultValues = (product: Product) => {
    const { link, name, price, category, store, url, currency } = product;
    reset({
      link: link || '',
      name: name || '',
      price: price || 0,
      category: category || '',
      store: store || '',
      url: url || '',
    });
    setPriceDisplay(formatPrice(Math.round((price || 0) * 100)));
    setFormCurrency(currency ?? 'BRL');
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
      } else if (selectedCategory && selectedCategory !== ALL_CATEGORIES) {
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
              <DialogTitle>{t('addProductDialog.title')}</DialogTitle>
              <DialogDescription className="mb-4">
                {t('addProductDialog.description')}
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
                  setPriceDisplay(formatPrice(Math.round(product.price * 100)));
                  setFormCurrency('BRL');
                  setValue('category', product.category);
                  setValue('store', product.store);
                  setValue('url', product.url);
                }}
                displayLabel={true}
              />
              <Field>
                <Label htmlFor="name">{t('addProductDialog.nameLabel')}</Label>
                <Input
                  id="name"
                  placeholder={t('addProductDialog.namePlaceholder')}
                  {...register('name', {
                    required: t('addProductDialog.nameRequired'),
                  })}
                />
                <FieldError>{errors.name?.message}</FieldError>
              </Field>
              <Field>
                <Label htmlFor="price">
                  {t('addProductDialog.priceLabel', {
                    symbol: CURRENCY_SYMBOLS[formCurrency],
                  })}
                </Label>
                <Controller
                  name="price"
                  control={control}
                  rules={{
                    validate: (value) =>
                      Number(value) > 0 || t('addProductDialog.priceRequired'),
                  }}
                  render={({ field }) => (
                    <Input
                      id="price"
                      inputMode="numeric"
                      placeholder={formatPrice(0)}
                      value={priceDisplay}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '');
                        const cents = digits ? parseInt(digits, 10) : 0;
                        setPriceDisplay(formatPrice(cents));
                        field.onChange(cents / 100);
                      }}
                      onBlur={field.onBlur}
                    />
                  )}
                />
                <FieldError>{errors.price?.message}</FieldError>
              </Field>
              <Field>
                <FieldLabel>{t('addProductDialog.categoryLabel')}</FieldLabel>
                {isAddingCategory ? (
                  <div className="flex gap-2">
                    <Input
                      autoFocus
                      placeholder={t('addProductDialog.newCategoryPlaceholder')}
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
                      {isSavingCategory ? <Spinner /> : t('common.add')}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={cancelCreateCategory}
                    >
                      {t('common.cancel')}
                    </Button>
                  </div>
                ) : (
                  <Controller
                    name="category"
                    control={control}
                    rules={{ required: t('addProductDialog.categoryRequired') }}
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
                          <SelectValue
                            placeholder={t(
                              'addProductDialog.chooseCategoryPlaceholder',
                            )}
                          />
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
                              {t('addProductDialog.addCategory')}
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
                <Label htmlFor="store">{t('addProductDialog.storeLabel')}</Label>
                <Input
                  id="store"
                  {...register('store', {
                    required: t('addProductDialog.storeRequired'),
                  })}
                />
                <FieldError>{errors.store?.message}</FieldError>
              </Field>
              {/* <Field>
                <FieldLabel htmlFor="picture">Foto da peça</FieldLabel>
                <Input id="picture" type="file" />
              </Field> */}
              <Field>
                <Label htmlFor="url">{t('addProductDialog.imageUrlLabel')}</Label>
                <Input
                  id="url"
                  placeholder={t('addProductDialog.imageUrlPlaceholder')}
                  {...register('url', {
                    required: t('addProductDialog.imageUrlRequired'),
                  })}
                />
                <FieldError>{errors.url?.message}</FieldError>
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt={t('addProductDialog.imagePreviewAlt')}
                    className="mt-2 h-40 w-full rounded-md object-cover"
                  />
                )}
              </Field>
            </FieldGroup>
            <DialogFooter>
              <DialogClose
                render={<Button variant="outline">{t('common.cancel')}</Button>}
              />
              <Button type="submit">{t('addProductDialog.submit')}</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
