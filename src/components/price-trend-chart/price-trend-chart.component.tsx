import { useId } from 'react';
import { cn } from '@/lib/utils';

const WIDTH = 240;
const HEIGHT = 80;
const PAD_Y = 14;
const PAD_X = 4;

// Só temos dois pontos reais de preço (original e atual), então desenhamos
// uma curva suave entre eles em vez de uma linha reta — fica mais perto da
// linguagem visual de um gráfico de tendência sem fingir ter mais dados do
// que realmente temos.
export default function PriceTrendChart({
  from,
  to,
  className,
}: {
  from: number;
  to: number;
  className?: string;
}) {
  const gradientId = useId();
  const min = Math.min(from, to);
  const max = Math.max(from, to);
  const range = max - min || 1;
  const scaleY = (value: number) =>
    HEIGHT - PAD_Y - ((value - min) / range) * (HEIGHT - PAD_Y * 2);

  const x1 = PAD_X;
  const x2 = WIDTH - PAD_X;
  const y1 = scaleY(from);
  const y2 = scaleY(to);
  const cx = (x1 + x2) / 2;

  const linePath = `M${x1},${y1} C${cx},${y1} ${cx},${y2} ${x2},${y2}`;
  const areaPath = `${linePath} L${x2},${HEIGHT} L${x1},${HEIGHT} Z`;

  const trend = to < from ? 'down' : to > from ? 'up' : 'flat';
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
