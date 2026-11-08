import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { HistorialGlobalEvaluacion } from '../api/types';
import { formatFecha } from '../lib/format';

const COLORES_LIBERTADES = ['#348d58', '#2563a8', '#b7791f', '#b23b3b', '#7c5cbf'];

function promedio(valores: number[]): number | null {
  if (valores.length === 0) return null;
  return Math.round((valores.reduce((suma, valor) => suma + valor, 0) / valores.length) * 100) / 100;
}

export function EvolucionGlobalChart({
  evaluaciones,
  mostrarLibertades = true,
  altura = 330,
}: {
  evaluaciones: HistorialGlobalEvaluacion[];
  mostrarLibertades?: boolean;
  altura?: number;
}) {
  const nombresLibertades =
    evaluaciones[0]?.libertades.map((libertad) => libertad.libertad_nombre) ?? [];

  const agrupado = new Map<
    string,
    { totales: number[]; libertades: Map<string, number[]> }
  >();

  evaluaciones.forEach((evaluacion) => {
    let grupo = agrupado.get(evaluacion.fecha);
    if (!grupo) {
      grupo = { totales: [], libertades: new Map() };
      agrupado.set(evaluacion.fecha, grupo);
    }
    if (evaluacion.puntaje_total !== null) {
      grupo.totales.push(evaluacion.puntaje_total);
    }
    evaluacion.libertades.forEach((libertad) => {
      const valores = grupo?.libertades.get(libertad.libertad_nombre) ?? [];
      valores.push(libertad.puntaje);
      grupo?.libertades.set(libertad.libertad_nombre, valores);
    });
  });

  const datos = Array.from(agrupado.entries())
    .sort(([fechaA], [fechaB]) => fechaA.localeCompare(fechaB))
    .map(([fecha, grupo]) => {
      const fila: Record<string, string | number | null> = {
        fecha: formatFecha(fecha),
        Total: promedio(grupo.totales),
      };
      if (mostrarLibertades) {
        grupo.libertades.forEach((valores, nombre) => {
          fila[nombre] = promedio(valores);
        });
      }
      return fila;
    });

  if (datos.length === 0) return null;

  return (
    <div style={{ width: '100%', height: altura }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={datos} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#163c2914" vertical={false} />
          <XAxis
            dataKey="fecha"
            tick={{ fontSize: 11, fill: '#66756b' }}
            tickLine={false}
            axisLine={{ stroke: '#163c291f' }}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: '#66756b' }}
            tickLine={false}
            axisLine={false}
            width={42}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 14,
              border: '1px solid #163c291f',
              boxShadow: '0 18px 40px -28px rgba(22, 60, 41, 0.35)',
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} iconType="circle" iconSize={7} />
          <Line
            type="monotone"
            dataKey="Total"
            name="Promedio total"
            stroke="#163c29"
            strokeWidth={3}
            dot={{ r: 4, fill: '#163c29' }}
            activeDot={{ r: 6 }}
            connectNulls
          />
          {mostrarLibertades &&
            nombresLibertades.map((nombre, indice) => (
              <Line
                key={nombre}
                type="monotone"
                dataKey={nombre}
                name={nombre}
                stroke={COLORES_LIBERTADES[indice % COLORES_LIBERTADES.length]}
                strokeWidth={1.8}
                dot={{ r: 2.5 }}
                strokeDasharray={indice % 2 === 0 ? undefined : '5 4'}
                connectNulls
              />
            ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
