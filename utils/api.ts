export interface ApiErrorShape {
  status: number;
  message: string;
  details?: unknown;
}

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export function apiBase(): string {
  let raw = '';
  try {
    const config = useRuntimeConfig();
    raw = String(config.public.apiBase || '').trim();
  } catch {
    raw = '';
  }

  // A deployed env value is often `api.ticketr.org/api/v1` without a scheme.
  // Node/browser fetch reject that before making a request, which looks like
  // "no endpoint is called" in the UI.
  if (!raw) raw = 'https://api.ticketr.org/api/v1';
  if (raw.startsWith('//')) raw = `https:${raw}`;
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(raw)) raw = `https://${raw}`;

  try {
    const url = new URL(raw);
    let path = url.pathname.replace(/\/+$/, '');
    if (!path || path === '/') path = '/api/v1';
    if (!/\/api\/v\d+$/.test(path)) {
      path = path.endsWith('/api') ? `${path}/v1` : `${path}/api/v1`;
    }
    return `${url.origin}${path}`;
  } catch {
    return 'https://api.ticketr.org/api/v1';
  }
}

function extractMessage(payload: any, fallback: string): string {
  if (!payload) return fallback;
  const message = payload.message ?? payload.error ?? payload.msg;
  if (Array.isArray(message)) return message.join('. ');
  if (typeof message === 'string' && message.trim()) return message;
  return fallback;
}

export function adminToken(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem('ticketr_admin_token') || localStorage.getItem('ticketr_super_token');
}

export function clearAdminSession() {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem('ticketr_admin_token');
  localStorage.removeItem('ticketr_admin_user');
  localStorage.removeItem('ticketr_admin_tenant');
  if (typeof document !== 'undefined') {
    document.cookie = 'ticketr_admin_session=; Path=/; Max-Age=0; SameSite=Lax';
  }
}

export function clearSuperSession() {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem('ticketr_super_token');
  localStorage.removeItem('ticketr_super_user');
}

/**
 * One fetch helper for every page. Handles the API base URL, bearer auth,
 * JSON/form bodies, Nest error shapes and expired sessions in one place.
 */
export async function apiRequest<T = any>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
    body?: any;
    token?: string | null;
    auth?: boolean;
    headers?: Record<string, string>;
    signal?: AbortSignal;
    timeoutMs?: number;
  } = {},
): Promise<T> {
  const { method = 'GET', body, auth = true, headers = {}, signal, timeoutMs = 30000 } = options;

  const token = options.token !== undefined ? options.token : auth ? adminToken() : null;

  const finalHeaders: Record<string, string> = { Accept: 'application/json', ...headers };
  let payload: BodyInit | undefined;

  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    finalHeaders['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  if (token) finalHeaders.Authorization = `Bearer ${token}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  if (signal) {
    signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  try {
    const response = await fetch(`${apiBase()}${path}`, {
      method,
      headers: finalHeaders,
      body: payload,
      signal: controller.signal,
    });

    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
      ? await response.json().catch(() => null)
      : await response.text().catch(() => '');

    if (!response.ok) {
      if (response.status === 401 && auth) {
        const wasSuper = typeof localStorage !== 'undefined' && !!localStorage.getItem('ticketr_super_token');
        clearAdminSession();
        if (wasSuper) clearSuperSession();
        if (typeof window !== 'undefined') {
          const path = window.location.pathname;
          const isLogin = path === '/admin/login' || path === '/login';
          if (!isLogin) {
            const redirect = encodeURIComponent(path + window.location.search);
            window.location.href = path.startsWith('/dashboard')
              ? `/login?redirect=${redirect}`
              : `/admin/login?redirect=${redirect}`;
          }
        }
      }
      throw new ApiError(
        response.status,
        extractMessage(data, `Request failed (${response.status})`),
        data,
      );
    }

    return data as T;
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    if (error?.name === 'AbortError') {
      throw new ApiError(408, 'This request took too long. Please check your connection and try again.');
    }
    throw new ApiError(0, 'We could not reach the server. Please check your connection.');
  } finally {
    clearTimeout(timer);
  }
}

export function errorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

/** Copies text with a graceful fallback for insecure contexts. */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const area = document.createElement('textarea');
    area.value = text;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}
