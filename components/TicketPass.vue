<template>
  <article
    class="relative overflow-hidden rounded-[20px] border border-line bg-white shadow-card"
    :class="ticket.status === 'CHECKED_IN' ? 'opacity-90' : ''"
  >
    <div class="grid grid-cols-1 sm:grid-cols-[1fr_190px]">
      <!-- Main stub -->
      <div class="p-5 sm:p-6 flex flex-col">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">{{ ticket.tier || 'Admission' }}</p>
            <h3 class="font-display text-xl font-semibold text-ink leading-tight mt-1 line-clamp-2">
              {{ event?.title || 'Event pass' }}
            </h3>
          </div>
          <UiBadge :value="ticket.status" dot class="shrink-0" />
        </div>

        <div class="mt-4 grid grid-cols-2 gap-3 text-[13px]">
          <div class="min-w-0">
            <p class="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Attendee</p>
            <p class="font-semibold text-ink truncate">{{ cleanAttendeeName(ticket.attendeeName) || 'Guest' }}</p>
          </div>
          <div class="min-w-0">
            <p class="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Venue</p>
            <p class="font-semibold text-ink truncate">{{ event?.location || '—' }}</p>
          </div>
          <div>
            <p class="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Date</p>
            <p class="font-semibold text-ink">{{ formatDate(event?.startDate, { weekday: 'short', day: 'numeric', month: 'short' }) }}</p>
          </div>
          <div>
            <p class="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Time</p>
            <p class="font-semibold text-ink">{{ formatTime(event?.startDate) }}</p>
          </div>
        </div>

        <div class="mt-4 rounded-xl bg-paper border border-line px-3.5 py-2.5 flex items-center justify-between gap-3">
          <div>
            <p class="text-[9px] font-bold uppercase tracking-[0.18em] text-muted">Ticket code</p>
            <p class="mono text-[13px] font-bold text-ink tracking-wide">{{ ticket.ticketNumber }}</p>
          </div>
          <button
            type="button"
            class="p-2 rounded-lg text-muted hover:text-ink hover:bg-white transition"
            title="Copy ticket code"
            @click="copy"
          >
            <Check v-if="copied" class="w-4 h-4 text-forest" />
            <Copy v-else class="w-4 h-4" />
          </button>
        </div>

        <div class="mt-4 flex flex-wrap items-center gap-2">
          <slot name="actions">
            <button
              v-if="ticket.status === 'ISSUED'"
              type="button"
              class="btn-secondary btn-sm"
              @click="$emit('transfer')"
            >
              <ArrowLeftRight class="w-3.5 h-3.5" /> Transfer
            </button>
            <button
              v-if="ticket.isResaleable !== false && ticket.status === 'ISSUED'"
              type="button"
              class="btn-ghost btn-sm"
              @click="$emit('resale')"
            >
              <Tag class="w-3.5 h-3.5" /> Resell
            </button>
            <a
              v-if="walletToken && ticket.hasPdfTemplate !== false && ticket.status !== 'CANCELLED'"
              :href="`${apiBase()}/tickets/${ticket.id || ticket._id}/pdf?token=${walletToken}`"
              target="_blank"
              rel="noopener"
              class="btn-ghost btn-sm"
            >
              <Download class="w-3.5 h-3.5" /> PDF
            </a>
          </slot>
        </div>
      </div>

      <!-- QR stub -->
      <div class="relative border-t sm:border-t-0 sm:border-l border-dashed border-line bg-paper/60 p-5 flex flex-col items-center justify-center gap-3">
        <div class="bg-white p-2.5 rounded-xl border border-line">
          <QrCode :value="ticket.qrCodeHash" :size="128" />
        </div>
        <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-muted text-center leading-relaxed">
          Scan at the gate
        </p>
        <p v-if="ticket.checkedInAt" class="text-[10px] font-semibold text-forest text-center">
          Checked in {{ formatTime(ticket.checkedInAt) }}
        </p>
      </div>
    </div>

    <div v-if="ticket.status === 'CHECKED_IN'" class="absolute inset-0 bg-white/45 pointer-events-none flex items-center justify-center">
      <span class="rotate-[-8deg] border-2 border-forest text-forest font-display font-bold uppercase tracking-[0.2em] text-sm px-4 py-2 rounded-lg bg-white/80">
        Used
      </span>
    </div>
    <div v-else-if="ticket.status === 'CANCELLED'" class="absolute inset-0 bg-white/60 pointer-events-none flex items-center justify-center">
      <span class="rotate-[-6deg] border-2 border-coral text-coral font-display font-bold uppercase tracking-[0.18em] text-sm px-4 py-2 rounded-lg bg-white/85">
        Cancelled
      </span>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ArrowLeftRight, Check, Copy, Download, Tag } from 'lucide-vue-next';

const props = defineProps<{
  ticket: any;
  event?: any;
  walletToken?: string;
}>();

defineEmits<{ transfer: []; resale: [] }>();

const copied = ref(false);

async function copy() {
  const ok = await copyText(props.ticket.ticketNumber);
  if (!ok) return;
  copied.value = true;
  setTimeout(() => (copied.value = false), 1800);
}
</script>
