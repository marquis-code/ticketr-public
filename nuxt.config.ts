// https://nuxt.com/docs/api/configuration/nuxt-config
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
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://api.ticketr.org/api/v1',
      paystackPublicKey: process.env.NUXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
      adminUrl: process.env.NUXT_PUBLIC_ADMIN_URL || 'https://admin.ticketr.org',
      publicUrl: process.env.NUXT_PUBLIC_PUBLIC_URL || 'https://ticketr.org',
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
      script: [
        {
          children: `
            if ((window.location.hostname.startsWith('admin-') || window.location.hostname.startsWith('admin.')) && window.location.pathname === '/') {
              window.location.replace('/admin/dashboard');
            }
          `
        }
      ]
    },
  },
});