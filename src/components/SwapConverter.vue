<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import RateSelector, { type RateType } from './RateSelector.vue';
import RateHistoryModal from './RateHistoryModal.vue';
import UpcomingRateButton from './UpcomingRateButton.vue';
import { getBcvRate, type BcvResult } from '../services/bcvService';
import { getUsdtRate, type UsdtResult } from '../services/usdtService';
import { getEuroRate, type EuroResult } from '../services/euroService';
import { saveTodayRateToHistory } from '../services/historyService';

const selectedRateType = ref<RateType>('BCV');
const bcvData = ref<BcvResult | null>(null);
const usdtData = ref<UsdtResult | null>(null);
const euroData = ref<EuroResult | null>(null);

const activeOverride = ref<{ rate: number; label: string } | null>(null);

const isLoading = ref(false);
const isForeignToVes = ref(true);
const foreignAmount = ref<string>('1');
const vesAmount = ref<string>('');
const copied = ref(false);

const fetchAllRates = async () => {
  isLoading.value = true;
  try {
    const [bcvRes, usdtRes, euroRes] = await Promise.all([
      getBcvRate(),
      getUsdtRate(),
      getEuroRate(),
    ]);

    bcvData.value = bcvRes;
    usdtData.value = usdtRes;
    euroData.value = euroRes;

    if (bcvRes?.rate) saveTodayRateToHistory('BCV', bcvRes.rate, bcvRes.updatedAt);
    if (usdtRes?.rate) saveTodayRateToHistory('USDT', usdtRes.rate, usdtRes.updatedAt);
    if (euroRes?.rate) saveTodayRateToHistory('EUR', euroRes.rate, euroRes.updatedAt);

    calculateValues();
  } catch (error) {
    console.error('Error al actualizar las tasas:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchAllRates();
});

const baseRate = computed(() => {
  switch (selectedRateType.value) {
    case 'EUR': return euroData.value?.rate ?? null;
    case 'USDT': return usdtData.value?.rate ?? null;
    case 'BCV':
    default: return bcvData.value?.rate ?? null;
  }
});

const currentRate = computed(() => {
  if (activeOverride.value) {
    return activeOverride.value.rate;
  }
  return baseRate.value;
});

const currencySymbol = computed(() => {
  switch (selectedRateType.value) {
    case 'EUR': return '€';
    case 'USDT': return 'USDT';
    case 'BCV':
    default: return '$';
  }
});

const currencyLabel = computed(() => {
  switch (selectedRateType.value) {
    case 'EUR': return 'EURO BCV';
    case 'USDT': return 'USDT BINANCE';
    case 'BCV':
    default: return 'DÓLAR BCV';
  }
});

const calculateValues = () => {
  const rate = currentRate.value;
  if (!rate || rate <= 0) {
    if (isForeignToVes.value) vesAmount.value = '';
    else foreignAmount.value = '';
    return;
  }

  if (isForeignToVes.value) {
    const num = parseFloat(foreignAmount.value);
    if (isNaN(num)) {
      vesAmount.value = '';
      return;
    }
    vesAmount.value = (num * rate).toFixed(2);
  } else {
    const num = parseFloat(vesAmount.value);
    if (isNaN(num)) {
      foreignAmount.value = '';
      return;
    }
    foreignAmount.value = (num / rate).toFixed(2);
  }
};

watch(selectedRateType, () => {
  activeOverride.value = null;
  calculateValues();
});

watch(currentRate, () => {
  calculateValues();
});

const handleHistoricalRateSelected = (payload: { rate: number; date: string }) => {
  const [, month, day] = payload.date.split('-');
  activeOverride.value = {
    rate: payload.rate,
    label: `Histórica (${day}/${month})`,
  };
  calculateValues();
};

const handleUpcomingRateApplied = (payload: { rate: number; isOfficial: boolean }) => {
  let labelPrefix = 'Dólar BCV Mañana';
  if (selectedRateType.value === 'EUR') labelPrefix = 'Euro BCV Mañana';

  activeOverride.value = {
    rate: payload.rate,
    label: payload.isOfficial ? `${labelPrefix} Oficial` : `${labelPrefix} Aprox.`,
  };
  calculateValues();
};

const resetToToday = () => {
  activeOverride.value = null;
  calculateValues();
};

const handleForeignInput = () => {
  isForeignToVes.value = true;
  calculateValues();
};

const handleVesInput = () => {
  isForeignToVes.value = false;
  calculateValues();
};

const toggleDirection = () => {
  if (!currentRate.value) return;

  const rate = currentRate.value;
  isForeignToVes.value = !isForeignToVes.value;

  if (!isForeignToVes.value) {
    const currentVes = parseFloat(vesAmount.value);
    if (isNaN(currentVes) || currentVes <= 0) {
      const numForeign = parseFloat(foreignAmount.value) || 1;
      vesAmount.value = (numForeign * rate).toFixed(2);
    }
  } else {
    const numForeign = parseFloat(foreignAmount.value) || 1;
    vesAmount.value = (numForeign * rate).toFixed(2);
  }

  calculateValues();
};

const formattedVesResult = computed(() => {
  if (!currentRate.value) return 'Sin conexión';
  const val = parseFloat(vesAmount.value);
  if (isNaN(val)) return '0,00';
  return new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
});

const formattedForeignResult = computed(() => {
  const val = parseFloat(foreignAmount.value);
  if (isNaN(val)) return '0,00';
  return new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
});

const formattedActiveRate = computed(() => {
  const rate = currentRate.value;
  if (!rate) return 'Tasa no disponible';
  return new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 3 }).format(rate);
});

const copyToClipboard = async (textToCopy: string) => {
  if (!textToCopy || !currentRate.value) return;
  try {
    await navigator.clipboard.writeText(textToCopy);
    copied.value = true;
    setTimeout(() => { copied.value = false; }, 2000);
  } catch (err) {
    console.error('Error al copiar:', err);
  }
};
</script>

<template>
  <div class="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 sm:p-6 shadow-xl transition-all space-y-4">
    
    <!-- Selector de Monedas -->
    <RateSelector v-model="selectedRateType" />

    <!-- Badge si se está usando un modo de Override (Histórica o Mañana) -->
    <div
      v-if="activeOverride"
      class="p-2.5 px-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-700 dark:text-amber-400 font-bold"
    >
      <div class="flex items-center gap-1.5 truncate">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="truncate">Modo: {{ activeOverride.label }}</span>
      </div>

      <button
        @click="resetToToday"
        type="button"
        class="px-2 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-800 dark:text-amber-300 font-extrabold text-[11px] transition-colors cursor-pointer shrink-0"
      >
        Volver a hoy
      </button>
    </div>

    <!-- Error Si No hay Tasa -->
    <div v-if="!currentRate && !isLoading" class="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-center text-xs text-red-600 dark:text-red-400 font-semibold flex items-center justify-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <span>Sin conexión / Tasa no disponible. Verifique su acceso a internet.</span>
    </div>

    <!-- Campos del Conversor -->
    <div class="relative flex flex-col gap-3 pt-1">
      
      <!-- Entrada Divisa Extranjera ($ / € / USDT) -->
      <div 
        class="p-4 rounded-2xl border transition-all duration-300"
        :class="isForeignToVes 
          ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/40 dark:border-emerald-500/30 ring-1 ring-emerald-500/20 shadow-sm' 
          : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700/60 opacity-90'"
      >
        <div class="flex items-center justify-between mb-1.5">
          <span 
            class="text-xs font-bold uppercase tracking-wider transition-colors"
            :class="isForeignToVes ? 'text-emerald-700 dark:text-emerald-400' : 'text-zinc-500 dark:text-zinc-400'"
          >
            {{ currencyLabel }}
          </span>
          <span 
            class="text-xs font-black px-2 py-0.5 rounded-md transition-colors"
            :class="isForeignToVes ? 'bg-emerald-500/20 text-emerald-800 dark:text-[#00E676]' : 'bg-zinc-200 dark:bg-zinc-700/80 text-zinc-700 dark:text-zinc-200'"
          >
            {{ selectedRateType === 'BCV' ? 'USD' : selectedRateType }}
          </span>
        </div>

        <div class="flex items-center justify-between gap-2">
          <span class="text-2xl font-black text-emerald-600 dark:text-[#00E676] shrink-0 select-none">
            {{ currencySymbol }}
          </span>

          <!-- Editable si Divisa -> VES (Selecciona el texto automáticamente al enfocar) -->
          <input
            v-if="isForeignToVes"
            v-model="foreignAmount"
            @input="handleForeignInput"
            @focus="($event.target as HTMLInputElement).select()"
            type="number"
            step="any"
            placeholder="0"
            :disabled="!currentRate"
            class="w-full bg-transparent text-right text-3xl font-black text-zinc-900 dark:text-white focus:outline-none placeholder:text-zinc-400 disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />

          <!-- Resultado si VES -> Divisa -->
          <div v-else class="flex items-center gap-2 w-full justify-end">
            <span class="w-full text-right text-3xl font-black truncate text-zinc-900 dark:text-white">
              {{ formattedForeignResult }}
            </span>

            <button
              v-if="currentRate"
              @click="copyToClipboard(foreignAmount)"
              type="button"
              class="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-[#00E676] transition-all cursor-pointer active:scale-95 shrink-0 ml-1"
              title="Copiar resultado"
            >
              <svg v-if="copied" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Botón Swap (Invertir Dirección) -->
      <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <button
          @click="toggleDirection"
          :disabled="!currentRate"
          type="button"
          class="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 text-emerald-600 dark:text-[#00E676] flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          title="Invertir dirección"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            class="w-5 h-5 transition-transform duration-300" 
            :class="{ 'rotate-180': !isForeignToVes }" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </button>
      </div>

      <!-- Entrada / Salida Bolívares (VES) -->
      <div 
        class="p-4 rounded-2xl border transition-all duration-300"
        :class="!isForeignToVes 
          ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/40 dark:border-emerald-500/30 ring-1 ring-emerald-500/20 shadow-sm' 
          : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700/60 opacity-90'"
      >
        <div class="flex items-center justify-between mb-1.5">
          <span 
            class="text-xs font-bold uppercase tracking-wider transition-colors"
            :class="!isForeignToVes ? 'text-emerald-700 dark:text-emerald-400' : 'text-zinc-500 dark:text-zinc-400'"
          >
            Bolívares
          </span>
          <span 
            class="text-xs font-black px-2 py-0.5 rounded-md transition-colors"
            :class="!isForeignToVes ? 'bg-emerald-500/20 text-emerald-800 dark:text-[#00E676]' : 'bg-zinc-200 dark:bg-zinc-700/80 text-zinc-700 dark:text-zinc-200'"
          >
            VES
          </span>
        </div>

        <div class="flex items-center justify-between gap-2">
          <span class="text-2xl font-black text-emerald-600 dark:text-[#00E676] shrink-0 select-none">
            Bs.
          </span>
          <div class="flex items-center gap-2 w-full justify-end">
            
            <!-- Editable si VES -> Divisa (Selecciona el texto automáticamente al enfocar) -->
            <input
              v-if="!isForeignToVes"
              v-model="vesAmount"
              @input="handleVesInput"
              @focus="($event.target as HTMLInputElement).select()"
              type="number"
              step="any"
              placeholder="0"
              :disabled="!currentRate"
              class="w-full bg-transparent text-right text-3xl font-black text-zinc-900 dark:text-white focus:outline-none placeholder:text-zinc-400 disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />

            <!-- Resultado si Divisa -> VES -->
            <div v-else class="flex items-center gap-2 w-full justify-end">
              <span :class="['text-3xl font-black truncate text-right w-full', currentRate ? 'text-zinc-900 dark:text-white' : 'text-red-500 text-base']">
                {{ formattedVesResult }}
              </span>

              <button
                v-if="currentRate"
                @click="copyToClipboard(vesAmount)"
                type="button"
                class="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-[#00E676] transition-all cursor-pointer active:scale-95 shrink-0 ml-1"
                title="Copiar resultado"
              >
                <svg v-if="copied" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>

          </div>
        </div>
      </div>

    </div>

    <!-- Módulo de Tasa Próxima (Se oculta automáticamente si es USDT) -->
    <UpcomingRateButton
      :activeType="selectedRateType"
      :currentRate="baseRate"
      @applyUpcomingRate="handleUpcomingRateApplied"
    />

    <!-- Pie: Tasa Activa y Botón de Recarga -->
    <div class="pt-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-medium border-t border-zinc-100 dark:border-zinc-800">
      <div class="flex items-center gap-1">
        <span>Tasa activa:</span>
        <strong class="text-zinc-800 dark:text-zinc-200 font-bold">
          <template v-if="currentRate">
            1 {{ selectedRateType === 'BCV' ? 'USD' : selectedRateType }} = Bs. {{ formattedActiveRate }}
          </template>
          <template v-else>
            Tasa no disponible
          </template>
        </strong>
      </div>

      <button
        @click="fetchAllRates"
        :disabled="isLoading"
        class="flex items-center gap-1 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer disabled:opacity-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" :class="{ 'animate-spin': isLoading }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span>{{ isLoading ? 'Buscando...' : 'Reintentar' }}</span>
      </button>
    </div>

    <!-- Modal para Seleccionar Fecha Histórica -->
    <div class="pt-1 border-t border-zinc-100 dark:border-zinc-800/80">
      <RateHistoryModal
        :activeType="selectedRateType"
        :currentRate="currentRate"
        @selectHistoricalRate="handleHistoricalRateSelected"
      />
    </div>

  </div>
</template>