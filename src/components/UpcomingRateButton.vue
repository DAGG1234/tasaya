<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue';
import { getUpcomingRate, type CurrencyType, type UpcomingRateResult } from '../services/historyService';

interface Props {
  activeType: CurrencyType;
  currentRate: number | null;
}

interface Emits {
  (e: 'applyUpcomingRate', payload: { rate: number; isOfficial: boolean }): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isLoading = ref(false);
const upcomingInfo = ref<UpcomingRateResult | null>(null);

const fetchUpcoming = async () => {
  // Ocultar de inmediato si es USDT o no hay tasa actual
  if (props.activeType === 'USDT' || !props.currentRate) {
    upcomingInfo.value = null;
    return;
  }

  isLoading.value = true;
  try {
    const res = await getUpcomingRate(props.activeType, props.currentRate);
    upcomingInfo.value = res;
  } catch (e) {
    console.error('Error calculando la tasa próxima:', e);
    upcomingInfo.value = null;
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchUpcoming();
});

watch([() => props.activeType, () => props.currentRate], () => {
  fetchUpcoming();
});

const formatRate = (rate: number) => {
  return new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rate);
};

const handleApply = () => {
  if (upcomingInfo.value && upcomingInfo.value.rate > 0) {
    emit('applyUpcomingRate', {
      rate: upcomingInfo.value.rate,
      isOfficial: upcomingInfo.value.isOfficial,
    });
  }
};

const labelTitle = computed(() => {
  return props.activeType === 'EUR' ? 'Euro BCV Mañana' : 'Dólar BCV Mañana';
});
</script>

<template>
  <!-- Ocultar completamente si la pestaña activa es USDT -->
  <div v-if="props.activeType !== 'USDT' && props.currentRate" class="w-full">
    
    <div class="w-full py-2 px-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between text-xs transition-all">
      
      <!-- Indicador de Carga -->
      <div v-if="isLoading" class="text-[11px] text-zinc-400 font-medium flex items-center gap-1.5 animate-pulse">
        <svg class="animate-spin h-3 w-3 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Verificando tasa oficial próxima...</span>
      </div>

      <!-- Estado: Tasa Próxima Disponible -->
      <template v-else-if="upcomingInfo && upcomingInfo.rate > 0">
        <div class="flex items-center gap-1.5 truncate">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-emerald-600 dark:text-[#00E676] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>

          <span class="text-zinc-500 dark:text-zinc-400 font-medium text-[11px]">
            {{ labelTitle }}:
          </span>

          <span class="font-extrabold text-zinc-900 dark:text-zinc-100 text-[11px]">
            Bs. {{ formatRate(upcomingInfo.rate) }}
          </span>

          <span
            v-if="upcomingInfo.changePercent !== 0"
            class="text-[10px] font-black px-1.5 py-0.2 rounded-md"
            :class="upcomingInfo.changePercent >= 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-500'"
          >
            {{ upcomingInfo.changePercent >= 0 ? '+' : '' }}{{ upcomingInfo.changePercent }}%
          </span>
        </div>

        <button
          @click="handleApply"
          type="button"
          class="text-[11px] font-extrabold text-emerald-600 hover:text-emerald-500 dark:text-[#00E676] dark:hover:text-emerald-400 transition-colors cursor-pointer shrink-0 ml-2"
        >
          Aplicar
        </button>
      </template>

      <!-- Estado: Pendiente por anuncio oficial -->
      <template v-else>
        <div class="flex items-center gap-2 truncate text-zinc-400 dark:text-zinc-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="truncate text-[11px] font-medium">Tasa Mañana: Pendiente por anuncio del BCV (4:00 PM)</span>
        </div>
      </template>

    </div>

  </div>
</template>