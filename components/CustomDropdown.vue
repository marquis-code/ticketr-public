<template>
  <div class="relative" ref="dropdownRef">
    <button
      type="button"
      @click="isOpen = !isOpen"
      class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-indigo-500 transition bg-white text-left flex justify-between items-center"
    >
      <span :class="{ 'text-gray-400': !modelValue && !placeholder }">
        {{ selectedLabel }}
      </span>
      <svg
        class="w-4 h-4 text-gray-400 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg py-1 overflow-hidden"
      >
        <div class="max-h-60 overflow-y-auto">
          <button
            v-if="allowEmpty"
            type="button"
            @click="selectOption('')"
            class="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
            :class="{ 'bg-indigo-50 text-indigo-700 font-medium': modelValue === '' }"
          >
            {{ emptyLabel }}
          </button>
          
          <button
            v-for="option in options"
            :key="option.code"
            type="button"
            @click="selectOption(option.code)"
            class="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
            :class="{ 'bg-indigo-50 text-indigo-700 font-medium': modelValue === option.code }"
          >
            {{ option.name }} ({{ option.code }})
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    required: true
  },
  options: {
    type: Array,
    required: true
  },
  placeholder: {
    type: String,
    default: 'Select an option'
  },
  allowEmpty: {
    type: Boolean,
    default: false
  },
  emptyLabel: {
    type: String,
    default: 'None'
  }
});

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const dropdownRef = ref(null);

const selectedLabel = computed(() => {
  if (!props.modelValue && props.allowEmpty) return props.emptyLabel;
  const opt = props.options.find(o => o.code === props.modelValue);
  return opt ? `${opt.name} (${opt.code})` : props.placeholder;
});

const selectOption = (val) => {
  emit('update:modelValue', val);
  isOpen.value = false;
};

// Close when clicking outside
const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});
</script>
