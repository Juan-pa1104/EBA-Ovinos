/**
 * Simulación del servicio de recomendaciones con IA.
 * En producción esto debería llamarse a un modelo real (LLM) o servicio externo.
 */
export function generarRecomendacionIA(evaluacion) {
  const { predio, resumen, clasificacion, puntaje_total, observaciones } = evaluacion;

  const planMejora = evaluacion.plan_mejora || resumen?.plan_mejora || [];
  const criticos = planMejora.filter((i) => i.puntaje === 0 || i.puntaje === 20);
  const medios = planMejora.filter((i) => i.puntaje === 55);

  const partes = [];

  partes.push(
    `Recomendación generada por el modelo EBA-IA para la evaluación #${evaluacion.id} del predio "${predio.nombre}" (${predio.municipio}).`
  );
  partes.push(
    `Especie: ${predio.especie} · Sistema productivo: ${predio.sistema_productivo} · Puntaje total: ${puntaje_total?.toFixed(1) ?? 'N/A'} / 100 · Clasificación: ${clasificacion ?? 'Sin clasificar'}.`
  );

  if (criticos.length > 0) {
    partes.push(
      `Se detectaron ${criticos.length} indicador(es) crítico(s) con puntaje 0 o 20. Priorizar acciones correctivas inmediatas en: ${criticos.map((i) => i.nombre).join(', ')}.`
    );
  }

  if (medios.length > 0) {
    partes.push(
      `Existen ${medios.length} indicador(es) en nivel medio (55 puntos) que pueden mejorarse: ${medios.map((i) => i.nombre).join(', ')}.`
    );
  }

  const libertadMasBaja = resumen.libertades
    .filter((l) => l.puntaje !== null)
    .sort((a, b) => a.puntaje - b.puntaje)[0];

  if (libertadMasBaja) {
    partes.push(
      `La libertad con menor puntaje es "${libertadMasBaja.libertad_nombre}" (${libertadMasBaja.puntaje?.toFixed(1) ?? 'N/A'}). Revisar prácticas asociadas a esta dimensión.`
    );
  }

  if (observaciones) {
    partes.push(`Observaciones del evaluador: "${observaciones}".`);
  }

  partes.push(
    'Esta recomendación es una orientación automática y no reemplaza el concepto técnico del ICA ni la evaluación de un veterinario colegiado.'
  );

  const contenido = partes.join('\n\n');

  return {
    contenido,
    modelo: 'EBA-IA-simulado-v1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}
