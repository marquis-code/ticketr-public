<template>
  <div class="space-y-4">
    <!-- Tabs -->
    <nav class="flex gap-1 overflow-x-auto no-scrollbar border-b border-line pb-px">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        class="px-3.5 py-2.5 text-[13px] font-semibold whitespace-nowrap border-b-2 transition-colors"
        :class="activeTab === tab.value ? 'border-ink text-ink' : 'border-transparent text-muted hover:text-ink'"
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
      </button>
    </nav>

    <div v-if="loading" class="space-y-3">
      <div class="skeleton h-20" />
      <div class="skeleton h-64" />
    </div>

    <div v-else-if="loadError" class="surface p-6">
      <p class="text-sm text-coral font-medium">{{ loadError }}</p>
      <button class="btn-secondary btn-sm mt-3" type="button" @click="loadAll">Retry</button>
    </div>

    <template v-else>
      <!-- Branding -->
      <section v-if="activeTab === 'branding'" class="grid lg:grid-cols-[1.4fr_1fr] gap-4 items-start">
        <div class="surface p-5 sm:p-6 space-y-4">
          <h3 class="font-display text-lg font-semibold text-ink">Storefront identity</h3>
          <div class="flex items-center gap-4">
            <img v-if="tenant.logoUrl" :src="tenant.logoUrl" alt="" class="w-16 h-16 rounded-2xl object-cover border border-line" />
            <span v-else class="w-16 h-16 rounded-2xl bg-ink text-lime flex items-center justify-center font-display text-xl font-semibold">
              {{ initials(tenant.name) }}
            </span>
            <label class="btn-secondary btn-sm cursor-pointer">
              <ImagePlus class="w-3.5 h-3.5" /> Upload logo
              <input type="file" accept="image/png,image/jpeg,image/webp" class="sr-only" @change="uploadLogo" />
            </label>
          </div>

          <div>
            <label class="label">Organization name</label>
            <input v-model.trim="tenant.name" type="text" class="input" />
          </div>
          <div class="grid sm:grid-cols-2 gap-3">
            <div>
              <label class="label">Contact email</label>
              <input v-model.trim="tenant.contactEmail" type="email" class="input" />
            </div>
            <div>
              <label class="label">Contact phone</label>
              <input v-model.trim="tenant.contactPhone" type="tel" class="input" />
            </div>
          </div>
          <div class="grid sm:grid-cols-2 gap-3">
            <div>
              <label class="label">Primary color</label>
              <div class="flex gap-2">
                <input v-model="tenant.primaryColor" type="color" class="w-11 h-11 rounded-lg border border-line bg-white p-1" />
                <input v-model="tenant.primaryColor" type="text" class="input mono" />
              </div>
            </div>
            <div>
              <label class="label">Accent color</label>
              <div class="flex gap-2">
                <input v-model="tenant.secondaryColor" type="color" class="w-11 h-11 rounded-lg border border-line bg-white p-1" />
                <input v-model="tenant.secondaryColor" type="text" class="input mono" />
              </div>
            </div>
          </div>
          <div>
            <label class="label">Notification emails</label>
            <input v-model="notificationEmails" type="text" class="input" placeholder="ops@org.com, finance@org.com" />
            <p class="field-hint">Comma separated. These addresses receive new-order alerts.</p>
          </div>
          <div>
            <label class="label">Storefront handle</label>
            <input :value="tenant.slug" type="text" class="input mono" disabled />
            <p class="field-hint">Changing the handle requires support, to avoid breaking shared event links.</p>
          </div>

          <p v-if="saveError" class="field-error">{{ saveError }}</p>
          <button class="btn-primary" type="button" :disabled="saving" @click="saveTenant">
            {{ saving ? 'Saving…' : 'Save branding' }}
          </button>
        </div>

        <div class="surface p-5">
          <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Live preview</p>
          <div class="mt-3 rounded-2xl border border-line overflow-hidden">
            <div class="h-20" :style="{ background: `linear-gradient(135deg, ${tenant.primaryColor}, ${tenant.secondaryColor})` }" />
            <div class="p-4 bg-white">
              <img v-if="tenant.logoUrl" :src="tenant.logoUrl" alt="" class="w-10 h-10 rounded-xl object-cover border border-line -mt-8 bg-white" />
              <p class="font-display text-base font-semibold text-ink mt-2">{{ tenant.name || 'Your organization' }}</p>
              <p class="text-[11px] text-muted">{{ tenant.slug }}.ticketr.org</p>
              <button class="btn-primary btn-sm w-full mt-3" :style="{ background: tenant.primaryColor }" type="button">Get tickets</button>
            </div>
          </div>
          <p class="text-[11px] text-muted mt-3">Buyers see your name, logo and colors across the storefront and ticket emails.</p>
        </div>
      </section>

      <!-- Payouts -->
      <section v-else-if="activeTab === 'payouts'" class="grid lg:grid-cols-[1.4fr_1fr] gap-4 items-start">
        <div class="surface p-5 sm:p-6 space-y-4">
          <div class="flex items-center justify-between gap-3">
            <h3 class="font-display text-lg font-semibold text-ink">Remittance account</h3>
            <span class="chip-soft">Manual transfers</span>
          </div>
          <p class="text-[12.5px] text-muted leading-relaxed">
            Only shown to buyers when your payment method is bank transfer. Card payments settle through Paystack.
          </p>

          <div>
            <label class="label">Bank</label>
            <select v-model="payout.bankCode" class="input" @change="syncBankName">
              <option value="">Select a bank…</option>
              <option v-for="bank in banks" :key="bank.code" :value="bank.code">{{ bank.name }}</option>
            </select>
          </div>
          <div class="grid sm:grid-cols-2 gap-3">
            <div>
              <label class="label">Account number</label>
              <input v-model.trim="payout.accountNumber" type="text" inputmode="numeric" maxlength="20" class="input mono" />
            </div>
            <div>
              <label class="label">Account name</label>
              <input v-model.trim="payout.accountName" type="text" class="input" />
            </div>
          </div>
          <button class="btn-secondary btn-sm" type="button" :disabled="resolving" @click="resolveAccount">
            {{ resolving ? 'Resolving…' : 'Verify account with Paystack' }}
          </button>
          <p v-if="resolveMessage" class="text-[12px] font-medium" :class="resolved ? 'text-forest' : 'text-coral'">{{ resolveMessage }}</p>

          <div class="divider" />

          <div class="rounded-xl bg-paper border border-line p-4">
            <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Payment rails</p>
            <p class="text-sm font-semibold text-ink mt-1">{{ tenant.paymentMethod === 'MANUAL_TRANSFER' ? 'Bank transfer (organizer review)' : 'Paystack (instant)' }}</p>
            <p class="text-[11px] text-muted mt-1">Payment rails are changed by Ticketr support for compliance and payout reconciliation.</p>
          </div>

          <p v-if="saveError" class="field-error">{{ saveError }}</p>
          <button class="btn-primary" type="button" :disabled="saving" @click="savePayout">
            {{ saving ? 'Saving…' : 'Save payout account' }}
          </button>
        </div>

        <div class="surface p-5 space-y-3">
          <h3 class="font-display text-lg font-semibold text-ink">How money moves</h3>
          <ol class="space-y-3 text-[12.5px] text-muted">
            <li class="flex gap-2.5"><span class="w-5 h-5 rounded-full bg-lime text-ink flex items-center justify-center text-[10px] font-bold shrink-0">1</span> Buyer pays by card or transfer.</li>
            <li class="flex gap-2.5"><span class="w-5 h-5 rounded-full bg-lime text-ink flex items-center justify-center text-[10px] font-bold shrink-0">2</span> Tickets are issued once the payment is verified.</li>
            <li class="flex gap-2.5"><span class="w-5 h-5 rounded-full bg-lime text-ink flex items-center justify-center text-[10px] font-bold shrink-0">3</span> Gross, platform fees and net payout are recorded per order.</li>
            <li class="flex gap-2.5"><span class="w-5 h-5 rounded-full bg-lime text-ink flex items-center justify-center text-[10px] font-bold shrink-0">4</span> Settlement follows the schedule in your organizer agreement.</li>
          </ol>
          <NuxtLink to="/admin/orders" class="btn-secondary btn-sm w-full">See orders & payouts</NuxtLink>
        </div>
      </section>

      <!-- Team -->
      <section v-else-if="activeTab === 'team'" class="grid lg:grid-cols-[1.4fr_1fr] gap-4 items-start">
        <div class="surface p-5 sm:p-6 space-y-4">
          <h3 class="font-display text-lg font-semibold text-ink">Team & access</h3>
          <p class="text-[12.5px] text-muted">Organizers see everything. Gate staff can only open the scanner and attendee lookup.</p>

          <div class="divide-y divide-line">
            <div v-for="member in team" :key="member.id" class="py-2.5 flex items-center gap-3">
              <span class="w-8 h-8 rounded-full bg-paper border border-line flex items-center justify-center text-[10px] font-bold text-ink">
                {{ initials(member.name) }}
              </span>
              <div class="min-w-0 flex-1">
                <p class="text-[13px] font-semibold text-ink truncate">{{ member.name }}</p>
                <p class="text-[11px] text-muted truncate">{{ member.email }}</p>
              </div>
              <span class="chip-muted !text-[9px]">{{ member.role }}</span>
            </div>
          </div>

          <div class="divider" />
          <h4 class="text-[13px] font-semibold text-ink">Invite someone</h4>
          <div class="grid sm:grid-cols-3 gap-2.5">
            <input v-model.trim="invite.name" type="text" class="input !py-2.5" placeholder="Full name" />
            <input v-model.trim="invite.email" type="email" class="input !py-2.5" placeholder="Email" />
            <select v-model="invite.role" class="input !py-2.5">
              <option value="ORGANIZER">Organizer</option>
              <option value="STAFF">Gate staff</option>
            </select>
          </div>
          <p v-if="inviteError" class="field-error">{{ inviteError }}</p>
          <button class="btn-primary btn-sm" type="button" :disabled="inviting" @click="sendInvite">
            {{ inviting ? 'Sending…' : 'Send invite' }}
          </button>
          <p class="text-[11px] text-muted">They receive a secure link to set a password.</p>
        </div>
      </section>

      <!-- Security -->
      <section v-else class="grid lg:grid-cols-[1.4fr_1fr] gap-4 items-start">
        <div class="surface p-5 sm:p-6 space-y-4">
          <h3 class="font-display text-lg font-semibold text-ink">Your account</h3>
          <div>
            <label class="label">Name</label>
            <input v-model.trim="profile.name" type="text" class="input" />
          </div>
          <div>
            <label class="label">Email</label>
            <input :value="profile.email" type="email" class="input" disabled />
          </div>
          <button class="btn-secondary btn-sm" type="button" :disabled="savingProfile" @click="saveProfile">
            {{ savingProfile ? 'Saving…' : 'Save profile' }}
          </button>

          <div class="divider" />
          <h4 class="text-[13px] font-semibold text-ink">Change password</h4>
          <div>
            <label class="label">Current password</label>
            <input v-model="password.current" type="password" autocomplete="current-password" class="input" />
          </div>
          <div class="grid sm:grid-cols-2 gap-3">
            <div>
              <label class="label">New password</label>
              <input v-model="password.next" type="password" autocomplete="new-password" class="input" />
            </div>
            <div>
              <label class="label">Confirm</label>
              <input v-model="password.confirm" type="password" autocomplete="new-password" class="input" />
            </div>
          </div>
          <p v-if="passwordError" class="field-error">{{ passwordError }}</p>
          <button class="btn-primary btn-sm" type="button" :disabled="changingPassword" @click="changePassword">
            {{ changingPassword ? 'Updating…' : 'Update password' }}
          </button>
        </div>

        <div class="surface p-5 space-y-3">
          <h3 class="font-display text-lg font-semibold text-ink">Session security</h3>
          <ul class="space-y-2.5 text-[12.5px] text-muted">
            <li class="flex gap-2"><ShieldCheck class="w-4 h-4 text-forest shrink-0" /> Sessions expire automatically; expired tokens are cleared.</li>
            <li class="flex gap-2"><Lock class="w-4 h-4 text-forest shrink-0" /> Passwords are hashed with bcrypt; login is rate-limited.</li>
            <li class="flex gap-2"><History class="w-4 h-4 text-forest shrink-0" /> Every privileged action is written to your audit trail.</li>
          </ul>
          <NuxtLink to="/admin/audit-logs" class="btn-secondary btn-sm w-full">Open audit trail</NuxtLink>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { History, ImagePlus, Lock, ShieldCheck } from 'lucide-vue-next';
import { toast } from 'vue-sonner';

definePageMeta({ layout: 'admin' });

const route = useRoute();

const tabs = [
  { label: 'Branding', value: 'branding' },
  { label: 'Payouts', value: 'payouts' },
  { label: 'Team', value: 'team' },
  { label: 'Security', value: 'security' },
];
const activeTab = ref(
  typeof route.query.tab === 'string' && tabs.some((tab) => tab.value === route.query.tab)
    ? String(route.query.tab)
    : 'branding',
);

const tenant = reactive<any>({
  id: '',
  name: '',
  slug: '',
  contactEmail: '',
  contactPhone: '',
  logoUrl: '',
  primaryColor: '#11483A',
  secondaryColor: '#0A1F1A',
  paymentMethod: 'PAYSTACK',
});
const notificationEmails = ref('');
const profile = reactive({ id: '', name: '', email: '' });
const team = ref<any[]>([]);
const banks = ref<any[]>([]);
const payout = reactive({ bankCode: '', bankName: '', accountNumber: '', accountName: '' });
const invite = reactive({ name: '', email: '', role: 'STAFF' });
const inviteError = ref('');
const inviting = ref(false);
const password = reactive({ current: '', next: '', confirm: '' });
const passwordError = ref('');
const changingPassword = ref(false);
const savingProfile = ref(false);

const loading = ref(true);
const loadError = ref('');
const saving = ref(false);
const saveError = ref('');
const resolving = ref(false);
const resolveMessage = ref('');
const resolved = ref(false);

async function loadAll() {
  loading.value = true;
  loadError.value = '';
  try {
    const me = await apiRequest<any>('/auth/me');
    Object.assign(profile, { id: me.id, name: me.name, email: me.email });
    if (me.tenant) {
      Object.assign(tenant, {
        id: me.tenant.id || me.tenant._id,
        name: me.tenant.name || '',
        slug: me.tenant.slug || '',
        contactEmail: me.tenant.contactEmail || '',
        contactPhone: me.tenant.contactPhone || '',
        logoUrl: me.tenant.logoUrl || '',
        primaryColor: me.tenant.primaryColor || '#11483A',
        secondaryColor: me.tenant.secondaryColor || '#0A1F1A',
        paymentMethod: me.tenant.paymentMethod || 'PAYSTACK',
      });
      notificationEmails.value = (me.tenant.notificationEmails || []).join(', ');
      const account = me.tenant.primaryRemittanceAccount || me.tenant.remittanceAccount;
      if (account) {
        payout.accountNumber = account.accountNumber || '';
        payout.accountName = account.accountName || '';
        payout.bankName = account.bankName || '';
        payout.bankCode = account.bankCode || '';
      }
    } else {
      loadError.value = 'Your account is not linked to an organization.';
    }
    if (tenant.id) {
      const [teamData, bankData] = await Promise.allSettled([
        apiRequest<any[]>('/auth/tenant-users'),
        apiRequest<any[]>('/paystack/banks'),
      ]);
      if (teamData.status === 'fulfilled') team.value = teamData.value || [];
      if (bankData.status === 'fulfilled') {
        banks.value = (bankData.value || []).slice(0, 300);
        if (!payout.bankName && payout.bankCode) {
          payout.bankName = banks.value.find((bank) => bank.code === payout.bankCode)?.name || '';
        }
      }
    }
  } catch (err) {
    loadError.value = errorMessage(err);
  } finally {
    loading.value = false;
  }
}

async function saveTenant() {
  saving.value = true;
  saveError.value = '';
  try {
    await apiRequest(`/tenants/${tenant.id}`, {
      method: 'PATCH',
      body: {
        name: tenant.name,
        contactEmail: tenant.contactEmail,
        contactPhone: tenant.contactPhone,
        logoUrl: tenant.logoUrl,
        primaryColor: tenant.primaryColor,
        secondaryColor: tenant.secondaryColor,
        notificationEmails: notificationEmails.value.split(',').map((email) => email.trim()).filter(Boolean),
      },
    });
    toast.success('Branding saved');
  } catch (err) {
    saveError.value = errorMessage(err);
  } finally {
    saving.value = false;
  }
}

async function uploadLogo(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const form = new FormData();
  form.append('image', file);
  try {
    const data = await apiRequest<any>('/communications/upload-image', { method: 'POST', body: form });
    if (data?.url) {
      tenant.logoUrl = data.url;
      await saveTenant();
    }
  } catch (err) {
    toast.error(errorMessage(err));
  }
}

function syncBankName() {
  payout.bankName = banks.value.find((bank) => bank.code === payout.bankCode)?.name || '';
  resolved.value = false;
  resolveMessage.value = '';
}

async function resolveAccount() {
  resolveMessage.value = '';
  if (!payout.bankCode || payout.accountNumber.length < 6) {
    resolveMessage.value = 'Select a bank and enter a valid account number.';
    resolved.value = false;
    return;
  }
  resolving.value = true;
  try {
    const data = await apiRequest<any>(
      `/paystack/resolve-account?accountNumber=${encodeURIComponent(payout.accountNumber)}&bankCode=${encodeURIComponent(payout.bankCode)}`,
    );
    payout.accountName = data?.account_name || payout.accountName;
    resolved.value = true;
    resolveMessage.value = `Verified: ${data?.account_name || 'account resolved'}`;
  } catch (err) {
    resolved.value = false;
    resolveMessage.value = errorMessage(err, 'Could not resolve that account.');
  } finally {
    resolving.value = false;
  }
}

async function savePayout() {
  saving.value = true;
  saveError.value = '';
  try {
    await apiRequest(`/tenants/${tenant.id}`, {
      method: 'PATCH',
      body: {
        primaryRemittanceAccount: {
          bankName: payout.bankName,
          bankCode: payout.bankCode,
          accountNumber: payout.accountNumber,
          accountName: payout.accountName,
        },
      },
    });
    toast.success('Payout account saved');
  } catch (err) {
    saveError.value = errorMessage(err);
  } finally {
    saving.value = false;
  }
}

async function sendInvite() {
  inviteError.value = '';
  if (!invite.name || !invite.email.includes('@')) {
    inviteError.value = 'Enter a name and valid email.';
    return;
  }
  inviting.value = true;
  try {
    await apiRequest('/auth/invite', { method: 'POST', body: invite });
    toast.success('Invite sent');
    invite.name = '';
    invite.email = '';
    const teamData = await apiRequest<any[]>('/auth/tenant-users');
    team.value = teamData || [];
  } catch (err) {
    inviteError.value = errorMessage(err);
  } finally {
    inviting.value = false;
  }
}

async function saveProfile() {
  savingProfile.value = true;
  try {
    await apiRequest('/auth/me', { method: 'PATCH', body: { name: profile.name } });
    toast.success('Profile updated');
  } catch (err) {
    toast.error(errorMessage(err));
  } finally {
    savingProfile.value = false;
  }
}

async function changePassword() {
  passwordError.value = '';
  if (password.next !== password.confirm) {
    passwordError.value = 'The new passwords do not match.';
    return;
  }
  if (password.next.length < 8) {
    passwordError.value = 'Use at least 8 characters with a letter and a number.';
    return;
  }
  changingPassword.value = true;
  try {
    await apiRequest('/auth/password', {
      method: 'PATCH',
      body: { currentPassword: password.current, newPassword: password.next },
    });
    toast.success('Password updated');
    password.current = '';
    password.next = '';
    password.confirm = '';
  } catch (err) {
    passwordError.value = errorMessage(err);
  } finally {
    changingPassword.value = false;
  }
}

watch(activeTab, (tab) => {
  if (typeof window !== 'undefined') {
    window.history.replaceState({}, '', `/admin/settings?tab=${tab}`);
  }
});

onMounted(loadAll);
useSeoMeta({ title: 'Settings', robots: 'noindex, nofollow' });
</script>
