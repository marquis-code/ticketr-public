<template>
  <div class="space-y-4">
    <section class="surface p-4 sm:p-5">
      <div class="flex flex-col lg:flex-row lg:items-end gap-3">
        <div class="flex-1 min-w-0">
          <label class="label">Action</label>
          <input v-model="filters.action" type="search" placeholder="e.g. ORDER_FORCE_APPROVED_SUCCESS" class="input !py-2.5" />
        </div>
        <div class="flex-1 min-w-0">
          <label class="label">Entity contains</label>
          <input v-model="filters.entity" type="search" placeholder="/api/v1/orders/…" class="input !py-2.5" />
        </div>
        <div>
          <label class="label">From</label>
          <input v-model="filters.startDate" type="date" class="input !py-2.5" />
        </div>
        <div>
          <label class="label">To</label>
          <input v-model="filters.endDate" type="date" class="input !py-2.5" />
        </div>
        <button class="btn-primary btn-sm shrink-0" type="button" @click="apply">Apply</button>
        <button class="btn-ghost btn-sm shrink-0" type="button" @click="clear">Clear</button>
      </div>
    </section>

    <div v-if="error" class="surface p-4 border-coral/30 bg-coral/5 flex items-start gap-3">
      <AlertTriangle class="w-5 h-5 text-coral shrink-0 mt-0.5" />
      <p class="text-sm text-ink flex-1">{{ error }}</p>
      <button class="btn-secondary btn-sm" type="button" @click="load">Retry</button>
    </div>

    <section class="table-wrap">
      <div v-if="loading" class="p-5 space-y-2.5">
        <div v-for="n in 8" :key="n" class="skeleton h-10" />
      </div>
      <UiEmpty
        v-else-if="!logs.length"
        title="No audit entries"
        message="Actions appear here as your team works. Records are retained for 90 days."
        class="!py-14"
      >
        <template #icon><ShieldCheck class="w-6 h-6" /></template>
      </UiEmpty>
      <table v-else class="table min-w-[820px]">
        <thead>
          <tr>
            <th>Time</th>
            <th>Action</th>
            <th>Actor</th>
            <th>Entity</th>
            <th class="text-right">Details</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in logs" :key="log._id">
            <td class="whitespace-nowrap">
              <p class="text-[12px] font-medium text-ink">{{ formatDateTime(log.createdAt) }}</p>
              <p class="text-[10px] text-muted">{{ relativeTime(log.createdAt) }}</p>
            </td>
            <td class="max-w-[260px]">
              <span class="chip-muted !text-[9px] !normal-case !tracking-normal inline-block max-w-full truncate align-middle">
                {{ log.action || 'UNKNOWN' }}
              </span>
            </td>
            <td class="max-w-[180px]">
              <p class="text-[12px] font-semibold text-ink truncate">{{ actorName(log) }}</p>
              <p class="text-[10.5px] text-muted truncate">{{ log.ipAddress || '' }}</p>
            </td>
            <td class="max-w-[220px]">
              <p class="mono text-[10.5px] text-muted truncate">{{ log.entity || '—' }}</p>
              <p v-if="log.entityId && log.entityId !== 'N/A'" class="mono text-[9.5px] text-muted/70 truncate">{{ log.entityId }}</p>
            </td>
            <td>
              <div class="flex justify-end">
                <button class="btn-ghost btn-sm" type="button" @click="expand = expand === log._id ? null : log._id">
                  {{ expand === log._id ? 'Hide' : 'View' }}
                </button>
              </div>
              <div v-if="expand === log._id" class="mt-2 rounded-lg bg-paper border border-line p-2.5 text-left">
                <pre class="mono text-[10px] leading-relaxed text-ink/80 whitespace-pre-wrap break-all max-h-64 overflow-auto">{{ prettyDetails(log.details) }}</pre>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <div class="flex items-center justify-between gap-3">
      <p class="text-[12px] text-muted">
        {{ total }} entr{{ total === 1 ? 'y' : 'ies' }}
        <span v-if="total"> · showing {{ (page - 1) * limit + 1 }}–{{ Math.min(page * limit, total) }}</span>
      </p>
      <div class="flex gap-2">
        <button class="btn-secondary btn-sm" type="button" :disabled="page <= 1" @click="changePage(page - 1)">Previous</button>
        <button class="btn-secondary btn-sm" type="button" :disabled="page >= totalPages" @click="changePage(page + 1)">Next</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertTriangle, ShieldCheck } from 'lucide-vue-next';

definePageMeta({ layout: 'admin' });

const logs = ref<any[]>([]);
const loading = ref(true);
const error = ref('');
const page = ref(1);
const limit = 30;
const total = ref(0);
const totalPages = ref(1);
const expand = ref<string | null>(null);
const filters = reactive({ action: '', entity: '', startDate: '', endDate: '' });

function actorName(log: any) {
  const user = log.userId;
  if (user && typeof user === 'object') return user.name || user.email || 'Team member';
  return 'Team member';
}

function prettyDetails(details: any) {
  try {
    return JSON.stringify(details || {}, null, 2);
  } catch {
    return String(details);
  }
}

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const params = new URLSearchParams({ page: String(page.value), limit: String(limit) });
    if (filters.action.trim()) params.set('action', filters.action.trim());
    if (filters.entity.trim()) params.set('entity', filters.entity.trim());
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);
    const data = await apiRequest<any>(`/audit?${params.toString()}`);
    logs.value = data?.logs || [];
    total.value = data?.total || 0;
    totalPages.value = data?.totalPages || 1;
  } catch (err) {
    error.value = errorMessage(err);
    logs.value = [];
  } finally {
    loading.value = false;
  }
}

function apply() {
  page.value = 1;
  load();
}

function clear() {
  filters.action = '';
  filters.entity = '';
  filters.startDate = '';
  filters.endDate = '';
  page.value = 1;
  load();
}

function changePage(next: number) {
  if (next < 1 || next > totalPages.value) return;
  page.value = next;
  load();
}

onMounted(load);
useSeoMeta({ title: 'Audit trail', robots: 'noindex, nofollow' });
</script>
