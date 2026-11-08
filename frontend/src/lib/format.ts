import type { Clasificacion, EstadoEvaluacion, MetodoEvaluacion } from '../api/types';

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export function formatFecha(fecha: string | null | undefined): string {
  if (!fecha) return '—';
  const normalizada = fecha.length <= 10 ? `${fecha}T12:00:00` : fecha.replace(' ', 'T');
  const date = new Date(normalizada);
  if (Number.isNaN(date.getTime())) return fecha;
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatFechaHora(fecha: string | null | undefined): string {
  if (!fecha) return '—';
  const date = new Date(fecha.replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return fecha;
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function hoyISO(): string {
  const ahora = new Date();
  const local = new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

export function porcentajePeso(peso: number): string {
  return `${Math.round(peso * 100)} %`;
}

export function iniciales(nombre: string): string {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? '')
    .join('');
}

export const ETIQUETA_ESPECIE: Record<string, string> = {
  OVINO: 'Ovino',
  CAPRINO: 'Caprino',
};

export const ETIQUETA_SISTEMA: Record<string, string> = {
  EXTENSIVO: 'Extensivo',
  SEMI_INTENSIVO: 'Semi intensivo',
  INTENSIVO: 'Intensivo',
  FAMILIAR: 'Familiar',
};

export const ETIQUETA_METODO: Record<MetodoEvaluacion, string> = {
  DOCUMENTAL: 'Documental',
  VISUAL: 'Visual',
  VISUAL_MUESTREO: 'Visual con muestreo',
};

export const ETIQUETA_ESTADO: Record<EstadoEvaluacion, string> = {
  BORRADOR: 'Borrador',
  CERRADA: 'Cerrada',
};

export const ETIQUETA_CLASIFICACION: Record<Clasificacion, string> = {
  'EXCELENTE BIENESTAR': 'Excelente bienestar',
  ALTO: 'Alto',
  MEDIO: 'Medio',
  BAJO: 'Bajo',
};

export function estiloClasificacion(clasificacion: Clasificacion | null | undefined): {
  badge: string;
  text: string;
  bg: string;
  border: string;
  hex: string;
} {
  switch (clasificacion) {
    case 'EXCELENTE BIENESTAR':
      return {
        badge: 'bg-emerald-100 text-emerald-800 ring-emerald-600/15',
        text: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        hex: '#1f7a4d',
      };
    case 'ALTO':
      return {
        badge: 'bg-sky-100 text-sky-800 ring-sky-600/15',
        text: 'text-sky-700',
        bg: 'bg-sky-50',
        border: 'border-sky-200',
        hex: '#2563a8',
      };
    case 'MEDIO':
      return {
        badge: 'bg-amber-100 text-amber-800 ring-amber-600/15',
        text: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        hex: '#b7791f',
      };
    case 'BAJO':
      return {
        badge: 'bg-red-100 text-red-800 ring-red-600/15',
        text: 'text-red-700',
        bg: 'bg-red-50',
        border: 'border-red-200',
        hex: '#b23b3b',
      };
    default:
      return {
        badge: 'bg-brand-50 text-brand-700 ring-brand-600/10',
        text: 'text-brand-700',
        bg: 'bg-brand-50',
        border: 'border-brand-200',
        hex: '#66756b',
      };
  }
}

export function colorPuntaje(puntaje: number | null): string {
  if (puntaje === null) return '#b8c4bc';
  if (puntaje >= 90) return '#1f7a4d';
  if (puntaje >= 75) return '#2563a8';
  if (puntaje >= 50) return '#b7791f';
  return '#b23b3b';
}
