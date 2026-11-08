import { pipeline } from 'stream';
import { promisify } from 'util';
import PDFDocument from 'pdfkit';

const streamPipeline = promisify(pipeline);

/**
 * Genera un PDF simple del reporte de evaluación.
 * Devuelve un Buffer con el contenido del PDF.
 */
export async function generarReportePDF(evaluacion) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).fillColor('#1f7a4d').text('Reporte de Evaluación de Bienestar Animal', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).fillColor('#333').text(`Evaluación #${evaluacion.id}`, { align: 'center' });
    doc.text(`Predio: ${evaluacion.predio.nombre}`, { align: 'center' });
    doc.text(`Municipio: ${evaluacion.predio.municipio} · Especie: ${evaluacion.predio.especie}`, { align: 'center' });
    doc.text(`Sistema: ${evaluacion.predio.sistema_productivo}`, { align: 'center' });
    doc.text(`Evaluador: ${evaluacion.evaluador.nombre} · Fecha: ${evaluacion.fecha}`, { align: 'center' });
    doc.moveDown();

    doc.fontSize(14).fillColor('#1f7a4d').text('Resultado Final');
    doc.fontSize(11).fillColor('#333');
    doc.text(`Puntaje total: ${(evaluacion.puntaje_total ?? 0).toFixed(1)} / 100`);
    doc.text(`Clasificación: ${evaluacion.clasificacion ?? 'Sin clasificar'}`);
    doc.text(`Estado: ${evaluacion.estado}`);
    doc.text(`Cerrada el: ${evaluacion.cerrada_en ?? '—'}`);
    doc.moveDown();

    doc.fontSize(14).fillColor('#1f7a4d').text('Resumen por Libertad');
    const libertades = evaluacion.resumen?.libertades ?? [];
    libertades.forEach((l, i) => {
      doc.fontSize(11).fillColor('#333');
      doc.text(`L${i + 1} · ${l.libertad_nombre}: ${(l.puntaje ?? 0).toFixed(2)} pts (peso ${(l.peso * 100).toFixed(0)}%)`);
    });
    doc.moveDown();

    doc.fontSize(14).fillColor('#1f7a4d').text('Plan de Mejora');
    const plan = evaluacion.plan_mejora ?? [];
    if (plan.length === 0) {
      doc.fontSize(11).fillColor('#333').text('No hay indicadores en plan de mejora. ¡Excelente!');
    } else {
      plan.forEach((item) => {
        doc.fontSize(11).fillColor('#333');
        doc.text(`#${item.numero} ${item.nombre} · ${item.libertad_nombre} · Puntaje: ${item.puntaje}`);
        if (item.criterio_100) doc.text(`  Para llegar a 100: ${item.criterio_100}`);
      });
    }
    doc.moveDown();

    doc.fontSize(14).fillColor('#1f7a4d').text('Detalle de Indicadores');
    const items = evaluacion.items ?? [];
    items.forEach((item) => {
      doc.fontSize(10).fillColor('#333');
      doc.text(`#${item.numero} ${item.nombre} · ${item.metodo_evaluacion} · Puntaje: ${item.puntaje ?? '—'}`);
      if (item.observacion) doc.text(`  Observación: ${item.observacion}`);
    });

    doc.end();
  });
}
