export default defineNuxtRouteMiddleware((to) => {
  let hostname = '';
  if (import.meta.client) {
    hostname = window.location.hostname;
  } else {
    try {
      hostname = useRequestURL().hostname;
    } catch (e) {}
  }

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
    if (!to.path.startsWith('/admin')) {
      return navigateTo('/admin/login', { redirectCode: 302 });
    }
  } else {
    // NOT on admin subdomain but trying to access /admin routes => block
    if (to.path.startsWith('/admin')) {
      return navigateTo('/', { redirectCode: 302 });
    }
  }
});
