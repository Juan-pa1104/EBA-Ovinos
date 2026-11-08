export type Rol = 'ADMIN' | 'EVALUADOR' | 'RESPONSABLE';
export type Especie = 'OVINO' | 'CAPRINO';
export type SistemaProductivo = 'EXTENSIVO' | 'SEMI_INTENSIVO' | 'INTENSIVO' | 'FAMILIAR';
export type MetodoEvaluacion = 'DOCUMENTAL' | 'VISUAL' | 'VISUAL_MUESTREO';
export type EstadoEvaluacion = 'BORRADOR' | 'CERRADA';
export type Puntaje = 0 | 20 | 55 | 100;
export type Clasificacion = 'EXCELENTE BIENESTAR' | 'ALTO' | 'MEDIO' | 'BAJO';
export type TipoPredioCriterio = 'PRODUCTIVO' | 'FAMILIAR';

export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: Rol;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token: string;
  usuario: Usuario;
}

export interface Predio {
  id: number;
  nombre: string;
  municipio: string;
  direccion: string | null;
  especie: Especie;
  sistema_productivo: SistemaProductivo;
  es_ovino_de_lana: boolean;
  numero_animales: number;
  responsable_id: number | null;
  creado_por: number | null;
  created_at: string;
  updated_at: string;
}

export interface PredioConResumen extends Predio {
  responsable_nombre: string | null;
  ultima_clasificacion: Clasificacion | null;
  ultima_fecha: string | null;
  total_evaluaciones: number;
  borradores: number;
}

export interface Libertad {
  id: number;
  nombre: string;
  peso: number;
}

export interface CriterioIndicador {
  indicador_id: number;
  tipo_predio: TipoPredioCriterio;
  seccion: string;
  criterio_100: string;
  criterio_55: string;
  criterio_20: string;
  criterio_0: string;
}

export interface Indicador {
  id: number;
  numero: number;
  libertad_id: number;
  nombre: string;
  descripcion: string | null;
  metodo_evaluacion: MetodoEvaluacion;
  aplica_extensivo: boolean;
  aplica_semi_intensivo: boolean;
  aplica_intensivo: boolean;
  aplica_familiar: boolean;
  solo_especie: Especie | null;
  solo_ovino_lana: boolean;
  criterio_100: string | null;
  criterio_55: string | null;
  criterio_20: string | null;
  criterio_0: string | null;
  criterios: CriterioIndicador[];
  libertad_nombre: string;
  libertad_peso: number;
}

export interface EvaluacionListado {
  id: number;
  predio_id: number;
  evaluador_id: number;
  fecha: string;
  estado: EstadoEvaluacion;
  puntaje_total: number | null;
  clasificacion: Clasificacion | null;
  observaciones: string | null;
  cerrada_en: string | null;
  created_at: string;
  updated_at: string;
  predio_nombre: string;
  predio_especie: Especie;
  predio_sistema_productivo: SistemaProductivo;
  evaluador_nombre: string;
}

export interface ItemEvaluacion {
  id: number;
  indicador_id: number;
  numero: number;
  nombre: string;
  descripcion: string | null;
  metodo_evaluacion: MetodoEvaluacion;
  libertad_id: number;
  libertad_nombre: string;
  libertad_peso: number;
  seccion: string | null;
  criterio_100: string | null;
  criterio_55: string | null;
  criterio_20: string | null;
  criterio_0: string | null;
  puntaje: Puntaje | null;
  observacion: string | null;
}

export interface PlanMejoraItem {
  indicador_id: number;
  numero: number;
  nombre: string;
  libertad_id: number;
  libertad_nombre: string;
  libertad_peso: number;
  seccion: string | null;
  puntaje: Puntaje;
  criterio_actual: string | null;
  criterio_100: string | null;
  observacion: string | null;
}

export interface RecomendacionIA {
  evaluacion_id: number;
  contenido: string;
  modelo: string;
  created_at: string;
  updated_at: string;
}

export interface RecomendacionResponse {
  recomendacion: RecomendacionIA | null;
}

export interface ResumenLibertad {
  libertad_id: number;
  libertad_nombre: string;
  peso: number;
  puntaje: number | null;
  calificados: number;
  total: number;
}

export interface ResumenEvaluacion {
  libertades: ResumenLibertad[];
  puntaje_total: number | null;
  clasificacion: Clasificacion | null;
  calificados: number;
  total: number;
  completo: boolean;
}

export interface EvaluacionDetalle {
  id: number;
  predio_id: number;
  evaluador_id: number;
  fecha: string;
  estado: EstadoEvaluacion;
  puntaje_total: number | null;
  clasificacion: Clasificacion | null;
  observaciones: string | null;
  cerrada_en: string | null;
  created_at: string;
  updated_at: string;
  predio: PredioConResumen;
  evaluador: { id: number; nombre: string; correo: string };
  items: ItemEvaluacion[];
  resumen: ResumenEvaluacion;
  plan_mejora: PlanMejoraItem[];
}

export interface DashboardData {
  rol: Rol;
  metricas: Record<string, number>;
  distribucion: Record<string, number>;
  ultimas_evaluaciones: EvaluacionListado[];
  predios: PredioConResumen[];
}

export interface HistorialLibertad {
  libertad_id: number;
  libertad_nombre: string;
  peso: number;
  puntaje: number;
}

export interface HistorialEvaluacion {
  id: number;
  fecha: string;
  puntaje_total: number | null;
  clasificacion: Clasificacion | null;
  libertades: HistorialLibertad[];
}

export interface HistorialResponse {
  predio: PredioConResumen;
  evaluaciones: HistorialEvaluacion[];
}

export interface HistorialGlobalEvaluacion extends HistorialEvaluacion {
  predio_id: number;
  predio_nombre: string;
  predio_municipio: string;
  predio_especie: Especie;
  predio_sistema_productivo: SistemaProductivo;
  evaluador_id: number;
  evaluador_nombre: string;
  cerrada_en: string | null;
}

export interface HistorialGlobalResponse {
  evaluaciones: HistorialGlobalEvaluacion[];
}

export interface ResponsableOption {
  id: number;
  nombre: string;
  correo: string;
}
