import { useId } from 'react';
import { cn } from '@/lib/utils';
import type { PricePoint } from '@/types';

const WIDTH = 240;
const HEIGHT = 80;
const PAD_Y = 14;
const PAD_X = 4;

// Com histórico real (2+ pontos) desenha o preço ao longo do tempo, em
// degraus (o preço fica fixo até mudar). Sem histórico, só temos dois pontos
// (original e atual): desenha uma curva suave entre eles, sem fingir ter
// mais dados do que realmente temos.
export default function PriceTrendChart({
  from,
  to,
  history,
  className,
}: {
  from: number;
  to: number;
  history?: PricePoint[];
  className?: string;
}) {
  const gradientId = useId();
  const real = history && history.length >= 2 ? history : null;

  const values = real ? real.map((point) => point.price) : [from, to];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const scaleY = (value: number) =>
    HEIGHT - PAD_Y - ((value - min) / range) * (HEIGHT - PAD_Y * 2);

  const x1 = PAD_X;
  const x2 = WIDTH - PAD_X;
  let linePath: string;
  let y2: number;
  let trend: 'down' | 'up' | 'flat';

  if (real) {
    const t0 = real[0].at;
    const span = real[real.length - 1].at - t0 || 1;
    const xs = real.map((point) => x1 + ((point.at - t0) / span) * (x2 - x1));
    linePath = real
      .map((point, i) =>
        i === 0
          ? `M${xs[i]},${scaleY(point.price)}`
          : `L${xs[i]},${scaleY(real[i - 1].price)} L${xs[i]},${scaleY(point.price)}`,
      )
      .join(' ');
    y2 = scaleY(real[real.length - 1].price);
    const first = real[0].price;
    const last = real[real.length - 1].price;
    trend = last < first ? 'down' : last > first ? 'up' : 'flat';
  } else {
    const y1 = scaleY(from);
    y2 = scaleY(to);
    const cx = (x1 + x2) / 2;
    linePath = `M${x1},${y1} C${cx},${y1} ${cx},${y2} ${x2},${y2}`;
    trend = to < from ? 'down' : to > from ? 'up' : 'flat';
  }
  const areaPath = `${linePath} L${x2},${HEIGHT} L${x1},${HEIGHT} Z`;

  const strokeColor =
    trend === 'down'
      ? 'var(--success)'
      : trend === 'up'
        ? 'var(--destructive)'
        : 'var(--muted-foreground)';

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="none"
      className={cn('h-20 w-full', className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.2" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path
        d={linePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx={x2} cy={y2} r="4" fill={strokeColor} />
      <circle cx={x2} cy={y2} r="8" fill={strokeColor} opacity="0.18" />
    </svg>
  );
}
