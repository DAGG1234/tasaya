<script setup lang="ts">
export type RateType = 'BCV' | 'USDT' | 'EUR';

interface Props {
  modelValue: RateType;
}

interface Emits {
  (e: 'update:modelValue', value: RateType): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const options: { type: RateType; label: string; badge: string }[] = [
  { type: 'BCV', label: 'BCV Dólar', badge: 'USD' },
  { type: 'USDT', label: 'USDT Binance', badge: 'P2P' },
  { type: 'EUR', label: 'BCV Euro', badge: 'EUR' },
];

const selectRate = (type: RateType) => {
  emit('update:modelValue', type);
};
</script>

<template>
  <div class="w-full bg-zinc-200/80 dark:bg-zinc-900/80 p-1.5 rounded-2xl border border-zinc-300/60 dark:border-zinc-800/80 shadow-inner">
    <div class="grid grid-cols-3 gap-1.5 w-full">
      <button
        v-for="option in options"
        :key="option.type"
        @click="selectRate(option.type)"
        type="button"
        :class="[
          'py-2.5 px-1 sm:px-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 cursor-pointer select-none',
          props.modelValue === option.type
            ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-md border border-zinc-200 dark:border-zinc-700/60 scale-[1.02]'
            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-300/40 dark:hover:bg-zinc-800/40'
        ]"
      >
        <span 
          class="w-2 h-2 rounded-full transition-all shrink-0"
          :class="props.modelValue === option.type ? 'bg-[#00E676] shadow-[0_0_8px_#00E676]' : 'bg-zinc-400 dark:bg-zinc-600'"
        ></span>
        
        <span class="truncate text-[11px] sm:text-xs tracking-tight">
          {{ option.label }}
        </span>
      </button>
    </div>
  </div>
</template>