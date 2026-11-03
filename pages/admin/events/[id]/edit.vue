<template>
  <div class="space-y-4">
    <div v-if="loading" class="space-y-3">
      <div class="skeleton h-24" />
      <div class="skeleton h-64" />
    </div>

    <div v-else-if="loadError" class="surface p-8 text-center">
      <span class="w-12 h-12 rounded-2xl bg-coral/10 text-coral flex items-center justify-center mx-auto mb-3">
        <AlertTriangle class="w-6 h-6" />
      </span>
      <h2 class="font-display text-xl font-semibold text-ink">Event unavailable</h2>
      <p class="text-sm text-muted mt-1">{{ loadError }}</p>
      <NuxtLink to="/admin/events" class="btn-primary btn-sm mt-4">Back to events</NuxtLink>
    </div>

    <template v-else-if="event">
      <!-- Header -->
      <section class="surface p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <img v-if="event.bannerUrl" :src="event.bannerUrl" alt="" class="w-14 h-14 rounded-xl object-cover border border-line shrink-0" />
          <span v-else class="w-14 h-14 rounded-xl bg-paper border border-line flex items-center justify-center shrink-0">
            <Ticket class="w-5 h-5 text-muted" />
          </span>
          <div class="min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <UiBadge :value="event.status" dot />
              <span class="mono text-[10px] text-muted">{{ event._id.slice(-6) }}</span>
            </div>
            <h2 class="font-display text-xl font-semibold text-ink truncate mt-1">{{ event.title }}</h2>
            <p class="text-[12px] text-muted truncate">{{ event.location }} · {{ formatDate(event.startDate, { day: 'numeric', month: 'short' }) }}</p>
          </div>
        </div>
        <div class="flex flex-wrap gap-2 shrink-0">
          <NuxtLink :to="`/admin/events/${event._id}/attendees`" class="btn-secondary btn-sm">
            <Users class="w-3.5 h-3.5" /> Attendees
          </NuxtLink>
          <NuxtLink :to="`/admin/scanner?eventId=${event._id}`" class="btn-secondary btn-sm">
            <ScanLine class="w-3.5 h-3.5" /> Scanner
          </NuxtLink>
          <a :href="storefrontLink" target="_blank" class="btn-secondary btn-sm">
            <ExternalLink class="w-3.5 h-3.5" /> View live
          </a>
          <button class="btn-primary btn-sm" type="button" :disabled="saving" @click="saveDetails">
            {{ saving ? 'Saving…' : 'Save changes' }}
          </button>
        </div>
      </section>

      <p v-if="saveError" class="rounded-xl bg-coral/10 border border-coral/20 px-4 py-3 text-[12.5px] font-medium text-coral">{{ saveError }}</p>
      <p v-if="savedFlash" class="rounded-xl bg-forest/10 border border-forest/20 px-4 py-3 text-[12.5px] font-medium text-forest">Changes saved.</p>

      <div class="grid lg:grid-cols-[1.55fr_1fr] gap-4 items-start">
        <div class="space-y-4 min-w-0">
          <!-- Details -->
          <section class="surface p-4 sm:p-5 space-y-3.5">
            <h3 class="font-display text-lg font-semibold text-ink">Event details</h3>
            <div>
              <label class="label">Title</label>
              <input v-model.trim="form.title" type="text" class="input" />
            </div>
            <div>
              <label class="label">Description</label>
              <textarea v-model.trim="form.description" rows="6" class="input resize-y" />
            </div>
            <div class="grid sm:grid-cols-2 gap-3">
              <div>
                <label class="label">Starts</label>
                <input v-model="form.startDate" type="datetime-local" class="input" />
              </div>
              <div>
                <label class="label">Ends</label>
                <input v-model="form.endDate" type="datetime-local" class="input" />
              </div>
            </div>
            <div>
              <label class="label">Venue or link</label>
              <input v-model.trim="form.location" type="text" class="input" />
            </div>
            <div class="grid sm:grid-cols-2 gap-3">
              <div>
                <label class="label">Check-in opens</label>
                <input v-model="form.checkInStart" type="datetime-local" class="input" />
              </div>
              <div>
                <label class="label">Check-in closes</label>
                <input v-model="form.checkInEnd" type="datetime-local" class="input" />
              </div>
            </div>
            <div>
              <label class="label">Tags</label>
              <input v-model="form.tags" type="text" class="input" />
            </div>
            <div>
              <label class="label">Venue map link</label>
              <input v-model.trim="form.venueMapUrl" type="url" class="input" placeholder="https://maps.google.com/…" />
            </div>
          </section>

          <!-- Tiers -->
          <section class="surface p-4 sm:p-5 space-y-3">
            <div class="flex items-center justify-between gap-2">
              <div>
                <h3 class="font-display text-lg font-semibold text-ink">Ticket tiers</h3>
                <p class="text-[11.5px] text-muted">Price is locked once a tier has sales.</p>
              </div>
              <button class="btn-secondary btn-sm" type="button" @click="addTier">
                <Plus class="w-3.5 h-3.5" /> Add tier
              </button>
            </div>

            <div v-for="tier in event.tiers" :key="tier._id" class="rounded-xl border border-line p-3.5 space-y-3">
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <p class="text-[12.5px] font-semibold text-ink">{{ tier.name }}</p>
                  <UiBadge :value="tier.isActive ? 'ACTIVE' : 'DRAFT'" class="!text-[8px] !px-1.5 !py-0.5" />
                  <span v-if="tier.isCoupleTicket" class="chip-lime !text-[8px] !px-1.5">Couple</span>
                </div>
                <button
                  class="btn-ghost btn-sm text-coral"
                  type="button"
                  :disabled="(tier.soldCount || 0) > 0"
                  :title="(tier.soldCount || 0) > 0 ? 'Tier has sales' : 'Delete tier'"
                  @click="removeTier(tier)"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>

              <div class="grid sm:grid-cols-3 gap-2.5">
                <div class="sm:col-span-2">
                  <label class="label">Name</label>
                  <input v-model.trim="tier.name" type="text" class="input !py-2.5" @change="updateTier(tier)" />
                </div>
                <div>
                  <label class="label">Price</label>
                  <input
                    v-model.number="tier.price"
                    type="number"
                    min="0"
                    class="input !py-2.5"
                    :disabled="(tier.soldCount || 0) > 0"
                    @change="updateTier(tier)"
                  />
                </div>
                <div>
                  <label class="label">Capacity</label>
                  <input v-model.number="tier.capacity" type="number" :min="(tier.soldCount || 0) + (tier.reservedCount || 0) + 1" class="input !py-2.5" @change="updateTier(tier)" />
                </div>
                <div>
                  <label class="label">Max/order</label>
                  <input v-model.number="tier.maxPerPurchase" type="number" min="1" class="input !py-2.5" @change="updateTier(tier)" />
                </div>
                <div>
                  <label class="label">On sale</label>
                  <select v-model="tier.isActive" class="input !py-2.5" @change="updateTier(tier)">
                    <option :value="true">Active</option>
                    <option :value="false">Paused</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-3 gap-2 text-center text-[10.5px]">
                <div class="rounded-lg bg-paper border border-line py-1.5">
                  <p class="font-bold text-ink">{{ tier.soldCount || 0 }}</p>
                  <p class="text-muted">Sold</p>
                </div>
                <div class="rounded-lg bg-paper border border-line py-1.5">
                  <p class="font-bold text-ink">{{ tier.reservedCount || 0 }}</p>
                  <p class="text-muted">Held</p>
                </div>
                <div class="rounded-lg bg-paper border border-line py-1.5">
                  <p class="font-bold text-ink">{{ tier.remaining }}</p>
                  <p class="text-muted">Left</p>
                </div>
              </div>
            </div>

            <p v-if="tierError" class="field-error">{{ tierError }}</p>
          </section>

          <!-- Media -->
          <section class="surface p-4 sm:p-5 space-y-3">
            <h3 class="font-display text-lg font-semibold text-ink">Media</h3>
            <div class="flex flex-wrap gap-2">
              <label class="btn-secondary btn-sm cursor-pointer">
                <ImagePlus class="w-3.5 h-3.5" /> Replace cover
                <input type="file" accept="image/png,image/jpeg,image/webp" class="sr-only" @change="uploadCover" />
              </label>
              <label class="btn-secondary btn-sm cursor-pointer">
                <Plus class="w-3.5 h-3.5" /> Add gallery images
                <input type="file" accept="image/png,image/jpeg,image/webp" multiple class="sr-only" @change="uploadGallery" />
              </label>
            </div>
            <div class="grid grid-cols-3 sm:grid-cols-5 gap-2">
              <div v-for="(image, index) in event.carouselImages || []" :key="image + index" class="relative aspect-square rounded-lg overflow-hidden border border-line">
                <img :src="image" alt="" class="w-full h-full object-cover" />
              </div>
            </div>
          </section>
        </div>

        <!-- Sidebar -->
        <aside class="space-y-4">
          <section class="surface p-4 sm:p-5 space-y-3">
            <h3 class="font-display text-lg font-semibold text-ink">Status</h3>
            <select :value="event.status" class="input !py-2.5" @change="changeStatus(($event.target as HTMLSelectElement).value)">
              <option value="PUBLISHED">Published — on sale</option>
              <option value="DRAFT">Draft — hidden</option>
              <option value="CANCELLED">Cancelled — stop sales</option>
              <option value="COMPLETED">Completed — past event</option>
            </select>
            <p class="text-[11px] text-muted">Drafts are hidden from the storefront. Cancelling stops new sales but keeps existing tickets.</p>

            <div class="divider" />

            <h3 class="font-display text-lg font-semibold text-ink">Resale & policies</h3>
            <label class="flex items-start gap-2.5 text-[12.5px] text-ink cursor-pointer">
              <input v-model="form.resaleEnabled" type="checkbox" class="mt-0.5 w-4 h-4 rounded border-line text-forest focus:ring-forest" />
              <span>Verified resale & transfers</span>
            </label>
            <div v-if="form.resaleEnabled">
              <label class="label">Resale cap (%)</label>
              <input v-model.number="form.resalePriceCapPercent" type="number" min="0" max="100" class="input !py-2.5" />
            </div>
            <div>
              <label class="label">Transfer policy</label>
              <textarea v-model.trim="form.transferPolicy" rows="2" class="input !py-2.5 resize-y text-[12px]" />
            </div>
            <div>
              <label class="label">Refund policy</label>
              <textarea v-model.trim="form.refundPolicy" rows="2" class="input !py-2.5 resize-y text-[12px]" />
            </div>
          </section>

          <section class="surface p-4 sm:p-5">
            <h3 class="font-display text-lg font-semibold text-ink">Danger zone</h3>
            <p class="text-[11.5px] text-muted mt-1">Deleting is only possible before any tickets are issued.</p>
            <button class="btn-danger btn-sm mt-3 w-full" type="button" @click="deleteOpen = true">Delete event</button>
          </section>
        </aside>
      </div>

      <UiModal :open="deleteOpen" title="Delete this event?" eyebrow="Irreversible" size="sm" @close="deleteOpen = false">
        <p class="text-sm text-muted">This removes {{ event.title }} and its tiers. Events with tickets or payments cannot be deleted.</p>
        <p v-if="deleteError" class="field-error mt-2">{{ deleteError }}</p>
        <template #footer>
          <button class="btn-danger" type="button" :disabled="deleting" @click="deleteEvent">{{ deleting ? 'Deleting…' : 'Delete event' }}</button>
          <button class="btn-secondary" type="button" @click="deleteOpen = false">Cancel</button>
        </template>
      </UiModal>
    </template>
  </div>
</template>

<script setup lang="ts">
import { AlertTriangle, ExternalLink, ImagePlus, Plus, ScanLine, Ticket, Trash2, Users } from 'lucide-vue-next';
import { toast } from 'vue-sonner';

definePageMeta({ layout: 'admin' });

const route = useRoute();
const config = useRuntimeConfig();
const eventId = computed(() => String(route.params.id || ''));

const event = ref<any>(null);
const loading = ref(true);
const loadError = ref('');
const saving = ref(false);
const saveError = ref('');
const savedFlash = ref(false);
const tierError = ref('');
const deleteOpen = ref(false);
const deleting = ref(false);
const deleteError = ref('');

const form = reactive({
  title: '',
  description: '',
  location: '',
  startDate: '',
  endDate: '',
  checkInStart: '',
  checkInEnd: '',
  tags: '',
  venueMapUrl: '',
  resaleEnabled: true,
  resalePriceCapPercent: 100,
  transferPolicy: '',
  refundPolicy: '',
});

const storefrontLink = computed(() => {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/event/${event.value?.slug || ''}`;
});

function hydrateForm(source: any) {
  form.title = source.title || '';
  form.description = source.description || '';
  form.location = source.location || '';
  form.startDate = toLocalInput(source.startDate);
  form.endDate = toLocalInput(source.endDate);
  form.checkInStart = toLocalInput(source.checkInStart);
  form.checkInEnd = toLocalInput(source.checkInEnd);
  form.tags = (source.tags || []).join(', ');
  form.venueMapUrl = source.venueMapUrl || '';
  form.resaleEnabled = source.resaleEnabled !== false;
  form.resalePriceCapPercent = source.resalePriceCapPercent ?? 100;
  form.transferPolicy = source.transferPolicy || '';
  form.refundPolicy = source.refundPolicy || '';
}

async function load() {
  loading.value = true;
  loadError.value = '';
  try {
    const data = await apiRequest<any>(`/events/${eventId.value}`);
    event.value = data;
    hydrateForm(data);
  } catch (err) {
    loadError.value = errorMessage(err);
  } finally {
    loading.value = false;
  }
}

function iso(value: string) {
  return value ? new Date(value).toISOString() : undefined;
}

async function saveDetails() {
  saving.value = true;
  saveError.value = '';
  savedFlash.value = false;
  try {
    await apiRequest(`/events/${eventId.value}/details`, {
      method: 'PATCH',
      body: {
        title: form.title,
        description: form.description,
        location: form.location,
        startDate: iso(form.startDate),
        endDate: iso(form.endDate),
        checkInStart: iso(form.checkInStart) || null,
        checkInEnd: iso(form.checkInEnd) || null,
        tags: form.tags,
        venueMapUrl: form.venueMapUrl,
        resaleEnabled: form.resaleEnabled,
        resalePriceCapPercent: form.resalePriceCapPercent,
        transferPolicy: form.transferPolicy,
        refundPolicy: form.refundPolicy,
      },
    });
    savedFlash.value = true;
    toast.success('Event updated');
    await load();
    setTimeout(() => (savedFlash.value = false), 2500);
  } catch (err) {
    saveError.value = errorMessage(err);
  } finally {
    saving.value = false;
  }
}

async function updateTier(tier: any) {
  tierError.value = '';
  try {
    await apiRequest(`/events/${eventId.value}/tiers/${tier._id}`, {
      method: 'PATCH',
      body: {
        name: tier.name,
        price: Number(tier.price),
        capacity: Number(tier.capacity),
        maxPerPurchase: Number(tier.maxPerPurchase),
        isActive: tier.isActive === true || tier.isActive === 'true',
      },
    });
    await load();
  } catch (err) {
    tierError.value = errorMessage(err);
    await load();
  }
}

async function addTier() {
  tierError.value = '';
  try {
    await apiRequest(`/events/${eventId.value}/tiers`, {
      method: 'POST',
      body: { name: `New tier ${(event.value?.tiers?.length || 0) + 1}`, price: 0, capacity: 50, maxPerPurchase: 5 },
    });
    await load();
  } catch (err) {
    tierError.value = errorMessage(err);
  }
}

async function removeTier(tier: any) {
  if (!confirm(`Delete ${tier.name}?`)) return;
  tierError.value = '';
  try {
    await apiRequest(`/events/${eventId.value}/tiers/${tier._id}`, { method: 'DELETE' });
    await load();
  } catch (err) {
    tierError.value = errorMessage(err);
  }
}

async function changeStatus(status: string) {
  try {
    await apiRequest(`/events/${eventId.value}/status`, { method: 'PATCH', body: { status } });
    toast.success(`Event marked ${status.toLowerCase()}`);
    await load();
  } catch (err) {
    toast.error(errorMessage(err));
  }
}

async function uploadCover(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const form = new FormData();
  form.append('banner', file);
  try {
    await apiRequest(`/events/${eventId.value}`, { method: 'PATCH', body: form });
    toast.success('Cover updated');
    await load();
  } catch (err) {
    toast.error(errorMessage(err));
  }
}

async function uploadGallery(input: Event) {
  const files = Array.from((input.target as HTMLInputElement).files || []);
  if (!files.length) return;
  const form = new FormData();
  for (const file of files.slice(0, 10)) form.append('images', file);
  try {
    await apiRequest(`/events/${eventId.value}/images`, { method: 'PATCH', body: form });
    toast.success('Gallery updated');
    await load();
  } catch (err) {
    toast.error(errorMessage(err));
  }
}

async function deleteEvent() {
  deleting.value = true;
  deleteError.value = '';
  try {
    await apiRequest(`/events/${eventId.value}`, { method: 'DELETE' });
    toast.success('Event deleted');
    await navigateTo('/admin/events');
  } catch (err) {
    deleteError.value = errorMessage(err);
  } finally {
    deleting.value = false;
  }
}

onMounted(load);
useSeoMeta({ title: 'Edit event', robots: 'noindex, nofollow' });
void config;
</script>
