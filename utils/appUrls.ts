export type AppKind = 'public' | 'admin' | 'superadmin';

/**
 * Resolve the origin for a sibling app.
 *
 * Production uses the configured public domains. Local development uses the
 * ports from the README so moving between storefront (3002), console (3003) and
 * platform admin (3001) never drops the developer on a production host.
 */
export function appOrigin(kind: AppKind): string {
  const config = useRuntimeConfig();
  const requestUrl = useRequestURL();
  const host = requestUrl.hostname;
  const isLocal =
    host === 'localhost' ||
    host === '127.0.0.1' ||
    /^\d+\.\d+\.\d+\.\d+$/.test(host);

  if (isLocal) {
    if (kind === 'public') return 'http://localhost:3002';
    if (kind === 'admin') return 'http://localhost:3003';
    return 'http://localhost:3001';
  }

  const configured =
    kind === 'public'
      ? config.public.publicUrl
      : kind === 'admin'
        ? config.public.adminUrl
        : (config.public as any).superAdminUrl;

  return String(configured || '').replace(/\/+$/, '');
}
