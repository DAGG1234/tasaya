<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { getBcvRate } from '../services/bcvService';
import { getUsdtRate } from '../services/usdtService';
import RateSelector from './RateSelector.vue';

const activeTab = ref<'BCV' | 'USDT'>('BCV');
// Mantenemos el input como string para permitir tipear decimales libremente (ej: "12.5" o "12,5")
const amountInput = ref<string>('1');
const isInverse = ref(false); // false: USD -> VES | true: VES -> USD

const rateValue = ref<number>(0);
const updatedAt = ref<string>('');
const isOffline = ref<boolean>(false);
const isLoading = ref<boolean>(true);
const errorMessage = ref<string | null>(null);
const isRotating = ref(false);
const isCopied = ref(false);

const fetchCurrentRate = async () => {
  isLoading.value = true;
  errorMessage.value = null;
  try {
    if (activeTab.value === 'BCV') {
      const data = await getBcvRate();
      rateValue.value = data.rate;
      updatedAt.value = data.updatedAt;
      isOffline.value = data.isOffline;
    } else {
      const data = await getUsdtRate();
      rateValue.value = data.rate;
      updatedAt.value = data.updatedAt;
      isOffline.value = data.isOffline;
    }
  } catch (error: any) {
    errorMessage.value = error.message || 'Error al obtener la tasa de cambio.';
  } finally {
    isLoading.value = false;
  }
};

watch(activeTab, () => {
  fetchCurrentRate();
});

onMounted(() => {
  fetchCurrentRate();
});

// Parsea la entrada limpia soportando tanto coma como punto decimal
const parsedInputNumber = computed(() => {
  if (!amountInput.value) return 0;
  const cleanStr = amountInput.value.replace(',', '.');
  const num = parseFloat(cleanStr);
  return isNaN(num) ? 0 : num;
});

// Valor numérico directo del resultado para usar en el Swap
const rawResultNumber = computed(() => {
  const num = parsedInputNumber.value;
  if (num <= 0 || !rateValue.value) return 0;

  if (!isInverse.value) {
    return num * rateValue.value; // USD -> VES
  } else {
    return num / rateValue.value; // VES -> USD
  }
});

// Resultado formateado para mostrar en pantalla
const convertedResult = computed(() => {
  const raw = rawResultNumber.value;
  if (raw <= 0) return '0,00';

  if (!isInverse.value) {
    return raw.toLocaleString('es-VE', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  } else {
    const maxDigits = raw < 0.01 && raw > 0 ? 4 : 2;
    return raw.toLocaleString('es-VE', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: maxDigits 
    });
  }
});

const copyResultToClipboard = () => {
  if (isLoading.value || !convertedResult.value) return;
  navigator.clipboard.writeText(convertedResult.value);
  isCopied.value = true;
  setTimeout(() => {
    isCopied.value = false;
  }, 2000);
};

// Al hacer Swap, mantenemos el monto calculado pasando el resultado como la nueva entrada
const toggleSwapDirection = () => {
  isRotating.value = true;
  setTimeout(() => {
    isRotating.value = false;
  }, 300);

  const currentResult = rawResultNumber.value;
  
  isInverse.value = !isInverse.value;

  // Asignamos el valor obtenido ajustándolo a máximo 2 o 4 decimales limpios
  if (currentResult > 0) {
    const decimals = isInverse.value && currentResult < 0.01 ? 4 : 2;
    amountInput.value = currentResult.toFixed(decimals);
  }
};
</script>

<template>
  <div class="w-full max-w-xl mx-auto space-y-6">
    <!-- Selector de Tasa Activa -->
    <RateSelector v-model="activeTab" />

    <!-- Tarjeta Principal del Conversor -->
    <div class="bg-white dark:bg-[#18181B] rounded-3xl p-6 sm:p-8 shadow-2xl shadow-zinc-200/50 dark:shadow-black/70 border border-zinc-200/80 dark:border-zinc-800/80 transition-all relative overflow-hidden">
      
      <!-- Aviso de Modo Sin Conexión -->
      <transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="transform -translate-y-2 opacity-0"
        enter-to-class="transform translate-y-0 opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="transform translate-y-0 opacity-100"
        leave-to-class="transform -translate-y-2 opacity-0"
      >
        <div v-if="isOffline" class="mb-5 py-2.5 px-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3 text-amber-600 dark:text-amber-400 text-xs sm:text-sm font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Modo sin conexión: Usando última cotización en caché.</span>
        </div>
      </transition>

      <div class="space-y-4 relative">
        
        <!-- Bloque Superior: Entrada de Origen (Editable) -->
        <div class="p-5 sm:p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800/60 space-y-2 transition-colors">
          <div class="flex justify-between items-center text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            <span>{{ !isInverse ? (activeTab === 'BCV' ? 'Dólar Oficial' : 'USDT Binance') : 'Bolívares' }}</span>
            <span class="px-2.5 py-1 rounded-lg bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-bold">
              {{ !isInverse ? 'USD' : 'VES' }}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-3xl font-bold text-zinc-400 mr-3">{{ !isInverse ? '$' : 'Bs.' }}</span>
            
            <!-- Input editable flexible para decimales -->
            <input
              v-model="amountInput"
              type="text"
              inputmode="decimal"
              placeholder="0.00"
              class="w-full bg-transparent text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white focus:outline-none text-right tracking-tight"
            />
          </div>
        </div>

        <!-- Botón Central Flotante de Inversión (Swap) -->
        <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <button
            @click="toggleSwapDirection"
            :class="[
              'w-12 h-12 rounded-full bg-white dark:bg-zinc-900 text-emerald-600 dark:text-brandGreen border-2 border-zinc-200 dark:border-zinc-700 flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer',
              isRotating ? 'rotate-180' : 'rotate-0'
            ]"
            title="Invertir conversión"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
        </div>

        <!-- Bloque Inferior: Resultado de Destino (Calculado) -->
        <div class="p-5 sm:p-6 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/15 border border-emerald-500/20 dark:border-emerald-500/20 space-y-2 transition-colors relative">
          <div class="flex justify-between items-center text-xs font-semibold text-emerald-600/80 dark:text-brandGreen/80 uppercase tracking-wider">
            <span>{{ !isInverse ? 'Bolívares' : (activeTab === 'BCV' ? 'Dólar Oficial' : 'USDT Binance') }}</span>
            
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-brandGreen text-xs font-bold">
                {{ !isInverse ? 'VES' : 'USD' }}
              </span>
            </div>
          </div>

          <div class="flex items-center justify-between gap-3">
            <span class="text-3xl font-bold text-emerald-600 dark:text-brandGreen">{{ !isInverse ? 'Bs.' : '$' }}</span>
            
            <div class="flex-1 text-right truncate">
              <span v-if="isLoading" class="animate-pulse text-zinc-400 text-xl">Calculando...</span>
              <span v-else class="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
                {{ convertedResult }}
              </span>
            </div>

            <!-- Botón de Copiar Resultado -->
            <div class="relative shrink-0">
              <button
                @click="copyResultToClipboard"
                :class="[
                  'w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all duration-200 active:scale-90 shadow-md border cursor-pointer',
                  isCopied
                    ? 'bg-emerald-500 text-white border-emerald-400 dark:bg-brandGreen dark:text-zinc-950 dark:border-brandGreen shadow-emerald-500/30'
                    : 'bg-emerald-500/15 hover:bg-emerald-500/25 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 text-emerald-600 dark:text-brandGreen border-emerald-500/30'
                ]"
                :title="isCopied ? '¡Copiado!' : 'Copiar monto'"
              >
                <svg v-if="!isCopied" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>

                <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </button>

              <!-- Notificación Flotante -->
              <transition
                enter-active-class="transition duration-200 ease-out"
                enter-from-class="opacity-0 translate-y-1 scale-90"
                enter-to-class="opacity-100 translate-y-0 scale-100"
                leave-active-class="transition duration-150 ease-in"
                leave-from-class="opacity-100 translate-y-0 scale-100"
                leave-to-class="opacity-0 translate-y-1 scale-90"
              >
                <span
                  v-if="isCopied"
                  class="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-md bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-[10px] font-bold tracking-wide shadow-xl whitespace-nowrap pointer-events-none"
                >
                  ¡Copiado!
                </span>
              </transition>
            </div>
          </div>
        </div>
      </div>

      <!-- Pie de la Tarjeta -->
      <div class="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 gap-3">
        <div class="flex items-center gap-2">
          <span class="text-zinc-400">Tasa activa:</span>
          <span class="font-semibold text-zinc-800 dark:text-zinc-200">
            <span v-if="isLoading">Cargando...</span>
            <span v-else>1 USD = Bs. {{ rateValue.toLocaleString('es-VE', { minimumFractionDigits: 2 }) }}</span>
          </span>
        </div>
        <button 
          @click="fetchCurrentRate"
          class="hover:text-emerald-600 dark:hover:text-brandGreen transition-colors flex items-center gap-1.5 py-1.5 px-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/60 font-medium cursor-pointer"
          title="Actualizar tasa"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" :class="{ 'animate-spin': isLoading }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Actualizar</span>
        </button>
      </div>

    </div>
  </div>
</template>