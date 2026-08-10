export default defineNuxtRouteMiddleware((to) => {
  if (!import.meta.client) return;

  const hostname = window.location.hostname;
  let isAdminSubdomain = false;

  if (hostname && hostname.startsWith('admin-')) {
    isAdminSubdomain = true;
  }

  // Local dev support: ?mode=admin
  if (to.query.mode === 'admin') {
    isAdminSubdomain = true;
  }

  if (isAdminSubdomain) {
    // On admin subdomain but NOT on an /admin route => redirect to admin login
    if (!to.path.startsWith('/' + 'admin')) {
      return navigateTo('/' + 'admin/login', { redirectCode: 302 });
    }
  } else {
    // NOT on admin subdomain but trying to access /admin routes => block
    if (to.path.startsWith('/' + 'admin')) {
      return navigateTo('/', { redirectCode: 302 });
    }
  }
});
