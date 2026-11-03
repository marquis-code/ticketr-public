/**
 * One gate for the organizer console.
 *
 * - A dedicated admin host (`admin.*` or `admin-*`) serves the console.
 * - The public host forwards /admin/* to the configured admin URL.
 * - Local development can opt in with `?mode=admin`.
 * - Tokens are checked for expiry and role before rendering console pages.
 */
function readToken() {
  if (typeof localStorage === 'undefined') return { token: null, role: null, expired: false };
  const token = localStorage.getItem('ticketr_admin_token');
  if (!token) return { token: null, role: null, expired: false };
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    const expired = !payload?.exp || payload.exp * 1000 < Date.now();
    return { token, role: payload?.role || null, expired };
  } catch {
    return { token, role: null, expired: true };
  }
}

function hostOf(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

export default defineNuxtRouteMiddleware((to) => {
  const config = useRuntimeConfig();
  const url = useRequestURL();
  const hostname = url.hostname;
  const isServer = import.meta.server;
  const isLocal =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    /^\d+\.\d+\.\d+\.\d+$/.test(hostname);

  const isAdminPath = to.path === '/admin' || to.path.startsWith('/admin/');
  const configuredAdminUrl = String(config.public.adminUrl || '').replace(/\/+$/, '');
  const configuredAdminHost = hostOf(configuredAdminUrl);

  // A per-tenant admin host must not create a second console session.
  if (hostname.startsWith('admin-') && configuredAdminHost && configuredAdminHost !== hostname) {
    return navigateTo(`${configuredAdminUrl}${to.fullPath}`, { external: true, redirectCode: 302 });
  }

  const isAdminHost =
    hostname.startsWith('admin-') ||
    hostname.startsWith('admin.') ||
    to.query.mode === 'admin' ||
    (isLocal && isAdminPath);

  // Public host: send console traffic to the dedicated admin deployment.
  if (isAdminPath && !isAdminHost) {
    if (configuredAdminUrl && configuredAdminHost && configuredAdminHost !== hostname) {
      return navigateTo(`${configuredAdminUrl}${to.fullPath}`, {
        external: true,
        redirectCode: 302,
      });
    }
    return navigateTo('/', { redirectCode: 302 });
  }

  if (isAdminHost) {
    const authRoutes = [
      '/admin/login',
      '/admin/signup',
      '/admin/forgot-password',
      '/admin/reset-password',
    ];
    const isAuthRoute = authRoutes.includes(to.path);
    const cookieHeader = isServer
      ? useRequestHeaders(['cookie']).cookie || ''
      : typeof document !== 'undefined'
        ? document.cookie
        : '';
    const sessionHint = /(?:^|;\s*)ticketr_admin_session=1(?:;|$)/.test(cookieHeader);

    // SSR must never render the storefront chrome on an admin host, and should
    // not guess between dashboard and login. The non-secret hint cookie lets it
    // choose correctly without a public-home flash.
    if (isServer) {
      if (to.path === '/' || !isAdminPath) {
        return navigateTo(sessionHint ? '/admin/dashboard' : '/admin/login', {
          redirectCode: 302,
        });
      }
      if (isAuthRoute && sessionHint) {
        return navigateTo('/admin/dashboard', { redirectCode: 302 });
      }
      if (!isAuthRoute && !sessionHint) {
        return navigateTo(`/admin/login?redirect=${encodeURIComponent(to.fullPath)}`, {
          redirectCode: 302,
        });
      }
      return;
    }

    const { token, role, expired } = readToken();
    if (expired && token) {
      localStorage.removeItem('ticketr_admin_token');
      localStorage.removeItem('ticketr_admin_user');
      document.cookie = 'ticketr_admin_session=; Path=/; Max-Age=0; SameSite=Lax';
    }
    const authed = !!token && !expired;

    if (to.path === '/' || to.path === '') {
      return navigateTo(authed ? '/admin/dashboard' : '/admin/login');
    }

    // Storefront routes on the admin host belong in the console.
    if (!isAdminPath) {
      return navigateTo(authed ? '/admin/dashboard' : '/admin/login', { redirectCode: 302 });
    }

    if (authed && isAuthRoute) {
      return navigateTo(role === 'STAFF' ? '/admin/scanner' : '/admin/dashboard', {
        redirectCode: 302,
      });
    }
    if (!authed && !isAuthRoute && to.path !== '/admin/verify') {
      return navigateTo(`/admin/login?redirect=${encodeURIComponent(to.fullPath)}`, {
        redirectCode: 302,
      });
    }

    // Gate staff only need the scanner and attendee lookup.
    if (
      authed &&
      role === 'STAFF' &&
      !['/admin/scanner', '/admin/attendees', '/admin/verify'].some((path) =>
        to.path.startsWith(path),
      )
    ) {
      return navigateTo('/admin/scanner', { redirectCode: 302 });
    }
  }

  // Local development convenience: allow /admin/* without a dedicated host.
  if (isLocal && to.path.startsWith('/admin') && !isAdminHost) {
    // handled above only when an adminUrl is configured and differs; local dev
    // usually sets NUXT_PUBLIC_ADMIN_URL to localhost:3003.
  }
});
