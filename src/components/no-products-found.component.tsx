import { IconHanger } from '@tabler/icons-react';

export default function NoProductsFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 w-full h-100 rounded-xl border-2 border-dashed border-border bg-muted/30 text-center px-6">
      <IconHanger className="text-muted-foreground" size={40} stroke={1.5} />
      <p className="text-lg font-semibold">A arara está vazia</p>
      <p className="max-w-sm text-muted-foreground">
        Viu uma peça que amou? É só clicar em Adicionar Produto
      </p>
    </div>
  );
}
