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

export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return;

  const config = useRuntimeConfig();
  const hostname = window.location.hostname;
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname);

  const isAdminPath = to.path === '/admin' || to.path.startsWith('/admin/');

  const isAdminHost =
    hostname.startsWith('admin-') ||
    hostname.startsWith('admin.') ||
    to.query.mode === 'admin' ||
    (isLocal && isAdminPath);

  // Public host: send console traffic to the dedicated admin deployment.
  if (isAdminPath && !isAdminHost) {
    const adminUrl = String(config.public.adminUrl || '').replace(/\/+$/, '');
    if (adminUrl && !adminUrl.includes(hostname)) {
      return navigateTo(`${adminUrl}${to.fullPath}`, { external: true });
    }
    return navigateTo('/', { redirectCode: 302 });
  }

  if (isAdminHost) {
    const { token, role, expired } = readToken();
    if (expired && token) {
      localStorage.removeItem('ticketr_admin_token');
      localStorage.removeItem('ticketr_admin_user');
    }
    const authed = !!token && !expired;

    if (to.path === '/' || to.path === '') {
      return navigateTo(authed ? '/admin/dashboard' : '/admin/login');
    }

    // Storefront routes on the admin host belong in the console.
    if (!isAdminPath) {
      return navigateTo(authed ? '/admin/dashboard' : '/admin/login', { redirectCode: 302 });
    }

    const authRoutes = ['/admin/login', '/admin/signup', '/admin/forgot-password', '/admin/reset-password'];
    const isAuthRoute = authRoutes.includes(to.path);

    if (authed && isAuthRoute) {
      return navigateTo(role === 'STAFF' ? '/admin/scanner' : '/admin/dashboard', { redirectCode: 302 });
    }
    if (!authed && !isAuthRoute && to.path !== '/admin/verify') {
      return navigateTo(`/admin/login?redirect=${encodeURIComponent(to.fullPath)}`, { redirectCode: 302 });
    }

    // Gate staff only need the scanner and attendee lookup.
    if (authed && role === 'STAFF' && !['/admin/scanner', '/admin/attendees', '/admin/verify'].some((path) => to.path.startsWith(path))) {
      return navigateTo('/admin/scanner', { redirectCode: 302 });
    }
  }

  // Local development convenience: allow /admin/* without a dedicated host.
  if (isLocal && to.path.startsWith('/admin') && !isAdminHost) {
    // handled above only when an adminUrl is configured and differs; local dev
    // usually sets NUXT_PUBLIC_ADMIN_URL to localhost:3003.
  }
});
