// https://nuxt.com/docs/api/configuration/nuxt-config
function normalizeApiBase(value?: string): string {
  let raw = (value || 'https://api.ticketr.org/api/v1').trim();
  if (raw.startsWith('//')) raw = `https:${raw}`;
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(raw)) raw = `https://${raw}`;
  try {
    const url = new URL(raw);
    let path = url.pathname.replace(/\/+$/, '');
    if (!path || path === '/') path = '/api/v1';
    if (!/\/api\/v\d+$/.test(path)) {
      path = path.endsWith('/api') ? `${path}/v1` : `${path}/api/v1`;
    }
    return `${url.origin}${path}`;
  } catch {
    return 'https://api.ticketr.org/api/v1';
  }
}

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],
  css: ['~/assets/css/main.css'],
  devServer: {
    port: 3002,
  },
  runtimeConfig: {
    public: {
      apiBase: normalizeApiBase(process.env.NUXT_PUBLIC_API_BASE),
      paystackPublicKey: process.env.NUXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
      adminUrl: process.env.NUXT_PUBLIC_ADMIN_URL || 'https://admin.ticketr.org',
      publicUrl: process.env.NUXT_PUBLIC_PUBLIC_URL || 'https://www.ticketr.org',
      superAdminUrl: process.env.NUXT_PUBLIC_SUPERADMIN_URL || 'https://superadmin.ticketr.org',
    },
  },
  app: {
    head: {
      title: 'Ticketr - Modern Event Ticketing',
      meta: [
        { name: 'description', content: 'Book event tickets seamlessly for your institution or school.' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'stylesheet', href: 'https://api.fontshare.com/v2/css?f[]=clash-display@200,300,400,500,600,700&f[]=satoshi@300,400,500,700,900&display=swap' },
      ],
      script: []
    },
  },
});