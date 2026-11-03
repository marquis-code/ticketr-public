<template>
  <div class="bg-paper">
    <div class="border-b border-line bg-white">
      <div class="shell py-10 sm:py-14 max-w-3xl">
        <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">Trust & policy</p>
        <h1 class="font-display text-3xl sm:text-4xl font-semibold text-ink mt-2">{{ doc.title }}</h1>
        <p class="text-sm text-muted mt-2">{{ doc.summary }}</p>
        <p class="text-[11px] text-muted mt-3">Last updated {{ doc.updated }}</p>
      </div>
    </div>

    <div class="shell py-10 max-w-3xl">
      <nav class="flex gap-2 mb-8 flex-wrap">
        <NuxtLink
          v-for="item in docs"
          :key="item.slug"
          :to="`/legal/${item.slug}`"
          class="chip"
          :class="item.slug === doc.slug ? '!bg-ink !text-paper !border-ink' : ''"
        >
          {{ item.title }}
        </NuxtLink>
      </nav>

      <article class="prose-editorial">
        <section v-for="section in doc.sections" :key="section.heading" class="mb-7">
          <h2 class="font-display text-xl font-semibold text-ink mb-2">{{ section.heading }}</h2>
          <p v-for="paragraph in section.body" :key="paragraph" class="mb-3">{{ paragraph }}</p>
          <ul v-if="section.list" class="list-disc pl-5 space-y-1.5 mb-3">
            <li v-for="item in section.list" :key="item">{{ item }}</li>
          </ul>
        </section>
      </article>

      <div class="surface p-5 mt-8">
        <p class="text-sm font-semibold text-ink">Questions?</p>
        <p class="text-[13px] text-muted mt-1">
          Email <a href="mailto:support@ticketr.org" class="text-forest font-semibold hover:underline">support@ticketr.org</a>
          and a human will respond within one business day.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' });

const route = useRoute();
const slug = computed(() => String(route.params.doc || 'terms'));

const docs = [
  {
    slug: 'terms',
    title: 'Terms of service',
    summary: 'The rules that keep tickets trustworthy for buyers and organizers.',
    updated: '1 September 2026',
    sections: [
      {
        heading: 'One pass, one entry',
        body: [
          'Every ticket carries a unique QR credential. The first successful scan at the gate admits the holder; every later scan of the same credential is refused.',
          'Screenshots, printouts and forwarded emails do not create additional entries. Do not share your QR code with anyone you are not transferring the ticket to.',
        ],
      },
      {
        heading: 'Transfers and resale',
        body: [
          'Where the organizer enables it, a ticket may be transferred or resold inside Ticketr. A completed transfer rotates the QR credential immediately, permanently invalidating the previous code.',
          'Resale prices are capped by the organizer. Ticketr charges a platform fee on resale to cover verification and buyer protection; the remainder is paid to the seller after the event.',
        ],
      },
      {
        heading: 'Payments',
        body: [
          'Card payments are processed by Paystack. Bank-transfer payments are verified by the organizer against a unique bank reference; duplicate references are rejected.',
          'Prices, platform fees and discounts are itemised before payment. Ticketr does not add fees after the point of payment.',
        ],
        list: [
          'An order is only confirmed once payment is verified.',
          'Issued tickets are delivered to the buyer email and the private wallet.',
          'Part-payments do not issue tickets until the balance is settled.',
        ],
      },
      {
        heading: 'Organizer responsibilities',
        body: [
          'Organizers must describe events accurately, honour published policies and verify transfer payments in good faith. Ticketr may suspend accounts that abuse the approval queue or attempt to circumvent inventory limits.',
        ],
      },
    ],
  },
  {
    slug: 'privacy',
    title: 'Privacy notice',
    summary: 'What we collect, why we collect it, and what we never expose publicly.',
    updated: '1 September 2026',
    sections: [
      {
        heading: 'Ticket data stays private',
        body: [
          'Ticket QR credentials are only available through a private wallet link delivered to the buyer, or through the organizer console. There is no public ticket lookup by email or ticket number.',
          'We do not sell attendee data. Organizers only see attendee details for their own events.',
        ],
      },
      {
        heading: 'What we collect',
        body: [
          'Account details (name, email, password hash), order details (tickets, amounts, references), attendee details supplied at checkout, and technical logs needed to secure and operate the service.',
        ],
      },
      {
        heading: 'Retention',
        body: [
          'Audit records are retained for 90 days. Financial records are retained as required for accounting and dispute resolution. You can request deletion of non-financial personal data by contacting support.',
        ],
      },
      {
        heading: 'Processors',
        body: [
          'Payments are processed by Paystack. Email delivery runs on Resend. Media is stored on Cloudinary. Each processor receives only the data needed to perform its function.',
        ],
      },
    ],
  },
  {
    slug: 'refunds',
    title: 'Refunds & resale policy',
    summary: 'How to recover value when plans change — without enabling scalping.',
    updated: '1 September 2026',
    sections: [
      {
        heading: 'Refunds',
        body: [
          'Unless the organizer publishes a different policy, ticket sales are final. If an event is cancelled or materially changed, the organizer is responsible for refunding the face value to buyers.',
          'Platform fees on a cancelled event are refunded by Ticketr. Contact support with your order number.',
        ],
      },
      {
        heading: 'Verified resale',
        body: [
          'Rather than selling screenshots in group chats, list your ticket for resale inside Ticketr. Resale is only available while the event is upcoming and only when the organizer has enabled it.',
          'Listings are capped at face value (or lower, at the organizer’s choice). When a buyer pays, your QR is cancelled and a fresh one is issued to the buyer. You are paid after the event.',
        ],
      },
      {
        heading: 'Transfers',
        body: [
          'Transfers are free and rotate the QR code. The previous holder’s code stops working immediately. Transfers close one hour before the event starts.',
        ],
      },
    ],
  },
];

const doc = computed(() => docs.find((item) => item.slug === slug.value) || docs[0]);

if (!docs.some((item) => item.slug === slug.value)) {
  throw createError({ statusCode: 404, statusMessage: 'Policy not found' });
}

useSeoMeta({
  title: computed(() => `${doc.value.title} | Ticketr`),
  description: computed(() => doc.value.summary),
});
</script>
