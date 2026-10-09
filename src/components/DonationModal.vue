<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
  isOpen: boolean;
  onClose: () => void;
}>();

const copiedField = ref<string | null>(null);

const bankInfo = {
  bank: 'Banco Venezolano de Credito (0104)',
  phone: '04141235400',
  idCard: '04141235400',
};

const copyToClipboard = (text: string, fieldKey: string) => {
  navigator.clipboard.writeText(text);
  copiedField.value = fieldKey;
  setTimeout(() => {
    copiedField.value = null;
  }, 2000);
};
</script>

<template>
  <transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div class="bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 w-full max-w-lg rounded-3xl p-7 sm:p-8 shadow-2xl space-y-7 relative">
        
        <!-- Botón Cerrar -->
        <button
          @click="onClose"
          class="absolute top-6 right-6 p-2.5 rounded-2xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800/80 transition-colors"
          title="Cerrar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Cabecera del Modal -->
        <div class="flex items-center space-x-4">
          <div class="w-14 h-14 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-brandGreen border border-emerald-500/30 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-emerald-500 dark:text-brandGreen" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h3 class="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
              Tu aporte nos ayuda
            </h3>
            <p class="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
              Datos para realizar tu aporte vía Pago Móvil
            </p>
          </div>
        </div>

        <!-- Tarjeta de Datos Bancarios (Legibilidad Máxima) -->
        <div class="space-y-4 bg-zinc-50 dark:bg-zinc-950/70 p-5 sm:p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80">
          
          <!-- Banco -->
          <div class="flex items-center justify-between py-2 border-b border-zinc-200/60 dark:border-zinc-800/60 pb-3">
            <div>
              <p class="text-xs font-bold uppercase tracking-wider text-zinc-400">Banco</p>
              <p class="text-base sm:text-lg font-black text-zinc-900 dark:text-white mt-0.5">{{ bankInfo.bank }}</p>
            </div>
            <button
              @click="copyToClipboard(bankInfo.bank, 'bank')"
              class="px-3.5 py-2 rounded-xl bg-zinc-200/80 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200 transition-all flex items-center gap-1.5"
            >
              <svg v-if="copiedField !== 'bank'" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>{{ copiedField === 'bank' ? '¡Copiado!' : 'Copiar' }}</span>
            </button>
          </div>

          <!-- Teléfono -->
          <div class="flex items-center justify-between py-2 border-b border-zinc-200/60 dark:border-zinc-800/60 pb-3">
            <div>
              <p class="text-xs font-bold uppercase tracking-wider text-zinc-400">Teléfono</p>
              <p class="text-base sm:text-lg font-black text-zinc-900 dark:text-white mt-0.5">{{ bankInfo.phone }}</p>
            </div>
            <button
              @click="copyToClipboard(bankInfo.phone, 'phone')"
              class="px-3.5 py-2 rounded-xl bg-zinc-200/80 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200 transition-all flex items-center gap-1.5"
            >
              <svg v-if="copiedField !== 'phone'" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>{{ copiedField === 'phone' ? '¡Copiado!' : 'Copiar' }}</span>
            </button>
          </div>

          <!-- Cédula / RIF -->
          <div class="flex items-center justify-between pt-2">
            <div>
              <p class="text-xs font-bold uppercase tracking-wider text-zinc-400">Cédula / RIF</p>
              <p class="text-base sm:text-lg font-black text-zinc-900 dark:text-white mt-0.5">{{ bankInfo.idCard }}</p>
            </div>
            <button
              @click="copyToClipboard(bankInfo.idCard, 'idCard')"
              class="px-3.5 py-2 rounded-xl bg-zinc-200/80 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200 transition-all flex items-center gap-1.5"
            >
              <svg v-if="copiedField !== 'idCard'" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>{{ copiedField === 'idCard' ? '¡Copiado!' : 'Copiar' }}</span>
            </button>
          </div>

        </div>

        <p class="text-center text-xs text-zinc-400 font-medium">
          Tu apoyo permite mantener la infraestructura y actualizar las tasas de cambio en tiempo real.
        </p>

      </div>
    </div>
  </transition>
</template>