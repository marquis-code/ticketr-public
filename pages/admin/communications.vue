<template>
  <div class="max-w-6xl mx-auto p-6 lg:p-8 space-y-8">
    
    <!-- Header Area -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Broadcast Communications</h1>
        <p class="text-sm text-gray-500 mt-1">Manage and send emails to your attendees directly from the platform.</p>
      </div>
      <button 
        v-if="viewMode === 'list'"
        @click="openCompose(null)"
        class="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        New Broadcast
      </button>
    </div>

    <!-- LIST VIEW -->
    <div v-if="viewMode === 'list'" class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div v-if="loadingList" class="p-8 text-center text-gray-500 animate-pulse">Loading communications...</div>
      <div v-else-if="communications.length === 0" class="p-12 text-center">
        <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
        </div>
        <h3 class="text-lg font-bold text-gray-900">No communications found</h3>
        <p class="text-sm text-gray-500 mt-1">You haven't created any emails yet.</p>
        <button @click="openCompose(null)" class="mt-6 px-5 py-2.5 bg-indigo-50 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 transition-all">Create your first broadcast</button>
      </div>
      <table v-else class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-200">
            <th class="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject</th>
            <th class="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Audience</th>
            <th class="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            <th class="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
            <th class="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="comm in communications" :key="comm._id" class="hover:bg-gray-50 transition-colors">
            <td class="py-4 px-6 text-sm font-medium text-gray-900">
              <span class="truncate block max-w-xs" :title="comm.subject">{{ comm.subject }}</span>
            </td>
            <td class="py-4 px-6 text-sm text-gray-500 capitalize">{{ comm.audience }}</td>
            <td class="py-4 px-6">
              <span 
                class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                :class="{
                  'bg-gray-100 text-gray-800': comm.status === 'DRAFT',
                  'bg-blue-100 text-blue-800 animate-pulse': comm.status === 'SENDING',
                  'bg-green-100 text-green-800': comm.status === 'SENT',
                  'bg-red-100 text-red-800': comm.status === 'FAILED',
                }"
              >
                {{ comm.status }}
              </span>
            </td>
            <td class="py-4 px-6 text-sm text-gray-500">{{ new Date(comm.createdAt).toLocaleDateString() }}</td>
            <td class="py-4 px-6 text-sm text-right space-x-3">
              <button @click="showPreview(comm)" class="text-indigo-600 hover:text-indigo-900 font-medium">Preview</button>
              <button v-if="comm.status === 'DRAFT' || comm.status === 'FAILED'" @click="openCompose(comm)" class="text-gray-600 hover:text-gray-900 font-medium">Edit</button>
              <button v-if="comm.status === 'DRAFT' || comm.status === 'FAILED' || comm.status === 'SENT'" @click="confirmSend(comm)" class="text-green-600 hover:text-green-900 font-medium">{{ comm.status === 'DRAFT' ? 'Send' : 'Resend' }}</button>
              <button v-if="comm.status !== 'SENDING'" @click="confirmDelete(comm)" class="text-red-600 hover:text-red-900 font-medium">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- COMPOSE VIEW -->
    <div v-if="viewMode === 'compose'" class="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 lg:p-8">
      <form @submit.prevent="saveOrSend('send')" class="space-y-6">
        
        <div class="space-y-2">
          <label class="block text-sm font-semibold text-gray-700">Target Audience <span class="text-red-500">*</span></label>
          <CustomSelect 
            v-model="form.audience" 
            :options="audienceOptions" 
            placeholder="Select Audience..." 
          />
        </div>

        <div v-if="form.audience === 'event'" class="space-y-2">
          <label class="block text-sm font-semibold text-gray-700">Select Event <span class="text-red-500">*</span></label>
          <CustomSelect 
            v-model="form.eventId" 
            :options="eventOptions" 
            placeholder="Choose an event..." 
          />
        </div>

        <div v-if="form.audience === 'custom'" class="space-y-2">
          <label class="block text-sm font-semibold text-gray-700">Custom Email Addresses <span class="text-red-500">*</span></label>
          <div class="flex flex-wrap gap-2 mb-2" v-if="customEmailsList.length > 0">
            <span v-for="(email, idx) in customEmailsList" :key="idx" class="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-full">
              {{ email }}
              <button type="button" @click="removeEmail(idx)" class="hover:text-red-500 focus:outline-none">
                <X class="w-3 h-3" />
              </button>
            </span>
          </div>
          <input 
            type="text" 
            v-model="emailInput" 
            @keydown.enter.prevent="addEmail"
            @keydown.188.prevent="addEmail"
            placeholder="Type an email and press Enter or Comma..."
            class="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 hover:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
          <p class="text-xs text-gray-500 mt-1">Press Enter or type a comma after each email to add it.</p>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-semibold text-gray-700">Subject Line <span class="text-red-500">*</span></label>
          <input 
            type="text" 
            v-model="form.subject" 
            required 
            placeholder="Important Update Regarding Your Ticket"
            class="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 hover:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-semibold text-gray-700">Email Body <span class="text-red-500">*</span></label>
          <div class="quill-wrapper border border-gray-300 rounded-xl overflow-hidden bg-gray-50 hover:bg-white focus-within:ring-2 focus-within:ring-indigo-500 focus-within:bg-white transition-all">
            <ClientOnly>
              <QuillEditor 
                theme="snow" 
                v-model:content="form.message" 
                contentType="html" 
                :toolbar="toolbarOptions" 
                ref="quillEditor"
                style="min-height: 250px;"
              />
            </ClientOnly>
          </div>
        </div>

        <div class="pt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-gray-100">
          <button 
            type="button"
            @click="cancelCompose"
            class="w-full sm:w-auto px-6 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button 
            type="button" 
            @click="saveOrSend('draft')"
            :disabled="loading || !isFormValid" 
            class="w-full sm:w-auto px-6 py-3 bg-indigo-50 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 transition-all disabled:opacity-50"
          >
            Save as Draft
          </button>
          <button 
            type="submit" 
            :disabled="loading || !isFormValid" 
            class="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg v-if="loading && submittingAction === 'send'" class="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <span>{{ (loading && submittingAction === 'send') ? 'Sending...' : 'Send Broadcast' }}</span>
          </button>
        </div>

      </form>
    </div>
    
    <!-- Hidden file input for custom image handler -->
    <input type="file" ref="imageUploadInput" class="hidden" accept="image/*" @change="handleImageUpload" />

    <!-- Modals -->
    <ConfirmModal 
      :isOpen="isDeleteModalOpen"
      title="Delete Communication"
      description="Are you sure you want to delete this email? This action cannot be undone."
      @close="isDeleteModalOpen = false"
      @confirm="executeDelete"
    />

    <ConfirmModal 
      :isOpen="isSendModalOpen"
      title="Dispatch Email"
      description="Are you sure you want to send this broadcast right now? It will be delivered to the selected audience immediately."
      @close="isSendModalOpen = false"
      @confirm="executeSend"
    />

    <PreviewModal 
      :isOpen="isPreviewModalOpen"
      :htmlContent="previewContent"
      @close="isPreviewModalOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue';
import { useRuntimeConfig } from '#app';
import { toast } from 'vue-sonner';
import { X } from 'lucide-vue-next';
import CustomSelect from '~/components/CustomSelect.vue';
import ConfirmModal from '~/components/ConfirmModal.vue';
import PreviewModal from '~/components/PreviewModal.vue';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';

definePageMeta({ layout: 'default' });

const config = useRuntimeConfig();

const viewMode = ref('list'); // 'list' or 'compose'
const communications = ref([]);
const loadingList = ref(false);

const events = ref([]);
const loading = ref(false);
const submittingAction = ref(''); // 'draft' or 'send'

const isDeleteModalOpen = ref(false);
const isSendModalOpen = ref(false);
const isPreviewModalOpen = ref(false);
const commToActOn = ref(null);
const previewContent = ref('');

const audienceOptions = [
  { value: 'all', label: 'All Attendees (Across all events)' },
  { value: 'event', label: 'Attendees of a Specific Event' },
  { value: 'custom', label: 'Custom Email List' }
];

const eventOptions = computed(() => {
  return events.value.map(e => ({ value: e._id, label: e.title }));
});

const form = ref({
  id: null,
  audience: '',
  eventId: '',
  subject: '',
  message: ''
});

const customEmailsList = ref([]);
const emailInput = ref('');

const addEmail = () => {
  const email = emailInput.value.trim().replace(/,$/, '');
  if (email && email.includes('@')) {
    if (!customEmailsList.value.includes(email)) {
      customEmailsList.value.push(email);
    }
  }
  emailInput.value = '';
};

const removeEmail = (index) => {
  customEmailsList.value.splice(index, 1);
};

const isFormValid = computed(() => {
  if (!form.value.audience || !form.value.subject || !form.value.message || form.value.message === '<p><br></p>') return false;
  if (form.value.audience === 'event' && !form.value.eventId) return false;
  if (form.value.audience === 'custom' && customEmailsList.value.length === 0 && !emailInput.value.trim()) return false;
  return true;
});

// Quill Configuration
const quillEditor = ref(null);
const imageUploadInput = ref(null);

const toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'],
  ['blockquote', 'code-block'],
  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
  [{ 'script': 'sub'}, { 'script': 'super' }],
  [{ 'indent': '-1'}, { 'indent': '+1' }],
  [{ 'size': ['small', false, 'large', 'huge'] }],
  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
  [{ 'color': [] }, { 'background': [] }],
  [{ 'align': [] }],
  ['link', 'image', 'video'],
  ['clean']
];

onMounted(async () => {
  await fetchEvents();
  await fetchCommunications();
});

const fetchCommunications = async () => {
  loadingList.value = true;
  try {
    const res = await fetch(`${config.public.apiBase}/communications`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('ticketr_admin_token')}`
      }
    });
    if (res.ok) {
      communications.value = await res.json();
    }
  } catch (err) {
    toast.error('Failed to load communications history.');
  } finally {
    loadingList.value = false;
  }
};

const fetchEvents = async () => {
  try {
    const res = await fetch(`${config.public.apiBase}/events/admin/my-events`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('ticketr_admin_token')}`
      }
    });
    if (res.ok) {
      events.value = await res.json();
    } else {
      const res2 = await fetch(`${config.public.apiBase}/events/tenant`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ticketr_admin_token')}`
        }
      });
      if (res2.ok) {
         events.value = await res2.json();
      }
    }
  } catch (error) {
    console.error('Error fetching events:', error);
  }
};

const initQuill = () => {
  setTimeout(() => {
    if (quillEditor.value) {
      const quill = quillEditor.value.getQuill();
      if(quill) {
        quill.getModule('toolbar').addHandler('image', () => {
          imageUploadInput.value.click();
        });
        if (form.value.message) {
          quillEditor.value.setHTML(form.value.message);
        }
      }
    }
  }, 1000);
};

const openCompose = (comm = null) => {
  if (comm) {
    form.value = {
      id: comm._id,
      audience: comm.audience,
      eventId: comm.eventId || '',
      subject: comm.subject,
      message: comm.message
    };
    customEmailsList.value = comm.customEmails || [];
  } else {
    form.value = { id: null, audience: '', eventId: '', subject: '', message: '' };
    customEmailsList.value = [];
  }
  emailInput.value = '';
  viewMode.value = 'compose';
  initQuill();
};

const cancelCompose = () => {
  viewMode.value = 'list';
};

const showPreview = (comm) => {
  previewContent.value = comm.message;
  isPreviewModalOpen.value = true;
};

const confirmDelete = (comm) => {
  commToActOn.value = comm;
  isDeleteModalOpen.value = true;
};

const confirmSend = (comm) => {
  commToActOn.value = comm;
  isSendModalOpen.value = true;
};

const executeDelete = async () => {
  isDeleteModalOpen.value = false;
  try {
    const res = await fetch(`${config.public.apiBase}/communications/${commToActOn.value._id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('ticketr_admin_token')}`
      }
    });
    if (res.ok) {
      toast.success('Deleted successfully');
      fetchCommunications();
    } else {
      toast.error('Failed to delete');
    }
  } catch (err) {
    toast.error('Network error');
  }
};

const executeSend = async () => {
  isSendModalOpen.value = false;
  
  // We can optimistically mark it as sending in UI
  const commIndex = communications.value.findIndex(c => c._id === commToActOn.value._id);
  if (commIndex > -1) {
    communications.value[commIndex].status = 'SENDING';
  }
  toast.info('Dispatching emails in the background...');

  try {
    const res = await fetch(`${config.public.apiBase}/communications/${commToActOn.value._id}/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('ticketr_admin_token')}`
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'Broadcast sent successfully!');
      } else {
        toast.error(data.message || 'Failed to send broadcast');
      }
    } else {
      toast.error('Error occurred while dispatching.');
    }
  } catch (err) {
    toast.error('Network error while dispatching.');
  } finally {
    fetchCommunications(); // refresh status
  }
};

const saveOrSend = async (action) => {
  if (form.value.audience === 'custom' && emailInput.value.trim()) {
    addEmail();
  }

  if (!isFormValid.value) return;
  
  // If action is send from the compose view, we first save, then send.
  submittingAction.value = action;
  loading.value = true;
  
  try {
    const payload = {
      audience: form.value.audience,
      eventId: form.value.audience === 'event' ? form.value.eventId : undefined,
      customEmails: form.value.audience === 'custom' ? customEmailsList.value : undefined,
      subject: form.value.subject,
      message: form.value.message
    };

    const method = form.value.id ? 'PUT' : 'POST';
    const url = form.value.id 
      ? `${config.public.apiBase}/communications/${form.value.id}` 
      : `${config.public.apiBase}/communications`;

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('ticketr_admin_token')}`
      },
      body: JSON.stringify(payload)
    });
    
    if (res.ok) {
      const savedComm = await res.json();
      
      if (action === 'send') {
        // Send it now
        commToActOn.value = savedComm;
        // Don't show modal, just send it because they clicked Send Broadcast from form
        await executeSend(); 
      } else {
        toast.success('Draft saved successfully');
      }
      
      viewMode.value = 'list';
      fetchCommunications();
    } else {
      const err = await res.json();
      toast.error(err.message || 'Error occurred while saving.');
    }
  } catch (error) {
    toast.error('Network error. Check your connection.');
  } finally {
    loading.value = false;
    submittingAction.value = '';
  }
};

const handleImageUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const quill = quillEditor.value.getQuill();
  const range = quill.getSelection(true);

  toast.info('Uploading image...', { id: 'image-upload' });

  const formData = new FormData();
  formData.append('image', file);

  try {
    const res = await fetch(`${config.public.apiBase}/communications/upload-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('ticketr_admin_token')}`
      },
      body: formData
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        quill.insertEmbed(range.index, 'image', data.url);
        quill.setSelection(range.index + 1);
        toast.success('Image uploaded successfully', { id: 'image-upload' });
      }
    } else {
      toast.error('Failed to upload image', { id: 'image-upload' });
    }
  } catch (err) {
    toast.error('Network error while uploading image', { id: 'image-upload' });
  } finally {
    event.target.value = '';
  }
};
</script>

<style>
.quill-wrapper .ql-toolbar {
  border: none !important;
  border-bottom: 1px solid #e5e7eb !important;
  background-color: #f9fafb;
  border-top-left-radius: 0.75rem;
  border-top-right-radius: 0.75rem;
  padding: 12px !important;
}
.quill-wrapper .ql-container {
  border: none !important;
  font-family: inherit !important;
  font-size: 14px !important;
}
.quill-wrapper .ql-editor {
  min-height: 250px;
  padding: 16px !important;
}
</style>
