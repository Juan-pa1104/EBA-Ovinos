import {
  AlertTriangle,
  Check,
  ChevronDown,
  Loader2,
  RefreshCw,
  Search,
  X,
  type LucideIcon,
} from 'lucide-react';
import {
  useEffect,
  useId,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import type { Clasificacion, EstadoEvaluacion, MetodoEvaluacion, Puntaje } from '../api/types';
import {
  cn,
  ETIQUETA_CLASIFICACION,
  ETIQUETA_ESTADO,
  ETIQUETA_METODO,
  estiloClasificacion,
} from '../lib/format';

/* ------------------------------------------------------------------ */
/* Botones                                                             */
/* ------------------------------------------------------------------ */

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANTES: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-700 text-white shadow-sm hover:bg-brand-800 active:bg-brand-900 disabled:bg-brand-700/45',
  secondary:
    'bg-brand-100 text-brand-800 hover:bg-brand-200 active:bg-brand-200/80 disabled:bg-brand-100/60',
  outline:
    'border border-brand-900/15 bg-white text-brand-800 hover:border-brand-500/40 hover:bg-brand-50 disabled:text-brand-900/35',
  ghost: 'text-brand-800 hover:bg-brand-100/70 disabled:text-brand-900/30',
  danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700 active:bg-red-800 disabled:bg-red-400',
};

const TAMANOS: Record<ButtonSize, string> = {
  sm: 'h-9 gap-1.5 rounded-xl px-3 text-xs',
  md: 'h-10 gap-2 rounded-xl px-4 text-sm',
  lg: 'h-12 gap-2.5 rounded-2xl px-6 text-sm',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: LucideIcon;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icono,
  className,
  children,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        'focus-ring inline-flex items-center justify-center font-bold transition disabled:cursor-not-allowed',
        VARIANTES[variant],
        TAMANOS[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : Icono ? (
        <Icono className="h-4 w-4" />
      ) : null}
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Formularios                                                         */
/* ------------------------------------------------------------------ */

interface FieldWrapProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: (id: string) => ReactNode;
  htmlFor?: string;
}

function FieldWrap({ label, hint, error, required, children, htmlFor }: FieldWrapProps) {
  return (
    <div>
      {label && (
        <label className="field-label" htmlFor={htmlFor}>
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      {children(htmlFor ?? '')}
      {hint && !error && <p className="mt-1.5 text-xs text-brand-900/45">{hint}</p>}
      {error && <p className="mt-1.5 text-xs font-semibold text-red-600">{error}</p>}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Input({ label, hint, error, className, id, ...props }: InputProps) {
  const generado = useId();
  const inputId = id ?? generado;
  return (
    <FieldWrap label={label} hint={hint} error={error} required={props.required} htmlFor={inputId}>
      {(htmlFor) => (
        <input
          id={htmlFor}
          className={cn('input-base', error && 'border-red-300 focus:border-red-500 focus:ring-red-500/10', className)}
          {...props}
        />
      )}
    </FieldWrap>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

export function Select({ label, hint, error, className, id, children, ...props }: SelectProps) {
  const generado = useId();
  const selectId = id ?? generado;
  return (
    <FieldWrap label={label} hint={hint} error={error} required={props.required} htmlFor={selectId}>
      {(htmlFor) => (
        <div className="relative">
          <select
            id={htmlFor}
            className={cn(
              'input-base appearance-none pr-10',
              error && 'border-red-300 focus:border-red-500 focus:ring-red-500/10',
              className,
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-900/40" />
        </div>
      )}
    </FieldWrap>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Textarea({ label, hint, error, className, id, ...props }: TextareaProps) {
  const generado = useId();
  const areaId = id ?? generado;
  return (
    <FieldWrap label={label} hint={hint} error={error} required={props.required} htmlFor={areaId}>
      {(htmlFor) => (
        <textarea
          id={htmlFor}
          className={cn(
            'input-base min-h-[92px] resize-y leading-relaxed',
            error && 'border-red-300 focus:border-red-500 focus:ring-red-500/10',
            className,
          )}
          {...props}
        />
      )}
    </FieldWrap>
  );
}

export function SearchField({
  value,
  onChange,
  placeholder = 'Buscar...',
  className,
}: {
  value: string;
  onChange: (valor: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-900/35" />
      <input
        type="search"
        value={value}
        onChange={(evento) => onChange(evento.target.value)}
        placeholder={placeholder}
        className="input-base pl-10"
      />
    </div>
  );
}

export function Checkbox({
  label,
  description,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; description?: string }) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className={cn(
        'flex cursor-pointer items-start gap-3 rounded-2xl border border-brand-900/10 bg-white p-3.5 transition hover:border-brand-500/30',
        className,
      )}
    >
      <input
        id={id}
        type="checkbox"
        className="mt-0.5 h-4 w-4 rounded border-brand-900/20 text-brand-600 accent-brand-600"
        {...props}
      />
      <span>
        <span className="block text-sm font-semibold text-ink">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-brand-900/50">{description}</span>}
      </span>
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* Tarjetas y badges                                                   */
/* ------------------------------------------------------------------ */

export function Card({
  children,
  className,
  as: Etiqueta = 'div',
}: {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'article';
}) {
  return <Etiqueta className={cn('card-base', className)}>{children}</Etiqueta>;
}

type BadgeVariant = 'neutral' | 'green' | 'blue' | 'amber' | 'red' | 'earth' | 'outline';

const BADGES: Record<BadgeVariant, string> = {
  neutral: 'bg-brand-50 text-brand-700 ring-brand-600/10',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
  blue: 'bg-sky-50 text-sky-700 ring-sky-600/15',
  amber: 'bg-amber-50 text-amber-700 ring-amber-600/15',
  red: 'bg-red-50 text-red-700 ring-red-600/15',
  earth: 'bg-earth-100 text-earth-800 ring-earth-700/15',
  outline: 'bg-white text-brand-700 ring-brand-900/15',
};

export function Badge({
  children,
  variant = 'neutral',
  className,
}: {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold leading-none ring-1 ring-inset',
        BADGES[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function ClasificacionBadge({
  clasificacion,
  className,
}: {
  clasificacion: Clasificacion | null | undefined;
  className?: string;
}) {
  if (!clasificacion) {
    return (
      <Badge variant="outline" className={className}>
        Sin evaluación
      </Badge>
    );
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold leading-none ring-1 ring-inset',
        estiloClasificacion(clasificacion).badge,
        className,
      )}
    >
      {ETIQUETA_CLASIFICACION[clasificacion]}
    </span>
  );
}

export function EstadoBadge({ estado }: { estado: EstadoEvaluacion }) {
  return (
    <Badge variant={estado === 'CERRADA' ? 'green' : 'amber'}>
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          estado === 'CERRADA' ? 'bg-emerald-500' : 'bg-amber-500',
        )}
      />
      {ETIQUETA_ESTADO[estado]}
    </Badge>
  );
}

export function MetodoBadge({ metodo }: { metodo: MetodoEvaluacion }) {
  const variante: BadgeVariant =
    metodo === 'DOCUMENTAL' ? 'earth' : metodo === 'VISUAL' ? 'blue' : 'green';
  return <Badge variant={variante}>{ETIQUETA_METODO[metodo]}</Badge>;
}

export function ScorePill({ puntaje, className }: { puntaje: Puntaje | null; className?: string }) {
  const estilos: Record<Puntaje, string> = {
    0: 'bg-red-50 text-red-700 ring-red-600/15',
    20: 'bg-orange-50 text-orange-700 ring-orange-600/15',
    55: 'bg-amber-50 text-amber-700 ring-amber-600/15',
    100: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
  };
  if (puntaje === null) {
    return (
      <span className={cn('text-xs font-semibold text-brand-900/35', className)}>Sin calificar</span>
    );
  }
  return (
    <span
      className={cn(
        'inline-flex min-w-[42px] items-center justify-center rounded-lg px-2 py-1 text-xs font-extrabold ring-1 ring-inset',
        estilos[puntaje],
        className,
      )}
    >
      {puntaje}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Indicadores y estado                                                */
/* ------------------------------------------------------------------ */

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-5 w-5 animate-spin text-brand-600', className)} />;
}

export function LoadingBlock({ label = 'Cargando información...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-brand-900/[0.07] bg-white px-6 py-20 text-center shadow-soft">
      <Spinner className="h-7 w-7" />
      <p className="text-sm font-semibold text-brand-900/55">{label}</p>
    </div>
  );
}

export function LoadingScreen({ label = 'Cargando...' }: { label?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-700 text-white shadow-lift">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
        <p className="text-sm font-semibold text-brand-900/55">{label}</p>
      </div>
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-red-100 bg-white px-6 py-14 text-center shadow-soft">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <div>
        <h3 className="font-display text-lg font-semibold text-ink">No pudimos cargar la información</h3>
        <p className="mt-1 max-w-md text-sm text-brand-900/55">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" icon={RefreshCw} onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  );
}

export function EmptyState({
  icon: Icono,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-brand-900/15 bg-white/60 px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        <Icono className="h-6 w-6" />
      </div>
      <div>
        <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
        {description && <p className="mx-auto mt-1 max-w-md text-sm text-brand-900/50">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function ProgressBar({
  value,
  color = '#348d58',
  className,
  showLabel = false,
}: {
  value: number;
  color?: string;
  className?: string;
  showLabel?: boolean;
}) {
  const porcentaje = Math.max(0, Math.min(100, value));
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-brand-900/[0.07]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${porcentaje}%`, backgroundColor: color }}
        />
      </div>
      {showLabel && (
        <span className="w-10 text-right text-[11px] font-bold tabular-nums text-brand-900/50">
          {Math.round(porcentaje)}%
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Encabezados y métricas                                              */
/* ------------------------------------------------------------------ */

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-600">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {title}
        </h1>
        {subtitle && <p className="mt-1.5 max-w-2xl text-sm text-brand-900/55">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

const TONOS_STAT: Record<string, string> = {
  green: 'bg-brand-50 text-brand-700',
  blue: 'bg-sky-50 text-sky-700',
  amber: 'bg-amber-50 text-amber-700',
  earth: 'bg-earth-100 text-earth-700',
  red: 'bg-red-50 text-red-700',
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icono,
  tone = 'green',
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: keyof typeof TONOS_STAT;
}) {
  return (
    <div className="card-base flex items-start gap-4 p-4 sm:p-5">
      <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl', TONOS_STAT[tone])}>
        <Icono className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-900/45">{label}</p>
        <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-ink">{value}</p>
        {hint && <p className="mt-0.5 truncate text-xs text-brand-900/45">{hint}</p>}
      </div>
    </div>
  );
}

export function Avatar({ nombre, className }: { nombre: string; className?: string }) {
  const letras = nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join('');
  return (
    <div
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-700 text-xs font-extrabold text-white',
        className,
      )}
    >
      {letras}
    </div>
  );
}

export function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className="text-xs font-semibold text-brand-900/45">{label}</dt>
      <dd className="text-right text-sm font-semibold text-ink">{value}</dd>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Modal y confirmación                                                */
/* ------------------------------------------------------------------ */

const TAMANOS_MODAL = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: keyof typeof TAMANOS_MODAL;
}) {
  useEffect(() => {
    if (!open) return;
    const manejarTecla = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', manejarTecla);
    const overflowOriginal = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', manejarTecla);
      document.body.style.overflow = overflowOriginal;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-brand-950/40 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        className={cn(
          'flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl border border-white/60 bg-white shadow-lift animate-fade-in sm:rounded-3xl',
          TAMANOS_MODAL[size],
        )}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-start justify-between gap-4 border-b border-brand-900/[0.07] px-5 py-4 sm:px-6">
          <div>
            <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
            {description && <p className="mt-1 text-sm text-brand-900/50">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-brand-900/40 transition hover:bg-brand-50 hover:text-brand-900"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer && (
          <div className="flex flex-col-reverse gap-2 border-t border-brand-900/[0.07] bg-brand-50/40 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  loading = false,
  danger = false,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  danger?: boolean;
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
            icon={danger ? AlertTriangle : Check}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-brand-900/65">{description}</p>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Selector de puntaje                                                 */
/* ------------------------------------------------------------------ */

const OPCIONES_PUNTAJE: Array<{
  valor: Puntaje;
  etiqueta: string;
  seleccionado: string;
  base: string;
}> = [
  {
    valor: 0,
    etiqueta: 'Crítico',
    seleccionado: 'border-red-600 bg-red-600 text-white shadow-sm',
    base: 'border-red-200 text-red-700 hover:bg-red-50',
  },
  {
    valor: 20,
    etiqueta: 'Bajo',
    seleccionado: 'border-orange-500 bg-orange-500 text-white shadow-sm',
    base: 'border-orange-200 text-orange-700 hover:bg-orange-50',
  },
  {
    valor: 55,
    etiqueta: 'Aceptable',
    seleccionado: 'border-amber-500 bg-amber-500 text-white shadow-sm',
    base: 'border-amber-200 text-amber-700 hover:bg-amber-50',
  },
  {
    valor: 100,
    etiqueta: 'Óptimo',
    seleccionado: 'border-emerald-600 bg-emerald-600 text-white shadow-sm',
    base: 'border-emerald-200 text-emerald-700 hover:bg-emerald-50',
  },
];

export function ScoreSelector({
  value,
  onChange,
  disabled = false,
}: {
  value: Puntaje | null;
  onChange: (puntaje: Puntaje) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-4 gap-2" role="group" aria-label="Seleccionar puntaje">
      {OPCIONES_PUNTAJE.map((opcion) => {
        const activo = value === opcion.valor;
        return (
          <button
            key={opcion.valor}
            type="button"
            disabled={disabled}
            aria-pressed={activo}
            onClick={() => onChange(opcion.valor)}
            className={cn(
              'focus-ring flex flex-col items-center justify-center rounded-xl border px-2 py-2.5 transition disabled:cursor-not-allowed disabled:opacity-60',
              activo ? opcion.seleccionado : cn('bg-white', opcion.base),
            )}
          >
            <span className="text-base font-extrabold leading-none tabular-nums">{opcion.valor}</span>
            <span className={cn('mt-1 text-[10px] font-bold leading-none', activo ? 'opacity-80' : 'opacity-70')}>
              {opcion.etiqueta}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function SectionTitle({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-brand-900/50">{description}</p>}
      </div>
      {actions}
    </div>
  );
}
