<template>
  <div class="bg-paper">
    <!-- Loading -->
    <div v-if="pending" class="shell py-14">
      <div class="skeleton h-4 w-40 mb-6" />
      <div class="grid lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-4">
          <div class="skeleton aspect-[16/9] !rounded-2xl" />
          <div class="skeleton h-9 w-3/4" />
          <div class="skeleton h-4 w-full" />
          <div class="skeleton h-4 w-5/6" />
        </div>
        <div class="skeleton h-[420px] !rounded-2xl" />
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="loadError || !event" class="shell py-20">
      <div class="surface max-w-lg mx-auto p-8 sm:p-10 text-center">
        <span class="w-14 h-14 rounded-2xl bg-coral/10 text-coral flex items-center justify-center mx-auto mb-4">
          <CalendarX class="w-7 h-7" />
        </span>
        <h1 class="font-display text-2xl font-semibold text-ink">Event unavailable</h1>
        <p class="text-sm text-muted mt-2">
          {{ loadError || 'This event may have been unpublished or the link is incorrect.' }}
        </p>
        <NuxtLink to="/" class="btn-primary mt-6">Browse other events</NuxtLink>
      </div>
    </div>

    <template v-else>
      <!-- ======================= HEADER ======================= -->
      <div class="border-b border-line bg-white">
        <div class="shell py-4 flex items-center gap-2 text-[12px] font-semibold text-muted overflow-hidden">
          <NuxtLink to="/" class="hover:text-ink transition shrink-0">Discover</NuxtLink>
          <ChevronRight class="w-3.5 h-3.5 shrink-0" />
          <NuxtLink :to="organizerLink" class="hover:text-ink transition truncate shrink-0">{{ tenant?.name || 'Organizer' }}</NuxtLink>
          <ChevronRight class="w-3.5 h-3.5 shrink-0" />
          <span class="text-ink truncate">{{ event.title }}</span>
        </div>
      </div>

      <div class="shell py-8 sm:py-10">
        <div class="grid lg:grid-cols-[1.55fr_1fr] gap-8 lg:gap-10 items-start">
          <!-- ======================= LEFT ======================= -->
          <div class="min-w-0 space-y-7">
            <!-- Gallery -->
            <section>
              <div class="relative overflow-hidden rounded-[22px] border border-line bg-ink/5">
                <div class="relative aspect-[16/9] sm:aspect-[16/8]">
                  <img
                    v-if="galleryImages.length"
                    :src="galleryImages[activeImage]"
                    :alt="event.title"
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="w-full h-full bg-grid bg-paper flex items-center justify-center">
                    <Ticket class="w-16 h-16 text-ink/15" />
                  </div>
                  <div class="absolute inset-x-0 top-0 p-3 flex items-start justify-between gap-2">
                    <div class="flex flex-wrap gap-2">
                      <span v-if="isCancelled" class="chip-coral !bg-ink !text-paper">Cancelled</span>
                      <span v-else-if="isPast" class="chip-ink">Past event</span>
                      <span v-else-if="remaining <= 0" class="chip-ink">Sold out</span>
                      <span v-else-if="remaining <= 20" class="chip-lime">{{ remaining }} seats left</span>
                      <span v-else class="chip !bg-white/85 backdrop-blur">{{ remaining }} seats left</span>
                      <span v-if="event.isVirtual" class="chip !bg-white/85 backdrop-blur"><Video class="w-3 h-3" /> Online</span>
                    </div>
                    <button
                      type="button"
                      class="w-9 h-9 rounded-full bg-white/90 backdrop-blur border border-line flex items-center justify-center text-ink hover:bg-white transition"
                      title="Share event"
                      @click="share"
                    >
                      <Share2 class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div v-if="galleryImages.length > 1" class="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
                <button
                  v-for="(image, index) in galleryImages"
                  :key="image + index"
                  type="button"
                  class="relative w-20 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition"
                  :class="activeImage === index ? 'border-ink' : 'border-transparent opacity-70 hover:opacity-100'"
                  @click="activeImage = index"
                >
                  <img :src="image" alt="" class="w-full h-full object-cover" />
                </button>
              </div>
            </section>

            <!-- Title & meta -->
            <section>
              <div class="flex flex-wrap items-center gap-2 mb-3">
                <span v-for="tag in event.tags || []" :key="tag" class="chip !text-[10px]">{{ tag }}</span>
                <span class="chip-soft !text-[10px]"><ShieldCheck class="w-3 h-3" /> Verified organizer</span>
              </div>

              <h1 class="font-display text-3xl sm:text-[2.6rem] leading-[1.05] font-semibold text-ink tracking-[-0.03em]">
                {{ event.title }}
              </h1>

              <div class="grid sm:grid-cols-2 gap-3 mt-5">
                <div class="flex items-start gap-3 rounded-xl border border-line bg-white px-4 py-3.5">
                  <span class="w-9 h-9 rounded-lg bg-paper flex items-center justify-center shrink-0">
                    <CalendarDays class="w-4 h-4 text-forest" />
                  </span>
                  <div class="min-w-0">
                    <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Date & time</p>
                    <p class="text-sm font-semibold text-ink">{{ formatDate(event.startDate, { weekday: 'long', day: 'numeric', month: 'long' }) }}</p>
                    <p class="text-xs text-muted mt-0.5">{{ formatTime(event.startDate) }} — {{ formatTime(event.endDate) }}</p>
                  </div>
                </div>

                <div class="flex items-start gap-3 rounded-xl border border-line bg-white px-4 py-3.5">
                  <span class="w-9 h-9 rounded-lg bg-paper flex items-center justify-center shrink-0">
                    <MapPin class="w-4 h-4 text-forest" />
                  </span>
                  <div class="min-w-0">
                    <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">{{ event.isVirtual ? 'Online' : 'Venue' }}</p>
                    <p class="text-sm font-semibold text-ink truncate">{{ event.isVirtual ? 'Join link after checkout' : event.location }}</p>
                    <a
                      v-if="event.venueMapUrl"
                      :href="event.venueMapUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-xs font-semibold text-forest hover:underline inline-flex items-center gap-1 mt-0.5"
                    >
                      Open map <ArrowUpRight class="w-3 h-3" />
                    </a>
                    <span v-else class="text-xs text-muted">{{ countdownLabel(event.startDate) }}</span>
                  </div>
                </div>
              </div>
            </section>

            <!-- About -->
            <section class="surface p-5 sm:p-7">
              <h2 class="font-display text-xl font-semibold text-ink">About this event</h2>
              <div class="prose-editorial mt-3 whitespace-pre-line">{{ event.description }}</div>

              <div v-if="event.tags?.length" class="flex flex-wrap gap-2 mt-5 pt-5 border-t border-line">
                <span v-for="tag in event.tags" :key="tag" class="chip-muted">{{ tag }}</span>
              </div>
            </section>

            <!-- Organizer + policies -->
            <section class="grid sm:grid-cols-2 gap-4">
              <div class="surface p-5">
                <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Organizer</p>
                <div class="flex items-center gap-3 mt-3">
                  <img
                    v-if="tenant?.logoUrl"
                    :src="tenant.logoUrl"
                    alt=""
                    class="w-11 h-11 rounded-xl object-cover border border-line"
                  />
                  <div v-else class="w-11 h-11 rounded-xl bg-ink text-lime flex items-center justify-center font-display font-semibold">
                    {{ initials(tenant?.name) }}
                  </div>
                  <div class="min-w-0">
                    <p class="font-semibold text-ink truncate">{{ tenant?.name }}</p>
                    <p class="text-xs text-muted truncate">{{ tenant?.contactEmail || 'Verified organizer' }}</p>
                  </div>
                </div>
                <div class="mt-4 flex items-center gap-2 text-[11px] font-semibold text-forest">
                  <ShieldCheck class="w-4 h-4" /> Identity and payout verified
                </div>
              </div>

              <div class="surface p-5">
                <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Ticket policies</p>
                <div class="mt-3 space-y-3 text-[13px] text-ink/75 leading-relaxed">
                  <p class="flex gap-2"><RefreshCcw class="w-4 h-4 text-forest shrink-0 mt-0.5" /> {{ event.transferPolicy }}</p>
                  <p class="flex gap-2"><ReceiptText class="w-4 h-4 text-forest shrink-0 mt-0.5" /> {{ event.refundPolicy }}</p>
                  <p class="flex gap-2"><ScanLine class="w-4 h-4 text-forest shrink-0 mt-0.5" /> One QR per ticket. Screenshots are refused after first scan.</p>
                </div>
              </div>
            </section>

            <!-- Resale -->
            <section v-if="resaleListings.length" class="surface p-5 sm:p-6">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Verified resale</p>
                  <h2 class="font-display text-xl font-semibold text-ink mt-1">Fans reselling at face value</h2>
                </div>
                <span class="chip-lime">Capped</span>
              </div>

              <div class="mt-4 divide-y divide-line">
                <div v-for="listing in resaleListings" :key="listing.id" class="py-3 flex items-center justify-between gap-3">
                  <div class="min-w-0">
                    <p class="text-sm font-semibold text-ink truncate">{{ listing.tierName }}</p>
                    <p class="text-xs text-muted">
                      {{ listing.section ? `Section ${listing.section} · ` : '' }}Listed {{ relativeTime(listing.createdAt) }}
                    </p>
                  </div>
                  <div class="flex items-center gap-3 shrink-0">
                    <span class="font-display text-lg font-semibold text-ink">{{ formatMoney(listing.askingPrice) }}</span>
                    <button class="btn-primary btn-sm" type="button" @click="openResale(listing)">Buy</button>
                  </div>
                </div>
              </div>
              <p class="text-[11px] text-muted mt-2">
                Resale purchases rotate the seller’s QR instantly. The seller is paid after the event.
              </p>
            </section>

            <!-- Past gallery -->
            <section v-if="isPast && event.galleryImages?.length" class="surface p-5 sm:p-6">
              <h2 class="font-display text-xl font-semibold text-ink">From the night</h2>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
                <div v-for="(image, index) in event.galleryImages" :key="index" class="relative aspect-square rounded-xl overflow-hidden bg-ink/5">
                  <img :src="image" alt="" loading="lazy" class="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              </div>
            </section>
          </div>

          <!-- ======================= CHECKOUT ======================= -->
          <aside class="lg:sticky lg:top-[92px]">
            <div class="surface overflow-hidden shadow-lift">
              <div class="px-5 pt-5 pb-4 border-b border-line flex items-center justify-between gap-3">
                <div>
                  <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                    {{ isPast ? 'Event ended' : 'Choose your tickets' }}
                  </p>
                  <p class="font-display text-xl font-semibold text-ink mt-0.5">
                    {{ isPast ? 'Thanks for coming' : itemCount ? formatMoney(total) : 'Pick a tier to begin' }}
                  </p>
                </div>
                <span v-if="!isPast" class="chip-soft">{{ itemCount }} ticket{{ itemCount === 1 ? '' : 's' }}</span>
              </div>

              <!-- Cancelled / past -->
              <div v-if="isCancelled" class="p-5 sm:p-6 text-sm text-muted leading-relaxed">
                <p class="font-semibold text-ink">This event was cancelled.</p>
                <p class="mt-1">The organizer is responsible for refunding the face value of existing tickets. Contact them or our support team with your order number.</p>
                <NuxtLink to="/my-tickets" class="btn-secondary btn-sm mt-4 w-full">Open my wallet</NuxtLink>
              </div>
              <div v-else-if="isPast" class="p-5 sm:p-6 text-sm text-muted leading-relaxed">
                <p>Ticket sales are closed. If you attended, your pass stays in your wallet as a keepsake.</p>
                <NuxtLink to="/my-tickets" class="btn-secondary btn-sm mt-4 w-full">Open my wallet</NuxtLink>
              </div>

              <!-- Sold out entirely -->
              <div v-else-if="!purchasableTiers.length" class="p-5 sm:p-6">
                <div class="rounded-xl bg-paper border border-line p-4 text-center">
                  <p class="font-semibold text-ink">Sold out</p>
                  <p class="text-xs text-muted mt-1">Join the resale waitlist by checking back — verified resale listings appear here.</p>
                </div>
              </div>

              <div v-else class="p-4 sm:p-5 space-y-4 max-h-[calc(100vh-220px)] overflow-y-auto">
                <!-- Manual transfer notice -->
                <div v-if="isManualTransfer" class="rounded-xl bg-amber-50 border border-amber-200 p-3.5 text-[12px] text-amber-900 leading-relaxed">
                  <p class="font-bold flex items-center gap-1.5"><Building2 class="w-3.5 h-3.5" /> Bank transfer checkout</p>
                  <p class="mt-1">Place your order, transfer the exact total, then upload your receipt. Tickets are issued after the organizer verifies your payment.</p>
                </div>

                <!-- Tiers -->
                <div class="space-y-2.5">
                  <div
                    v-for="tier in event.tiers"
                    :key="tier._id"
                    class="rounded-xl border p-3.5 transition-all"
                    :class="quantity[tier._id] > 0 ? 'border-ink bg-paper/70' : 'border-line bg-white'"
                  >
                    <div class="flex items-start justify-between gap-3">
                      <div class="min-w-0">
                        <div class="flex items-center gap-1.5 flex-wrap">
                          <p class="font-semibold text-ink text-sm">{{ tier.name }}</p>
                          <span v-if="tier.isCoupleTicket" class="chip-lime !text-[9px] !px-2 !py-0.5">Couple</span>
                          <span v-if="tier.remaining <= 0" class="chip-coral !text-[9px] !px-2 !py-0.5">Sold out</span>
                        </div>
                        <p v-if="tier.description" class="text-[11.5px] text-muted mt-0.5 line-clamp-2">{{ tier.description }}</p>
                        <div class="mt-2 flex items-center gap-2">
                          <div class="h-1 w-20 rounded-full bg-line overflow-hidden">
                            <div class="h-full rounded-full bg-forest" :style="{ width: `${Math.min(100, tier.sellThrough || 0)}%` }" />
                          </div>
                          <span class="text-[10px] font-semibold" :class="tier.remaining <= 10 ? 'text-coral' : 'text-muted'">
                            {{ tier.remaining }} left
                          </span>
                        </div>
                      </div>
                      <p class="font-display text-base font-semibold text-ink shrink-0">
                        {{ Number(tier.price) === 0 ? 'Free' : formatMoney(tier.price) }}
                      </p>
                    </div>

                    <div class="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-line/70">
                      <p class="text-[11px] text-muted">
                        Max {{ Math.min(tier.maxPerPurchase || 5, tier.remaining) }} per order
                        <span v-if="tier.isCoupleTicket"> · 2 passes each</span>
                      </p>
                      <div class="flex items-center gap-1.5">
                        <button
                          type="button"
                          class="w-8 h-8 rounded-lg border border-line bg-white text-ink font-bold disabled:opacity-35 disabled:pointer-events-none"
                          :disabled="!quantity[tier._id]"
                          :aria-label="`Remove one ${tier.name}`"
                          @click="setQuantity(tier, (quantity[tier._id] || 0) - 1)"
                        >
                          −
                        </button>
                        <span class="w-7 text-center text-sm font-bold text-ink">{{ quantity[tier._id] || 0 }}</span>
                        <button
                          type="button"
                          class="w-8 h-8 rounded-lg bg-ink text-paper font-bold disabled:opacity-35 disabled:pointer-events-none"
                          :disabled="(quantity[tier._id] || 0) >= Math.min(tier.maxPerPurchase || 5, tier.remaining) || tier.remaining <= 0"
                          :aria-label="`Add one ${tier.name}`"
                          @click="setQuantity(tier, (quantity[tier._id] || 0) + 1)"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Buyer -->
                <div class="space-y-3 pt-1">
                  <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Buyer details</p>
                  <div>
                    <label class="label" for="buyer-name">Full name</label>
                    <input id="buyer-name" v-model.trim="buyer.name" type="text" autocomplete="name" placeholder="e.g. Jane Doe" class="input" :class="{ 'input-error': showBuyerErrors && errors.buyerName }" @blur="touched.buyerName = true" />
                    <p v-if="showBuyerErrors && errors.buyerName" class="field-error">{{ errors.buyerName }}</p>
                  </div>
                  <div>
                    <label class="label" for="buyer-email">Email for tickets</label>
                    <input
                      id="buyer-email"
                      v-model.trim="buyer.email"
                      type="email"
                      autocomplete="email"
                      placeholder="you@example.com"
                      class="input"
                      :class="{ 'input-error': showBuyerErrors && errors.buyerEmail }"
                      @blur="touched.buyerName = true"
                    />
                    <p v-if="showBuyerErrors && errors.buyerEmail" class="field-error">{{ errors.buyerEmail }}</p>
                    <p class="field-hint">Your tickets and private wallet link are sent here. Check the spelling.</p>
                  </div>
                  <div>
                    <label class="label" for="buyer-phone">Phone <span class="text-muted/70 normal-case tracking-normal">(optional)</span></label>
                    <input id="buyer-phone" v-model.trim="buyer.phone" type="tel" autocomplete="tel" placeholder="+234…" class="input" />
                  </div>
                </div>

                <!-- Attendees -->
                <div v-if="itemCount > 0" class="space-y-3 pt-1">
                  <div class="flex items-center justify-between gap-2">
                    <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Who is attending</p>
                    <label class="flex items-center gap-2 text-[11px] font-semibold text-muted cursor-pointer">
                      <input v-model="sameAsBuyer" type="checkbox" class="w-3.5 h-3.5 rounded border-line text-forest focus:ring-forest" />
                      Same as buyer
                    </label>
                  </div>

                  <div v-for="row in attendeeRows" :key="row.key" class="rounded-xl border border-line bg-white p-3.5 space-y-2.5">
                    <div class="flex items-center justify-between gap-2">
                      <p class="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">{{ row.label }}</p>
                      <span class="mono text-[10px] text-muted">{{ row.tierName }}</span>
                    </div>
                    <input v-model.trim="row.name" :disabled="sameAsBuyer" type="text" placeholder="Attendee full name" class="input !py-2.5" :class="{ 'input-error': touched.attendees && !row.name }" />
                    <input v-model.trim="row.email" :disabled="sameAsBuyer" type="email" placeholder="Attendee email" class="input !py-2.5" :class="{ 'input-error': touched.attendees && !row.email }" />
                    <div v-if="requireDepartment">
                      <select v-if="departmentOptions.length" v-model="row.department" class="input !py-2.5">
                        <option value="">Select {{ departmentLabel.toLowerCase() }}</option>
                        <option v-for="option in departmentOptions" :key="option" :value="option">{{ option }}</option>
                      </select>
                      <input v-else v-model.trim="row.department" type="text" :placeholder="departmentLabel" class="input !py-2.5" />
                    </div>
                    <div v-for="field in customFields" :key="field.name">
                      <label class="block text-[10px] font-bold uppercase tracking-[0.1em] text-muted mb-1">
                        {{ field.label }} <span v-if="field.required" class="text-coral">*</span>
                      </label>
                      <select v-if="field.type === 'select'" v-model="row.custom[field.name]" class="input !py-2.5">
                        <option value="">Select option</option>
                        <option v-for="option in field.options" :key="option" :value="option">{{ option }}</option>
                      </select>
                      <input v-else v-model.trim="row.custom[field.name]" type="text" class="input !py-2.5" />
                    </div>
                  </div>
                  <p v-if="attendeeError" class="field-error">{{ attendeeError }}</p>
                </div>

                <!-- Promo -->
                <div v-if="itemCount > 0">
                  <label class="label" for="promo">Promo code</label>
                  <div class="flex gap-2">
                    <input
                      id="promo"
                      v-model.trim="promoInput"
                      type="text"
                      placeholder="OPTIONAL"
                      class="input mono uppercase !py-2.5"
                      :disabled="!!appliedPromo"
                    />
                    <button v-if="!appliedPromo" type="button" class="btn-secondary btn-sm shrink-0" :disabled="!promoInput || promoPending" @click="applyPromo">
                      {{ promoPending ? 'Checking…' : 'Apply' }}
                    </button>
                    <button v-else type="button" class="btn-ghost btn-sm shrink-0" @click="removePromo">Remove</button>
                  </div>
                  <p v-if="promoError" class="field-error">{{ promoError }}</p>
                  <p v-if="appliedPromo" class="field-hint !text-forest font-semibold">
                    {{ appliedPromo.code }} applied — you save {{ formatMoney(displayDiscount) }}
                  </p>
                </div>

                <!-- Installments -->
                <label
                  v-if="canInstallment"
                  class="flex items-start gap-2.5 rounded-xl border border-line bg-white p-3.5 cursor-pointer"
                >
                  <input v-model="installment" type="checkbox" class="mt-0.5 w-4 h-4 rounded border-line text-forest focus:ring-forest" />
                  <span class="text-[12px] text-ink leading-relaxed">
                    <strong>Pay 50% now</strong> and the balance within 14 days
                    <span class="block text-[11px] text-muted mt-0.5">
                      {{ formatMoney(total / 2) }} today, {{ formatMoney(total - total / 2) }} later. Tickets are issued once the balance is paid.
                    </span>
                  </span>
                </label>

                <!-- Breakdown -->
                <div v-if="itemCount > 0" class="rounded-xl bg-paper border border-line p-3.5 space-y-1.5 text-[12.5px]">
                  <div class="flex justify-between"><span class="text-muted">Subtotal</span><span class="font-semibold text-ink">{{ formatMoney(subtotal) }}</span></div>
                  <div v-if="buyerFee > 0" class="flex justify-between">
                    <span class="text-muted">Platform fee</span><span class="font-semibold text-ink">{{ formatMoney(buyerFee) }}</span>
                  </div>
                  <div v-if="displayDiscount > 0" class="flex justify-between text-forest">
                    <span>Promo discount</span><span class="font-semibold">−{{ formatMoney(displayDiscount) }}</span>
                  </div>
                  <div class="flex justify-between pt-2 mt-1 border-t border-line text-sm">
                    <span class="font-semibold text-ink">Total</span>
                    <span class="font-display text-lg font-semibold text-ink">{{ formatMoney(total) }}</span>
                  </div>
                  <div v-if="installment" class="flex justify-between text-forest font-semibold">
                    <span>Due now</span><span>{{ formatMoney(amountDueNow) }}</span>
                  </div>
                  <div v-if="installment" class="flex justify-between text-muted">
                    <span>Balance in 14 days</span><span>{{ formatMoney(total - amountDueNow) }}</span>
                  </div>
                  <p class="text-[10px] text-muted pt-1">
                    {{ installment ? 'The 50% deposit secures your seats. Tickets issue after the balance.' : 'No hidden fees. This is the exact amount charged.' }}
                  </p>
                </div>

                <!-- Terms -->
                <label class="flex items-start gap-2.5 text-[11.5px] text-muted leading-relaxed cursor-pointer">
                  <input v-model="acceptedTerms" type="checkbox" class="mt-0.5 w-3.5 h-3.5 rounded border-line text-forest focus:ring-forest shrink-0" />
                  <span>
                    I agree to the
                    <NuxtLink to="/legal/terms" class="text-ink underline decoration-lime decoration-2 underline-offset-2">ticket terms</NuxtLink>
                    and understand transfers rotate my QR code.
                  </span>
                </label>
                <p v-if="submitError" class="text-[12px] font-medium text-coral bg-coral/10 border border-coral/20 rounded-lg px-3 py-2">{{ submitError }}</p>

                <button
                  type="button"
                  class="btn-primary w-full !py-3.5"
                  :disabled="!canSubmit"
                  @click="submitOrder"
                >
                  <span v-if="submitting" class="w-4 h-4 border-2 border-paper/40 border-t-paper rounded-full animate-spin" />
                  <Lock v-else class="w-4 h-4" />
                  {{ submitting ? 'Securing your order…' : isManualTransfer ? 'Place order & upload receipt' : `Pay ${formatMoney(amountDueNow)}` }}
                </button>
                <p class="text-[10px] text-center text-muted">
                  Secured by Paystack · Your wallet link is emailed instantly
                </p>
              </div>
            </div>

            <div class="mt-3 flex items-center justify-center gap-4 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">
              <span class="flex items-center gap-1"><Lock class="w-3 h-3" /> Encrypted</span>
              <span class="flex items-center gap-1"><ShieldCheck class="w-3 h-3" /> Verified</span>
              <span class="flex items-center gap-1"><RefreshCcw class="w-3 h-3" /> Face-value resale</span>
            </div>
          </aside>
        </div>
      </div>

      <!-- Sticky mobile bar -->
      <div v-if="!isPast && !isCancelled && purchasableTiers.length" class="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-line bg-paper/95 backdrop-blur px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Total</p>
            <p class="font-display text-lg font-semibold text-ink">{{ formatMoney(total) }}</p>
          </div>
          <a href="#checkout" class="btn-primary" @click.prevent="scrollToCheckout">
            {{ itemCount ? 'Review & pay' : 'Choose tickets' }}
          </a>
        </div>
      </div>

      <!-- ============== MODALS ============== -->
      <UiModal :open="modal === 'paid'" title="You already have a ticket" eyebrow="Duplicate order blocked" @close="modal = null">
        <p class="text-sm text-muted leading-relaxed">
          A paid ticket is already confirmed for <strong class="text-ink">{{ buyer.email }}</strong> at this event. You will not be charged twice.
        </p>
        <div class="my-4 rounded-xl bg-paper border border-line p-4 text-sm">
          <div class="flex justify-between"><span class="text-muted">Order</span><span class="mono font-semibold">{{ sessionInfo?.orderNumber }}</span></div>
          <div class="flex justify-between mt-1"><span class="text-muted">Status</span><span class="font-semibold text-forest">Paid</span></div>
        </div>
        <p class="text-xs text-muted">Open your wallet to see the QR code. If you need another ticket, use a different attendee email.</p>
        <template #footer>
          <NuxtLink to="/my-tickets" class="btn-primary">Open my wallet</NuxtLink>
          <button class="btn-secondary" type="button" @click="modal = null">Close</button>
        </template>
      </UiModal>

      <UiModal :open="modal === 'pending'" title="Finish your payment" eyebrow="Reserved order found" @close="modal = null">
        <p class="text-sm text-muted leading-relaxed">
          You have an unfinished order <strong class="mono text-ink">#{{ sessionInfo?.orderNumber }}</strong> for {{ formatMoney(sessionInfo?.totalAmount) }}.
        </p>
        <p class="text-sm text-muted mt-2">
          Your seats are held until the timer runs out. Continue to keep the same price and inventory.
        </p>
        <template #footer>
          <button class="btn-primary" type="button" :disabled="resuming" @click="resumeSession">
            {{ resuming ? 'Resuming…' : 'Continue order' }}
          </button>
          <button class="btn-secondary" type="button" @click="modal = null">Change selection</button>
        </template>
      </UiModal>

      <UiModal :open="modal === 'awaiting'" title="Payment under review" eyebrow="Proof received" @close="modal = null">
        <p class="text-sm text-muted leading-relaxed">
          Your receipt for order <strong class="mono text-ink">#{{ sessionInfo?.orderNumber }}</strong> is with the organizer. You will receive your tickets by email as soon as it is verified.
        </p>
        <div class="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-3.5 text-xs text-amber-900">
          Please do not send a second transfer. Duplicate bank references are automatically blocked.
        </div>
        <template #footer>
          <button class="btn-primary" type="button" @click="modal = null">Got it</button>
        </template>
      </UiModal>

      <UiModal :open="modal === 'manual'" title="Transfer & upload receipt" eyebrow="Order reserved" @close="modal = null">
        <div class="rounded-xl bg-paper border border-line p-4 space-y-2.5 text-sm">
          <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Transfer exactly</p>
          <p class="font-display text-2xl font-semibold text-ink">{{ formatMoney(manualOrder?.totalAmount) }}</p>
          <div class="divider my-2" />
          <div class="flex justify-between items-center gap-2">
            <span class="text-muted text-xs">Bank</span>
            <span class="font-semibold text-ink text-right">{{ manualAccount?.bankName || 'See organizer instructions' }}</span>
          </div>
          <div class="flex justify-between items-center gap-2">
            <span class="text-muted text-xs">Account number</span>
            <button type="button" class="mono font-bold text-ink inline-flex items-center gap-1.5" @click="copyAccount">
              {{ manualAccount?.accountNumber || '—' }} <Copy class="w-3.5 h-3.5 text-muted" />
            </button>
          </div>
          <div class="flex justify-between items-center gap-2">
            <span class="text-muted text-xs">Account name</span>
            <span class="font-semibold text-ink text-right">{{ manualAccount?.accountName || '—' }}</span>
          </div>
          <div class="flex justify-between items-center gap-2">
            <span class="text-muted text-xs">Reference</span>
            <span class="mono font-bold text-ink">{{ manualOrder?.orderNumber }}</span>
          </div>
        </div>

        <div class="mt-4">
          <label class="label">Proof of payment</label>
          <label class="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line bg-white px-4 py-6 cursor-pointer hover:border-forest/40 transition">
            <UploadCloud class="w-6 h-6 text-muted" />
            <span class="text-xs font-semibold text-ink">{{ receiptFile ? receiptFile.name : 'Upload JPG, PNG or PDF (max 10MB)' }}</span>
            <input type="file" accept="image/png,image/jpeg,image/webp,application/pdf" class="sr-only" @change="onReceiptChange" />
          </label>
          <img v-if="receiptPreview" :src="receiptPreview" alt="Receipt preview" class="mt-3 w-full max-h-40 object-contain rounded-lg border border-line" />
          <p v-if="receiptError" class="field-error">{{ receiptError }}</p>
        </div>

        <template #footer>
          <button class="btn-primary" type="button" :disabled="uploadingReceipt || !receiptFile" @click="uploadReceipt">
            {{ uploadingReceipt ? 'Uploading…' : 'Submit receipt' }}
          </button>
          <button class="btn-secondary" type="button" @click="copyAccount">Copy account</button>
        </template>
      </UiModal>

      <UiModal :open="modal === 'resale'" title="Buy a verified resale ticket" eyebrow="Face-value resale" @close="modal = null">
        <div v-if="resaleTarget" class="space-y-4">
          <div class="rounded-xl bg-paper border border-line p-4 flex items-center justify-between">
            <div>
              <p class="font-semibold text-ink">{{ resaleTarget.tierName }}</p>
              <p class="text-xs text-muted">Seller’s QR is cancelled the moment you pay.</p>
            </div>
            <p class="font-display text-xl font-semibold text-ink">{{ formatMoney(resaleTarget.askingPrice) }}</p>
          </div>
          <div>
            <label class="label">Your name</label>
            <input v-model.trim="resaleBuyer.name" type="text" class="input" placeholder="Full name" />
          </div>
          <div>
            <label class="label">Your email</label>
            <input v-model.trim="resaleBuyer.email" type="email" class="input" placeholder="you@example.com" />
          </div>
          <p v-if="resaleError" class="field-error">{{ resaleError }}</p>
          <p class="text-[11px] text-muted leading-relaxed">
            Payments are held by Ticketr. 90% goes to the seller after the event; the platform fee covers verification and support.
          </p>
        </div>
        <template #footer>
          <button class="btn-primary" type="button" :disabled="resalePending" @click="startResale">
            {{ resalePending ? 'Starting…' : 'Continue to payment' }}
          </button>
          <button class="btn-secondary" type="button" @click="modal = null">Cancel</button>
        </template>
      </UiModal>
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  ArrowUpRight,
  Building2,
  CalendarDays,
  CalendarX,
  ChevronRight,
  Copy,
  Lock,
  MapPin,
  ReceiptText,
  RefreshCcw,
  ScanLine,
  Share2,
  ShieldCheck,
  Ticket,
  UploadCloud,
  Video,
} from 'lucide-vue-next';
import { toast } from 'vue-sonner';

definePageMeta({ layout: 'default' });

const config = useRuntimeConfig();
const route = useRoute();
const reqUrl = useRequestURL();

const tenantSlug = computed(() => {
  if (typeof route.query.tenant === 'string' && route.query.tenant) return route.query.tenant;
  const host = reqUrl.hostname;
  if (host && host !== 'localhost' && host !== '127.0.0.1' && !/^\d+\./.test(host)) {
    const parts = host.split('.');
    if (parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'admin' && !parts[0].startsWith('admin-')) {
      return parts[0];
    }
  }
  return null;
});

const eventSlug = route.params.slug as string;

const { data, pending, error } = await useFetch<any>(
  tenantSlug.value
    ? `${config.public.apiBase}/events/tenant/${tenantSlug.value}/${eventSlug}`
    : `${config.public.apiBase}/events/public/slug/${encodeURIComponent(eventSlug)}`,
  { key: `event-${tenantSlug.value || 'global'}-${eventSlug}` },
);

const event = computed(() => data.value?.event || null);
const tenant = computed(() => data.value?.tenant || null);
const loadError = computed(() => {
  const value = error.value as any;
  if (!value) return '';
  return value?.data?.message || value?.message || 'We could not load this event.';
});

const galleryImages = computed<string[]>(() => {
  if (!event.value) return [];
  const images = [...(event.value.carouselImages || [])];
  if (event.value.bannerUrl) images.unshift(event.value.bannerUrl);
  return Array.from(new Set(images.filter(Boolean)));
});
const activeImage = ref(0);
const isManualTransfer = computed(
  () => tenant.value?.paymentMethod === 'MANUAL_TRANSFER',
);
const isPast = computed(
  () =>
    !!event.value &&
    (event.value.status === 'COMPLETED' || new Date(event.value.endDate).getTime() < Date.now()),
);
const isCancelled = computed(() => event.value?.status === 'CANCELLED');
const remaining = computed(() => Number(event.value?.remaining || 0));
const purchasableTiers = computed<any[]>(() =>
  isCancelled.value
    ? []
    : (event.value?.tiers || []).filter((tier: any) => tier.isActive !== false && tier.remaining > 0),
);
const organizerLink = computed(() => (tenantSlug.value ? `/?tenant=${tenantSlug.value}` : '/'));

const departmentOptions = computed<string[]>(() => event.value?.formSettings?.departmentOptions || []);
const departmentLabel = computed(() => event.value?.formSettings?.departmentLabel || 'Department');
const requireDepartment = computed(() => event.value?.formSettings?.requireDepartment !== false);
const customFields = computed<any[]>(() => event.value?.formSettings?.customFields || []);

// ---------------------------------------------------------------------------
// Selection state
// ---------------------------------------------------------------------------
const quantity = reactive<Record<string, number>>({});
const buyer = reactive({ name: '', email: '', phone: '' });
const sameAsBuyer = ref(true);
const acceptedTerms = ref(false);
const touched = reactive({ buyerName: false, attendees: false });
const attempted = ref(false);
const showBuyerErrors = computed(() => touched.buyerName || attempted.value);
const promoInput = ref('');
const promoPending = ref(false);
const promoError = ref('');
const appliedPromo = ref<any>(null);
const submitError = ref('');
const submitting = ref(false);

type AttendeeRow = {
  key: string;
  tierId: string;
  tierName: string;
  label: string;
  name: string;
  email: string;
  department: string;
  custom: Record<string, string>;
};
const attendees = reactive<Record<string, AttendeeRow[]>>({});

function unitsPerTier(tier: any): number {
  if (!tier) return 1;
  if (tier.isCoupleTicket) return 2;
  const match = String(tier.name || '').match(/table\s+(?:of|for)?\s*(\d+)/i);
  return match ? Math.max(1, parseInt(match[1], 10)) : 1;
}

function setQuantity(tier: any, next: number) {
  const max = Math.min(tier.maxPerPurchase || 5, tier.remaining);
  const value = Math.max(0, Math.min(max, next));
  quantity[tier._id] = value;

  const units = unitsPerTier(tier);
  const target = value * units;
  const rows = attendees[tier._id] || (attendees[tier._id] = []);
  while (rows.length < target) {
    const index = rows.length;
    rows.push({
      key: `${tier._id}-${index}`,
      tierId: tier._id,
      tierName: tier.name,
      label: units > 1 ? `${tier.name} · Pass ${index + 1}` : `${tier.name}`,
      name: sameAsBuyer.value ? buyer.name : '',
      email: sameAsBuyer.value ? buyer.email : '',
      department: '',
      custom: {},
    });
  }
  if (rows.length > target) rows.splice(target);
}

const attendeeRows = computed<AttendeeRow[]>(() =>
  Object.values(attendees).flat().filter(Boolean),
);

const itemCount = computed(() =>
  (event.value?.tiers || []).reduce((sum: number, tier: any) => sum + (quantity[tier._id] || 0) * unitsPerTier(tier), 0),
);
const unitCount = computed(() =>
  Object.values(quantity).reduce((sum, value) => sum + (value || 0), 0),
);

const subtotal = computed(() =>
  (event.value?.tiers || []).reduce((sum: number, tier: any) => sum + Number(tier.price) * (quantity[tier._id] || 0), 0),
);

const buyerFee = computed(() =>
  (event.value?.tiers || []).reduce((sum: number, tier: any) => {
    const qty = quantity[tier._id] || 0;
    if (!qty) return sum;
    const fee = Number(tier.markupFee || 0);
    if (!fee || tier.markupStrategy === 'DEDUCT_FROM_FEE') return sum;
    const itemSubtotal = Number(tier.price) * qty;
    return sum + (tier.markupFeeType === 'PERCENTAGE' ? (fee / 100) * itemSubtotal : fee * qty);
  }, 0),
);

const displayDiscount = computed(() => {
  if (!appliedPromo.value) return 0;
  const value = Number(appliedPromo.value.value || 0);
  const discount = appliedPromo.value.type === 'FLAT' ? value : (value / 100) * subtotal.value;
  return Math.min(subtotal.value, Math.round(discount * 100) / 100);
});

const total = computed(() => Math.max(0, Math.round((subtotal.value + buyerFee.value - displayDiscount.value) * 100) / 100));
const installment = ref(false);
const amountDueNow = computed(() => (installment.value ? Math.round((total.value / 2) * 100) / 100 : total.value));
const canInstallment = computed(
  () =>
    !isManualTransfer.value &&
    total.value >= 20000 &&
    !!event.value?.startDate &&
    new Date(event.value.startDate).getTime() > Date.now() + 14 * 24 * 60 * 60 * 1000,
);

watch(total, (value) => {
  if (value < 20000) installment.value = false;
});

const errors = computed(() => ({
  buyerName: !buyer.name || buyer.name.length < 2 ? 'Enter the buyer’s full name' : '',
  buyerEmail: !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(buyer.email) ? 'Enter a valid email address' : '',
}));

const attendeeError = computed(() => {
  if (!touched.attendees) return '';
  for (const row of attendeeRows.value) {
    if (!row.name || row.name.length < 2) return `Add a name for ${row.label}`;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(row.email)) return `Add a valid email for ${row.label}`;
    if (requireDepartment.value && departmentOptions.value.length && !row.department) {
      return `Select ${departmentLabel.value.toLowerCase()} for ${row.label}`;
    }
    for (const field of customFields.value) {
      if (field.required && !row.custom[field.name]) return `${field.label} is required for ${row.label}`;
    }
  }
  return '';
});

const canSubmit = computed(
  () =>
    !submitting.value &&
    itemCount.value > 0 &&
    !errors.value.buyerName &&
    !errors.value.buyerEmail &&
    !attendeeError.value &&
    acceptedTerms.value,
);

watch(sameAsBuyer, (apply) => {
  if (!apply) return;
  attendeeRows.value.forEach((row) => {
    row.name = buyer.name;
    row.email = buyer.email;
  });
});
watch(
  () => buyer.name,
  (value) => {
    if (sameAsBuyer.value) attendeeRows.value.forEach((row) => (row.name = value));
  },
);
watch(
  () => buyer.email,
  (value) => {
    if (sameAsBuyer.value) attendeeRows.value.forEach((row) => (row.email = value));
  },
);

// ---------------------------------------------------------------------------
// Promo
// ---------------------------------------------------------------------------
async function applyPromo() {
  promoError.value = '';
  if (!promoInput.value) return;
  promoPending.value = true;
  try {
    const data = await apiRequest<any>(
      `/orders/validate-promo?code=${encodeURIComponent(promoInput.value)}&eventId=${event.value._id}`,
      { auth: false },
    );
    appliedPromo.value = data;
  } catch (err: any) {
    promoError.value = errorMessage(err, 'That promo code is not valid.');
    appliedPromo.value = null;
  } finally {
    promoPending.value = false;
  }
}

function removePromo() {
  appliedPromo.value = null;
  promoInput.value = '';
  promoError.value = '';
}

// ---------------------------------------------------------------------------
// Session check
// ---------------------------------------------------------------------------
const modal = ref<null | 'paid' | 'pending' | 'awaiting' | 'manual' | 'resale'>(null);
const sessionInfo = ref<any>(null);
const resuming = ref(false);

async function onEmailBlur() {
  touched.buyerName = true;
  if (!buyer.email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(buyer.email) || !event.value) return;
  try {
    const data = await apiRequest<any>(
      `/orders/active-session?eventId=${event.value._id}&email=${encodeURIComponent(buyer.email)}`,
      { auth: false },
    );
    if (!data) return;
    sessionInfo.value = data;
    if (data.isAlreadyPaid) modal.value = 'paid';
    else if (data.status === 'AWAITING_APPROVAL') modal.value = 'awaiting';
    else if (data.status === 'PENDING') modal.value = 'pending';
  } catch {
    // Session lookup is best-effort; checkout still works.
  }
}

async function resumeSession() {
  resuming.value = true;
  submitError.value = '';
  try {
    const result = await createOrder();
    if (result?.authorizationUrl) {
      window.location.href = result.authorizationUrl;
      return;
    }
    if (result?.paymentMethod === 'MANUAL_TRANSFER') {
      manualOrder.value = result;
      manualAccount.value = result.remittanceAccount || tenant.value?.primaryRemittanceAccount || null;
      if (result?.walletToken && typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('ticketr_wallet_token', result.walletToken);
      }
      modal.value = 'manual';
      return;
    }
    modal.value = null;
  } catch (err) {
    submitError.value = errorMessage(err);
    modal.value = null;
    toast.error(submitError.value);
  } finally {
    resuming.value = false;
  }
}

// ---------------------------------------------------------------------------
// Checkout
// ---------------------------------------------------------------------------
async function createOrder() {
  touched.attendees = true;
  const items = Object.entries(quantity)
    .filter(([, count]) => (count || 0) > 0)
    .map(([tierId, count]) => {
      const tier = (event.value.tiers || []).find((t: any) => t._id === tierId);
      if (!tier) return null;
      const rows = attendees[tierId] || [];
      return {
        tierId,
        quantity: count,
        attendees: rows.map((row) => ({
          name: row.name || buyer.name,
          email: row.email || buyer.email,
          departmentCode: row.department || undefined,
          customData: row.custom || {},
        })),
      };
    })
    .filter(Boolean);

  return apiRequest<any>('/orders', {
    method: 'POST',
    auth: false,
    body: {
      tenantId: tenant.value.id,
      eventId: event.value._id,
      customerName: buyer.name,
      customerEmail: buyer.email,
      customerPhone: buyer.phone || undefined,
      items,
      promoCode: appliedPromo.value?.code || undefined,
      isInstallmentPlan: installment.value,
      callbackUrl: `${window.location.origin}/order/confirmation`,
    },
  });
}

async function submitOrder() {
  submitError.value = '';
  attempted.value = true;
  touched.attendees = true;
  touched.buyerName = true;
  if (!canSubmit.value) {
    submitError.value = attendeeError.value || errors.value.buyerName || errors.value.buyerEmail || 'Check the highlighted fields.';
    return;
  }

  submitting.value = true;
  try {
    const result = await createOrder();

    if (result?.isAlreadyPaid) {
      sessionInfo.value = result;
      modal.value = 'paid';
      return;
    }
    if (result?.isAwaitingApproval) {
      sessionInfo.value = result;
      modal.value = 'awaiting';
      return;
    }
    if (result?.authorizationUrl) {
      window.location.href = result.authorizationUrl;
      return;
    }
    if (result?.paymentMethod === 'MANUAL_TRANSFER') {
      manualOrder.value = result;
      manualAccount.value = result.remittanceAccount || tenant.value?.primaryRemittanceAccount || null;
      if (result?.walletToken && typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('ticketr_wallet_token', result.walletToken);
      }
      modal.value = 'manual';
      return;
    }
    if (result?.walletToken) {
      await navigateTo(`/my-tickets?token=${result.walletToken}`);
      return;
    }
    if (result?.orderNumber) {
      toast.success('Order placed. Check your email for your wallet link.');
    }
  } catch (err: any) {
    submitError.value = errorMessage(err, 'We could not start your checkout.');
    toast.error(submitError.value);
  } finally {
    submitting.value = false;
  }
}

// ---------------------------------------------------------------------------
// Manual transfer
// ---------------------------------------------------------------------------
const manualOrder = ref<any>(null);
const manualAccount = ref<any>(null);
const receiptFile = ref<File | null>(null);
const receiptPreview = ref('');
const receiptError = ref('');
const uploadingReceipt = ref(false);

function onReceiptChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  receiptError.value = '';
  if (!file) return;
  if (file.size > 10 * 1024 * 1024) {
    receiptError.value = 'That file is larger than 10MB.';
    return;
  }
  if (!/^(image\/(png|jpe?g|webp)|application\/pdf)$/.test(file.type)) {
    receiptError.value = 'Upload a JPG, PNG, WEBP or PDF file.';
    return;
  }
  receiptFile.value = file;
  receiptPreview.value = file.type.startsWith('image/') ? URL.createObjectURL(file) : '';
}

async function uploadReceipt() {
  if (!receiptFile.value || !manualOrder.value) return;
  receiptError.value = '';
  uploadingReceipt.value = true;
  try {
    const form = new FormData();
    form.append('receipt', receiptFile.value);
    form.append('tenantId', tenant.value.id);
    await apiRequest(`/orders/${manualOrder.value.orderId}/upload-proof`, {
      method: 'POST',
      auth: false,
      body: form,
    });
    modal.value = null;
    toast.success('Receipt received. We emailed you a confirmation.');
    setTimeout(() => navigateTo('/my-tickets'), 800);
  } catch (err: any) {
    receiptError.value = errorMessage(err);
    toast.error(receiptError.value);
  } finally {
    uploadingReceipt.value = false;
  }
}

async function copyAccount() {
  const account = manualAccount.value;
  if (!account?.accountNumber) return;
  const ok = await copyText(`${account.bankName || ''} ${account.accountNumber} ${account.accountName || ''}`.trim());
  toast[ok ? 'success' : 'error'](ok ? 'Account details copied' : 'Could not copy — select manually');
}

// ---------------------------------------------------------------------------
// Resale
// ---------------------------------------------------------------------------
const resaleListings = ref<any[]>([]);
const resaleTarget = ref<any>(null);
const resaleBuyer = reactive({ name: '', email: '' });
const resaleError = ref('');
const resalePending = ref(false);

async function loadResale() {
  if (!event.value?._id) return;
  try {
    const listings = await apiRequest<any[]>(`/tickets/resale/event/${event.value._id}`, { auth: false });
    resaleListings.value = Array.isArray(listings) ? listings : [];
  } catch {
    resaleListings.value = [];
  }
}

function openResale(listing: any) {
  resaleTarget.value = listing;
  resaleBuyer.name = buyer.name;
  resaleBuyer.email = buyer.email;
  resaleError.value = '';
  modal.value = 'resale';
}

async function startResale() {
  resaleError.value = '';
  if (!resaleBuyer.name || !resaleBuyer.email.includes('@')) {
    resaleError.value = 'Enter your name and a valid email.';
    return;
  }
  resalePending.value = true;
  try {
    const result = await apiRequest<any>(`/tickets/resale/${resaleTarget.value.id}/checkout`, {
      method: 'POST',
      auth: false,
      body: {
        buyerName: resaleBuyer.name,
        buyerEmail: resaleBuyer.email,
        callbackUrl: `${window.location.origin}/order/confirmation`,
      },
    });
    if (result?.authorizationUrl) window.location.href = result.authorizationUrl;
    else toast.success('Resale checkout created.');
  } catch (err: any) {
    resaleError.value = errorMessage(err);
  } finally {
    resalePending.value = false;
  }
}

// ---------------------------------------------------------------------------
// Misc
// ---------------------------------------------------------------------------
async function share() {
  const url = window.location.href;
  if (navigator.share) {
    try {
      await navigator.share({ title: event.value.title, url });
      return;
    } catch {
      /* fall through */
    }
  }
  const ok = await copyText(url);
  toast[ok ? 'success' : 'error'](ok ? 'Event link copied' : 'Could not copy the link');
}

function scrollToCheckout() {
  const checkout = document.querySelector('aside');
  checkout?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

onMounted(() => {
  loadResale();
});

useSeoMeta({
  title: computed(() => (event.value ? `${event.value.title} — ${tenant.value?.name || 'Ticketr'}` : 'Event | Ticketr')),
  description: computed(() => (event.value?.description || '').slice(0, 160)),
  ogTitle: computed(() => event.value?.title || 'Event | Ticketr'),
  ogDescription: computed(() => (event.value?.description || '').slice(0, 160)),
  ogImage: computed(() => event.value?.bannerUrl || tenant.value?.logoUrl || undefined),
  twitterCard: 'summary_large_image',
});
</script>
