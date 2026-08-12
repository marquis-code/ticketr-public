import { defineNuxtPlugin, useRuntimeConfig } from '#app';
import { useRouter } from 'vue-router';

export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter();
  const config = useRuntimeConfig();

  // Function to send audit log to backend
  const sendAudit = async (action: string, entity: string, details: any) => {
    const token = localStorage.getItem('ticketr_admin_token');
    if (!token) return; // Only track authenticated users

    try {
      await fetch(`${config.public.apiBase}/audit/client`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action, entity, details }),
      });
    } catch (e) {
      // Fail silently for analytics tracking to prevent UI blocking
    }
  };

  // Track page navigations
  router.afterEach((to, from) => {
    if (to.path === from.path) return;
    
    sendAudit('PAGE_NAVIGATION', 'Admin Dashboard', {
      from: from.fullPath,
      to: to.fullPath,
      pageName: to.name || 'Unknown',
    });
  });

  // Track interactions (clicks)
  if (typeof window !== 'undefined') {
    window.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      
      // Only track clicks on interactive elements to reduce noise
      const interactiveElements = ['BUTTON', 'A'];
      let currentElement: HTMLElement | null = target;
      let found = false;

      while (currentElement && currentElement !== document.body) {
        if (interactiveElements.includes(currentElement.tagName)) {
          found = true;
          break;
        }
        currentElement = currentElement.parentElement;
      }

      if (found && currentElement) {
        const elementType = currentElement.tagName;
        const text = currentElement.innerText?.substring(0, 50).trim() || currentElement.getAttribute('aria-label') || currentElement.getAttribute('title') || 'Unknown element';
        const href = currentElement.getAttribute('href');

        sendAudit('USER_INTERACTION', 'Admin Dashboard', {
          type: 'CLICK',
          elementType,
          text,
          href,
          url: window.location.pathname,
        });
      }
    }, { passive: true });
  }
});
