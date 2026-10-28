import { useState } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

// Imagem de produto com estado de loading: mostra um placeholder pulsando
// com spinner até a imagem carregar (ou falhar). O pai define o tamanho.
export default function ProductImage({
  url,
  alt = '',
  className,
}: {
  url: string;
  alt?: string;
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={cn('relative overflow-hidden bg-muted', className)}>
      {!loaded && (
        <div className="absolute inset-0 flex animate-pulse items-center justify-center bg-muted">
          <Spinner className="size-6 text-muted-foreground" />
        </div>
      )}
      <img
        // ref callback cobre imagem em cache que já terminou antes do onLoad
        ref={(el) => {
          if (el?.complete) setLoaded(true);
        }}
        src={url}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={cn(
          'size-full object-contain transition-opacity duration-300',
          loaded ? 'opacity-100' : 'opacity-0',
        )}
      />
    </div>
  );
}
