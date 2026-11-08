import { obtenerDatosIniciales } from './seed.js';

const { usuarios, predios, indicadores, libertades } = obtenerDatosIniciales();

export const store = {
  usuarios: [...usuarios],
  predios: [...predios],
  indicadores: [...indicadores],
  libertades: [...libertades],
  evaluaciones: [],
  recomendacionesIA: [],
  nextEvalId: 1,
};

export function obtenerIndicador(id) {
  return store.indicadores.find((i) => i.id === Number(id));
}

export function obtenerPredio(id) {
  return store.predios.find((p) => p.id === Number(id));
}

export function obtenerUsuario(id) {
  return store.usuarios.find((u) => u.id === Number(id));
}

export function autenticarUsuario(correo, password) {
  return store.usuarios.find(
    (u) => u.correo === correo && u.password === password && u.activo
  );
}
