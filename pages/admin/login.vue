<template>
  <div class="min-h-screen grid lg:grid-cols-[1.05fr_1fr] bg-paper">
    <!-- ============ FORM ============ -->
    <div class="flex flex-col justify-center px-5 sm:px-10 lg:px-16 xl:px-24 py-10">
      <div class="w-full max-w-md mx-auto">
        <NuxtLink to="/" class="flex items-center gap-2.5 mb-10">
          <span class="w-9 h-9 rounded-xl bg-ink flex items-center justify-center">
            <Ticket class="w-[18px] h-[18px] text-lime" />
          </span>
          <span class="font-display text-[22px] font-semibold tracking-[-0.04em] text-ink">ticketr.</span>
          <span class="chip-muted !text-[9px] ml-1">Console</span>
        </NuxtLink>

        <template v-if="!otpRequired">
          <h1 class="font-display text-3xl sm:text-4xl font-semibold text-ink tracking-[-0.03em]">Welcome back.</h1>
          <p class="text-sm text-muted mt-2">Sign in to manage events, orders and the gate.</p>

          <form class="mt-8 space-y-4" @submit.prevent="submit">
            <div>
              <label class="label" for="email">Email</label>
              <input
                id="email"
                v-model.trim="form.email"
                type="email"
                required
                autocomplete="email"
                placeholder="you@organization.com"
                class="input !py-3.5"
              />
            </div>

            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="label !mb-0" for="password">Password</label>
                <NuxtLink to="/admin/forgot-password" class="text-[11px] font-semibold text-forest hover:underline">
                  Forgot password?
                </NuxtLink>
              </div>
              <div class="relative">
                <input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  autocomplete="current-password"
                  placeholder="••••••••"
                  class="input !py-3.5 !pr-12"
                />
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 px-4 text-muted hover:text-ink"
                  :aria-label="showPassword ? 'Hide password' : 'Show password'"
                  @click="showPassword = !showPassword"
                >
                  <EyeOff v-if="showPassword" class="w-4 h-4" />
                  <Eye v-else class="w-4 h-4" />
                </button>
              </div>
            </div>

            <p v-if="error" class="text-[12.5px] font-medium text-coral bg-coral/10 border border-coral/20 rounded-lg px-3.5 py-2.5 flex items-start gap-2">
              <AlertCircle class="w-4 h-4 shrink-0 mt-0.5" /> {{ error }}
            </p>

            <button type="submit" class="btn-primary w-full !py-3.5" :disabled="loading">
              <span v-if="loading" class="w-4 h-4 border-2 border-paper/40 border-t-paper rounded-full animate-spin" />
              {{ loading ? 'Signing in…' : 'Sign in' }}
              <ArrowRight v-if="!loading" class="w-4 h-4" />
            </button>
          </form>

          <p class="text-xs text-muted mt-6">
            New organizer?
            <NuxtLink to="/admin/signup" class="font-semibold text-forest hover:underline">Create an account</NuxtLink>
          </p>
        </template>

        <!-- OTP -->
        <template v-else>
          <h1 class="font-display text-3xl font-semibold text-ink">Verify it’s you.</h1>
          <p class="text-sm text-muted mt-2">We sent a 6-digit code to {{ form.email }}.</p>

          <form class="mt-8 space-y-4" @submit.prevent="submitOtp">
            <div>
              <label class="label">6-digit code</label>
              <input
                v-model.trim="otp"
                inputmode="numeric"
                maxlength="6"
                autocomplete="one-time-code"
                placeholder="000000"
                class="input !py-4 text-center mono !text-2xl tracking-[0.5em]"
              />
            </div>
            <p v-if="error" class="field-error">{{ error }}</p>
            <button type="submit" class="btn-primary w-full !py-3.5" :disabled="loading || otp.length !== 6">
              {{ loading ? 'Verifying…' : 'Verify & continue' }}
            </button>
            <button type="button" class="btn-ghost w-full" @click="otpRequired = false">Back to sign in</button>
          </form>
        </template>

        <div class="mt-10 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
          <span class="flex items-center gap-1.5"><ShieldCheck class="w-3.5 h-3.5" /> Encrypted</span>
          <span class="flex items-center gap-1.5"><Lock class="w-3.5 h-3.5" /> Role-based access</span>
        </div>
      </div>
    </div>

    <!-- ============ BRAND PANEL ============ -->
    <aside class="hidden lg:flex relative overflow-hidden bg-ink">
      <div class="absolute inset-0 bg-grid opacity-[0.12]" />
      <div class="absolute -bottom-40 -right-20 w-[520px] h-[520px] rounded-full bg-lime/15 blur-[130px]" />
      <div class="relative flex flex-col justify-between p-12 xl:p-16 w-full">
        <div class="flex items-center justify-between">
          <span class="chip-ink !bg-white/10 !text-paper !border-white/15">Organizer console</span>
          <span class="text-[10px] font-bold uppercase tracking-[0.18em] text-paper/40">Ticketr / 2026</span>
        </div>

        <div class="max-w-md">
          <h2 class="font-display text-[2.7rem] leading-[1.02] font-semibold text-paper tracking-[-0.035em]">
            Run the room.<br />
            <span class="text-lime">Keep the record.</span>
          </h2>
          <p class="text-sm text-paper/60 mt-5 leading-relaxed">
            Live sales, honest inventory and a gate that refuses duplicate passes. Everything reconciled without a spreadsheet.
          </p>

          <div class="mt-8 grid grid-cols-2 gap-3">
            <div v-for="item in features" :key="item.label" class="rounded-xl border border-white/10 bg-white/[0.05] p-4">
              <component :is="item.icon" class="w-4 h-4 text-lime" />
              <p class="text-[12px] font-semibold text-paper mt-2">{{ item.label }}</p>
              <p class="text-[10.5px] text-paper/45 mt-0.5">{{ item.body }}</p>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3 text-[11px] text-paper/40">
          <span class="w-2 h-2 rounded-full bg-lime animate-pulse" />
          All systems operational · Ticketr trust layer
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle, ArrowRight, Eye, EyeOff, Lock, ScanLine, ShieldCheck, Ticket, RefreshCcw } from 'lucide-vue-next';

definePageMeta({ layout: false });

const route = useRoute();
const config = useRuntimeConfig();
const { login } = useAuth();

const form = reactive({ email: '', password: '' });
const loading = ref(false);
const error = ref('');
const showPassword = ref(false);
const otpRequired = ref(false);
const otp = ref('');
const otpEmail = ref('');

const features = [
  { icon: ScanLine, label: 'Atomic gate scans', body: 'First scan wins, always' },
  { icon: ShieldCheck, label: 'Verified money', body: 'Bank-ref dedupe built in' },
  { icon: RefreshCcw, label: 'Live inventory', body: 'Holds, couples, tables' },
  { icon: Ticket, label: 'One ledger', body: 'Sales, fees, payouts' },
];

function redirectTarget(role: string): string {
  const requested = typeof route.query.redirect === 'string' ? route.query.redirect : '';
  if (requested.startsWith('/admin/')) {
    if (role === 'STAFF' && !requested.startsWith('/admin/scanner')) return '/admin/scanner';
    return requested;
  }
  if (role === 'STAFF') return '/admin/scanner';
  if (role === 'SUPER_ADMIN') return `${(config.public as any).superAdminUrl || '/admin/dashboard'}`;
  return '/admin/dashboard';
}

async function submit() {
  error.value = '';
  loading.value = true;
  try {
    const user = await login(form.email, form.password);
    if (!['ORGANIZER', 'SUPER_ADMIN', 'STAFF'].includes(user.role)) {
      error.value = 'This account does not have organizer access. Ask your organizer to invite you.';
      return;
    }
    await navigateTo(redirectTarget(user.role), { external: user.role === 'SUPER_ADMIN' && !!(config.public as any).superAdminUrl });
  } catch (err: any) {
    error.value = errorMessage(err, 'Invalid email or password.');
  } finally {
    loading.value = false;
  }
}

async function submitOtp() {
  error.value = '';
  loading.value = true;
  try {
    const data = await apiRequest<any>('/auth/verify-login-otp', {
      method: 'POST',
      auth: false,
      body: { email: otpEmail.value, otp: otp.value },
    });
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ticketr_admin_token', data.accessToken);
      localStorage.setItem('ticketr_admin_user', JSON.stringify(data.user));
    }
    await navigateTo(redirectTarget(data.user.role));
  } catch (err: any) {
    error.value = errorMessage(err, 'That code is not valid.');
  } finally {
    loading.value = false;
  }
}

useSeoMeta({ title: 'Organizer sign in | Ticketr', robots: 'noindex, nofollow' });

onMounted(() => {
  const { hydrate } = useAuth();
  hydrate();
  if (route.query.otp === '1') otpRequired.value = true;
});
</script>
