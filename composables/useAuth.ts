interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  tenantId?: string;
}

const state = reactive<{
  user: SessionUser | null;
  token: string | null;
  ready: boolean;
}>({
  user: null,
  token: null,
  ready: false,
});

function decodeExpiry(token: string | null): number | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload?.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function useAuth() {
  const isAuthed = computed(() => !!state.token);
  const isOrganizer = computed(() => ['ORGANIZER', 'SUPER_ADMIN'].includes(state.user?.role || ''));
  const isStaff = computed(() => state.user?.role === 'STAFF');
  const isSuperAdmin = computed(() => state.user?.role === 'SUPER_ADMIN');

  function hydrate() {
    if (typeof localStorage === 'undefined') return;
    const token = localStorage.getItem('ticketr_admin_token');
    const expiry = decodeExpiry(token);
    if (token && expiry && expiry < Date.now()) {
      clearAdminSession();
      state.token = null;
      state.user = null;
      state.ready = true;
      return;
    }
    state.token = token;
    try {
      state.user = JSON.parse(localStorage.getItem('ticketr_admin_user') || 'null');
    } catch {
      state.user = null;
    }
    state.ready = true;
  }

  async function login(email: string, password: string) {
    const data = await apiRequest<{ accessToken: string; user: SessionUser }>('/auth/login', {
      method: 'POST',
      auth: false,
      body: { email, password },
    });
    if (!data?.accessToken) throw new Error('Login failed. Please try again.');

    state.token = data.accessToken;
    state.user = data.user;
    state.ready = true;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ticketr_admin_token', data.accessToken);
      localStorage.setItem('ticketr_admin_user', JSON.stringify(data.user));
      if (data.user?.tenantId) localStorage.setItem('ticketr_admin_tenant', data.user.tenantId);
    }
    if (typeof document !== 'undefined') {
      // Non-secret hint only. Lets SSR choose the console shell instead of
      // flashing the login page for an already-authenticated organizer.
      document.cookie = `ticketr_admin_session=1; Path=/; Max-Age=604800; SameSite=Lax`;
    }
    return data.user;
  }

  async function refreshProfile() {
    if (!state.token) return null;
    const profile = await apiRequest<any>('/auth/me');
    const user: SessionUser = {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      tenantId: profile.tenant?.id || profile.tenant?._id || profile.tenantId,
    };
    state.user = user;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ticketr_admin_user', JSON.stringify(user));
    }
    return user;
  }

  function logout(redirect = true) {
    clearAdminSession();
    state.token = null;
    state.user = null;
    if (redirect && typeof window !== 'undefined') {
      window.location.href = '/admin/login';
    }
  }

  return {
    state,
    isAuthed,
    isOrganizer,
    isStaff,
    isSuperAdmin,
    hydrate,
    login,
    logout,
    refreshProfile,
  };
}
