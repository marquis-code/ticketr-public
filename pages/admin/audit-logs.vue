<template>
  <div class="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-gray-900">Audit Logs</h1>
        <p class="text-sm text-gray-500 mt-1">Monitor all administrative actions and security events.</p>
      </div>
      <div class="flex items-center gap-3">
        <button @click="fetchLogs" class="btn-secondary px-4 py-2 text-sm rounded-xl border border-gray-200 bg-white hover:bg-gray-50 shadow-sm flex items-center gap-2">
          <RefreshCcw class="w-4 h-4" :class="{ 'animate-spin': loading }" />
          Refresh
        </button>
      </div>
    </div>

    <!-- Filters UI -->
    <div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 flex-wrap">
      <div class="flex-1 min-w-[200px]">
        <label class="block text-xs font-semibold text-gray-700 mb-1">User</label>
        <CustomSelect 
          v-model="filters.userId" 
          :options="userOptions" 
          placeholder="All Users" 
          @change="applyFilters"
        />
      </div>
      <div class="flex-1 min-w-[200px]">
        <label class="block text-xs font-semibold text-gray-700 mb-1">Action Type</label>
        <CustomSelect 
          v-model="filters.action" 
          :options="actionOptions" 
          placeholder="All Actions" 
          @change="applyFilters"
        />
      </div>
      <div class="flex-1 min-w-[200px]">
        <label class="block text-xs font-semibold text-gray-700 mb-1">Entity</label>
        <input v-model="filters.entity" @keyup.enter="applyFilters" type="text" placeholder="e.g. Admin Dashboard" class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
      </div>
      <div class="flex-1 min-w-[150px]">
        <label class="block text-xs font-semibold text-gray-700 mb-1">Start Date</label>
        <DatePicker v-model="filters.startDate" placeholder="Start Date" @change="applyFilters" />
      </div>
      <div class="flex-1 min-w-[150px]">
        <label class="block text-xs font-semibold text-gray-700 mb-1">End Date</label>
        <DatePicker v-model="filters.endDate" placeholder="End Date" @change="applyFilters" />
      </div>
      <div class="flex flex-col justify-end gap-2 sm:flex-row sm:items-end w-full md:w-auto shrink-0 pt-2 md:pt-0">
        <button @click="clearFilters" class="w-full sm:w-auto px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition">Clear</button>
        <button @click="applyFilters" class="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary-600 transition">Apply Filters</button>
      </div>
    </div>

    <div v-if="loading && logs.length === 0" class="py-24">
      <TableLoadingState message="Loading audit logs..." />
    </div>

    <div v-else-if="!loading && logs.length === 0" class="text-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <ShieldCheck class="w-8 h-8 text-gray-400" />
      </div>
      <h3 class="text-lg font-bold text-gray-900 mb-1">No activity yet</h3>
      <p class="text-gray-500">There are no audit logs recorded for your organization.</p>
    </div>

    <div v-else class="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-gray-600">
          <thead class="bg-gray-50/50 text-gray-900 font-bold border-b border-gray-100">
            <tr>
              <th class="py-4 px-6 font-semibold w-48">Timestamp</th>
              <th class="py-4 px-6 font-semibold w-64">Action</th>
              <th class="py-4 px-6 font-semibold w-48">Entity</th>
              <th class="py-4 px-6 font-semibold">User ID</th>
              <th class="py-4 px-6 font-semibold w-24 text-right">Details</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="log in groupedLogs" :key="log._id" class="hover:bg-gray-50/50 transition-colors group">
              <td class="py-4 px-6 text-gray-500 font-medium whitespace-nowrap">
                {{ formatDate(log.createdAt) }}
              </td>
              <td class="py-4 px-6 font-medium">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 rounded-full" :class="getActionColor(log.action)"></div>
                  <span class="text-gray-900">{{ log.action }}</span>
                  <span v-if="log.count > 1" class="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full font-bold ml-1">{{ log.count }}</span>
                </div>
              </td>
              <td class="py-4 px-6">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-700">
                  {{ log.entity }}
                </span>
              </td>
              <td class="py-4 px-6 text-gray-500 font-mono text-xs">
                {{ formatUser(log.userId) }}
              </td>
              <td class="py-4 px-6 text-right">
                <button 
                  v-if="log.details && Object.keys(log.details).length > 0"
                  @click="viewDetails(log)" 
                  class="text-primary hover:text-primary-700 font-semibold flex items-center justify-end w-full"
                  title="View Details"
                >
                  <Eye class="w-5 h-5" />
                </button>
                <span v-else class="text-gray-400 text-xs">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Placeholder -->
      <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500 bg-gray-50/30">
        <span v-if="total > 0">Showing {{ (page - 1) * limit + 1 }} to {{ Math.min(page * limit, total) }} of {{ total }} entries</span>
        <span v-else>No entries</span>
        <div class="flex gap-2" v-if="totalPages > 1">
          <button 
            @click="page > 1 && (page--, fetchLogs())"
            :disabled="page === 1"
            class="p-1 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft class="w-5 h-5" />
          </button>
          <button 
            @click="page < totalPages && (page++, fetchLogs())"
            :disabled="page === totalPages"
            class="p-1 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <ChevronRight class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Details Modal -->
    <Teleport to="body">
      <div v-if="selectedLog" class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-gray-900/60 backdrop-blur-sm">
        <div class="bg-white rounded-2xl shadow-xl w-full md:max-w-2xl lg:max-w-3xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh] md:max-h-[85vh]">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
          <h3 class="text-lg font-bold text-gray-900">Log Details</h3>
          <button @click="selectedLog = null" class="text-gray-400 hover:text-gray-600 transition">
            <X class="w-5 h-5" />
          </button>
        </div>
        <div class="p-6 overflow-y-auto">
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Action</label>
              <div class="text-gray-900 font-medium">{{ selectedLog.action }}</div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Entity</label>
                <div class="text-gray-900 font-medium">{{ selectedLog.entity }}</div>
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Entity ID</label>
                <div class="text-gray-900 font-mono text-sm break-all">{{ selectedLog.entityId || 'N/A' }}</div>
              </div>
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">User Info</label>
              <div v-if="selectedLog.userId && typeof selectedLog.userId === 'object'">
                <div class="text-gray-900 font-bold">{{ selectedLog.userId.name }}</div>
                <div class="text-gray-500 text-sm">{{ selectedLog.userId.email }}</div>
                <div class="text-xs mt-1 font-mono bg-gray-100 inline-block px-1.5 py-0.5 rounded">{{ selectedLog.userId.role }}</div>
              </div>
              <div v-else class="text-gray-900 font-mono text-sm break-all">{{ selectedLog.userId || 'System' }}</div>
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Payload / Details</label>
              <pre class="bg-gray-900 text-gray-100 p-4 rounded-xl text-xs font-mono overflow-auto max-h-[40vh] md:max-h-[50vh] border border-gray-800 shadow-inner whitespace-pre-wrap word-break">{{ JSON.stringify(selectedLog.groupedDetails || selectedLog.details, null, 2) }}</pre>
            </div>
          </div>
        </div>
        <div class="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-end shrink-0">
          <button @click="selectedLog = null" class="w-full sm:w-auto px-4 py-3 sm:py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 shadow-sm transition">
            Close
          </button>
        </div>
      </div>
    </div>
    </Teleport>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin' });

import { ref, onMounted, computed } from 'vue';
import { ShieldCheck, RefreshCcw, X, ChevronLeft, ChevronRight, Eye } from 'lucide-vue-next';

const config = useRuntimeConfig();

const logs = ref([]);
const loading = ref(true);
const selectedLog = ref(null);

const filters = ref({
  userId: '',
  action: '',
  entity: '',
  startDate: '',
  endDate: ''
});

const userOptions = ref([{ label: 'All Users', value: '' }]);
const actionOptions = [
  { label: 'All Actions', value: '' },
  { label: 'Page Navigation', value: 'PAGE_NAVIGATION' },
  { label: 'User Interaction', value: 'USER_INTERACTION' },
  { label: 'Auth Events', value: 'AUTH_ACTION_SUCCESS' },
  { label: 'Order Views', value: 'VIEW_ORDER_SUCCESS' }
];

const groupedLogs = computed(() => {
  if (!logs.value || logs.value.length === 0) return [];
  const grouped = [];
  let currentGroup = null;

  for (const log of logs.value) {
    if (!currentGroup) {
      currentGroup = { ...log, count: 1, groupedDetails: [log.details] };
      grouped.push(currentGroup);
    } else {
      const timeDiff = new Date(currentGroup.createdAt).getTime() - new Date(log.createdAt).getTime();
      const currentUserId = typeof currentGroup.userId === 'object' && currentGroup.userId ? currentGroup.userId._id : currentGroup.userId;
      const logUserId = typeof log.userId === 'object' && log.userId ? log.userId._id : log.userId;
      
      if (
        currentGroup.action === log.action &&
        currentGroup.entity === log.entity &&
        currentUserId === logUserId &&
        Math.abs(timeDiff) < 5 * 60 * 1000 // group within 5 minutes
      ) {
        currentGroup.count++;
        currentGroup.groupedDetails.push(log.details);
      } else {
        currentGroup = { ...log, count: 1, groupedDetails: [log.details] };
        grouped.push(currentGroup);
      }
    }
  }
  return grouped;
});

const page = ref(1);
const limit = ref(15);
const total = ref(0);
const totalPages = ref(1);

onMounted(() => {
  fetchUsers();
  fetchLogs();
});

async function fetchUsers() {
  try {
    const token = localStorage.getItem('ticketr_admin_token');
    const res = await fetch(`${config.public.apiBase}/auth/tenant-users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const users = await res.json();
      userOptions.value = [
        { label: 'All Users', value: '' },
        ...users.map(u => ({ label: `${u.name} (${u.email})`, value: u.id }))
      ];
    }
  } catch (e) {
    console.error('Failed to load users');
  }
}

async function fetchLogs() {
  loading.value = true;
  try {
    const token = localStorage.getItem('ticketr_admin_token');
    
    const params = new URLSearchParams();
    params.append('page', page.value);
    params.append('limit', limit.value);
    if (filters.value.userId) params.append('userId', filters.value.userId.trim());
    if (filters.value.action) params.append('action', filters.value.action.trim());
    if (filters.value.entity) params.append('entity', filters.value.entity.trim());
    if (filters.value.startDate) params.append('startDate', filters.value.startDate);
    if (filters.value.endDate) params.append('endDate', filters.value.endDate);

    const res = await fetch(`${config.public.apiBase}/audit?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (res.ok) {
      const data = await res.json();
      logs.value = data.logs || [];
      total.value = data.total || 0;
      totalPages.value = data.totalPages || 1;
    }
  } catch (err) {
    console.error('Failed to fetch logs:', err);
  } finally {
    loading.value = false;
  }
}

function applyFilters() {
  page.value = 1;
  fetchLogs();
}

function clearFilters() {
  filters.value = { userId: '', action: '', entity: '', startDate: '', endDate: '' };
  page.value = 1;
  fetchLogs();
}

function viewDetails(log) {
  selectedLog.value = log;
}

function formatDate(dateString) {
  const d = new Date(dateString);
  return d.toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true
  });
}

function getActionColor(action) {
  if (action.includes('APPROVED')) return 'bg-emerald-500';
  if (action.includes('REJECTED') || action.includes('DELETED')) return 'bg-red-500';
  if (action.includes('UPDATED')) return 'bg-blue-500';
  if (action.includes('CREATED')) return 'bg-purple-500';
  return 'bg-gray-400';
}

function formatUser(user) {
  if (!user) return 'System';
  if (typeof user === 'string') return user;
  return `${user.name} (${user.role})`;
}
</script>
