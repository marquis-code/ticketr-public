<template>
  <div >
    

    <main class="max-w-7xl mx-auto px-4 md:px-6 py-8 flex-grow w-full space-y-6">
      <div>
        <h1 class="text-2xl font-extrabold text-gray-900">Orders & Financial Transactions</h1>
        <p class="text-xs text-gray-600 mt-1">Audit ticket purchases, Paystack transaction references, and revenue logs.</p>
        <p class="text-[11px] text-amber-700 bg-amber-50 px-3 py-2 rounded-lg mt-3 inline-block font-medium border border-amber-200">
          <strong>Note:</strong> You can approve uploaded receipts for <strong>AWAITING_APPROVAL</strong> orders, or manually Mark as Paid/Send Reminders for <strong>PENDING</strong> orders.
        </p>
      </div>

      <!-- Filters -->
      <div class="flex gap-2 border-b border-gray-200 pb-2">
        <button @click="currentTab = 'ALL'" :class="currentTab === 'ALL' ? 'text-indigo-600 border-b-2 border-indigo-600 font-bold' : 'text-gray-500'" class="px-4 py-2 text-sm">All Orders</button>
        <button @click="currentTab = 'AWAITING_APPROVAL'" :class="currentTab === 'AWAITING_APPROVAL' ? 'text-indigo-600 border-b-2 border-indigo-600 font-bold' : 'text-gray-500'" class="px-4 py-2 text-sm flex items-center gap-2">
          Pending Approvals
          <span v-if="pendingCount > 0" class="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{{ pendingCount }}</span>
        </button>
      </div>

      <!-- Orders Table -->
      <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <TableLoadingState v-if="loading" message="Loading orders..." />
        <TableEmptyState v-else-if="filteredOrders.length === 0" title="No Orders Found" message="No orders found in this category." />

        <div v-else class="overflow-x-auto border border-gray-200 rounded-xl bg-white shadow-sm">
          <table class="w-full text-left border-collapse whitespace-nowrap">
            <thead class="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th class="py-4 px-4 md:px-6">Customer & Order</th>
                <th class="py-4 px-4 md:px-6">Event</th>
                <th class="py-4 px-4 md:px-6">Amount</th>
                <th class="py-4 px-4 md:px-6">Reference</th>
                <th class="py-4 px-4 md:px-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white">
              <tr v-for="o in filteredOrders" :key="o._id" class="hover:bg-gray-50 transition-colors duration-150">
                <td class="px-6 py-4 md:px-6">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                      {{ o.customerName.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <p class="font-bold text-gray-900 text-sm">{{ o.customerName }}</p>
                      <p class="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                        <span class="font-mono text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{{ o.orderNumber }}</span>
                        {{ o.customerEmail }}
                      </p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 md:px-6">
                  <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 border border-gray-100 text-xs font-medium text-gray-700">
                    <Ticket class="w-3.5 h-3.5" /> {{ o.eventId?.title || 'Unknown Event' }}
                  </div>
                </td>
                <td class="px-6 py-4 md:px-6">
                  <span class="font-extrabold text-gray-900 text-sm">₦{{ o.totalAmount?.toLocaleString() }}</span>
                </td>
                <td class="px-6 py-4 md:px-6">
                  <div class="flex items-center gap-2">
                    <template v-if="o.proofOfPaymentUrl">
                      <div class="cursor-pointer overflow-hidden rounded border border-gray-200 shadow-sm" @click="viewReceipt(o.proofOfPaymentUrl)" title="View Proof of Payment">
                        <img v-if="!isPdf(o.proofOfPaymentUrl)" :src="o.proofOfPaymentUrl" class="w-12 h-8 object-cover hover:opacity-80 transition" alt="Proof" />
                        <div v-else class="w-12 h-8 flex items-center justify-center bg-gray-100 text-[10px] font-bold text-gray-600 hover:bg-gray-200 transition">PDF</div>
                      </div>
                    </template>
                    <span v-else-if="o.paystackReference" class="font-mono text-[11px] text-gray-500 truncate max-w-[120px]" :title="o.paystackReference">
                      {{ o.paystackReference }}
                    </span>
                    <span v-else class="text-xs text-gray-400 italic">No reference</span>
                  </div>
                </td>
                <td class="px-6 py-4 md:px-6 text-right">
                  <span
                    :class="{
                      'bg-emerald-50 text-emerald-700 border-emerald-200': o.status === 'PAID',
                      'bg-amber-50 text-amber-700 border-amber-200': o.status === 'PENDING',
                      'bg-orange-50 text-orange-700 border-orange-200': o.status === 'AWAITING_APPROVAL',
                      'bg-red-50 text-red-700 border-red-200': o.status === 'FAILED' || o.status === 'CANCELLED'
                    }"
                    class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border shadow-sm"
                  >
                    {{ o.status }}
                  </span>
                  
                  
                  <div v-if="o.status === 'AWAITING_APPROVAL'" class="mt-3 flex flex-wrap justify-end gap-2">
                    <button v-if="o.proofOfPaymentUrl" @click="viewReceipt(o.proofOfPaymentUrl)" class="text-xs text-indigo-600 hover:underline font-semibold flex items-center gap-1"><Paperclip class="w-3.5 h-3.5" /> View Receipt</button>
                    <span v-else class="text-[10px] text-gray-400 italic">No receipt uploaded</span>
                    <button @click="approveOrder(o._id)" :disabled="actioning === o._id" class="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1"><Check class="w-3.5 h-3.5" /> Approve</button>
                    <button @click="rejectOrder(o._id)" :disabled="actioning === o._id" class="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1"><X class="w-3.5 h-3.5" /> Reject</button>
                  </div>
                  
                  <div v-else-if="o.status === 'PENDING'" class="mt-3 flex flex-wrap justify-end gap-2">
                    <button @click="forceApproveOrder(o._id)" :disabled="actioning === o._id" class="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1"><Check class="w-3.5 h-3.5" /> Mark as Paid</button>
                    <button @click="remindOrder(o._id)" :disabled="actioning === o._id" class="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1"><Bell class="w-3.5 h-3.5" /> Send Reminder</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- Receipt Modal -->
    <div v-if="showingReceipt" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="closeReceipt">
      <div class="bg-white rounded-xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col h-[80vh]">
        <div class="p-4 border-b flex justify-between items-center bg-gray-50 shrink-0">
          <h3 class="font-bold">Proof of Payment</h3>
          <button @click="closeReceipt" class="text-gray-500 font-bold hover:text-black">&times;</button>
        </div>
        <div class="p-4 flex-grow overflow-auto flex justify-center bg-gray-100">
          <iframe v-if="isPdf(receiptUrl)" :src="receiptUrl" class="w-full h-full border-0" frameborder="0"></iframe>
          <img v-else :src="receiptUrl" alt="Receipt" class="max-w-full object-contain" />
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div v-if="confirmModal.show" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div class="bg-white border border-gray-200 w-full max-w-sm p-6 rounded-2xl shadow-xl">
        <h3 class="text-lg font-bold text-gray-900 mb-2">{{ confirmModal.title }}</h3>
        <p class="text-sm text-gray-500 mb-4">{{ confirmModal.message }}</p>
        
        <div v-if="confirmModal.requireReason" class="mb-6">
          <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Reason for approval <span class="text-red-500">*</span></label>
          <textarea v-model="confirmModal.reason" rows="2" class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="e.g. Verified transfer in bank app"></textarea>
        </div>

        <div class="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6">
          <button @click="confirmModal.show = false" class="w-full sm:w-auto px-4 py-3 sm:py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl sm:rounded-lg hover:bg-gray-200 transition">Cancel</button>
          <button 
            @click="confirmModal.onConfirm(confirmModal.reason); confirmModal.show = false" 
            :disabled="confirmModal.requireReason && !confirmModal.reason"
            class="w-full sm:w-auto px-4 py-3 sm:py-2 text-sm font-semibold text-white rounded-xl sm:rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed" 
            :class="confirmModal.variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'">
            {{ confirmModal.confirmText }}
          </button>
        </div>
      </div>
    </div>
    <!-- Action Loader Modal -->
    <div v-if="actioning" class="fixed inset-0 bg-white/70 flex flex-col items-center justify-center z-[100] backdrop-blur-md">
      <AppLoader size="xl" color="indigo" class="mb-4" />
      <h3 class="text-lg font-bold text-gray-900">Processing...</h3>
      <p class="text-sm text-gray-500 font-medium mt-1">Please wait while we update this order and generate tickets.</p>
    </div>

    <!-- Email Composer Modal -->
    <div v-if="composerModal.show" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-y-auto">
      <div class="bg-white border border-gray-200 w-full max-w-2xl rounded-2xl shadow-xl flex flex-col my-8 max-h-[90vh]">
        <div class="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div>
            <h3 class="text-xl font-bold text-gray-900">Compose Reminder Email</h3>
            <p class="text-xs text-gray-500 mt-1">Personalize the reminder message for {{ composerModal.customerName }}</p>
          </div>
          <button @click="composerModal.show = false" class="text-gray-400 hover:text-gray-600 transition">
            <X class="w-5 h-5" />
          </button>
        </div>
        
        <div class="p-6 overflow-y-auto flex-1 space-y-5">
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Subject Line</label>
            <input 
              v-model="composerModal.subject" 
              type="text" 
              class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm transition"
            />
          </div>
          
          <div class="flex-1 flex flex-col">
            <label class="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Email Body (Rich Text)</label>
            <div class="border border-gray-200 rounded-xl overflow-hidden shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition h-64 bg-white flex flex-col">
              <ClientOnly>
                <QuillEditor 
                  v-model:content="composerModal.message" 
                  contentType="html" 
                  theme="snow" 
                  toolbar="essential"
                  class="flex-1 overflow-y-auto"
                />
                <template #fallback>
                  <div class="p-4 text-sm text-gray-500 flex items-center justify-center h-full">Loading rich text editor...</div>
                </template>
              </ClientOnly>
            </div>
            <p class="text-[11px] text-gray-500 mt-2">
              Note: The beautifully branded email wrapper and the "Complete Payment" button will automatically be added around your message.
            </p>
          </div>
        </div>

        <div class="p-4 sm:p-6 border-t border-gray-100 flex flex-col-reverse sm:flex-row justify-end gap-3 shrink-0 bg-gray-50/50 rounded-b-2xl">
          <button @click="composerModal.show = false" class="w-full sm:w-auto px-4 py-3 sm:py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition shadow-sm">
            Cancel
          </button>
          <button 
            @click="sendCustomReminder" 
            :disabled="isSending"
            class="w-full sm:w-auto px-6 py-3 sm:py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <AppLoader v-if="isSending" size="sm" color="white" />
            <span>Send Email</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin' });

import { ref, onMounted, computed } from 'vue';
import { toast } from 'vue-sonner';
import { Ticket, Paperclip, Check, X, Bell } from 'lucide-vue-next';

const config = useRuntimeConfig();

const isSending = ref(false);

const composerModal = ref({
  show: false,
  orderId: null,
  customerName: '',
  subject: '',
  message: '',
});

function openComposer(order) {
  const eventName = order.eventId?.title || 'the event';
  
  composerModal.value = {
    show: true,
    orderId: order._id,
    customerName: order.customerName,
    subject: `Complete your booking for ${eventName}`,
    message: `<p>Hi <strong>${order.customerName}</strong>,</p><p><br></p><p>We noticed you started booking a ticket for <strong>${eventName}</strong> but didn't finish. Secure your spot now before tickets run out!</p>`,
  };
}

const orders = ref([]);
const loading = ref(true);
const actioning = ref(null);
const tenantLogo = ref('');
const tenantName = ref('');
const currentTab = ref('ALL');

const pendingCount = computed(() => orders.value.filter(o => ['AWAITING_APPROVAL', 'PENDING'].includes(o.status)).length);

const filteredOrders = computed(() => {
  if (currentTab.value === 'ALL') return orders.value;
  if (currentTab.value === 'AWAITING_APPROVAL') {
    return orders.value.filter(o => ['AWAITING_APPROVAL', 'PENDING'].includes(o.status));
  }
  return orders.value.filter(o => o.status === currentTab.value);
});

// Modal state
const showingReceipt = ref(false);
const receiptUrl = ref('');

const confirmModal = ref({
  show: false,
  title: '',
  message: '',
  confirmText: 'Confirm',
  variant: 'primary',
  requireReason: false,
  reason: '',
  onConfirm: () => {},
});

function showConfirm({ title, message, confirmText, variant, requireReason, onConfirm }) {
  confirmModal.value = { 
    show: true, 
    title, 
    message, 
    confirmText: confirmText || 'Confirm', 
    variant: variant || 'primary', 
    requireReason: requireReason || false,
    reason: '',
    onConfirm 
  };
}

function viewReceipt(url) {
  receiptUrl.value = url;
  showingReceipt.value = true;
}

function closeReceipt() {
  showingReceipt.value = false;
  receiptUrl.value = '';
}

function isPdf(url) {
  if (!url) return false;
  return url.toLowerCase().includes('.pdf');
}

async function approveOrder(orderId) {
  showConfirm({
    title: 'Approve Payment',
    message: 'Are you sure you want to approve this payment and issue tickets? This action cannot be undone.',
    confirmText: 'Approve & Issue Tickets',
    variant: 'primary',
    onConfirm: async () => {
      const token = localStorage.getItem('ticketr_admin_token');
      actioning.value = orderId;
      try {
        const res = await fetch(`${config.public.apiBase}/orders/admin/${orderId}/approve`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          toast.success('Order approved successfully');
          loadOrders();
        } else {
          toast.error('Failed to approve order');
        }
      } catch (err) {
        toast.error('Error approving order');
      } finally {
        actioning.value = null;
      }
    }
  });
}

async function rejectOrder(orderId) {
  showConfirm({
    title: 'Reject Payment',
    message: 'Are you sure you want to reject this payment? The buyer will not receive their tickets.',
    confirmText: 'Reject Payment',
    variant: 'danger',
    onConfirm: async () => {
      const token = localStorage.getItem('ticketr_admin_token');
      actioning.value = orderId;
      try {
        const res = await fetch(`${config.public.apiBase}/orders/admin/${orderId}/reject`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          toast.success('Order rejected');
          loadOrders();
        } else {
          toast.error('Failed to reject order');
        }
      } catch (err) {
        toast.error('Error rejecting order');
      } finally {
        actioning.value = null;
      }
    }
  });
}

async function forceApproveOrder(orderId) {
  showConfirm({
    title: 'Manually Mark as Paid',
    message: 'Are you sure you want to mark this pending order as paid? This will instantly generate and send the tickets to the customer.',
    confirmText: 'Mark as Paid & Issue Tickets',
    variant: 'primary',
    requireReason: true,
    onConfirm: async (reason) => {
      const token = localStorage.getItem('ticketr_admin_token');
      actioning.value = orderId;
      try {
        const res = await fetch(`${config.public.apiBase}/orders/admin/${orderId}/force-approve`, {
          method: 'PATCH',
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ reason })
        });
        if (res.ok) {
          toast.success('Order manually marked as paid!');
          loadOrders();
        } else {
          const err = await res.json();
          toast.error(err.message || 'Failed to mark order as paid');
        }
      } catch (err) {
        toast.error('Error marking order as paid');
      } finally {
        actioning.value = null;
      }
    }
  });
}

async function remindOrder(orderId) {
  const order = orders.value.find(o => o._id === orderId);
  if (!order) return;
  openComposer(order);
}

async function sendCustomReminder() {
  if (!composerModal.value.orderId) return;
  
  const token = localStorage.getItem('ticketr_admin_token');
  isSending.value = true;
  try {
    const res = await fetch(`${config.public.apiBase}/orders/admin/${composerModal.value.orderId}/remind`, {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        customSubject: composerModal.value.subject,
        customMessage: composerModal.value.message,
      }),
    });
    if (res.ok) {
      toast.success('Reminder sent successfully');
      composerModal.value.show = false;
    } else {
      const err = await res.json();
      toast.error(err.message || 'Failed to send reminder');
    }
  } catch (e) {
    toast.error('Network error');
  } finally {
    isSending.value = false;
  }
}

async function loadTenantDetails() {
  const token = localStorage.getItem('ticketr_admin_token');
  if (!token) return;
  try {
    const res = await fetch(`${config.public.apiBase}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.tenant) {
        tenantLogo.value = data.tenant.logoUrl;
        tenantName.value = data.tenant.name;
      }
    }
  } catch (err) {
    console.error(err);
  }
}

async function loadOrders() {
  const token = localStorage.getItem('ticketr_admin_token');
  if (!token) return;

  loading.value = true;
  try {
    const res = await fetch(`${config.public.apiBase}/orders/tenant`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      orders.value = await res.json();
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadTenantDetails();
  loadOrders();
});
</script>
