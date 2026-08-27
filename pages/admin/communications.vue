<template>
  <div class="max-w-4xl mx-auto p-6 lg:p-8 space-y-8">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Broadcast Communications</h1>
      <p class="text-sm text-gray-500 mt-1">Send emails to your attendees directly from the platform.</p>
    </div>

    <div class="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 lg:p-8">
      <form @submit.prevent="sendBroadcast" class="space-y-6">
        
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

        <div class="pt-4 flex items-center justify-end border-t border-gray-100">
          <button 
            type="submit" 
            :disabled="loading || !isFormValid" 
            class="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg v-if="loading" class="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <span>{{ loading ? 'Sending Broadcast...' : 'Send Broadcast' }}</span>
          </button>
        </div>

      </form>
    </div>
    
    <!-- Hidden file input for custom image handler -->
    <input type="file" ref="imageUploadInput" class="hidden" accept="image/*" @change="handleImageUpload" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue';
import { useRuntimeConfig } from '#app';
import { toast } from 'vue-sonner';
import { X } from 'lucide-vue-next';
import CustomSelect from '~/components/CustomSelect.vue';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';

definePageMeta({ layout: 'admin' });

const config = useRuntimeConfig();

const events = ref([]);
const loading = ref(false);

const audienceOptions = [
  { value: 'all', label: 'All Attendees (Across all events)' },
  { value: 'event', label: 'Attendees of a Specific Event' },
  { value: 'custom', label: 'Custom Email List' }
];

const eventOptions = computed(() => {
  return events.value.map(e => ({ value: e._id, label: e.title }));
});

const form = ref({
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
  if (form.value.audience === 'custom' && customEmailsList.value.length === 0) return false;
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
  
  setTimeout(() => {
    if (quillEditor.value) {
      const quill = quillEditor.value.getQuill();
      quill.getModule('toolbar').addHandler('image', () => {
        imageUploadInput.value.click();
      });
    }
  }, 1000);
});

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

const sendBroadcast = async () => {
  if (form.value.audience === 'custom' && emailInput.value.trim()) {
    addEmail();
  }

  if (!isFormValid.value) return;
  
  const confirmMsg = "Are you sure you want to broadcast this email? This action cannot be undone.";
  if (!window.confirm(confirmMsg)) return;

  loading.value = true;
  
  try {
    const payload = {
      audience: form.value.audience,
      eventId: form.value.audience === 'event' ? form.value.eventId : undefined,
      customEmails: form.value.audience === 'custom' ? customEmailsList.value : undefined,
      subject: form.value.subject,
      message: form.value.message
    };

    const res = await fetch(`${config.public.apiBase}/communications/broadcast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('ticketr_admin_token')}`
      },
      body: JSON.stringify(payload)
    });
    
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
         toast.success(data.message || 'Broadcast sent successfully!');
         form.value.audience = '';
         form.value.eventId = '';
         customEmailsList.value = [];
         emailInput.value = '';
         form.value.subject = '';
         form.value.message = '';
         
         if (quillEditor.value) {
            quillEditor.value.setHTML('');
         }
      } else {
         toast.error(data.message || 'Failed to send broadcast');
      }
    } else {
      const err = await res.json();
      toast.error(err.message || 'Error occurred while broadcasting.');
    }
  } catch (error) {
    toast.error('Network error. Check your connection.');
  } finally {
    loading.value = false;
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
