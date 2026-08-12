<template>
  <div class="relative">
    <input 
      type="text" 
      ref="inputRef"
      :placeholder="placeholder"
      class="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary pl-9 cursor-pointer"
    />
    <Calendar class="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
    <button 
      v-if="modelValue" 
      @click.stop="clearDate"
      class="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
      type="button"
    >
      <X class="w-4 h-4" />
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { Calendar, X } from 'lucide-vue-next';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.css';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Select Date'
  },
  enableTime: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

const inputRef = ref(null);
let fp = null;

onMounted(() => {
  fp = flatpickr(inputRef.value, {
    enableTime: props.enableTime,
    dateFormat: props.enableTime ? 'Y-m-d H:i' : 'Y-m-d',
    defaultDate: props.modelValue || null,
    onChange: (selectedDates, dateStr) => {
      emit('update:modelValue', dateStr);
      emit('change', dateStr);
    }
  });
});

watch(() => props.modelValue, (newVal) => {
  if (fp && newVal !== inputRef.value.value) {
    fp.setDate(newVal, false);
  }
});

function clearDate() {
  if (fp) {
    fp.clear();
  }
  emit('update:modelValue', '');
  emit('change', '');
}

onUnmounted(() => {
  if (fp) {
    fp.destroy();
  }
});
</script>

<style>
/* Custom overrides for flatpickr to match our aggressive modern styling */
.flatpickr-calendar {
  border: 1px solid #f3f4f6 !important;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1) !important;
  border-radius: 12px !important;
  padding: 8px !important;
}
.flatpickr-day.selected {
  background: #4f46e5 !important;
  border-color: #4f46e5 !important;
}
</style>
