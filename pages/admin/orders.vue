<template>
  <div >
    

    <main class="w-full space-y-8">
      <div>
        <h1 class="text-2xl font-extrabold text-gray-900">Orders & Financial Transactions</h1>
        <p class="text-xs text-gray-600 mt-1">Audit ticket purchases, Paystack transaction references, and revenue logs.</p>
        <p class="text-[11px] text-amber-700 bg-amber-50 px-3 py-2 rounded-lg mt-3 inline-block font-medium border border-amber-200">
          <strong>Note:</strong> You can approve uploaded receipts for <strong>AWAITING_APPROVAL</strong> orders, or manually Mark as Paid/Send Reminders for <strong>PENDING</strong> orders.
        </p>
      </div>

      <!-- Filters -->
      <div class="flex flex-col sm:flex-row gap-4 border-b border-gray-200 pb-2 justify-between items-start sm:items-center">
        <div class="flex gap-2">
          <button @click="currentTab = 'ALL'" :class="currentTab === 'ALL' ? 'text-indigo-600 border-b-2 border-indigo-600 font-bold' : 'text-gray-500'" class="px-4 py-2 text-sm">All Orders</button>
          <button @click="currentTab = 'AWAITING_APPROVAL'" :class="currentTab === 'AWAITING_APPROVAL' ? 'text-indigo-600 border-b-2 border-indigo-600 font-bold' : 'text-gray-500'" class="px-4 py-2 text-sm flex items-center gap-2">
            Pending Approvals
            <span v-if="pendingCount > 0" class="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{{ pendingCount }}</span>
          </button>
        </div>
        
        <div class="flex items-center gap-2 px-4">
          <label class="text-sm text-gray-500 font-semibold">Department:</label>
          <select v-model="selectedDepartment" class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500">
            <option v-for="dept in availableDepartments" :key="dept" :value="dept">{{ dept === 'ALL' ? 'All Departments' : dept }}</option>
          </select>
        </div>
      </div>

      <!-- Advanced Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
          <p class="text-xs font-semibold text-gray-500 uppercase">Total Orders</p>
          <h3 class="text-2xl font-extrabold text-gray-900 mt-1">{{ stats.totalOrders }}</h3>
        </div>
        <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
          <p class="text-xs font-semibold text-gray-500 uppercase">Total Paid</p>
          <h3 class="text-2xl font-extrabold text-emerald-600 mt-1">{{ stats.totalPaidOrders }}</h3>
        </div>
        <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
          <p class="text-xs font-semibold text-gray-500 uppercase">Total Revenue</p>
          <h3 class="text-2xl font-extrabold text-indigo-600 mt-1">₦{{ (stats.totalRevenue || 0).toLocaleString() }}</h3>
        </div>
        <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
          <p class="text-xs font-semibold text-gray-500 uppercase">Pending Review</p>
          <h3 class="text-2xl font-extrabold text-amber-600 mt-1">{{ stats.totalPending }}</h3>
        </div>
      </div>

      <!-- Orders Table -->
      <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <TableLoadingState v-if="loading" message="Loading orders..." />
        <TableEmptyState v-else-if="filteredOrders.length === 0" title="No Orders Found" message="No orders found in this category." />

        <div v-else class="overflow-x-auto border border-gray-200 rounded-xl bg-white shadow-sm">
          <table class="w-full text-left border-collapse whitespace-nowrap">
            <thead class="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th class="py-4 px-4 md:px-6 w-16 text-center">S/N</th>
                <th class="py-4 px-4 md:px-6">Customer & Order</th>
                <th class="py-4 px-4 md:px-6">Event</th>
                <th class="py-4 px-4 md:px-6">Amount</th>
                <th class="py-4 px-4 md:px-6">Reference</th>
                <th class="py-4 px-4 md:px-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white">
              <tr v-for="(o, index) in orders" :key="o._id" class="hover:bg-gray-50 transition-colors duration-150">
                <td class="px-6 py-4 md:px-6 text-center font-semibold text-gray-500 text-sm">
                  {{ (page - 1) * limit + index + 1 }}
                </td>
                <td class="px-6 py-4 md:px-6">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
                      {{ o.customerName.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <p class="font-bold text-gray-900 text-sm">{{ o.customerName }}</p>
                      <p class="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                        <span class="font-mono text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{{ o.orderNumber }}</span>
                        <span v-if="o.departmentCode" class="font-mono text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold">{{ o.departmentCode }}</span>
                        {{ o.customerEmail }}
                      </p>
                      <div v-if="getExistingPaidOrders(o).length > 0" class="mt-1">
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300" title="This customer already has another PAID order for this event">
                          <AlertTriangle class="w-3 h-3 text-amber-600 shrink-0" />
                          Has Paid Order ({{ getExistingPaidOrders(o)[0].orderNumber }})
                        </span>
                      </div>
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
                  <div class="space-y-1">
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
                      <span v-else class="text-xs text-gray-400 italic">No Paystack ref</span>
                    </div>
                    <div v-if="o.bankReference">
                      <span class="font-mono text-[10px] font-semibold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200 inline-block max-w-[140px] truncate" :title="'Bank Ref / Session ID: ' + o.bankReference">
                        Bank: {{ o.bankReference }}
                      </span>
                    </div>
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
                    <button @click="deleteOrder(o._id)" :disabled="actioning === o._id" class="text-xs bg-gray-500 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1"><Trash class="w-3.5 h-3.5" /> Delete</button>
                  </div>
                  
                  <div v-else-if="o.status === 'PENDING'" class="mt-3 flex flex-wrap justify-end gap-2">
                    <button @click="openManualApproveModal(o)" :disabled="actioning === o._id" class="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1 shadow-sm"><Check class="w-3.5 h-3.5" /> Mark as Paid</button>
                    <button @click="remindOrder(o._id)" :disabled="actioning === o._id" class="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1"><Bell class="w-3.5 h-3.5" /> Send Reminder</button>
                    <button @click="deleteOrder(o._id)" :disabled="actioning === o._id" class="text-xs bg-gray-500 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1"><Trash class="w-3.5 h-3.5" /> Delete</button>
                  </div>
                  
                  <div v-else-if="o.status !== 'PAID'" class="mt-3 flex flex-wrap justify-end gap-2">
                    <button @click="deleteOrder(o._id)" :disabled="actioning === o._id" class="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1"><Trash class="w-3.5 h-3.5" /> Delete</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Pagination Controls -->
        <div class="p-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="text-sm text-gray-500">
            Showing <span class="font-bold text-gray-900">{{ orders.length > 0 ? (page - 1) * limit + 1 : 0 }}</span> to <span class="font-bold text-gray-900">{{ (page - 1) * limit + orders.length }}</span> of <span class="font-bold text-gray-900">{{ totalRecords }}</span> orders
          </div>
          <div class="flex items-center gap-2">
            <button @click="changePage(page - 1)" :disabled="page <= 1" class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
            <span class="text-sm text-gray-700 font-semibold px-2">Page {{ page }} of {{ totalPages }}</span>
            <button @click="changePage(page + 1)" :disabled="page >= totalPages" class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
          </div>
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

    <!-- Manual Mark as Paid Modal (Compulsory Proof & Bank Ref) -->
    <div v-if="manualApproveModal.show" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-y-auto">
      <div class="bg-white border border-gray-200 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col my-8">
        <div class="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 class="text-lg font-extrabold text-gray-900 flex items-center gap-2">
              <Check class="w-5 h-5 text-emerald-600" />
              Verify & Mark Order as Paid
            </h3>
            <p class="text-xs text-gray-500 mt-1">
              Order: <span class="font-mono font-bold text-gray-700">{{ manualApproveModal.order?.orderNumber }}</span> • <span class="font-bold text-emerald-700">₦{{ manualApproveModal.order?.totalAmount?.toLocaleString() }}</span>
            </p>
          </div>
          <button @click="manualApproveModal.show = false" class="text-gray-400 hover:text-gray-600 transition">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="p-6 space-y-5">
          <!-- Duplicate Warning Banner -->
          <div v-if="getExistingPaidOrders(manualApproveModal.order).length > 0" class="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-900">
            <ShieldAlert class="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div class="text-xs">
              <p class="font-bold text-rose-800">Duplicate Payment Risk Warning!</p>
              <p class="mt-0.5 text-rose-700">
                This customer (<span class="font-semibold">{{ manualApproveModal.order?.customerEmail }}</span>) already has a <strong>PAID</strong> order (<span class="font-mono font-bold">{{ getExistingPaidOrders(manualApproveModal.order)[0]?.orderNumber }}</span>) for this event.
              </p>
              <p class="mt-1 font-semibold text-rose-900">
                Please verify that this is a genuine separate payment and NOT a duplicate approval of the same transfer!
              </p>
            </div>
          </div>

          <!-- Customer & Event Summary -->
          <div class="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs space-y-1">
            <div class="flex justify-between">
              <span class="text-gray-500">Customer:</span>
              <span class="font-bold text-gray-800">{{ manualApproveModal.order?.customerName }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Email:</span>
              <span class="font-medium text-gray-700">{{ manualApproveModal.order?.customerEmail }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Event:</span>
              <span class="font-medium text-gray-700">{{ manualApproveModal.order?.eventId?.title || 'Event' }}</span>
            </div>
          </div>

          <!-- Bank Reference Input (Compulsory) -->
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
              Bank Transaction Reference / Session ID <span class="text-red-500">*</span>
            </label>
            <input 
              v-model="manualApproveModal.bankReference" 
              type="text" 
              placeholder="e.g. 090267240813123456789012345678 or NIP Session ID"
              class="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <p class="text-[11px] text-gray-500 mt-1">
              Required. The unique bank session ID or transaction reference from your bank app statement. Each reference can only be used once.
            </p>
          </div>

          <!-- Proof of Payment Upload (Compulsory) -->
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
              Proof of Payment Receipt File <span class="text-red-500">*</span>
            </label>
            <input 
              type="file" 
              ref="receiptFileInput" 
              @change="onReceiptFileChange" 
              accept="image/*,application/pdf" 
              class="hidden" 
            />
            <div 
              @click="$refs.receiptFileInput.click()"
              class="border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center gap-1.5"
              :class="manualApproveModal.file ? 'border-emerald-400 bg-emerald-50/40 text-emerald-800' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-600'"
            >
              <template v-if="manualApproveModal.file">
                <Check class="w-6 h-6 text-emerald-600" />
                <p class="text-xs font-bold text-emerald-800">{{ manualApproveModal.fileName }}</p>
                <p class="text-[10px] text-emerald-600">Click to change file</p>
              </template>
              <template v-else>
                <Upload class="w-6 h-6 text-gray-400" />
                <p class="text-xs font-semibold text-gray-700">Click to upload bank transfer receipt (Image or PDF)</p>
                <p class="text-[10px] text-gray-500">PNG, JPG, JPEG, or PDF up to 10MB</p>
              </template>
            </div>
          </div>

          <!-- Reason / Notes (Compulsory) -->
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
              Verification Reason / Notes <span class="text-red-500">*</span>
            </label>
            <textarea 
              v-model="manualApproveModal.reason" 
              rows="2" 
              placeholder="e.g. Verified ₦15,000 credit in bank app statement from customer on Aug 16"
              class="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            ></textarea>
          </div>
        </div>

        <div class="p-4 sm:p-6 border-t border-gray-100 flex flex-col-reverse sm:flex-row justify-end gap-3 bg-gray-50/50 rounded-b-2xl">
          <button 
            @click="manualApproveModal.show = false" 
            class="w-full sm:w-auto px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button 
            @click="submitManualApprove" 
            :disabled="!manualApproveModal.bankReference || !manualApproveModal.file || !manualApproveModal.reason || manualApproveModal.isSubmitting" 
            class="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <AppLoader v-if="manualApproveModal.isSubmitting" size="sm" color="white" />
            <span>Verify & Issue Tickets</span>
          </button>
        </div>
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
    <!-- Confirm Modal -->
    <div v-if="confirmModal.show" class="fixed inset-0 bg-black/60 flex items-center justify-center z-[150] backdrop-blur-sm p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div class="p-6">
          <div class="flex items-center gap-3 mb-4" :class="confirmModal.variant === 'danger' ? 'text-rose-600' : 'text-indigo-600'">
            <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0" :class="confirmModal.variant === 'danger' ? 'bg-rose-100' : 'bg-indigo-100'">
              <AlertTriangle v-if="confirmModal.variant === 'danger'" class="w-5 h-5" />
              <ShieldAlert v-else class="w-5 h-5" />
            </div>
            <h3 class="text-lg font-bold text-gray-900">{{ confirmModal.title }}</h3>
          </div>
          <p class="text-sm text-gray-600">{{ confirmModal.message }}</p>
          
          <div v-if="confirmModal.requireReason" class="mt-4">
            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Reason *</label>
            <textarea v-model="confirmModal.reason" rows="2" class="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"></textarea>
          </div>
        </div>
        <div class="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button @click="confirmModal.show = false" class="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition">
            Cancel
          </button>
          <button @click="confirmModal.onConfirm(); confirmModal.show = false" :class="confirmModal.variant === 'danger' ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'" class="px-4 py-2 text-sm font-semibold rounded-xl transition shadow-sm">
            {{ confirmModal.confirmText }}
          </button>
        </div>
      </div>
    </div>
</template>

<script setup>
definePageMeta({ layout: 'admin' });


import { ref, onMounted, computed } from 'vue';
import { toast } from 'vue-sonner';
import { Ticket, Paperclip, Check, X, Bell, AlertTriangle, ShieldAlert, Upload, FileText, Trash } from 'lucide-vue-next';

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
const selectedDepartment = ref('ALL');

const pendingCount = computed(() => orders.value.filter(o => ['AWAITING_APPROVAL', 'PENDING'].includes(o.status)).length);

const page = ref(1);
const limit = ref(20);
const totalPages = ref(1);
const totalRecords = ref(0);

const stats = ref({
  totalOrders: 0,
  totalPaidOrders: 0,
  totalRevenue: 0,
  totalPending: 0,
});
const availableDepartments = ref(['ALL']);

function changePage(newPage) {
  if (newPage < 1 || newPage > totalPages.value) return;
  page.value = newPage;
  loadOrders();
}

watch([currentTab, selectedDepartment], () => {
  page.value = 1;
  loadOrders();
});

// Receipt modal state
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
          const err = await res.json();
          toast.error(err.message || 'Failed to approve order');
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
          const err = await res.json();
          toast.error(err.message || 'Failed to reject order');
        }
      } catch (err) {
        toast.error('Error rejecting order');
      } finally {
        actioning.value = null;
      }
    }
  });
}

async function deleteOrder(orderId) {
  showConfirm({
    title: 'Delete Order',
    message: 'Are you sure you want to delete this order entirely? This action is permanent.',
    confirmText: 'Delete Order',
    variant: 'danger',
    onConfirm: async () => {
      const token = localStorage.getItem('ticketr_admin_token');
      actioning.value = orderId;
      try {
        const res = await fetch(`${config.public.apiBase}/orders/admin/${orderId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          toast.success('Order deleted successfully');
          loadOrders();
        } else {
          const err = await res.json();
          toast.error(err.message || 'Failed to delete order');
        }
      } catch (err) {
        toast.error('Error deleting order');
      } finally {
        actioning.value = null;
      }
    }
  });
}

const receiptFileInput = ref(null);

const manualApproveModal = ref({
  show: false,
  order: null,
  bankReference: '',
  reason: '',
  file: null,
  fileName: '',
  isSubmitting: false,
});

function getExistingPaidOrders(order) {
  if (!order || !order.customerEmail) return [];
  const eventId = order.eventId?._id || order.eventId;
  // Fallback to checking the current page, better to check backend but this provides some safety
  return orders.value.filter(o => {
    if (o._id === order._id) return false;
    if (o.status !== 'PAID') return false;
    const oEventId = o.eventId?._id || o.eventId;
    const sameEmail = o.customerEmail && o.customerEmail.toLowerCase().trim() === order.customerEmail.toLowerCase().trim();
    return sameEmail && oEventId === eventId;
  });
}

function openManualApproveModal(order) {
  manualApproveModal.value = {
    show: true,
    order,
    bankReference: '',
    reason: '',
    file: null,
    fileName: '',
    isSubmitting: false,
  };
}

function onReceiptFileChange(e) {
  const file = e.target.files?.[0];
  if (file) {
    manualApproveModal.value.file = file;
    manualApproveModal.value.fileName = file.name;
  }
}

async function submitManualApprove() {
  if (!manualApproveModal.value.order) return;
  const orderId = manualApproveModal.value.order._id;
  
  const bankRef = manualApproveModal.value.bankReference?.trim();
  if (!bankRef) {
    toast.error('Bank Transaction Reference / Session ID is compulsory');
    return;
  }

  if (!manualApproveModal.value.file) {
    toast.error('Proof of payment receipt upload is compulsory');
    return;
  }

  const reason = manualApproveModal.value.reason?.trim();
  if (!reason) {
    toast.error('Verification notes / reason is compulsory');
    return;
  }

  const token = localStorage.getItem('ticketr_admin_token');
  manualApproveModal.value.isSubmitting = true;
  actioning.value = orderId;

  try {
    const formData = new FormData();
    formData.append('bankReference', bankRef);
    formData.append('reason', reason);
    formData.append('receipt', manualApproveModal.value.file);

    const res = await fetch(`${config.public.apiBase}/orders/admin/${orderId}/force-approve`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (res.ok) {
      toast.success('Order manually verified & marked as paid! Tickets issued.');
      manualApproveModal.value.show = false;
      loadOrders();
    } else {
      const err = await res.json();
      toast.error(err.message || 'Failed to mark order as paid');
    }
  } catch (err) {
    toast.error('Error marking order as paid');
  } finally {
    manualApproveModal.value.isSubmitting = false;
    actioning.value = null;
  }
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
    const query = new URLSearchParams({
      page: page.value,
      limit: limit.value,
      status: currentTab.value,
      departmentCode: selectedDepartment.value,
    });
    const res = await fetch(`${config.public.apiBase}/orders/tenant?${query.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.metadata) {
        orders.value = data.data;
        totalPages.value = data.metadata.lastPage;
        totalRecords.value = data.metadata.total;
        stats.value = data.metadata.statistics;
        availableDepartments.value = data.metadata.statistics.availableDepartments || ['ALL'];
      } else {
        orders.value = data;
      }
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
