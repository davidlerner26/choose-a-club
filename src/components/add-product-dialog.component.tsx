'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import type { Product } from '../types';

type IFormInput = {
  link: string;
  name: string;
  price: number;
  category: string;
  store: string;
};

type AddProductDialogProps = {
  categories: string[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
};

export default function AddProductDialog({
  categories,
  setProducts,
}: AddProductDialogProps) {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit } = useForm<IFormInput>();
  const onSubmit: SubmitHandler<IFormInput> = (data) => {
    setProducts((products) => [
      ...products,
      { ...data, id: crypto.randomUUID(), price: Number(data.price) },
    ]);
  };

  return (
    <main>
      <button
        onClick={() => setOpen(true)}
        className="rounded-md bg-gray-950/5 px-2.5 py-1.5 text-sm font-semibold text-gray-900 hover:bg-gray-950/10"
      >
        + Colar link
      </button>
      <Dialog open={open} onClose={setOpen} className="relative z-10">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
            >
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <DialogTitle
                        as="h3"
                        className="text-base font-semibold text-gray-900"
                      >
                        Nova peça
                      </DialogTitle>
                      <div className="mb-2">
                        <p className="text-sm text-gray-500">
                          Cole o link e aguarde — o app busca nome, preço e foto
                          sozinho.
                        </p>
                      </div>
                      <div>
                        <label
                          htmlFor="link"
                          className="block text-sm/6 font-medium text-gray-900"
                        >
                          Link da loja
                        </label>
                        <div>
                          <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
                            <input
                              id="link"
                              type="text"
                              placeholder="https://loja.com.br/vestido"
                              className="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                              {...register('link')}
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm/6 font-medium text-gray-900"
                        >
                          Nome da peça
                        </label>
                        <div>
                          <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
                            <input
                              id="name"
                              type="text"
                              placeholder="Vestido midi de linho"
                              className="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                              {...register('name')}
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label
                          htmlFor="price"
                          className="block text-sm/6 font-medium text-gray-900"
                        >
                          Preço (R$)
                        </label>
                        <div>
                          <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
                            <input
                              id="price"
                              type="number"
                              placeholder="189,90"
                              className="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                              {...register('price')}
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label
                          htmlFor="category"
                          className="block text-sm/6 font-medium text-gray-900"
                        >
                          Categoria
                        </label>
                        <div>
                          <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
                            <select
                              id="category"
                              className="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                              {...register('category')}
                            >
                              {categories.map((category: string) => (
                                <option key={category} value={category}>
                                  {category}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label
                          htmlFor="store"
                          className="block text-sm/6 font-medium text-gray-900"
                        >
                          Loja
                        </label>
                        <div>
                          <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
                            <input
                              id="store"
                              type="text"
                              placeholder="https://loja.com.br/vestido"
                              className="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                              {...register('store')}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="submit"
                    onClick={() => setOpen(false)}
                    className="inline-flex w-full justify-center rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-red-500 sm:ml-3 sm:w-auto"
                  >
                    Adicionar à wishlist
                  </button>
                  <button
                    type="button"
                    data-autofocus
                    onClick={() => setOpen(false)}
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </main>
  );
}
