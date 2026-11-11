import { History, Loader2, MessageCircle, Plus, SendHorizonal, Sparkles, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { api, mensajeDeError } from '../api/client';
import { useToast } from '../context/ToastContext';
import { cn } from '../lib/format';
import { Button, ConfirmDialog, ErrorState, LoadingBlock } from './ui';

interface Conversacion {
  id: number;
  usuario_id: number;
  titulo: string;
  creado_en: string;
  actualizado_en: string;
}

interface Mensaje {
  id: number;
  conversacion_id: number;
  rol: 'user' | 'assistant' | 'system';
  contenido: string;
  creado_en: string;
}

type Vista = 'chat' | 'historial';

const SUGERENCIAS = [
  'Explícame las 5 libertades y sus pesos',
  'Qué significa un puntaje 55 en un indicador',
  '¿Qué predios puedo consultar?',
  'Analiza oportunidades de mejora en mi última evaluación',
];

export function AsistenteChat() {
  const { toast } = useToast();
  const [abierto, setAbierto] = useState(false);
  const [vista, setVista] = useState<Vista>('chat');
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [conversacionId, setConversacionId] = useState<number | null>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [cargandoConversaciones, setCargandoConversaciones] = useState(false);
  const [cargandoMensajes, setCargandoMensajes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aBorrar, setABorrar] = useState<Conversacion | null>(null);
  const contenedorRef = useRef<HTMLDivElement>(null);

  const cargarConversaciones = useCallback(async () => {
    setCargandoConversaciones(true);
    try {
      const data = await api.get<Conversacion[]>('/asistente/conversaciones');
      setConversaciones(data);
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setCargandoConversaciones(false);
    }
  }, []);

  const cargarMensajes = useCallback(
    async (id: number) => {
      setCargandoMensajes(true);
      try {
        const data = await api.get<Mensaje[]>(`/asistente/conversaciones/${id}/mensajes`);
        setMensajes(data);
      } catch (err) {
        setError(mensajeDeError(err));
      } finally {
        setCargandoMensajes(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (abierto) {
      void cargarConversaciones();
      if (conversacionId) void cargarMensajes(conversacionId);
    }
  }, [abierto, conversacionId, cargarConversaciones, cargarMensajes]);

  useEffect(() => {
    if (!contenedorRef.current) return;
    if (!abierto || vista !== 'chat') return;
    const el = contenedorRef.current;
    // Al recuperar historial viejo, saltar al final (más reciente) sin animación larga
    // Al recibir respuesta nueva, autoscroll suave
    el.scrollTo({ top: el.scrollHeight, behavior: enviando ? 'auto' : 'smooth' });
  }, [mensajes, enviando, abierto, vista]);

  const nuevaConversacion = () => {
    setConversacionId(null);
    setMensajes([]);
    setNuevoMensaje('');
    setVista('chat');
    setError(null);
  };

  const abrirConversacion = (id: number) => {
    setConversacionId(id);
    setVista('chat');
    void cargarMensajes(id);
  };

  const eliminarConversacion = async () => {
    if (!aBorrar) return;
    try {
      await api.delete(`/asistente/conversaciones/${aBorrar.id}`);
      toast('Conversación eliminada.');
      setConversaciones((actuales) => actuales.filter((c) => c.id !== aBorrar.id));
      if (conversacionId === aBorrar.id) nuevaConversacion();
    } catch (err) {
      toast(mensajeDeError(err), 'error');
    } finally {
      setABorrar(null);
    }
  };

  const enviar = async () => {
    const texto = nuevoMensaje.trim();
    if (!texto || enviando) return;
    setEnviando(true);
    setError(null);
    try {
      let id = conversacionId;
      if (!id) {
        const creada = await api.post<Conversacion>('/asistente/conversaciones', {
          titulo: texto.slice(0, 60) || 'Nueva conversación',
        });
        id = creada.id;
        setConversacionId(id);
        setConversaciones((actuales) => [creada, ...actuales]);
      }
      const respuesta = await api.post<{
        conversacionId: number;
        mensajeUsuario: Mensaje;
        respuesta: Mensaje;
        texto: string;
        llamadas: string[];
        modelo: string;
      }>(`/asistente/conversaciones/${id}/chat`, { mensaje: texto });
      setMensajes((actuales) => [...actuales, respuesta.mensajeUsuario, respuesta.respuesta]);
      setNuevoMensaje('');
      // Actualizar título/actualizado_en en la lista sin recargar todo el historial
      setConversaciones((actuales) =>
        actuales.map((c) =>
          c.id === id ? { ...c, actualizado_en: new Date().toISOString() } : c,
        ),
      );
    } catch (err) {
      const msg = mensajeDeError(err);
      setError(msg);
      toast(msg, 'error');
    } finally {
      setEnviando(false);
    }
  };

  const alPresionarTecla = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void enviar();
    }
  };

  return (
    <>
      <div className="group/tooltip-fab fixed bottom-20 right-4 z-50 lg:bottom-6 lg:right-6">
        <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-brand-950 px-2 py-1 text-[10px] font-bold text-white opacity-0 shadow-lg transition-opacity group-hover/tooltip-fab:opacity-100 group-focus-within/tooltip-fab:opacity-100">
          {abierto ? 'Cerrar EBA Assistant' : 'Abrir EBA Assistant'}
        </span>
      <button
        type="button"
        title={abierto ? 'Cerrar EBA Assistant' : 'Abrir EBA Assistant'}
        onClick={() => setAbierto((v) => !v)}
        aria-label={abierto ? 'Cerrar EBA Assistant' : 'Abrir EBA Assistant'}
        className={cn(
          'relative flex h-14 w-14 items-center justify-center rounded-full bg-brand-700 text-white shadow-lift transition hover:bg-brand-800',
          abierto && 'bg-brand-900 hover:bg-brand-950',
        )}
      >
        {abierto ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!abierto && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-extrabold text-brand-950">
            IA
          </span>
        )}
      </button>
      </div>

      {abierto && (
        <div className="fixed inset-x-3 bottom-36 z-50 flex h-[70vh] max-h-[640px] min-h-[420px] flex-col overflow-hidden rounded-3xl border border-brand-900/10 bg-white shadow-lift sm:inset-auto sm:bottom-24 sm:right-6 sm:w-[400px] lg:bottom-24">
          <div className="shrink-0 flex items-center justify-between gap-2 bg-brand-900 px-4 py-3 text-white">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                <Sparkles className="h-5 w-5 text-brand-200" />
              </span>
              <div>
                <p className="text-sm font-bold leading-tight">EBA Assistant</p>
                <p className="text-[11px] text-brand-300">Bienestar ovino y caprino</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <div className="group relative">
                <button
                  type="button"
                  title="Nueva conversación"
                  onClick={nuevaConversacion}
                  className="rounded-lg p-2 text-brand-200 hover:bg-white/10"
                  aria-label="Nueva conversación"
                >
                  <Plus className="h-5 w-5" />
                </button>
                <span className="pointer-events-none absolute -bottom-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-brand-950 px-2 py-1 text-[10px] font-bold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                  Nueva conversación
                </span>
              </div>
              <div className="group relative">
                <button
                  type="button"
                  title={vista === 'chat' ? 'Ver historial' : 'Volver al chat'}
                  onClick={() => setVista(vista === 'chat' ? 'historial' : 'chat')}
                  className="rounded-lg p-2 text-brand-200 hover:bg-white/10"
                  aria-label={vista === 'chat' ? 'Ver historial' : 'Volver al chat'}
                >
                  <History className="h-5 w-5" />
                </button>
                <span className="pointer-events-none absolute -bottom-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-brand-950 px-2 py-1 text-[10px] font-bold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                  {vista === 'chat' ? 'Historial' : 'Volver al chat'}
                </span>
              </div>
              <div className="group relative">
                <button
                  type="button"
                  title="Cerrar asistente"
                  onClick={() => setAbierto(false)}
                  className="rounded-lg p-2 text-brand-200 hover:bg-white/10"
                  aria-label="Cerrar asistente"
                >
                  <X className="h-5 w-5" />
                </button>
                <span className="pointer-events-none absolute -bottom-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-brand-950 px-2 py-1 text-[10px] font-bold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                  Cerrar asistente
                </span>
              </div>
            </div>
          </div>

          {vista === 'chat' ? (
            <>
              <div ref={contenedorRef} className="min-h-0 flex-1 space-y-3 overflow-x-hidden overflow-y-auto overscroll-contain bg-cream/60 p-4 scroll-smooth [-webkit-overflow-scrolling:touch]">
                {cargandoMensajes ? (
                  <LoadingBlock label="Cargando conversación..." />
                ) : mensajes.length === 0 ? (
                  <div className="space-y-3">
                    <div className="rounded-2xl rounded-tl-md border border-brand-900/10 bg-white p-3 text-sm leading-relaxed text-brand-900/75 shadow-sm">
                      Hola, soy <strong>EBA Assistant</strong>. Puedo explicarte las 5 libertades, los 39 indicadores, calificaciones 0/20/55/100, y consultar tus predios y evaluaciones autorizados. ¿En qué te ayudo?
                    </div>
                    {SUGERENCIAS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setNuevoMensaje(s)}
                        disabled={enviando}
                        className="block w-full rounded-xl border border-brand-900/10 bg-white px-3 py-2 text-left text-xs text-brand-800 transition hover:border-brand-500/40 hover:bg-brand-50"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                ) : (
                  mensajes.map((m) => (
                    <div key={m.id} className={cn('min-w-0 max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm break-words [overflow-wrap:anywhere]', m.rol === 'user' ? 'ml-auto rounded-br-md bg-brand-700 text-white' : 'mr-auto rounded-bl-md border border-brand-900/10 bg-white text-brand-900/85')}>
                      {m.rol === 'user' ? (
                        <p className="whitespace-pre-wrap break-words">{m.contenido}</p>
                      ) : (
                        <div className="prose-sm">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              h1: ({ children }) => <h1 className="mb-2 mt-3 font-display text-base font-bold text-ink first:mt-0">{children}</h1>,
                              h2: ({ children }) => <h2 className="mb-2 mt-3 font-display text-[15px] font-bold text-ink first:mt-0">{children}</h2>,
                              h3: ({ children }) => <h3 className="mb-1.5 mt-3 text-sm font-bold text-ink first:mt-0">{children}</h3>,
                              p: ({ children }) => <p className="mb-2 last:mb-0 break-words">{children}</p>,
                              ul: ({ children }) => <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>,
                              ol: ({ children }) => <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>,
                              li: ({ children }) => <li className="break-words">{children}</li>,
                              blockquote: ({ children }) => <blockquote className="mb-2 border-l-4 border-brand-200 bg-brand-50/60 py-1 pl-3 pr-2 text-brand-900/75 last:mb-0">{children}</blockquote>,
                              hr: () => <hr className="my-3 border-brand-900/10" />,
                              pre: ({ children }) => <pre className="my-2 max-w-full overflow-x-auto overflow-y-hidden rounded-xl bg-brand-950 p-3 text-[11px] leading-relaxed text-white">{children}</pre>,
                              code: ({ className, children, ...props }) => {
                                const esBloque = /language-/.test(className ?? '');
                                if (esBloque) return <code className="font-mono text-[11px]">{children}</code>;
                                return <code className="rounded-md bg-brand-50 px-1.5 py-0.5 font-mono text-[11px] text-brand-800 break-words">{children}</code>;
                              },
                              table: ({ children }) => (
                                <div className="my-2 max-w-full overflow-x-auto rounded-xl border border-brand-900/10">
                                  <table className="w-full min-w-[280px] border-collapse text-left text-xs">{children}</table>
                                </div>
                              ),
                              thead: ({ children }) => <thead className="bg-brand-50">{children}</thead>,
                              th: ({ children }) => <th className="border-b border-brand-900/10 px-2.5 py-2 font-bold text-brand-900/80">{children}</th>,
                              td: ({ children }) => <td className="border-b border-brand-900/[0.06] px-2.5 py-2 break-words">{children}</td>,
                              strong: ({ children }) => <strong className="font-bold text-ink">{children}</strong>,
                              em: ({ children }) => <em className="italic">{children}</em>,
                              a: ({ href, children }) => {
                                const seguro = typeof href === 'string' && (href.startsWith('https://') || href.startsWith('http://'));
                                if (!seguro) return <span className="break-words">{children}</span>;
                                return <a href={href} target="_blank" rel="noreferrer noopener" className="font-semibold text-brand-700 underline decoration-brand-200 underline-offset-2 break-words">{children}</a>;
                              },
                            }}
                          >
                            {m.contenido}
                          </ReactMarkdown>
                        </div>
                      )}
                      <p className={cn('mt-1.5 text-[10px]', m.rol === 'user' ? 'text-white/60' : 'text-brand-900/40')}>{new Date(m.creado_en).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  ))
                )}
                {enviando && (
                  <div className="mr-auto flex max-w-[85%] items-center gap-2 rounded-2xl rounded-bl-md border border-brand-900/10 bg-white px-3 py-2.5 text-xs text-brand-900/60 shadow-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    EBA Assistant está procesando tu consulta...
                  </div>
                )}
              </div>

              <div className="shrink-0 border-t border-brand-900/[0.07] bg-white p-3">
                {error && (
                  <div className="mb-2 rounded-xl bg-red-50 px-3 py-2 text-xs leading-relaxed text-red-800">
                    {error}. Revisa tu conexión e inténtalo de nuevo.
                  </div>
                )}
                <div className="flex gap-2">
                  <textarea
                    value={nuevoMensaje}
                    onChange={(e) => setNuevoMensaje(e.target.value)}
                    onKeyDown={alPresionarTecla}
                    rows={1}
                    placeholder="Escribe tu pregunta... (Enter para enviar, Shift+Enter para nueva línea)"
                    className="max-h-28 flex-1 resize-none rounded-2xl border border-brand-900/10 bg-cream/70 px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                    maxLength={4000}
                    disabled={enviando}
                    aria-label="Escribe tu pregunta"
                  />
                  <div className="group relative">
                  <Button title="Enviar mensaje" onClick={() => void enviar()} disabled={!nuevoMensaje.trim() || enviando} loading={enviando} aria-label="Enviar mensaje">
                    <SendHorizonal className="h-4 w-4" />
                  </Button>
                  <span className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-brand-950 px-2 py-1 text-[10px] font-bold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                    Enviar mensaje
                  </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-white p-4 scroll-smooth [-webkit-overflow-scrolling:touch]">
              {cargandoConversaciones ? (
                <LoadingBlock label="Cargando historial..." />
              ) : error ? (
                <ErrorState message={error} onRetry={() => void cargarConversaciones()} />
              ) : conversaciones.length === 0 ? (
                <p className="rounded-2xl bg-cream p-4 text-center text-xs leading-relaxed text-brand-900/55">Aún no tienes conversaciones. Inicia una nueva con el botón +.</p>
              ) : (
                <ul className="space-y-2">
                  {conversaciones.map((c) => (
                    <li key={c.id} className={cn('group flex items-center gap-2 rounded-2xl border p-3', c.id === conversacionId ? 'border-brand-500/40 bg-brand-50/70' : 'border-brand-900/10 bg-white')}>
                      <button type="button" onClick={() => abrirConversacion(c.id)} className="min-w-0 flex-1 text-left">
                        <p className="truncate text-sm font-bold text-ink">{c.titulo || 'Nueva conversación'}</p>
                        <p className="mt-0.5 text-[11px] text-brand-900/45">{new Date(c.actualizado_en).toLocaleString('es-CO')}</p>
                      </button>
                      <div className="group relative shrink-0">
                      <button type="button" title="Eliminar conversación" onClick={() => setABorrar(c)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label={`Eliminar ${c.titulo}`}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <span className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-brand-950 px-2 py-1 text-[10px] font-bold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                        Eliminar conversación
                      </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(aBorrar)}
        title="Eliminar conversación"
        description={`Se eliminarán ${aBorrar ? `«${aBorrar.titulo}»` : 'esta conversación'} y todos sus mensajes permanentemente.`}
        confirmLabel="Eliminar"
        danger
        onCancel={() => setABorrar(null)}
        onConfirm={() => void eliminarConversacion()}
      />
    </>
  );
}
