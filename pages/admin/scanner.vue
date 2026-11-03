<template>
  <div class="max-w-5xl mx-auto space-y-4">
    <!-- Session header -->
    <section class="surface p-4 sm:p-5">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div class="flex-1 min-w-0">
          <label class="label" for="scanner-event">Scanning for</label>
          <select id="scanner-event" v-model="eventId" class="input !py-2.5" @change="onEventChange">
            <option value="">Select the event at this gate…</option>
            <option v-for="event in events" :key="event._id" :value="event._id">
              {{ event.title }} — {{ formatDate(event.startDate, { day: 'numeric', month: 'short' }) }}
            </option>
          </select>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <span class="chip" :class="online ? 'chip-soft' : 'chip-coral'">
            <span class="status-dot" :class="online ? 'bg-forest' : 'bg-coral'" />
            {{ online ? 'Online' : 'Offline' }}
          </span>
          <button class="btn-secondary btn-sm" type="button" @click="loadEvents">
            <RefreshCcw class="w-3.5 h-3.5" /> Events
          </button>
        </div>
      </div>

      <div v-if="!eventId" class="mt-3 rounded-xl bg-amber-50 border border-amber-200 px-3.5 py-2.5 text-[12px] text-amber-900 font-medium">
        Choose the event first. This scopes every scan to your organization and prevents scanning another organizer’s tickets.
      </div>

      <div v-if="queue.length" class="mt-3 rounded-xl bg-paper border border-line px-3.5 py-2.5 flex items-center justify-between gap-3">
        <p class="text-[12px] text-ink font-medium">
          {{ queue.length }} scan{{ queue.length === 1 ? '' : 's' }} waiting to sync (offline queue).
        </p>
        <button class="btn-primary btn-sm" type="button" :disabled="syncing" @click="syncQueue">
          {{ syncing ? 'Syncing…' : 'Sync now' }}
        </button>
      </div>
    </section>

    <div class="grid lg:grid-cols-[1.1fr_1fr] gap-4 items-start">
      <!-- Scanner -->
      <section class="surface overflow-hidden">
        <div class="relative bg-ink aspect-square sm:aspect-[4/3]">
          <QrcodeStream
            v-if="cameraOn"
            :constraints="{ facingMode: facingMode }"
            :paused="paused"
            class="w-full h-full object-cover"
            @detect="onDetect"
            @error="onCameraError"
            @camera-on="cameraReady = true"
          />

          <div v-else class="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <span class="w-16 h-16 rounded-2xl bg-white/[0.07] border border-white/10 flex items-center justify-center">
              <ScanLine class="w-7 h-7 text-lime" />
            </span>
            <p class="text-paper font-semibold mt-4">Camera is off</p>
            <p class="text-paper/50 text-xs mt-1 max-w-xs">Turn on the camera or paste a ticket code below. Works over HTTPS or localhost.</p>
            <button class="btn-accent btn-sm mt-4" type="button" @click="cameraOn = true">
              <Camera class="w-4 h-4" /> Start camera
            </button>
          </div>

          <!-- frame -->
          <div v-if="cameraOn" class="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div class="relative w-[62%] aspect-square max-w-[280px]">
              <span class="absolute inset-0 border-2 border-lime/80 rounded-2xl" />
              <span class="absolute left-0 top-0 w-8 h-8 border-t-4 border-l-4 border-lime rounded-tl-xl" />
              <span class="absolute right-0 top-0 w-8 h-8 border-t-4 border-r-4 border-lime rounded-tr-xl" />
              <span class="absolute left-0 bottom-0 w-8 h-8 border-b-4 border-l-4 border-lime rounded-bl-xl" />
              <span class="absolute right-0 bottom-0 w-8 h-8 border-b-4 border-r-4 border-lime rounded-br-xl" />
              <span v-if="paused" class="absolute inset-0 flex items-center justify-center bg-ink/60 rounded-2xl">
                <span class="text-paper text-xs font-semibold">Processing…</span>
              </span>
            </div>
          </div>

          <div v-if="cameraOn" class="absolute top-3 right-3 flex gap-1.5">
            <button class="w-9 h-9 rounded-full bg-white/90 text-ink flex items-center justify-center" title="Switch camera" @click="toggleCamera">
              <SwitchCamera class="w-4 h-4" />
            </button>
            <button class="w-9 h-9 rounded-full bg-white/90 text-ink flex items-center justify-center" title="Stop camera" @click="cameraOn = false">
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div class="p-4 space-y-3">
          <form class="flex gap-2" @submit.prevent="verifyManual">
            <input
              v-model.trim="manualCode"
              type="text"
              placeholder="Paste QR hash or ticket code"
              class="input mono !py-2.5"
              autocomplete="off"
              :disabled="!eventId || verifying"
            />
            <button type="submit" class="btn-primary btn-sm shrink-0" :disabled="!eventId || !manualCode || verifying">
              {{ verifying ? 'Checking…' : 'Check' }}
            </button>
          </form>

          <label class="flex items-center justify-between gap-3 text-[12px] font-medium text-ink cursor-pointer rounded-xl bg-paper border border-line px-3 py-2.5">
            <span>
              Commit check-in
              <span class="block text-[10.5px] text-muted">Off = validate only, without admitting.</span>
            </span>
            <input v-model="commit" type="checkbox" class="w-4 h-4 rounded border-line text-forest focus:ring-forest" />
          </label>

          <div class="grid grid-cols-3 gap-2 text-center">
            <div class="rounded-xl bg-paper border border-line py-2">
              <p class="num text-xl font-bold text-ink">{{ session.admitted }}</p>
              <p class="text-[9px] font-bold uppercase tracking-[0.1em] text-muted">Admitted</p>
            </div>
            <div class="rounded-xl bg-paper border border-line py-2">
              <p class="num text-xl font-bold text-ink">{{ session.duplicates }}</p>
              <p class="text-[9px] font-bold uppercase tracking-[0.1em] text-muted">Duplicates</p>
            </div>
            <div class="rounded-xl bg-paper border border-line py-2">
              <p class="num text-xl font-bold text-ink">{{ session.rejected }}</p>
              <p class="text-[9px] font-bold uppercase tracking-[0.1em] text-muted">Rejected</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Result -->
      <section class="space-y-4">
        <div v-if="!result" class="surface p-6 sm:p-8 flex flex-col items-center justify-center text-center min-h-[260px]">
          <span class="w-12 h-12 rounded-2xl bg-paper border border-line flex items-center justify-center">
            <TicketCheck class="w-6 h-6 text-muted" />
          </span>
          <p class="font-display text-lg font-semibold text-ink mt-3">Waiting for a ticket</p>
          <p class="text-xs text-muted mt-1 max-w-xs">Scan a pass or paste its code. Every result is recorded against this event.</p>
        </div>

        <div
          v-else
          class="surface overflow-hidden border-2"
          :class="resultTone.border"
        >
          <div class="px-5 py-5 flex items-start gap-4" :class="resultTone.bg">
            <span class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" :class="resultTone.iconWrap">
              <CheckCircle2 v-if="result.valid" class="w-6 h-6" />
              <AlertTriangle v-else-if="result.alreadyCheckedIn" class="w-6 h-6" />
              <XCircle v-else class="w-6 h-6" />
            </span>
            <div class="min-w-0">
              <p class="text-[10px] font-bold uppercase tracking-[0.18em]" :class="resultTone.kicker">{{ resultTone.label }}</p>
              <p class="font-display text-xl font-semibold text-ink leading-tight mt-0.5">{{ result.attendeeName || 'Unnamed attendee' }}</p>
              <p class="text-[12.5px] text-muted mt-1">{{ result.message }}</p>
            </div>
          </div>

          <div class="p-5 grid grid-cols-2 gap-3 text-[12px]">
            <div>
              <p class="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">Ticket</p>
              <p class="mono font-semibold text-ink text-[11.5px] break-all">{{ result.ticketNumber || '—' }}</p>
            </div>
            <div>
              <p class="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">Tier</p>
              <p class="font-semibold text-ink">{{ result.tierName || '—' }}</p>
            </div>
            <div>
              <p class="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">Event</p>
              <p class="font-semibold text-ink truncate">{{ result.eventName || currentEvent?.title || '—' }}</p>
            </div>
            <div>
              <p class="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">Time</p>
              <p class="font-semibold text-ink">{{ result.checkedInAt ? formatTime(result.checkedInAt) : formatTime(new Date()) }}</p>
            </div>
          </div>

          <div class="px-5 pb-5 flex gap-2">
            <button class="btn-primary btn-sm flex-1" type="button" @click="resetResult">Scan next</button>
            <button v-if="result.alreadyCheckedIn" class="btn-ghost btn-sm" type="button" @click="showHistory = true">
              History
            </button>
          </div>
        </div>

        <!-- Recent -->
        <div class="surface overflow-hidden">
          <div class="px-4 py-3 border-b border-line flex items-center justify-between">
            <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">This session</p>
            <span class="text-[10px] text-muted">{{ recent.length }} scan{{ recent.length === 1 ? '' : 's' }}</span>
          </div>
          <div v-if="!recent.length" class="px-4 py-6 text-center text-xs text-muted">No scans yet.</div>
          <div v-else class="max-h-64 overflow-y-auto divide-y divide-line">
            <div v-for="(scan, index) in recent" :key="index" class="px-4 py-2.5 flex items-center gap-2.5">
              <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="scan.valid ? 'bg-forest' : scan.alreadyCheckedIn ? 'bg-amber-500' : 'bg-coral'" />
              <div class="min-w-0 flex-1">
                <p class="text-[12px] font-medium text-ink truncate">{{ scan.attendeeName || scan.message }}</p>
                <p class="mono text-[10px] text-muted truncate">{{ scan.ticketNumber || scan.code }}</p>
              </div>
              <span class="text-[10px] text-muted shrink-0">{{ scan.at }}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  RefreshCcw,
  ScanLine,
  SwitchCamera,
  TicketCheck,
  X,
  XCircle,
} from 'lucide-vue-next';
import { QrcodeStream } from 'vue-qrcode-reader';
import { toast } from 'vue-sonner';

definePageMeta({ layout: 'admin' });

const route = useRoute();
const config = useRuntimeConfig();

const events = ref<any[]>([]);
const eventId = ref(typeof route.query.eventId === 'string' ? route.query.eventId : '');
const cameraOn = ref(false);
const cameraReady = ref(false);
const facingMode = ref<'environment' | 'user'>('environment');
const paused = ref(false);
const manualCode = ref('');
const verifying = ref(false);
const commit = ref(true);
const result = ref<any>(null);
const recent = ref<any[]>([]);
const session = reactive({ admitted: 0, duplicates: 0, rejected: 0 });
const online = ref(true);
const queue = ref<any[]>([]);
const syncing = ref(false);
const lastScan = ref<{ code: string; at: number } | null>(null);
const showHistory = ref(false);

const currentEvent = computed(() => events.value.find((event) => event._id === eventId.value));

const resultTone = computed(() => {
  if (!result.value) return { border: 'border-line', bg: '', iconWrap: '', kicker: '', label: '' };
  if (result.value.valid) {
    return {
      border: 'border-forest/40',
      bg: 'bg-forest/[0.06]',
      iconWrap: 'bg-forest text-lime',
      kicker: 'text-forest',
      label: 'Admit — valid ticket',
    };
  }
  if (result.value.alreadyCheckedIn) {
    return {
      border: 'border-amber-300',
      bg: 'bg-amber-50',
      iconWrap: 'bg-amber-400 text-ink',
      kicker: 'text-amber-700',
      label: 'Refuse — already scanned',
    };
  }
  return {
    border: 'border-coral/40',
    bg: 'bg-coral/5',
    iconWrap: 'bg-coral text-white',
    kicker: 'text-coral',
    label: 'Refuse — invalid',
  };
});

function beep(ok: boolean) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = ok ? 880 : 220;
    gain.gain.value = 0.06;
    osc.start();
    setTimeout(() => {
      osc.stop();
      ctx.close();
    }, ok ? 120 : 280);
  } catch {
    /* audio optional */
  }
  if (navigator.vibrate) navigator.vibrate(ok ? 40 : [90, 60, 90]);
}

async function loadEvents() {
  try {
    const data = await apiRequest<any>('/events/tenant?limit=100');
    events.value = data?.data || [];
    if (!eventId.value && events.value.length === 1) eventId.value = events.value[0]._id;
    if (eventId.value && !events.value.some((event) => event._id === eventId.value)) eventId.value = '';
  } catch (err) {
    toast.error(errorMessage(err, 'Could not load your events.'));
  }
}

function onEventChange() {
  result.value = null;
  recent.value = [];
  session.admitted = 0;
  session.duplicates = 0;
  session.rejected = 0;
  if (typeof window !== 'undefined') {
    window.history.replaceState({}, '', `/admin/scanner?eventId=${eventId.value}`);
  }
}

function toggleCamera() {
  facingMode.value = facingMode.value === 'environment' ? 'user' : 'environment';
}

function onCameraError(error: any) {
  const name = error?.name || '';
  if (name === 'NotAllowedError') toast.error('Camera permission denied. Use the manual code input.');
  else if (name === 'NotFoundError') toast.error('No camera found on this device.');
  else toast.error('Camera could not start. Use the manual code input.');
  cameraOn.value = false;
}

async function onDetect(detectedCodes: any[]) {
  if (!detectedCodes?.length || paused.value || verifying.value) return;
  const code = String(detectedCodes[0].rawValue || '').trim();
  if (!code) return;
  if (lastScan.value && lastScan.value.code === code && Date.now() - lastScan.value.at < 3000) return;
  lastScan.value = { code, at: Date.now() };
  paused.value = true;
  await verify(code);
  setTimeout(() => {
    paused.value = false;
  }, 1200);
}

async function verifyManual() {
  if (!manualCode.value) return;
  await verify(manualCode.value);
  manualCode.value = '';
}

async function verify(code: string) {
  if (!eventId.value) {
    toast.error('Select the event before scanning.');
    return;
  }
  verifying.value = true;
  result.value = null;
  try {
    const data = await apiRequest<any>('/tickets/verify-scan', {
      method: 'POST',
      body: { qrCodeHash: code, eventId: eventId.value, commit: commit.value },
    });
    result.value = data;
    recordSession(data, code);
    beep(!!data.valid);
  } catch (err: any) {
    if (err?.status === 0) {
      queue.value.push({ code, eventId: eventId.value, commit: commit.value, at: new Date().toISOString() });
      persistQueue();
      result.value = {
        valid: false,
        message: 'Network unavailable. Scan saved locally — it will sync automatically.',
        attendeeName: 'Offline scan queued',
      };
      return;
    }
    result.value = {
      valid: false,
      message: errorMessage(err),
    };
    session.rejected++;
    beep(false);
    recent.value.unshift({ valid: false, message: result.value.message, code, at: new Date().toLocaleTimeString() });
    persistRecent();
  } finally {
    verifying.value = false;
  }
}

function recordSession(data: any, code: string) {
  if (data.valid) session.admitted++;
  else if (data.alreadyCheckedIn) session.duplicates++;
  else session.rejected++;
  recent.value.unshift({
    valid: data.valid,
    alreadyCheckedIn: data.alreadyCheckedIn,
    attendeeName: data.attendeeName,
    ticketNumber: data.ticketNumber,
    message: data.message,
    code,
    at: new Date().toLocaleTimeString(),
  });
  recent.value = recent.value.slice(0, 30);
  persistRecent();
}

function resetResult() {
  result.value = null;
  lastScan.value = null;
}

function persistRecent() {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(`ticketr_scanner_recent_${eventId.value}`, JSON.stringify(recent.value));
}
function persistQueue() {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem('ticketr_scanner_queue', JSON.stringify(queue.value));
}

async function syncQueue() {
  if (!queue.value.length || syncing.value) return;
  syncing.value = true;
  const pending = [...queue.value];
  const failed: any[] = [];
  for (const item of pending) {
    try {
      const data = await apiRequest<any>('/tickets/verify-scan', {
        method: 'POST',
        body: { qrCodeHash: item.code, eventId: item.eventId, commit: item.commit },
      });
      recordSession(data, item.code);
    } catch (err: any) {
      if (err?.status === 0) {
        failed.push(item);
      } else {
        recordSession({ valid: false, message: errorMessage(err) }, item.code);
      }
    }
  }
  queue.value = failed;
  persistQueue();
  syncing.value = false;
  toast[queue.value.length ? 'error' : 'success'](
    queue.value.length ? `${queue.value.length} scans still pending` : 'All offline scans synced',
  );
}

function handleOnline() {
  online.value = true;
  if (queue.value.length) syncQueue();
}

onMounted(() => {
  loadEvents();
  online.value = navigator.onLine;
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', () => (online.value = false));
  try {
    queue.value = JSON.parse(localStorage.getItem('ticketr_scanner_queue') || '[]');
    if (eventId.value) {
      recent.value = JSON.parse(localStorage.getItem(`ticketr_scanner_recent_${eventId.value}`) || '[]');
    }
  } catch {
    queue.value = [];
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('online', handleOnline);
});

useSeoMeta({ title: 'Gate scanner', robots: 'noindex, nofollow' });
void config;
</script>
