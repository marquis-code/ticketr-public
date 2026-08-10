export default defineNuxtRouteMiddleware((to) => {
  // Get hostname from the request URL
  const reqUrl = useRequestURL();
  const hostname = reqUrl.hostname;

  let isAdminSubdomain = false;

  if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
    const parts = hostname.split('.');
    // e.g. admin-thebig5.ticketr.org => parts = ['admin-thebig5', 'ticketr', 'org']
    if (parts.length > 2 && parts[0].startsWith('admin-')) {
      isAdminSubdomain = true;
    }
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
