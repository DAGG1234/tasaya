<script setup lang="ts">
defineProps<{
  modelValue: 'BCV' | 'USDT';
}>();

defineEmits<{
  (e: 'update:modelValue', value: 'BCV' | 'USDT'): void;
}>();
</script>

<template>
  <div class="flex p-1.5 bg-zinc-200/80 dark:bg-zinc-900 rounded-2xl border border-zinc-300/50 dark:border-zinc-800 max-w-lg mx-auto w-full shadow-sm">
    <button
      @click="$emit('update:modelValue', 'BCV')"
      :class="[
        'flex-1 py-3 px-5 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 flex items-center justify-center gap-2.5',
        modelValue === 'BCV'
          ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-md border border-zinc-200/80 dark:border-zinc-700/60'
          : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
      ]"
    >
      <span 
        class="w-2.5 h-2.5 rounded-full transition-all"
        :class="modelValue === 'BCV' ? 'bg-emerald-500 dark:bg-brandGreen shadow-[0_0_10px_rgba(0,230,118,0.7)] animate-pulse' : 'bg-transparent'"
      ></span>
      BCV Oficial
    </button>

    <button
      @click="$emit('update:modelValue', 'USDT')"
      :class="[
        'flex-1 py-3 px-5 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 flex items-center justify-center gap-2.5',
        modelValue === 'USDT'
          ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-md border border-zinc-200/80 dark:border-zinc-700/60'
          : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
      ]"
    >
      <span 
        class="w-2.5 h-2.5 rounded-full transition-all"
        :class="modelValue === 'USDT' ? 'bg-emerald-500 dark:bg-brandGreen shadow-[0_0_10px_rgba(0,230,118,0.7)] animate-pulse' : 'bg-transparent'"
      ></span>
      USDT Binance
    </button>
  </div>
</template>