<template>
  <form class="space-y-5" @submit.prevent="submit">
    <!-- Progress / actions -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">New event</p>
        <h2 class="font-display text-2xl font-semibold text-ink mt-0.5">Build your event</h2>
      </div>
      <div class="flex gap-2">
        <NuxtLink to="/admin/events" class="btn-secondary btn-sm">Cancel</NuxtLink>
        <button type="submit" class="btn-primary btn-sm" :disabled="submitting">
          <span v-if="submitting" class="w-4 h-4 border-2 border-paper/40 border-t-paper rounded-full animate-spin" />
          {{ submitting ? 'Publishing…' : 'Publish event' }}
        </button>
      </div>
    </div>

    <p v-if="error" class="rounded-xl bg-coral/10 border border-coral/20 px-4 py-3 text-[12.5px] font-medium text-coral">
      {{ error }}
    </p>

    <div class="grid lg:grid-cols-[1.6fr_1fr] gap-5 items-start">
      <div class="space-y-5 min-w-0">
        <!-- Basics -->
        <section class="surface p-5 sm:p-6 space-y-4">
          <header>
            <h3 class="font-display text-lg font-semibold text-ink">Event basics</h3>
            <p class="text-xs text-muted mt-0.5">What people see on the storefront.</p>
          </header>

          <div>
            <label class="label" for="title">Event title</label>
            <input id="title" v-model.trim="form.title" type="text" maxlength="120" class="input" placeholder="e.g. Dinner & Awards Night 2026" @input="onTitleInput" />
            <p v-if="fieldErrors.title" class="field-error">{{ fieldErrors.title }}</p>
          </div>

          <div>
            <label class="label" for="slug">Event link</label>
            <div class="flex items-center gap-1 rounded-xl border border-line bg-paper px-3 py-2.5 text-sm">
              <span class="text-muted shrink-0 hidden sm:inline">/event/</span>
              <input id="slug" v-model.trim="form.slug" type="text" class="flex-1 bg-transparent border-0 p-0 text-sm font-medium text-ink focus:ring-0 focus:outline-none mono" placeholder="dinner-awards-2026" @input="slugEdited = true" />
            </div>
            <p class="field-hint">Lowercase letters, numbers and dashes. Must be unique for your organization.</p>
          </div>

          <div>
            <label class="label" for="description">Description</label>
            <textarea id="description" v-model.trim="form.description" rows="6" maxlength="8000" class="input resize-y" placeholder="What happens, who it's for, what's included…" />
            <div class="flex justify-between mt-1">
              <p v-if="fieldErrors.description" class="field-error">{{ fieldErrors.description }}</p>
              <p class="field-hint ml-auto">{{ form.description.length }}/8000</p>
            </div>
          </div>

          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label class="label" for="startDate">Starts</label>
              <input id="startDate" v-model="form.startDate" type="datetime-local" class="input" />
              <p v-if="fieldErrors.startDate" class="field-error">{{ fieldErrors.startDate }}</p>
            </div>
            <div>
              <label class="label" for="endDate">Ends</label>
              <input id="endDate" v-model="form.endDate" type="datetime-local" class="input" />
              <p v-if="fieldErrors.endDate" class="field-error">{{ fieldErrors.endDate }}</p>
            </div>
          </div>

          <div>
            <label class="label" for="location">Venue or link</label>
            <input id="location" v-model.trim="form.location" type="text" class="input" placeholder="e.g. J.F. Ade Ajayi Hall, UNILAG" />
            <label class="flex items-center gap-2 mt-2 text-[12px] font-medium text-muted cursor-pointer">
              <input v-model="form.isVirtual" type="checkbox" class="w-3.5 h-3.5 rounded border-line text-forest focus:ring-forest" />
              This is an online event
            </label>
            <p v-if="fieldErrors.location" class="field-error">{{ fieldErrors.location }}</p>
          </div>

          <div>
            <label class="label" for="tags">Tags</label>
            <input id="tags" v-model="form.tags" type="text" class="input" placeholder="Campus, Awards, Dinner" />
            <p class="field-hint">Comma separated. Used for discovery filters.</p>
          </div>
        </section>

        <!-- Media -->
        <section class="surface p-5 sm:p-6 space-y-4">
          <header>
            <h3 class="font-display text-lg font-semibold text-ink">Cover & gallery</h3>
            <p class="text-xs text-muted mt-0.5">The first image becomes the cover. Up to 10 images, 10MB each.</p>
          </header>

          <label class="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line bg-paper/60 px-4 py-8 cursor-pointer hover:border-forest/40 transition">
            <ImagePlus class="w-6 h-6 text-muted" />
            <span class="text-xs font-semibold text-ink">Choose images</span>
            <span class="text-[11px] text-muted">JPG, PNG or WEBP</span>
            <input type="file" accept="image/png,image/jpeg,image/webp" multiple class="sr-only" @change="onFiles" />
          </label>

          <div v-if="imagePreviews.length" class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div v-for="(preview, index) in imagePreviews" :key="preview" class="relative aspect-[4/3] rounded-xl overflow-hidden border border-line group">
              <img :src="preview" alt="" class="w-full h-full object-cover" />
              <span v-if="index === 0" class="absolute top-1.5 left-1.5 chip-lime !text-[8px] !px-1.5 !py-0.5">Cover</span>
              <button type="button" class="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-ink/80 text-paper flex items-center justify-center opacity-0 group-hover:opacity-100 transition" @click="removeImage(index)">
                <X class="w-3 h-3" />
              </button>
            </div>
          </div>
        </section>

        <!-- Tiers -->
        <section class="surface p-5 sm:p-6 space-y-4">
          <header class="flex items-start justify-between gap-3">
            <div>
              <h3 class="font-display text-lg font-semibold text-ink">Ticket tiers</h3>
              <p class="text-xs text-muted mt-0.5">Price in Naira. Capacity counts physical passes.</p>
            </div>
            <button type="button" class="btn-secondary btn-sm" @click="addTier"><Plus class="w-3.5 h-3.5" /> Add tier</button>
          </header>

          <div v-if="!form.tiers.length" class="rounded-xl border border-dashed border-line p-6 text-center text-sm text-muted">
            Add at least one ticket tier to publish.
          </div>

          <div v-for="(tier, index) in form.tiers" :key="index" class="rounded-xl border border-line bg-paper/40 p-4 space-y-3">
            <div class="flex items-center justify-between gap-2">
              <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Tier {{ index + 1 }}</p>
              <button v-if="form.tiers.length > 1" type="button" class="text-coral hover:bg-coral/10 rounded-lg p-1.5" title="Remove tier" @click="form.tiers.splice(index, 1)">
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>

            <div class="grid sm:grid-cols-2 gap-3">
              <div class="sm:col-span-2">
                <label class="label">Name</label>
                <input v-model.trim="tier.name" type="text" class="input !py-2.5" placeholder="e.g. VIP, Regular, Table for 10" />
              </div>
              <div>
                <label class="label">Price (₦)</label>
                <input v-model.number="tier.price" type="number" min="0" step="50" class="input !py-2.5" />
              </div>
              <div>
                <label class="label">Capacity</label>
                <input v-model.number="tier.capacity" type="number" min="1" class="input !py-2.5" />
              </div>
              <div>
                <label class="label">Max per order</label>
                <input v-model.number="tier.maxPerPurchase" type="number" min="1" class="input !py-2.5" />
              </div>
              <div>
                <label class="label">Description</label>
                <input v-model.trim="tier.description" type="text" class="input !py-2.5" placeholder="Optional" />
              </div>
            </div>

            <label class="flex items-center gap-2 text-[12px] font-medium text-muted cursor-pointer">
              <input v-model="tier.isCoupleTicket" type="checkbox" class="w-3.5 h-3.5 rounded border-line text-forest focus:ring-forest" />
              Couple ticket (issues 2 passes per unit)
            </label>
          </div>

          <p v-if="fieldErrors.tiers" class="field-error">{{ fieldErrors.tiers }}</p>
        </section>

        <!-- Form settings -->
        <section class="surface p-5 sm:p-6 space-y-4">
          <header>
            <h3 class="font-display text-lg font-semibold text-ink">Attendee questions</h3>
            <p class="text-xs text-muted mt-0.5">Optional details collected per pass at checkout.</p>
          </header>

          <label class="flex items-center gap-2 text-[13px] font-medium text-ink cursor-pointer">
            <input v-model="form.formSettings.requireDepartment" type="checkbox" class="w-4 h-4 rounded border-line text-forest focus:ring-forest" />
            Ask for a department / association
          </label>

          <div v-if="form.formSettings.requireDepartment" class="grid sm:grid-cols-2 gap-3">
            <div>
              <label class="label">Label</label>
              <input v-model.trim="form.formSettings.departmentLabel" type="text" class="input !py-2.5" placeholder="Department" />
            </div>
            <div>
              <label class="label">Options</label>
              <input v-model="form.formSettings.departmentOptionsText" type="text" class="input !py-2.5" placeholder="EDM, TVESA, ULSESA" />
            </div>
          </div>

          <div class="divider" />

          <div class="flex items-center justify-between">
            <p class="text-[13px] font-semibold text-ink">Custom fields</p>
            <button type="button" class="btn-ghost btn-sm" @click="form.formSettings.customFields.push({ name: '', label: '', type: 'text', required: false, optionsText: '' })">
              <Plus class="w-3.5 h-3.5" /> Add field
            </button>
          </div>

          <div v-for="(field, index) in form.formSettings.customFields" :key="index" class="rounded-xl border border-line p-3.5 space-y-2.5">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Field {{ index + 1 }}</span>
              <button type="button" class="text-coral" @click="form.formSettings.customFields.splice(index, 1)"><Trash2 class="w-3.5 h-3.5" /></button>
            </div>
            <div class="grid sm:grid-cols-2 gap-2.5">
              <input v-model.trim="field.label" type="text" class="input !py-2.5" placeholder="Label (e.g. Meal preference)" />
              <select v-model="field.type" class="input !py-2.5">
                <option value="text">Short text</option>
                <option value="select">Dropdown</option>
              </select>
            </div>
            <input v-if="field.type === 'select'" v-model="field.optionsText" type="text" class="input !py-2.5" placeholder="Options, comma separated" />
            <label class="flex items-center gap-2 text-[12px] text-muted">
              <input v-model="field.required" type="checkbox" class="w-3.5 h-3.5 rounded border-line text-forest focus:ring-forest" /> Required
            </label>
          </div>
        </section>
      </div>

      <!-- Sidebar -->
      <aside class="space-y-4 lg:sticky lg:top-[92px]">
        <section class="surface p-5 space-y-3">
          <h3 class="font-display text-lg font-semibold text-ink">Policies</h3>
          <label class="flex items-start gap-2.5 text-[12.5px] text-ink cursor-pointer">
            <input v-model="form.resaleEnabled" type="checkbox" class="mt-0.5 w-4 h-4 rounded border-line text-forest focus:ring-forest" />
            <span>
              Allow verified resale & transfers
              <span class="block text-[11px] text-muted">Old QR codes are invalidated when a ticket changes hands.</span>
            </span>
          </label>
          <div v-if="form.resaleEnabled">
            <label class="label">Resale price cap (%)</label>
            <input v-model.number="form.resalePriceCapPercent" type="number" min="0" max="100" class="input !py-2.5" />
            <p class="field-hint">100 = never above face value. Most organizers keep this at 100.</p>
          </div>
          <div>
            <label class="label">Transfer policy</label>
            <textarea v-model.trim="form.transferPolicy" rows="2" class="input !py-2.5 resize-y text-[12.5px]" />
          </div>
          <div>
            <label class="label">Refund policy</label>
            <textarea v-model.trim="form.refundPolicy" rows="2" class="input !py-2.5 resize-y text-[12.5px]" />
          </div>
        </section>

        <section class="surface p-5 space-y-3">
          <h3 class="font-display text-lg font-semibold text-ink">Check-in window</h3>
          <div>
            <label class="label">Opens</label>
            <input v-model="form.checkInStart" type="datetime-local" class="input !py-2.5" />
          </div>
          <div>
            <label class="label">Closes</label>
            <input v-model="form.checkInEnd" type="datetime-local" class="input !py-2.5" />
          </div>
          <p class="field-hint">Leave blank to allow scanning around the event time. Setting this prevents early or late entry.</p>
        </section>

        <section class="surface p-5">
          <h3 class="font-display text-lg font-semibold text-ink">Publish checklist</h3>
          <ul class="mt-3 space-y-2 text-[12px]">
            <li v-for="item in checklist" :key="item.label" class="flex items-center gap-2">
              <span class="w-4 h-4 rounded-full flex items-center justify-center shrink-0" :class="item.ok ? 'bg-lime text-ink' : 'bg-paper border border-line text-muted'">
                <Check v-if="item.ok" class="w-2.5 h-2.5" />
              </span>
              <span :class="item.ok ? 'text-ink' : 'text-muted'">{{ item.label }}</span>
            </li>
          </ul>
          <button type="submit" class="btn-primary w-full mt-4" :disabled="submitting || !canPublish">
            {{ submitting ? 'Publishing…' : 'Publish event' }}
          </button>
          <p class="text-[10.5px] text-muted text-center mt-2">You can edit most details after publishing.</p>
        </section>
      </aside>
    </div>
  </form>
</template>

<script setup lang="ts">
import { Check, ImagePlus, Plus, Trash2, X } from 'lucide-vue-next';
import { toast } from 'vue-sonner';

definePageMeta({ layout: 'admin' });

const config = useRuntimeConfig();

const form = reactive({
  title: '',
  slug: '',
  description: '',
  location: '',
  isVirtual: false,
  startDate: '',
  endDate: '',
  checkInStart: '',
  checkInEnd: '',
  tags: '',
  resaleEnabled: true,
  resalePriceCapPercent: 100,
  transferPolicy: 'Tickets can be transferred once to a new attendee. Transfers are verified in-platform and rotate the QR code.',
  refundPolicy: 'All sales are final. In-platform verified resale is available while the event is upcoming.',
  tiers: [
    { name: 'Regular', description: '', price: 5000, capacity: 100, maxPerPurchase: 5, isCoupleTicket: false },
  ],
  formSettings: {
    requireDepartment: false,
    departmentLabel: 'Department / Association',
    departmentOptionsText: '',
    customFields: [] as Array<{ name: string; label: string; type: 'text' | 'select'; required: boolean; optionsText: string }>,
  },
});

const files = ref<File[]>([]);
const imagePreviews = ref<string[]>([]);
const submitting = ref(false);
const error = ref('');

const fieldErrors = computed(() => {
  const errors: Record<string, string> = {};
  if (form.title.length < 3) errors.title = 'Give the event a title (at least 3 characters).';
  if (form.description.length < 20) errors.description = 'Describe the event in at least 20 characters.';
  if (!form.location) errors.location = 'Add a venue or online link.';
  if (!form.startDate) errors.startDate = 'Choose a start date and time.';
  if (!form.endDate) errors.endDate = 'Choose an end date and time.';
  if (form.startDate && form.endDate && new Date(form.endDate) <= new Date(form.startDate)) {
    errors.endDate = 'The event must end after it starts.';
  }
  if (!form.tiers.length) errors.tiers = 'Add at least one ticket tier.';
  else if (form.tiers.some((tier) => !tier.name || !(tier.capacity > 0) || tier.price === null)) {
    errors.tiers = 'Every tier needs a name, a price and a capacity of at least 1.';
  }
  return errors;
});

const canPublish = computed(() => Object.keys(fieldErrors.value).length === 0);

const checklist = computed(() => [
  { label: 'Title and description', ok: form.title.length >= 3 && form.description.length >= 20 },
  { label: 'Date, time and venue', ok: !!form.startDate && !!form.endDate && !!form.location },
  { label: 'At least one ticket tier', ok: form.tiers.length > 0 && form.tiers.every((tier) => tier.name && tier.capacity > 0) },
  { label: 'Cover image (recommended)', ok: files.value.length > 0 },
]);

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

const slugEdited = ref(false);
function onTitleInput() {
  if (!slugEdited.value) form.slug = slugify(form.title);
}

function addTier() {
  form.tiers.push({ name: '', description: '', price: 0, capacity: 50, maxPerPurchase: 5, isCoupleTicket: false });
}

function onFiles(event: Event) {
  const input = event.target as HTMLInputElement;
  const selected = Array.from(input.files || []);
  const valid = selected.filter((file) => /^image\/(png|jpe?g|webp)$/.test(file.type) && file.size <= 10 * 1024 * 1024);
  if (valid.length !== selected.length) toast.error('Some files were skipped (images under 10MB only).');
  files.value = [...files.value, ...valid].slice(0, 10);
  imagePreviews.value = files.value.map((file) => URL.createObjectURL(file));
  input.value = '';
}

function removeImage(index: number) {
  files.value.splice(index, 1);
  imagePreviews.value.splice(index, 1);
}

function iso(value: string) {
  return value ? new Date(value).toISOString() : undefined;
}

async function submit() {
  error.value = '';
  if (!canPublish.value) {
    error.value = Object.values(fieldErrors.value)[0] || 'Check the required fields.';
    return;
  }

  submitting.value = true;
  try {
    const payload = new FormData();
    payload.append('title', form.title);
    payload.append('slug', form.slug || slugify(form.title));
    payload.append('description', form.description);
    payload.append('location', form.location);
    payload.append('isVirtual', String(form.isVirtual));
    payload.append('startDate', iso(form.startDate) as string);
    payload.append('endDate', iso(form.endDate) as string);
    if (form.checkInStart) payload.append('checkInStart', iso(form.checkInStart) as string);
    if (form.checkInEnd) payload.append('checkInEnd', iso(form.checkInEnd) as string);
    payload.append('tags', form.tags);
    payload.append('resaleEnabled', String(form.resaleEnabled));
    payload.append('resalePriceCapPercent', String(form.resalePriceCapPercent));
    payload.append('transferPolicy', form.transferPolicy);
    payload.append('refundPolicy', form.refundPolicy);

    payload.append(
      'tiers',
      JSON.stringify(
        form.tiers.map((tier) => ({
          name: tier.name,
          description: tier.description,
          price: Number(tier.price) || 0,
          capacity: Number(tier.capacity) || 1,
          maxPerPurchase: Number(tier.maxPerPurchase) || 5,
          isCoupleTicket: !!tier.isCoupleTicket,
        })),
      ),
    );

    payload.append(
      'formSettings',
      JSON.stringify({
        requireDepartment: form.formSettings.requireDepartment,
        departmentLabel: form.formSettings.departmentLabel,
        departmentOptions: form.formSettings.departmentOptionsText
          .split(',')
          .map((option) => option.trim())
          .filter(Boolean),
        customFields: form.formSettings.customFields
          .filter((field) => field.label)
          .map((field, index) => ({
            name: field.name || slugify(field.label).replace(/-/g, '_') || `field_${index}`,
            label: field.label,
            type: field.type,
            required: field.required,
            options: field.optionsText.split(',').map((option) => option.trim()).filter(Boolean),
          })),
      }),
    );

    for (const file of files.value) payload.append('images', file);

    const created = await apiRequest<any>('/events', { method: 'POST', body: payload });
    toast.success('Event published');
    await navigateTo(`/admin/events/${created._id}/edit`);
  } catch (err) {
    error.value = errorMessage(err, 'We could not create this event.');
  } finally {
    submitting.value = false;
  }
}

useSeoMeta({ title: 'Create event', robots: 'noindex, nofollow' });
void config;
</script>
