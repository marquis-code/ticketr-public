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

    if (to.path === '/forgot-password') return navigateTo('/admin/forgot-password', { redirectCode: 301 });
    if (to.path === '/reset-password') return navigateTo('/admin/reset-password' + (to.query.token ? `?token=${to.query.token}` : ''), { redirectCode: 301 });
    if (to.path.startsWith('/verify/')) return navigateTo('/admin/verify/' + to.path.split('/verify/')[1], { redirectCode: 301 });
    if (to.path === '/login') return navigateTo('/admin/login', { redirectCode: 301 });
    if (to.path === '/signup') return navigateTo('/admin/signup', { redirectCode: 301 });

    // On admin subdomain but NOT on an /admin route => redirect appropriately
    if (!to.path.startsWith('/' + 'admin')) {
      return navigateTo(token ? '/' + 'admin/dashboard' : '/' + 'admin/login', { redirectCode: 302 });
    }

    // Authenticated admin trying to access login/signup page => redirect back to dashboard
    const isAuthRoute = to.path === '/admin/login' || to.path === '/admin/signup' || to.path === '/admin/forgot-password' || to.path === '/admin/reset-password';
    if (token && isAuthRoute) {
      return navigateTo('/' + 'admin/dashboard', { redirectCode: 302 });
    }

    // Unauthenticated user trying to access secure admin pages => redirect to login
    if (!token && !isAuthRoute) {
      return navigateTo('/' + 'admin/login', { redirectCode: 302 });
    }
  } else {
    // NOT on admin subdomain but trying to access /admin routes => block
    if (to.path.startsWith('/' + 'admin')) {
      return navigateTo('/', { redirectCode: 302 });
    }
  }
});
