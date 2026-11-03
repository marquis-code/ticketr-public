<template>
  <div class="relative inline-flex items-center justify-center bg-white" :style="{ width: `${size}px`, height: `${size}px` }">
    <img v-if="dataUrl" :src="dataUrl" :alt="alt" class="w-full h-full object-contain" />
    <div v-else class="skeleton w-full h-full" />
  </div>
</template>

<script setup lang="ts">
import QRCode from 'qrcode';

const props = withDefaults(
  defineProps<{
    value: string;
    size?: number;
    alt?: string;
    dark?: string;
    light?: string;
  }>(),
  { size: 180, alt: 'Ticket QR code', dark: '#0A1F1A', light: '#FFFFFF' },
);

const dataUrl = ref('');

async function render(value: string) {
  if (!value || typeof document === 'undefined') return;
  try {
    dataUrl.value = await QRCode.toDataURL(value, {
      width: Math.max(240, props.size * 2),
      margin: 1,
      errorCorrectionLevel: 'H',
      color: { dark: props.dark, light: props.light },
    });
  } catch {
    dataUrl.value = '';
  }
}

watch(() => props.value, (value) => render(value), { immediate: true });

onMounted(() => render(props.value));

defineExpose({ dataUrl });
</script>
