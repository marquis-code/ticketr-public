<template>
  <div class="min-h-screen bg-paper flex items-center justify-center px-5 py-10">
    <div class="w-full max-w-md">
      <NuxtLink to="/admin/scanner" class="flex items-center gap-2 text-[12px] font-semibold text-muted hover:text-ink mb-4">
        <ArrowLeft class="w-3.5 h-3.5" /> Back to scanner
      </NuxtLink>

      <div class="surface overflow-hidden">
        <div class="bg-ink text-paper px-5 py-5">
          <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-paper/50">Gate verification</p>
          <h1 class="font-display text-xl font-semibold mt-1">{{ state.user?.name || 'Gate staff' }}</h1>
          <p class="text-[11px] text-paper/50 mono truncate">{{ hash }}</p>
        </div>

        <!-- Not signed in -->
        <div v-if="!authed" class="p-6 text-center">
          <span class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-3">
            <Lock class="w-6 h-6" />
          </span>
          <p class="font-display text-lg font-semibold text-ink">Sign in to verify</p>
          <p class="text-sm text-muted mt-1">Ticket checks require a gate staff or organizer session.</p>
          <NuxtLink :to="`/admin/login?redirect=${encodeURIComponent(`/admin/verify/${hash}`)}`" class="btn-primary mt-4 w-full">Sign in</NuxtLink>
        </div>

        <!-- Loading -->
        <div v-else-if="loading" class="p-8 text-center">
          <div class="w-9 h-9 mx-auto rounded-full border-4 border-line border-t-forest animate-spin" />
          <p class="text-sm text-muted mt-3">Checking ticket…</p>
        </div>

        <!-- Result -->
        <div v-else class="p-5 space-y-4">
          <div class="rounded-xl border p-4 flex items-start gap-3" :class="tone.border + ' ' + tone.bg">
            <span class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" :class="tone.icon">
              <CheckCircle2 v-if="result?.valid" class="w-5 h-5" />
              <AlertTriangle v-else-if="result?.alreadyCheckedIn" class="w-5 h-5" />
              <XCircle v-else class="w-5 h-5" />
            </span>
            <div class="min-w-0">
              <p class="text-[10px] font-bold uppercase tracking-[0.14em]" :class="tone.kicker">{{ tone.label }}</p>
              <p class="font-display text-lg font-semibold text-ink leading-tight">{{ result?.attendeeName || 'Ticket' }}</p>
              <p class="text-[12px] text-muted mt-0.5">{{ result?.message }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3 text-[12px]">
            <div>
              <p class="text-[9px] font-bold uppercase tracking-[0.1em] text-muted">Ticket</p>
              <p class="mono font-semibold text-ink break-all">{{ result?.ticketNumber || '—' }}</p>
            </div>
            <div>
              <p class="text-[9px] font-bold uppercase tracking-[0.1em] text-muted">Tier</p>
              <p class="font-semibold text-ink">{{ result?.tierName || '—' }}</p>
            </div>
            <div class="col-span-2">
              <p class="text-[9px] font-bold uppercase tracking-[0.1em] text-muted">Event</p>
              <p class="font-semibold text-ink">{{ result?.eventName || '—' }}</p>
            </div>
          </div>

          <p v-if="error" class="field-error">{{ error }}</p>

          <button
            v-if="result?.valid"
            class="btn-primary w-full !py-3.5"
            type="button"
            :disabled="admitting"
            @click="admit"
          >
            {{ admitting ? 'Admitting…' : 'Admit attendee' }}
          </button>
          <NuxtLink to="/admin/scanner" class="btn-secondary w-full">Open full scanner</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertTriangle, ArrowLeft, CheckCircle2, Lock, XCircle } from 'lucide-vue-next';
import { toast } from 'vue-sonner';

definePageMeta({ layout: false });

const route = useRoute();
const { state, hydrate } = useAuth();
const hash = computed(() => String(route.params.hash || ''));
const authed = computed(() => !!state.token);
const loading = ref(true);
const admitting = ref(false);
const result = ref<any>(null);
const error = ref('');

const tone = computed(() => {
  if (result.value?.valid) {
    return { border: 'border-forest/30', bg: 'bg-forest/[0.06]', icon: 'bg-forest text-lime', kicker: 'text-forest', label: 'Ready to admit' };
  }
  if (result.value?.alreadyCheckedIn) {
    return { border: 'border-amber-300', bg: 'bg-amber-50', icon: 'bg-amber-400 text-ink', kicker: 'text-amber-700', label: 'Already scanned' };
  }
  return { border: 'border-coral/30', bg: 'bg-coral/5', icon: 'bg-coral text-white', kicker: 'text-coral', label: 'Do not admit' };
});

async function verify(commit: boolean) {
  const data = await apiRequest<any>('/tickets/verify-scan', {
    method: 'POST',
    body: { qrCodeHash: hash.value, commit },
  });
  result.value = data;
  return data;
}

async function admit() {
  admitting.value = true;
  error.value = '';
  try {
    await verify(true);
    toast.success('Attendee admitted');
    await navigateTo('/admin/scanner');
  } catch (err) {
    error.value = errorMessage(err);
  } finally {
    admitting.value = false;
  }
}

onMounted(async () => {
  hydrate();
  if (!authed.value) {
    loading.value = false;
    return;
  }
  try {
    await verify(false);
  } catch (err) {
    result.value = { valid: false, message: errorMessage(err) };
  } finally {
    loading.value = false;
  }
});

useSeoMeta({ title: 'Verify ticket | Ticketr', robots: 'noindex, nofollow' });
</script>
