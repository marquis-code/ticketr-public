<template>
  <div>
    

    <main class="max-w-4xl mx-auto px-4 md:px-6 py-8 flex-grow w-full space-y-6">
      <div>
        <h1 class="text-2xl font-extrabold text-gray-900">Organization Settings</h1>
        <p class="text-xs text-gray-600 mt-1">Configure your organization's custom branding colors, logo, and Paystack payout settings.</p>
      </div>

      <div class="glass-card rounded-2xl p-8 border-primary/30">
        <form @submit.prevent="saveSettings" class="space-y-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Organization Name</label>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full  border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Subdomain (Slug)</label>
              <input
                v-model="form.slug"
                type="text"
                required
                class="w-full  border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-indigo-500"
              />
              <span class="text-[11px] text-gray-500 block mt-1">Updates live URL (e.g. {{ form.slug || 'slug' }}.ticketr.org)</span>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Contact Email</label>
              <input
                v-model="form.contactEmail"
                type="email"
                required
                class="w-full  border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Signatory Emails for Orders</label>
              <div class="flex gap-2 mb-2">
                <input
                  v-model="newEmail"
                  type="email"
                  class="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-900 focus:outline-none focus:border-indigo-500 bg-white"
                  placeholder="admin@example.com"
                  @keydown.enter.prevent="addEmail"
                />
                <button type="button" @click="addEmail" class="btn-secondary !py-2 !px-4 text-xs whitespace-nowrap bg-white border border-gray-200 hover:bg-gray-50">
                  Add
                </button>
              </div>
              <div class="flex flex-wrap gap-2">
                <span v-for="(email, idx) in form.notificationEmails" :key="idx" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-100">
                  {{ email }}
                  <button type="button" @click="removeEmail(idx)" class="text-indigo-400 hover:text-indigo-600 focus:outline-none w-4 h-4 flex items-center justify-center font-bold text-sm leading-none">&times;</button>
                </span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Primary Color (Hex)</label>
              <div class="flex items-center gap-3">
                <input v-model="form.primaryColor" type="color" class="w-10 h-10 rounded bg-transparent cursor-pointer border-0" />
                <input v-model="form.primaryColor" type="text" class="w-full  border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-900" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Secondary Color (Hex)</label>
              <div class="flex items-center gap-3">
                <input v-model="form.secondaryColor" type="color" class="w-10 h-10 rounded bg-transparent cursor-pointer border-0" />
                <input v-model="form.secondaryColor" type="text" class="w-full  border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-900" />
              </div>
            </div>
          </div>

          <div class="pt-6 border-t border-gray-200">
            <h2 class="text-sm font-bold text-gray-900 mb-1">Primary Remittance Account</h2>
            <p class="text-xs text-gray-500 mb-4">Your main account for receiving ticket sales payouts.</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Bank Name</label>
                <select v-model="form.primaryBankCode" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-indigo-500 bg-white">
                  <option value="" disabled>Select Bank</option>
                  <option v-for="bank in banks" :key="bank.code" :value="bank.code">{{ bank.name }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Account Number</label>
                <div class="flex gap-2">
                  <input v-model="form.primaryAccountNumber" type="text" placeholder="e.g. 0123456789" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-indigo-500" />
                  <button type="button" @click="verifyAccount('primary')" :disabled="!form.primaryBankCode || !form.primaryAccountNumber || verifying.primary" class="btn-secondary !py-2.5 !px-4 text-xs whitespace-nowrap">
                    {{ verifying.primary ? 'Verifying...' : 'Verify' }}
                  </button>
                </div>
              </div>
            </div>
            <div class="mb-6">
              <label class="block text-xs font-medium text-gray-600 mb-1">Account Name (Auto-verified)</label>
              <input v-model="form.primaryAccountName" type="text" readonly class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-gray-50 focus:outline-none" placeholder="Verify account to auto-fill" />
            </div>

            <h2 class="text-sm font-bold text-gray-900 mb-1 mt-6">Secondary Remittance Account <span class="text-gray-400 font-normal">(Optional)</span></h2>
            <p class="text-xs text-gray-500 mb-4">A backup or alternative account for payouts.</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Bank Name</label>
                <select v-model="form.secondaryBankCode" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-indigo-500 bg-white">
                  <option value="">Select Bank (Optional)</option>
                  <option v-for="bank in banks" :key="bank.code" :value="bank.code">{{ bank.name }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Account Number</label>
                <div class="flex gap-2">
                  <input v-model="form.secondaryAccountNumber" type="text" placeholder="e.g. 0123456789" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-indigo-500" />
                  <button type="button" @click="verifyAccount('secondary')" :disabled="!form.secondaryBankCode || !form.secondaryAccountNumber || verifying.secondary" class="btn-secondary !py-2.5 !px-4 text-xs whitespace-nowrap">
                    {{ verifying.secondary ? 'Verifying...' : 'Verify' }}
                  </button>
                </div>
              </div>
            </div>
            <div class="mb-6">
              <label class="block text-xs font-medium text-gray-600 mb-1">Account Name (Auto-verified)</label>
              <input v-model="form.secondaryAccountName" type="text" readonly class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-gray-50 focus:outline-none" placeholder="Verify account to auto-fill" />
            </div>

            <div class="mt-6 pt-6 border-t border-gray-200">
              <label class="block text-xs font-medium text-gray-600 mb-1">Paystack Subaccount Code (Split Payouts)</label>
              <input
                v-model="form.paystackSubaccountCode"
                type="text"
                placeholder="ACCT_xxxxxx"
                class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 font-mono focus:outline-none focus:border-indigo-500"
              />
              <span class="text-[11px] text-gray-500 block mt-1">Ticket sales revenue will automatically split & deposit to this subaccount.</span>
            </div>
          </div>

          <div class="pt-4 flex justify-end">
            <button type="submit" :disabled="saving" class="btn-primary text-xs !py-2.5 !px-4 md:px-6">
              {{ saving ? 'Saving Changes...' : 'Save Settings' }}
            </button>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin' });

import { toast } from 'vue-sonner';
import { ref, onMounted } from 'vue';

const config = useRuntimeConfig();

const saving = ref(false);
const tenantId = ref('');
const newEmail = ref('');
const form = ref({
  name: '',
  slug: '',
  contactEmail: '',
  notificationEmails: [],
  primaryColor: '#4f46e5',
  secondaryColor: '#0f172a',
  paystackSubaccountCode: '',
  primaryBankCode: '',
  primaryAccountNumber: '',
  primaryAccountName: '',
  secondaryBankCode: '',
  secondaryAccountNumber: '',
  secondaryAccountName: '',
});

const banks = ref([]);
const verifying = ref({ primary: false, secondary: false });

function addEmail() {
  const email = newEmail.value.trim().toLowerCase();
  if (email && !form.value.notificationEmails.includes(email) && email.includes('@')) {
    form.value.notificationEmails.push(email);
    newEmail.value = '';
  }
}

function removeEmail(idx) {
  form.value.notificationEmails.splice(idx, 1);
}

async function loadBanks() {
  const token = localStorage.getItem('ticketr_admin_token');
  try {
    const res = await fetch(`${config.public.apiBase}/paystack/banks`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      banks.value = await res.json();
    }
  } catch (err) {
    console.error('Failed to load banks', err);
  }
}

async function verifyAccount(type) {
  const token = localStorage.getItem('ticketr_admin_token');
  const bankCode = type === 'primary' ? form.value.primaryBankCode : form.value.secondaryBankCode;
  const accountNumber = type === 'primary' ? form.value.primaryAccountNumber : form.value.secondaryAccountNumber;
  
  if (!bankCode || !accountNumber) return;

  verifying.value[type] = true;
  try {
    const res = await fetch(`${config.public.apiBase}/paystack/resolve-account?accountNumber=${accountNumber}&bankCode=${bankCode}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok && data.account_name) {
      if (type === 'primary') {
        form.value.primaryAccountName = data.account_name;
      } else {
        form.value.secondaryAccountName = data.account_name;
      }
      toast.success('Account verified successfully!');
    } else {
      toast.error(data.message || 'Failed to verify account number');
      if (type === 'primary') form.value.primaryAccountName = '';
      else form.value.secondaryAccountName = '';
    }
  } catch (err) {
    toast.error('Network error while verifying account');
  } finally {
    verifying.value[type] = false;
  }
}

async function loadTenantSettings() {
  const token = localStorage.getItem('ticketr_admin_token');
  if (!token) return;
  const user = JSON.parse(localStorage.getItem('ticketr_admin_user') || '{}');
  if (!user.tenantId) return;
  tenantId.value = user.tenantId;

  try {
    const res = await fetch(`${config.public.apiBase}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.tenant) {
        form.value.name = data.tenant.name || '';
        form.value.slug = data.tenant.slug || '';
        form.value.contactEmail = data.tenant.contactEmail || '';
        form.value.notificationEmails = data.tenant.notificationEmails || [];
        form.value.primaryColor = data.tenant.primaryColor || '#4f46e5';
        form.value.secondaryColor = data.tenant.secondaryColor || '#0f172a';
        form.value.paystackSubaccountCode = data.tenant.paystackSubaccountCode || '';
        form.value.paystackSubaccountCode = data.tenant.paystackSubaccountCode || '';
        form.value.primaryBankCode = data.tenant.primaryRemittanceAccount?.bankCode || data.tenant.remittanceAccount?.bankCode || '';
        form.value.primaryAccountNumber = data.tenant.primaryRemittanceAccount?.accountNumber || data.tenant.remittanceAccount?.accountNumber || data.tenant.accountNumber || '';
        form.value.primaryAccountName = data.tenant.primaryRemittanceAccount?.accountName || data.tenant.remittanceAccount?.accountName || data.tenant.accountName || '';
        form.value.secondaryBankCode = data.tenant.secondaryRemittanceAccount?.bankCode || '';
        form.value.secondaryAccountNumber = data.tenant.secondaryRemittanceAccount?.accountNumber || '';
        form.value.secondaryAccountName = data.tenant.secondaryRemittanceAccount?.accountName || '';
      }
    }
  } catch (err) {
    console.error(err);
  }
}

async function saveSettings() {
  const token = localStorage.getItem('ticketr_admin_token');
  if (!token || !tenantId.value) return;

  saving.value = true;
  try {
    const payload = { ...form.value };

    payload.primaryRemittanceAccount = form.value.primaryBankCode ? {
      bankCode: form.value.primaryBankCode,
      bankName: banks.value.find(b => b.code === form.value.primaryBankCode)?.name || '',
      accountNumber: form.value.primaryAccountNumber,
      accountName: form.value.primaryAccountName
    } : null;

    payload.secondaryRemittanceAccount = form.value.secondaryBankCode ? {
      bankCode: form.value.secondaryBankCode,
      bankName: banks.value.find(b => b.code === form.value.secondaryBankCode)?.name || '',
      accountNumber: form.value.secondaryAccountNumber,
      accountName: form.value.secondaryAccountName
    } : null;
    
    // Cleanup flat fields
    delete payload.primaryBankCode;
    delete payload.primaryAccountNumber;
    delete payload.primaryAccountName;
    delete payload.secondaryBankCode;
    delete payload.secondaryAccountNumber;
    delete payload.secondaryAccountName;

    const res = await fetch(`${config.public.apiBase}/tenants/${tenantId.value}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      toast.success('Settings saved successfully!');
    }
  } catch (e) {
    toast.error('Failed to save settings');
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  loadBanks();
  loadTenantSettings();
});
</script>
