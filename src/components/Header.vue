<script setup lang="ts">
import { ref } from 'vue';
import { useThemeStore } from '../stores/themeStore';
import logoSvgRaw from '../assets/logoTasaYa.svg?raw';

defineProps<{
  onOpenDonation: () => void;
}>();

const themeStore = useThemeStore();

const shareUrl = 'https://tasaya-three.vercel.app';
const showShareModal = ref(false);
const copied = ref(false);

const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;

const shareApp = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'TasaYa - Tu conversor confiable',
        text: 'Consulta y convierte en tiempo real entre el dólar oficial BCV y USDT Binance.',
        url: shareUrl,
      });
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Error al compartir:', error);
      }
    }
  } else {
    showShareModal.value = true;
  }
};

const copyShareLink = async () => {
  try {
    await navigator.clipboard.writeText(shareUrl);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Error al copiar el enlace:', err);
  }
};

const closeShareModal = () => {
  showShareModal.value = false;
};
</script>

<template>
  <header class="w-full h-20 flex items-center justify-between px-6 sm:px-10 border-b border-zinc-200 dark:border-zinc-800/80 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md shrink-0 transition-colors">
    
    <!-- Logotipo con color adaptativo según el modo -->
    <div class="flex items-center space-x-3.5">
      <div 
        class="logo-gigante w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center shrink-0 drop-shadow-[0_0_10px_rgba(0,230,118,0.2)]"
        v-html="logoSvgRaw"
      ></div>

      <h1 class="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
        Tasa<span class="text-emerald-600 dark:text-brandGreen">Ya</span>
      </h1>
    </div>

    <!-- Botones de Acción -->
    <div class="flex items-center space-x-2 sm:space-x-3">
      <!-- Compartir -->
      <button
        @click="shareApp"
        class="h-11 px-3.5 sm:px-4 rounded-full bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800/60 dark:hover:bg-zinc-700/60 text-zinc-700 dark:text-zinc-200 hover:text-emerald-600 dark:hover:text-brandGreen transition-all flex items-center gap-2 text-sm font-semibold border border-zinc-200 dark:border-zinc-700/40 shadow-sm cursor-pointer active:scale-95"
        title="Compartir aplicación"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-emerald-600 dark:text-brandGreen" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        <span class="hidden sm:inline">Compartir</span>
      </button>

      <!-- Apoyar -->
      <button
        @click="onOpenDonation"
        class="h-11 px-3.5 sm:px-4 rounded-full bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800/60 dark:hover:bg-zinc-700/60 text-zinc-700 dark:text-zinc-200 hover:text-emerald-600 dark:hover:text-brandGreen transition-all flex items-center gap-2 text-sm font-semibold border border-zinc-200 dark:border-zinc-700/40 shadow-sm cursor-pointer"
        title="Donar / Pago Móvil"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-emerald-600 dark:text-brandGreen" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <span class="hidden sm:inline">Apoyar</span>
      </button>

      <!-- Alternador de Tema -->
      <button
        @click="themeStore.toggleTheme()"
        class="h-11 w-11 rounded-full bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800/60 dark:hover:bg-zinc-700/60 text-zinc-700 dark:text-zinc-200 transition-all flex items-center justify-center border border-zinc-200 dark:border-zinc-700/40 shadow-sm cursor-pointer active:scale-95"
        :title="themeStore.theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
      >
        <svg v-if="themeStore.theme === 'dark'" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      </button>
    </div>

    <!-- Modal de Compartir para Escritorio (Centrado perfecto) -->
    <Teleport to="body">
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="showShareModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          @click.self="closeShareModal"
        >
          <div class="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4 text-center relative">
            
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                Compartir TasaYa
              </h3>
              <button
                @click="closeShareModal"
                type="button"
                class="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p class="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              Escanea el código QR con tu teléfono o copia el enlace directo:
            </p>

            <div class="p-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl inline-block mx-auto shadow-inner">
              <img
                :src="qrCodeUrl"
                alt="QR TasaYa"
                class="w-44 h-44 mx-auto rounded-xl object-contain bg-white p-1"
              />
            </div>

            <div class="flex items-center gap-2 p-2 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60">
              <input
                type="text"
                readonly
                :value="shareUrl"
                class="w-full bg-transparent text-xs font-bold text-zinc-700 dark:text-zinc-300 px-2 focus:outline-none select-all"
              />
              <button
                @click="copyShareLink"
                type="button"
                class="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-all cursor-pointer shrink-0 active:scale-95 shadow-md"
              >
                {{ copied ? '¡Copiado!' : 'Copiar' }}
              </button>
            </div>

          </div>
        </div>
      </transition>
    </Teleport>
  </header>
</template>

<style scoped>
.logo-gigante :deep(rect) {
  fill: none !important;
  stroke: none !important;
}
.logo-gigante :deep(svg) {
  width: 100% !important;
  height: 100% !important;
}
/* Color dinámico para el logo en modo claro */
.logo-gigante :deep(path),
.logo-gigante :deep(polygon),
.logo-gigante :deep(circle),
.logo-gigante :deep(g) {
  fill: #059669 !important;
}
/* Color dinámico para el logo en modo oscuro (.dark) */
:global(.dark) .logo-gigante :deep(path),
:global(.dark) .logo-gigante :deep(polygon),
:global(.dark) .logo-gigante :deep(circle),
:global(.dark) .logo-gigante :deep(g) {
  fill: #00E676 !important;
}
</style>