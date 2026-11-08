import type { Indicador, Predio, SistemaProductivo } from '../api/types';

const CAMPO_APLICABILIDAD: Record<
  SistemaProductivo,
  'aplica_extensivo' | 'aplica_semi_intensivo' | 'aplica_intensivo' | 'aplica_familiar'
> = {
  EXTENSIVO: 'aplica_extensivo',
  SEMI_INTENSIVO: 'aplica_semi_intensivo',
  INTENSIVO: 'aplica_intensivo',
  FAMILIAR: 'aplica_familiar',
};

function esVerdadero(valor: boolean | number): boolean {
  return valor === true || valor === 1;
}

/**
 * Vista previa en el cliente de la misma regla de aplicabilidad del backend.
 * La selección definitiva siempre la realiza el servidor al crear la evaluación.
 */
export function indicadorAplicaA(
  indicador: Indicador,
  predio: Pick<Predio, 'especie' | 'sistema_productivo' | 'es_ovino_de_lana'>,
): boolean {
  if (!esVerdadero(indicador[CAMPO_APLICABILIDAD[predio.sistema_productivo]])) return false;
  if (indicador.solo_especie && indicador.solo_especie !== predio.especie) return false;
  if (esVerdadero(indicador.solo_ovino_lana)) {
    const esOvinoDeLana = predio.especie === 'OVINO' && esVerdadero(predio.es_ovino_de_lana);
    if (!esOvinoDeLana) return false;
  }
  return true;
}

export function filtrarIndicadoresAplicables(
  indicadores: Indicador[],
  predio: Pick<Predio, 'especie' | 'sistema_productivo' | 'es_ovino_de_lana'>,
): Indicador[] {
  return indicadores
    .filter((indicador) => indicadorAplicaA(indicador, predio))
    .sort((a, b) => a.numero - b.numero);
}
