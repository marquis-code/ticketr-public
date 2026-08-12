import { defineNuxtPlugin, useRuntimeConfig } from '#app';
import { useRouter } from 'vue-router';

export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter();
  const config = useRuntimeConfig();

  const sendVisitTrack = async (pageUrl: string) => {
    try {
      const hostParts = window.location.hostname.split('.');
      // If hostname is something like "university-of-lagos.ticketr.org", subdomain is "university-of-lagos"
      // If it's localhost, it might just be localhost or tenant.localhost
      const subdomain = hostParts.length > 0 ? hostParts[0] : 'unknown';

      await fetch(`${config.public.apiBase}/analytics/track-visit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          tenantId: subdomain, 
          page: pageUrl,
          details: {
            hostname: window.location.hostname,
            referrer: document.referrer
          }
        }),
      });
    } catch (e) {
      // Fail silently to avoid interrupting the user flow
    }
  };

  router.afterEach((to) => {
    sendVisitTrack(to.fullPath);
  });
});
