export default defineNuxtRouteMiddleware((to) => {
  const { isAdminSubdomain, tenantSlug } = useSubdomain();

  if (isAdminSubdomain && tenantSlug) {
    // If on an admin subdomain but NOT already on an /admin route, redirect
    if (!to.path.startsWith('/admin')) {
      return navigateTo(`/admin/login?tenant=${tenantSlug}`);
    }
  }

  // If NOT on an admin subdomain but trying to access /admin routes, block
  if (!isAdminSubdomain && to.path.startsWith('/admin')) {
    return navigateTo('/');
  }
});
