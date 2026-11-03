/**
 * Host-level routing runs before Nuxt renders a single page.
 *
 * Without this, an admin host served by the public deployment renders the
 * storefront shell first and only redirects after hydration — the visible
 * "flash" when moving between ticketr-public and the console.
 */
export default defineEventHandler((event) => {
  const forwarded = getHeader(event, 'x-forwarded-host') || getHeader(event, 'host') || '';
  const host = forwarded.split(',')[0].trim().split(':')[0].toLowerCase();
  const url = getRequestURL(event);
  const path = url.pathname;

  const isLocal =
    host === 'localhost' ||
    host === '127.0.0.1' ||
    /^\d+\.\d+\.\d+\.\d+$/.test(host);
  if (isLocal || !host) return;

  const config = useRuntimeConfig(event);
  const adminUrl = String(config.public.adminUrl || '').replace(/\/+$/, '');
  let adminHost = '';
  try {
    adminHost = new URL(adminUrl).hostname.toLowerCase();
  } catch {
    adminHost = '';
  }

  const isAdminHost = host.startsWith('admin.') || host.startsWith('admin-');
  const isAdminPath = path === '/admin' || path.startsWith('/admin/');
  const isAsset =
    path.startsWith('/_nuxt/') ||
    path.startsWith('/__nuxt') ||
    path === '/favicon.svg' ||
    path === '/favicon.ico' ||
    path === '/robots.txt' ||
    path === '/sitemap.xml';

  // A per-tenant console host is not a second session. Move it to the one
  // configured console origin, preserving the requested path.
  if (host.startsWith('admin-') && adminHost && adminHost !== host) {
    return sendRedirect(event, `${adminUrl}${path}${url.search}`, 302);
  }

  if (isAdminHost && !isAsset) {
    const cookie = getHeader(event, 'cookie') || '';
    const authedHint = /(?:^|;\s*)ticketr_admin_session=1(?:;|$)/.test(cookie);
    const happyPath = authedHint ? '/admin/dashboard' : '/admin/login';

    if (path === '/' || (!isAdminPath && !isAsset)) {
      return sendRedirect(event, happyPath, 302);
    }
  }

  // Public host: console traffic belongs on the console origin.
  if (!isAdminHost && isAdminPath && adminHost && adminHost !== host) {
    return sendRedirect(event, `${adminUrl}${path}${url.search}`, 302);
  }
});
