<template>
  <div class="relative" ref="dropdownRef">
    <button 
      type="button" 
      @click="isOpen = !isOpen"
      class="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-left text-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary flex justify-between items-center transition-all duration-200"
      :class="{ 'border-primary ring-1 ring-primary': isOpen }"
    >
      <span class="truncate block pr-4" :class="{ 'text-gray-400': !selectedOption }">
        {{ selectedOption ? selectedOption.label : placeholder }}
      </span>
      <ChevronDown class="w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200" :class="{ 'rotate-180': isOpen }" />
    </button>

    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div 
        v-if="isOpen" 
        class="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg max-h-60 overflow-auto py-1 focus:outline-none"
      >
        <div v-if="options.length === 0" class="px-4 py-2 text-sm text-gray-500">
          No options available
        </div>
        <button
          v-for="option in options"
          :key="option.value"
          @click="selectOption(option)"
          type="button"
          class="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 flex items-center justify-between group"
          :class="{ 'bg-primary/5 text-primary font-medium': modelValue === option.value, 'text-gray-700': modelValue !== option.value }"
        >
          <span class="truncate">{{ option.label }}</span>
          <Check v-if="modelValue === option.value" class="w-4 h-4 text-primary" />
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ChevronDown, Check } from 'lucide-vue-next';

const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean],
    default: ''
  },
  options: {
    type: Array,
    required: true // array of { label, value }
  },
  placeholder: {
    type: String,
    default: 'Select an option'
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

const isOpen = ref(false);
const dropdownRef = ref(null);

const selectedOption = computed(() => {
  return props.options.find(opt => opt.value === props.modelValue) || null;
});

function selectOption(option) {
  emit('update:modelValue', option.value);
  emit('change', option.value);
  isOpen.value = false;
}

function handleClickOutside(event) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});
</script>
