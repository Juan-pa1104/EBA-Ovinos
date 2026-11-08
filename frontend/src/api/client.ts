const API_BASE = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '');

export const TOKEN_KEY = 'eba_token';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { ...options.headers };

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError(
      'No fue posible conectar con el servidor. Verifique su conexión e intente nuevamente.',
      0,
    );
  }

  if (response.status === 401 && path !== '/auth/login') {
    clearToken();
    window.dispatchEvent(new Event('eba:unauthorized'));
  }

  if (!response.ok) {
    let mensaje = 'Ocurrió un error inesperado.';
    let details: unknown;
    try {
      const payload = (await response.json()) as { error?: string; details?: unknown };
      mensaje = payload.error ?? mensaje;
      details = payload.details;
    } catch {
      // La respuesta no contiene JSON; se conserva el mensaje genérico.
    }
    throw new ApiError(mensaje, response.status, details);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
  delete: <T = void>(path: string) => request<T>(path, { method: 'DELETE' }),
};

export async function descargarPdf(path: string, nombreArchivo: string): Promise<void> {
  const token = getToken();
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  } catch {
    throw new ApiError('No fue posible conectar con el servidor.', 0);
  }

  if (!response.ok) {
    let mensaje = 'No fue posible generar el PDF.';
    try {
      const payload = (await response.json()) as { error?: string };
      mensaje = payload.error ?? mensaje;
    } catch {
      // Sin JSON de error.
    }
    throw new ApiError(mensaje, response.status);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreArchivo;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  URL.revokeObjectURL(url);
}

export function queryString(params: Record<string, string | number | undefined | null>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== '') {
      search.set(clave, String(valor));
    }
  });
  const texto = search.toString();
  return texto ? `?${texto}` : '';
}

export function mensajeDeError(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Ocurrió un error inesperado.';
}

export function detallesDeError(error: unknown): string[] {
  if (!(error instanceof ApiError)) return [];
  if (Array.isArray(error.details)) {
    return error.details
      .map((detalle) => {
        if (detalle && typeof detalle === 'object' && 'mensaje' in detalle) {
          return String((detalle as { mensaje: unknown }).mensaje);
        }
        return null;
      })
      .filter((mensaje): mensaje is string => Boolean(mensaje));
  }
  return [];
}
