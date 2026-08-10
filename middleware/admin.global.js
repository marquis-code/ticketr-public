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
    const token = localStorage.getItem('ticketr_admin_token');

    // On admin subdomain but NOT on an /admin route => redirect appropriately
    if (!to.path.startsWith('/' + 'admin')) {
      return navigateTo(token ? '/' + 'admin/dashboard' : '/' + 'admin/login', { redirectCode: 302 });
    }

    // Authenticated admin trying to access login page => redirect back to dashboard
    if (token && to.path === '/' + 'admin/login') {
      return navigateTo('/' + 'admin/dashboard', { redirectCode: 302 });
    }

    // Unauthenticated user trying to access secure admin pages => redirect to login
    if (!token && to.path !== '/' + 'admin/login') {
      return navigateTo('/' + 'admin/login', { redirectCode: 302 });
    }
  } else {
    // NOT on admin subdomain but trying to access /admin routes => block
    if (to.path.startsWith('/' + 'admin')) {
      return navigateTo('/', { redirectCode: 302 });
    }
  }
});
