import { forwardRef } from 'react';

export type GlassVariant = 'surface' | 'floating' | 'elevated';
export type GlassTint    = 'mint' | 'peach' | 'lavender' | 'sky' | 'none';
export type GlassRadius  = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'none';

interface GlassPaneProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:   GlassVariant;
  tint?:      GlassTint;
  radius?:    GlassRadius;
  shadow?:    'rest' | 'float' | 'lift' | 'none';
  bevel?:     boolean;
}

const RADIUS: Record<Exclude<GlassRadius, 'none'>, string> = {
  xs: 'var(--radius-xs)',
  sm: 'var(--radius-sm)',
  md: 'var(--radius-md)',
  lg: 'var(--radius-lg)',
  xl: 'var(--radius-xl)',
};

const TINT_BG: Record<Exclude<GlassTint, 'none'>, string> = {
  mint:     'linear-gradient(140deg, var(--accent-mint)     0%, transparent 55%)',
  peach:    'linear-gradient(140deg, var(--accent-peach)    0%, transparent 55%)',
  lavender: 'linear-gradient(140deg, var(--accent-lavender) 0%, transparent 55%)',
  sky:      'linear-gradient(140deg, var(--accent-sky)      0%, transparent 55%)',
};

const SHADOW: Record<Exclude<GlassPaneProps['shadow'], undefined | 'none'>, string> = {
  rest:  'var(--shadow-rest)',
  float: 'var(--shadow-float)',
  lift:  'var(--shadow-lift)',
};

const GlassPane = forwardRef<HTMLDivElement, GlassPaneProps>(
  (
    {
      variant  = 'floating',
      tint     = 'none',
      radius   = 'md',
      shadow   = 'rest',
      bevel    = true,
      className,
      style,
      children,
      ...rest
    },
    ref,
  ) => {
    const glassClass = `glass glass-${variant}`;
    const allClasses = [glassClass, className].filter(Boolean).join(' ');

    const borderStyle: React.CSSProperties =
      bevel
        ? {
            border:         '1px solid var(--glass-border)',
            borderTopColor: 'var(--glass-border-bright)',
          }
        : {
            border: '1px solid var(--glass-border)',
          };

    const shadowStyle: React.CSSProperties =
      bevel && shadow !== 'none'
        ? { boxShadow: `var(--shadow-inset-top), ${SHADOW[shadow]}` }
        : shadow !== 'none'
        ? { boxShadow: SHADOW[shadow] }
        : {};

    const backgroundStyle: React.CSSProperties =
      tint !== 'none'
        ? {
            background: `${TINT_BG[tint]}, var(--glass-${variant})`,
          }
        : {};

    const computedStyle: React.CSSProperties = {
      borderRadius: radius !== 'none' ? RADIUS[radius] : undefined,
      ...borderStyle,
      ...shadowStyle,
      ...backgroundStyle,
      ...style,
    };

    return (
      <div ref={ref} className={allClasses} style={computedStyle} {...rest}>
        {children}
      </div>
    );
  },
);

GlassPane.displayName = 'GlassPane';
export default GlassPane;
