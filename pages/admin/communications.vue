<template>
  <div class="space-y-4">
    <!-- Header -->
    <section class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Audience</p>
        <h2 class="font-display text-2xl font-semibold text-ink mt-0.5">Communications</h2>
        <p class="text-[12.5px] text-muted mt-1">Email attendees of one event or your whole list. Duplicate sends are blocked.</p>
      </div>
      <button class="btn-primary shrink-0" type="button" @click="openCompose()">
        <Plus class="w-4 h-4" /> New campaign
      </button>
    </section>

    <div v-if="error" class="surface p-4 border-coral/30 bg-coral/5 flex items-start gap-3">
      <AlertTriangle class="w-5 h-5 text-coral shrink-0 mt-0.5" />
      <p class="text-sm text-ink flex-1">{{ error }}</p>
      <button class="btn-secondary btn-sm" type="button" @click="load">Retry</button>
    </div>

    <!-- List -->
    <section class="table-wrap">
      <div v-if="loading" class="p-5 space-y-3">
        <div v-for="n in 4" :key="n" class="skeleton h-14" />
      </div>
      <UiEmpty
        v-else-if="!campaigns.length"
        title="No campaigns yet"
        message="Write once and reach every ticket holder, or send a targeted note to one event."
        class="!py-14"
      >
        <template #icon><Megaphone class="w-6 h-6" /></template>
        <template #action>
          <button class="btn-primary btn-sm" type="button" @click="openCompose()">New campaign</button>
        </template>
      </UiEmpty>
      <table v-else class="table min-w-[760px]">
        <thead>
          <tr>
            <th>Campaign</th>
            <th>Audience</th>
            <th>Recipients</th>
            <th>Status</th>
            <th>Updated</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="campaign in campaigns" :key="campaign._id">
            <td class="max-w-[280px]">
              <p class="text-[13px] font-semibold text-ink truncate">{{ campaign.subject }}</p>
              <p class="text-[11px] text-muted truncate">{{ stripHtml(campaign.message).slice(0, 90) }}</p>
            </td>
            <td>
              <span class="chip-muted !text-[9px]">{{ audienceLabel(campaign) }}</span>
            </td>
            <td class="text-[12px] text-ink">
              {{ campaign.recipientCount || 0 }}
              <span v-if="campaign.failedCount" class="text-[10px] text-coral block">{{ campaign.failedCount }} failed</span>
            </td>
            <td><UiBadge :value="campaign.status" dot /></td>
            <td class="text-[11.5px] text-muted whitespace-nowrap">{{ relativeTime(campaign.updatedAt || campaign.createdAt) }}</td>
            <td>
              <div class="flex items-center justify-end gap-1">
                <button class="btn-ghost btn-sm" type="button" title="Preview" @click="openPreview(campaign)">
                  <Eye class="w-4 h-4" />
                </button>
                <button class="btn-ghost btn-sm" type="button" title="Edit" :disabled="campaign.status === 'SENDING'" @click="openCompose(campaign)">
                  <Pencil class="w-4 h-4" />
                </button>
                <button
                  class="btn-secondary btn-sm !py-1.5 !px-2.5 text-[11px]"
                  type="button"
                  :disabled="sending === campaign._id || campaign.status === 'SENDING'"
                  @click="askSend(campaign)"
                >
                  {{ campaign.status === 'SENT' ? 'Resend' : 'Send' }}
                </button>
                <button class="btn-ghost btn-sm text-coral" type="button" title="Delete" @click="askDelete(campaign)">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- Compose -->
    <UiModal :open="compose.open" :title="compose.id ? 'Edit campaign' : 'New campaign'" eyebrow="Email attendees" size="lg" @close="compose.open = false">
      <div class="space-y-3.5">
        <div>
          <label class="label">Subject</label>
          <input v-model.trim="compose.subject" type="text" maxlength="140" class="input" placeholder="Doors open at 6pm — here's what to know" />
        </div>

        <div class="grid sm:grid-cols-2 gap-3">
          <div>
            <label class="label">Audience</label>
            <select v-model="compose.audience" class="input">
              <option value="event">Attendees of one event</option>
              <option value="all">Everyone who has a ticket</option>
              <option value="custom">Specific emails</option>
            </select>
          </div>
          <div v-if="compose.audience === 'event'">
            <label class="label">Event</label>
            <select v-model="compose.eventId" class="input">
              <option value="">Select event…</option>
              <option v-for="event in events" :key="event._id" :value="event._id">{{ event.title }}</option>
            </select>
          </div>
        </div>

        <div v-if="compose.audience === 'custom'">
          <label class="label">Emails</label>
          <textarea v-model="compose.customEmails" rows="2" class="input resize-y" placeholder="one@example.com, two@example.com" />
        </div>

        <div>
          <label class="label">Message</label>
          <textarea v-model="compose.message" rows="9" class="input resize-y" placeholder="Write your update. Basic formatting is preserved; scripts and iframes are stripped for safety." />
          <p class="field-hint">{{ compose.message.length }} characters · sent from your organizer identity</p>
        </div>

        <p v-if="compose.error" class="field-error">{{ compose.error }}</p>

        <div class="rounded-xl bg-paper border border-line p-3 text-[11.5px] text-muted">
          Campaigns cannot be edited while sending. A sent campaign must be duplicated deliberately — resending requires confirming a duplicate.
        </div>
      </div>
      <template #footer>
        <button class="btn-primary" type="button" :disabled="compose.saving" @click="saveCampaign">
          {{ compose.saving ? 'Saving…' : compose.id ? 'Save changes' : 'Create draft' }}
        </button>
        <button v-if="compose.id" class="btn-secondary" type="button" @click="compose.open = false; askSend(campaigns.find(c => c._id === compose.id))">
          Save & send
        </button>
        <button class="btn-ghost" type="button" @click="compose.open = false">Cancel</button>
      </template>
    </UiModal>

    <!-- Preview -->
    <UiModal :open="!!previewTarget" title="Campaign preview" eyebrow="Exactly what recipients get" size="lg" @close="previewTarget = null">
      <div v-if="previewTarget" class="space-y-3">
        <div class="rounded-xl border border-line overflow-hidden">
          <div class="px-4 py-3 bg-paper border-b border-line">
            <p class="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Subject</p>
            <p class="text-sm font-semibold text-ink">{{ previewTarget.subject }}</p>
          </div>
          <div class="p-4 prose-editorial" v-html="sanitizedPreview" />
        </div>
        <p class="text-[11px] text-muted">Scripts, iframes and inline event handlers are removed before sending.</p>
        <button class="btn-secondary btn-sm" type="button" @click="loadRecipientCount(previewTarget)">Check recipient count</button>
        <p v-if="recipientInfo" class="text-[12px] font-medium text-ink">{{ recipientInfo }}</p>
      </div>
    </UiModal>

    <!-- Send confirm -->
    <UiModal :open="!!sendTarget" :title="sendTarget?.status === 'SENT' ? 'Resend this campaign?' : 'Send this campaign?'" eyebrow="Email delivery" size="sm" @close="sendTarget = null">
      <p class="text-sm text-muted">
        <strong class="text-ink">{{ sendTarget?.subject }}</strong> will be emailed to every matching attendee. This cannot be undone.
      </p>
      <div v-if="sendTarget?.status === 'SENT'" class="mt-3 rounded-xl bg-amber-50 border border-amber-200 p-3 text-[12px] text-amber-900">
        This campaign was already sent. Resending will email everyone again.
      </div>
      <p v-if="sendError" class="field-error mt-2">{{ sendError }}</p>
      <template #footer>
        <button class="btn-primary" type="button" :disabled="!!sending" @click="confirmSend">
          {{ sending ? 'Sending…' : 'Send now' }}
        </button>
        <button class="btn-secondary" type="button" @click="sendTarget = null">Cancel</button>
      </template>
    </UiModal>

    <!-- Delete -->
    <UiModal :open="!!deleteTarget" title="Delete campaign?" eyebrow="Irreversible" size="sm" @close="deleteTarget = null">
      <p class="text-sm text-muted">{{ deleteTarget?.subject }} will be removed. Sent history is not recoverable.</p>
      <p v-if="deleteError" class="field-error mt-2">{{ deleteError }}</p>
      <template #footer>
        <button class="btn-danger" type="button" :disabled="deleting" @click="confirmDelete">{{ deleting ? 'Deleting…' : 'Delete' }}</button>
        <button class="btn-secondary" type="button" @click="deleteTarget = null">Cancel</button>
      </template>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import { AlertTriangle, Eye, Megaphone, Pencil, Plus, Trash2 } from 'lucide-vue-next';
import { toast } from 'vue-sonner';

definePageMeta({ layout: 'admin' });

const campaigns = ref<any[]>([]);
const events = ref<any[]>([]);
const loading = ref(true);
const error = ref('');
const sending = ref<string | null>(null);
const sendTarget = ref<any>(null);
const sendError = ref('');
const deleteTarget = ref<any>(null);
const deleteError = ref('');
const deleting = ref(false);
const previewTarget = ref<any>(null);
const recipientInfo = ref('');

const compose = reactive({
  open: false,
  id: '',
  subject: '',
  audience: 'event',
  eventId: '',
  customEmails: '',
  message: '',
  saving: false,
  error: '',
});

const sanitizedPreview = computed(() => {
  const raw = previewTarget.value?.message || '';
  return raw
    .replace(/<\s*(script|style|iframe|object|embed|form|input|meta|link)[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '');
});

function stripHtml(value: string) {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function audienceLabel(campaign: any) {
  if (campaign.audience === 'all') return 'All attendees';
  if (campaign.audience === 'event') return 'One event';
  return 'Custom list';
}

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const [campaignData, eventData] = await Promise.all([
      apiRequest<any>('/communications?limit=100'),
      apiRequest<any>('/events/tenant?limit=100'),
    ]);
    campaigns.value = campaignData?.data || [];
    events.value = eventData?.data || [];
  } catch (err) {
    error.value = errorMessage(err);
  } finally {
    loading.value = false;
  }
}

function openCompose(campaign?: any) {
  compose.open = true;
  compose.error = '';
  compose.id = campaign?._id || '';
  compose.subject = campaign?.subject || '';
  compose.audience = campaign?.audience || 'event';
  compose.eventId = campaign?.eventId || events.value[0]?._id || '';
  compose.customEmails = (campaign?.customEmails || []).join(', ');
  compose.message = campaign?.message || '';
}

async function saveCampaign(): Promise<any> {
  compose.error = '';
  if (compose.subject.length < 3) {
    compose.error = 'Add a subject line.';
    return null;
  }
  if (compose.message.length < 3) {
    compose.error = 'Write your message.';
    return null;
  }
  if (compose.audience === 'event' && !compose.eventId) {
    compose.error = 'Select the event.';
    return null;
  }

  compose.saving = true;
  try {
    const payload = {
      subject: compose.subject,
      message: compose.message,
      audience: compose.audience,
      eventId: compose.audience === 'event' ? compose.eventId : undefined,
      customEmails:
        compose.audience === 'custom'
          ? compose.customEmails.split(',').map((email) => email.trim()).filter(Boolean)
          : [],
    };
    const saved = compose.id
      ? await apiRequest<any>(`/communications/${compose.id}`, { method: 'PUT', body: payload })
      : await apiRequest<any>('/communications', { method: 'POST', body: payload });
    toast.success('Campaign saved');
    compose.open = false;
    await load();
    return saved;
  } catch (err) {
    compose.error = errorMessage(err);
    return null;
  } finally {
    compose.saving = false;
  }
}

function askSend(campaign: any) {
  if (!campaign) return;
  sendTarget.value = campaign;
  sendError.value = '';
}

async function confirmSend() {
  if (!sendTarget.value) return;
  sending.value = sendTarget.value._id;
  sendError.value = '';
  try {
    const result = await apiRequest<any>(`/communications/${sendTarget.value._id}/send`, {
      method: 'POST',
      body: { force: sendTarget.value.status === 'SENT' },
    });
    toast.success(result?.message || 'Campaign sent');
    sendTarget.value = null;
    await load();
  } catch (err) {
    sendError.value = errorMessage(err);
  } finally {
    sending.value = null;
  }
}

function openPreview(campaign: any) {
  previewTarget.value = campaign;
  recipientInfo.value = '';
}

async function loadRecipientCount(campaign: any) {
  try {
    const data = await apiRequest<any>(`/communications/${campaign._id}/preview-recipients`);
    recipientInfo.value = `${data.count} recipient${data.count === 1 ? '' : 's'} match this audience.`;
  } catch (err) {
    recipientInfo.value = errorMessage(err);
  }
}

function askDelete(campaign: any) {
  deleteTarget.value = campaign;
  deleteError.value = '';
}

async function confirmDelete() {
  deleting.value = true;
  deleteError.value = '';
  try {
    await apiRequest(`/communications/${deleteTarget.value._id}`, { method: 'DELETE' });
    toast.success('Campaign deleted');
    deleteTarget.value = null;
    await load();
  } catch (err) {
    deleteError.value = errorMessage(err);
  } finally {
    deleting.value = false;
  }
}

onMounted(load);
useSeoMeta({ title: 'Communications', robots: 'noindex, nofollow' });
</script>
