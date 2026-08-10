export function useSubdomain() {
  const route = useRoute();
  const reqUrl = useRequestURL();

  const hostname = reqUrl.hostname;
  let tenantSlug: string | null = null;
  let isAdminSubdomain = false;

  // Check query param first (for local dev)
  if (route.query.tenant) {
    tenantSlug = route.query.tenant as string;
  } else if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
    const parts = hostname.split('.');
    if (parts.length > 2 && parts[0] !== 'www') {
      const sub = parts[0];
      if (sub.startsWith('admin-')) {
        isAdminSubdomain = true;
        tenantSlug = sub.replace('admin-', '');
      } else if (sub === 'superadmin') {
        // superadmin subdomain — not handled here
      } else {
        tenantSlug = sub;
      }
    }
  }

  // Local dev: support ?mode=admin&tenant=thebig5
  if (route.query.mode === 'admin' && route.query.tenant) {
    isAdminSubdomain = true;
    tenantSlug = route.query.tenant as string;
  }

  return {
    tenantSlug,
    isAdminSubdomain,
    hostname,
  };
}
