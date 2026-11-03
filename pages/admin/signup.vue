<template>
  <div class="min-h-screen grid lg:grid-cols-[1.05fr_1fr] bg-paper">
    <div class="flex flex-col justify-center px-5 sm:px-10 lg:px-16 xl:px-24 py-10">
      <div class="w-full max-w-md mx-auto">
        <NuxtLink to="/" class="flex items-center gap-2.5 mb-8">
          <span class="w-9 h-9 rounded-xl bg-ink flex items-center justify-center">
            <Ticket class="w-[18px] h-[18px] text-lime" />
          </span>
          <span class="font-display text-[22px] font-semibold tracking-[-0.04em] text-ink">ticketr.</span>
        </NuxtLink>

        <h1 class="font-display text-3xl sm:text-4xl font-semibold text-ink tracking-[-0.03em]">Start selling.</h1>
        <p class="text-sm text-muted mt-2">Create your organizer account and publish your first event.</p>

        <form class="mt-7 space-y-3.5" @submit.prevent="submit">
          <div>
            <label class="label" for="name">Your name</label>
            <input id="name" v-model.trim="form.name" type="text" autocomplete="name" class="input !py-3" placeholder="Ada Obi" />
          </div>
          <div>
            <label class="label" for="organization">Organization</label>
            <input id="organization" v-model.trim="form.organizationName" type="text" class="input !py-3" placeholder="Faculty of Science, UNILAG" @input="syncSlug" />
          </div>
          <div>
            <label class="label" for="slug">Storefront handle</label>
            <div class="flex items-center rounded-xl border border-line bg-paper px-3">
              <input id="slug" v-model.trim="form.tenantSlug" type="text" class="flex-1 bg-transparent border-0 py-3 text-sm mono text-ink focus:outline-none focus:ring-0" placeholder="science-unilag" @input="slugEdited = true" />
              <span class="text-[11px] text-muted shrink-0">.ticketr.org</span>
            </div>
          </div>
          <div>
            <label class="label" for="email">Work email</label>
            <input id="email" v-model.trim="form.email" type="email" autocomplete="email" class="input !py-3" placeholder="you@organization.com" />
          </div>
          <div>
            <label class="label" for="password">Password</label>
            <input id="password" v-model="form.password" type="password" autocomplete="new-password" class="input !py-3" placeholder="At least 8 characters with a number" />
          </div>
          <div>
            <label class="label" for="confirm">Confirm password</label>
            <input id="confirm" v-model="form.confirm" type="password" autocomplete="new-password" class="input !py-3" />
          </div>

          <label class="flex items-start gap-2 text-[11.5px] text-muted leading-relaxed cursor-pointer pt-1">
            <input v-model="form.terms" type="checkbox" class="mt-0.5 w-3.5 h-3.5 rounded border-line text-forest focus:ring-forest" />
            <span>I agree to the <NuxtLink to="/legal/terms" class="text-ink underline decoration-lime decoration-2 underline-offset-2">organizer terms</NuxtLink> and understand fees are disclosed before payment.</span>
          </label>

          <p v-if="error" class="text-[12.5px] font-medium text-coral bg-coral/10 border border-coral/20 rounded-lg px-3.5 py-2.5">{{ error }}</p>

          <button type="submit" class="btn-primary w-full !py-3.5" :disabled="loading || !form.terms">
            <span v-if="loading" class="w-4 h-4 border-2 border-paper/40 border-t-paper rounded-full animate-spin" />
            {{ loading ? 'Creating account…' : 'Create organizer account' }}
          </button>
        </form>

        <p class="text-xs text-muted mt-5">
          Already have an account?
          <NuxtLink to="/admin/login" class="font-semibold text-forest hover:underline">Sign in</NuxtLink>
        </p>
      </div>
    </div>

    <aside class="hidden lg:flex relative overflow-hidden bg-ink">
      <div class="absolute inset-0 bg-grid opacity-[0.12]" />
      <div class="absolute -bottom-40 -right-20 w-[520px] h-[520px] rounded-full bg-lime/15 blur-[130px]" />
      <div class="relative flex flex-col justify-center p-12 xl:p-16 w-full">
        <span class="chip-ink !bg-white/10 !text-paper !border-white/15 w-fit">Why organizers switch</span>
        <h2 class="font-display text-[2.6rem] leading-[1.03] font-semibold text-paper tracking-[-0.035em] mt-5">
          Fewer disputes.<br />
          <span class="text-lime">Cleaner books.</span>
        </h2>
        <ul class="mt-7 space-y-3.5 max-w-sm">
          <li v-for="item in points" :key="item" class="flex items-start gap-3 text-[13px] text-paper/70">
            <span class="w-5 h-5 rounded-full bg-lime text-ink flex items-center justify-center shrink-0 mt-0.5">
              <Check class="w-3 h-3" />
            </span>
            {{ item }}
          </li>
        </ul>
        <div class="mt-8 rounded-2xl border border-white/10 bg-white/[0.05] p-4 max-w-sm">
          <p class="text-[11px] text-paper/45 uppercase tracking-[0.14em] font-bold">Pricing</p>
          <p class="text-paper text-sm mt-1 leading-relaxed">
            No setup fee. A flat platform fee per ticket is shown to buyers at checkout — never hidden at the gateway.
          </p>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { Check, Ticket } from 'lucide-vue-next';

definePageMeta({ layout: false });

const { hydrate } = useAuth();

const form = reactive({
  name: '',
  organizationName: '',
  tenantSlug: '',
  email: '',
  password: '',
  confirm: '',
  terms: false,
});

const loading = ref(false);
const error = ref('');
const slugEdited = ref(false);

const points = [
  'Live inventory that counts holds, couples and tables',
  'Bank-transfer approvals with duplicate-reference protection',
  'Single-use QR codes and an atomic gate scanner',
  'Revenue, fees and net payout reconciled per order',
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

function syncSlug() {
  if (!slugEdited.value) form.tenantSlug = slugify(form.organizationName);
}

async function submit() {
  error.value = '';
  if (form.name.length < 2) return (error.value = 'Enter your full name.');
  if (form.organizationName.length < 2) return (error.value = 'Enter your organization name.');
  if (form.tenantSlug.length < 3) return (error.value = 'Choose a storefront handle of at least 3 characters.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) return (error.value = 'Enter a valid email address.');
  if (form.password.length < 8 || !/[a-zA-Z]/.test(form.password) || !/[0-9]/.test(form.password)) {
    return (error.value = 'Use at least 8 characters with a letter and a number.');
  }
  if (form.password !== form.confirm) return (error.value = 'The passwords do not match.');

  loading.value = true;
  try {
    const data = await apiRequest<any>('/auth/register', {
      method: 'POST',
      auth: false,
      body: {
        name: form.name,
        email: form.email,
        password: form.password,
        role: 'ORGANIZER',
        tenantSlug: form.tenantSlug,
        organizationName: form.organizationName,
      },
    });
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ticketr_admin_token', data.accessToken);
      localStorage.setItem('ticketr_admin_user', JSON.stringify(data.user));
    }
    hydrate();
    await navigateTo('/admin/dashboard');
  } catch (err) {
    error.value = errorMessage(err);
  } finally {
    loading.value = false;
  }
}

useSeoMeta({ title: 'Create an organizer account | Ticketr', robots: 'noindex, nofollow' });
</script>
