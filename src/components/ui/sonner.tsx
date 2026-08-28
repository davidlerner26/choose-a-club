import type { CSSProperties } from 'react';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="system"
      className="toaster group"
      richColors
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--error-bg': '#dc2626',
          '--error-text': '#ffffff',
          '--error-border': '#dc2626',
        } as CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
