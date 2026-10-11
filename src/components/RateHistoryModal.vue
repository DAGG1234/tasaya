<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { getRateByDate, type CurrencyType } from '../services/historyService';

interface Props {
  activeType: CurrencyType;
  currentRate: number | null;
}

interface Emits {
  (e: 'selectHistoricalRate', payload: { rate: number; date: string }): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isOpen = ref(false);
const isLoading = ref(false);
const maxDate = new Date().toISOString().split('T')[0];
const selectedDate = ref<string>(maxDate);
const fetchedRate = ref<number | null>(null);

const currencyName = computed(() => {
  switch (props.activeType) {
    case 'EUR': return 'Euro BCV';
    case 'USDT': return 'USDT Binance';
    case 'BCV':
    default: return 'Dólar BCV';
  }
});

const formattedDateDisplay = computed(() => {
  if (!selectedDate.value) return '';
  const [year, month, day] = selectedDate.value.split('-');
  const d = new Date(Number(year), Number(month) - 1, Number(day));
  
  const formatted = new Intl.DateTimeFormat('es-VE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(d);

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
});

const formatRate = (rate: number) => {
  return new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rate);
};

const handleDateChange = async () => {
  if (!selectedDate.value) return;

  isLoading.value = true;
  fetchedRate.value = null;

  try {
    const res = await getRateByDate(props.activeType, selectedDate.value);
    if (res && res.rate > 0) {
      fetchedRate.value = res.rate;
    } else {
      fetchedRate.value = null;
    }
  } catch (e) {
    console.error('Error al consultar tasa histórica:', e);
    fetchedRate.value = null;
  } finally {
    isLoading.value = false;
  }
};

const openModal = () => {
  selectedDate.value = maxDate;
  fetchedRate.value = props.currentRate;
  isOpen.value = true;
};

const closeModal = () => {
  isOpen.value = false;
};

const applyHistoricalRate = () => {
  if (fetchedRate.value && fetchedRate.value > 0) {
    emit('selectHistoricalRate', {
      rate: fetchedRate.value,
      date: selectedDate.value,
    });
    closeModal();
  }
};

watch(() => props.activeType, () => {
  if (isOpen.value) {
    handleDateChange();
  }
});
</script>

<template>
  <div>
    <!-- Botón Disparador -->
    <button
      @click="openModal"
      type="button"
      class="w-full py-2.5 px-4 rounded-2xl bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800/60 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/60 transition-all flex items-center justify-center gap-2 text-xs font-bold cursor-pointer active:scale-98 shadow-sm"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-emerald-600 dark:text-[#00E676]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span>Consultar Tasas Históricas</span>
    </button>

    <!-- Modal Popup -->
    <Teleport to="body">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-md transition-all animate-fadeIn"
        @click.self="closeModal"
      >
        <div class="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 relative">
          
          <!-- Encabezado -->
          <div class="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981]"></span>
              <h3 class="text-sm sm:text-base font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                Inspeccionar Día — {{ currencyName }}
              </h3>
            </div>

            <button
              @click="closeModal"
              class="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Selector de Fecha -->
          <div class="space-y-2">
            <label class="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Selecciona una Fecha Pasada
            </label>
            <input
              type="date"
              v-model="selectedDate"
              :max="maxDate"
              @change="handleDateChange"
              class="w-full p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            />
          </div>

          <!-- Indicador de Tasa -->
          <div class="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 text-center space-y-1">
            <p class="text-xs font-bold text-zinc-500 dark:text-zinc-400">
              {{ formattedDateDisplay }}
            </p>

            <div v-if="isLoading" class="py-2 text-xs font-bold text-emerald-600 dark:text-[#00E676] flex items-center justify-center gap-1.5 animate-pulse">
              <svg class="animate-spin h-4 w-4 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Consultando DolarApi...</span>
            </div>

            <div v-else-if="fetchedRate" class="text-2xl font-black text-zinc-900 dark:text-white">
              Bs. {{ formatRate(fetchedRate) }}
            </div>

            <div v-else class="py-1 text-xs font-semibold text-rose-500">
              Sin registro de tasa para este día
            </div>
          </div>

          <!-- Acciones -->
          <div class="grid grid-cols-2 gap-2 pt-1">
            <button
              @click="closeModal"
              type="button"
              class="py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              @click="applyHistoricalRate"
              type="button"
              :disabled="!fetchedRate || fetchedRate <= 0 || isLoading"
              class="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              Aplicar a Conversor
            </button>
          </div>

        </div>
      </div>
    </Teleport>
  </div>
</template>