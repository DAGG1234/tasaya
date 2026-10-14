<script setup lang="ts">
import { ref, onMounted } from 'vue';

const deferredPrompt = ref<any>(null);
const showInstallBanner = ref(false);
const showIOSPrompt = ref(false);
const isIOS = ref(false);

onMounted(() => {
  // 1. Detección de iOS (iPhone / iPad / iPod)
  const userAgent = navigator.userAgent;
  const isIosDevice = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;

  isIOS.value = isIosDevice;

  if (isIosDevice && !isStandalone) {
    // Mostrar banner específico para iOS si no está instalada como PWA
    const iosDismissed = sessionStorage.getItem('tasaya_ios_prompt_dismissed');
    if (!iosDismissed) {
      showIOSPrompt.value = true;
    }
  }

  // 2. Evento nativo para Android / Desktop (beforeinstallprompt)
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt.value = e;
    showInstallBanner.value = true;
  });

  window.addEventListener('appinstalled', () => {
    showInstallBanner.value = false;
    deferredPrompt.value = null;
  });
});

const installPWA = async () => {
  if (!deferredPrompt.value) return;
  deferredPrompt.value.prompt();
  const { outcome } = await deferredPrompt.value.userChoice;
  if (outcome === 'accepted') {
    showInstallBanner.value = false;
  }
  deferredPrompt.value = null;
};

const dismissIOSPrompt = () => {
  showIOSPrompt.value = false;
  sessionStorage.setItem('tasaya_ios_prompt_dismissed', 'true');
};

const dismissBanner = () => {
  showInstallBanner.value = false;
};
</script>

<template>
  <div>
    <!-- Banner de Instalación Nativo (Android / Desktop) -->
    <transition
      enter-active-class="transform transition duration-300 ease-out"
      enter-from-class="translate-y-10 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transform transition duration-200 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-10 opacity-0"
    >
      <div
        v-if="showInstallBanner"
        class="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 shadow-2xl flex items-center justify-between gap-3"
      >
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-[#00E676] flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>
          <div>
            <h4 class="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white">Instalar TasaYa</h4>
            <p class="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">Accede rápido y sin conexión.</p>
          </div>
        </div>

        <div class="flex items-center gap-1.5 shrink-0">
          <button
            @click="installPWA"
            type="button"
            class="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md cursor-pointer active:scale-95"
          >
            Instalar
          </button>
          <button
            @click="dismissBanner"
            type="button"
            class="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </transition>

    <!-- Modal / Banner Guía para iOS (iPhone / iPad / Safari) -->
    <transition
      enter-active-class="transform transition duration-300 ease-out"
      enter-from-class="translate-y-10 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transform transition duration-200 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-10 opacity-0"
    >
      <div
        v-if="showIOSPrompt"
        class="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-[#00E676] flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 18v-5m0 0V9m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 class="text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white">
              Instalar TasaYa en tu iPhone
            </h4>
          </div>

          <button
            @click="dismissIOSPrompt"
            type="button"
            class="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p class="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
          Abre esta web en <strong>Safari</strong> y sigue estos pasos para agregarla a tu pantalla de inicio:
        </p>

        <div class="space-y-2 pt-1">
          <!-- Paso 1: Icono oficial de Compartir de iOS (Caja con Flecha hacia arriba) -->
          <div class="flex items-center gap-3 p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800">
            <span class="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-[#00E676] flex items-center justify-center font-black text-xs shrink-0">1</span>
            <p class="text-xs text-zinc-700 dark:text-zinc-300 font-medium flex items-center gap-1.5 flex-wrap">
              <span>Toca el botón <strong>Compartir</strong></span>
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 inline text-emerald-600 dark:text-[#00E676] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span>en la barra inferior.</span>
            </p>
          </div>

          <!-- Paso 2 -->
          <div class="flex items-center gap-3 p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800">
            <span class="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-[#00E676] flex items-center justify-center font-black text-xs shrink-0">2</span>
            <p class="text-xs text-zinc-700 dark:text-zinc-300 font-medium">
              Selecciona <strong>"Agregar al Inicio"</strong> en el menú.
            </p>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>