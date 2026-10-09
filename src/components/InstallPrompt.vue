<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const deferredPrompt = ref<any>(null);
const isVisible = ref(false);
const isInstalled = ref(false);

const handleBeforeInstallPrompt = (e: Event) => {
  // Previene que el navegador muestre su banner nativo automático
  e.preventDefault();
  // Almacena el evento para dispararlo cuando el usuario haga clic
  deferredPrompt.value = e;
  
  // Muestra el banner flotante después de 2 segundos de cargar la app
  setTimeout(() => {
    if (!isInstalled.value) {
      isVisible.value = true;
    }
  }, 2000);
};

const handleAppInstalled = () => {
  isInstalled.value = true;
  isVisible.value = false;
  deferredPrompt.value = null;
};

onMounted(() => {
  // Verifica si la app ya corre en modo standalone (instalada)
  if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
    isInstalled.value = true;
    return;
  }

  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  window.addEventListener('appinstalled', handleAppInstalled);
});

onUnmounted(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  window.removeEventListener('appinstalled', handleAppInstalled);
});

const installApp = async () => {
  if (!deferredPrompt.value) return;

  // Muestra el prompt nativo de instalación
  deferredPrompt.value.prompt();

  // Espera la elección del usuario
  const { outcome } = await deferredPrompt.value.userChoice;
  
  if (outcome === 'accepted') {
    console.log('Usuario aceptó instalar la PWA');
  } else {
    console.log('Usuario canceló la instalación');
  }

  // El prompt solo se puede usar una vez
  deferredPrompt.value = null;
  isVisible.value = false;
};

const dismissBanner = () => {
  isVisible.value = false;
};
</script>

<template>
  <transition
    enter-active-class="transition duration-300 ease-out transform"
    enter-from-class="translate-y-8 opacity-0 scale-95"
    enter-to-class="translate-y-0 opacity-100 scale-100"
    leave-active-class="transition duration-200 ease-in transform"
    leave-from-class="translate-y-0 opacity-100 scale-100"
    leave-to-class="translate-y-8 opacity-0 scale-95"
  >
    <div 
      v-if="isVisible && !isInstalled"
      class="fixed bottom-5 right-5 left-5 sm:left-auto sm:max-w-md z-50 bg-zinc-900/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-3xl p-5 shadow-2xl shadow-black/80 flex items-center gap-4 text-white"
    >
      <!-- Logotipo -->
      <div class="w-12 h-12 rounded-2xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center shrink-0 overflow-hidden p-2">
        <img src="/logoTasaYa.png" alt="TasaYa Logo" class="w-full h-full object-contain" />
      </div>

      <!-- Textos descriptivos -->
      <div class="flex-1 min-w-0">
        <h4 class="text-base font-black tracking-tight text-white flex items-center gap-1.5">
          Instala TasaYa
        </h4>
        <p class="text-xs font-medium text-zinc-400 truncate mt-0.5">
          Accede más rápido y úsala sin conexión.
        </p>
      </div>

      <!-- Botones de Acción -->
      <div class="flex items-center gap-2 shrink-0">
        <button
          @click="installApp"
          class="px-4 py-2.5 rounded-xl bg-[#00E676] hover:bg-[#00c864] text-zinc-950 font-extrabold text-xs tracking-wide transition-all shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
        >
          Instalar App
        </button>

        <button
          @click="dismissBanner"
          class="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Cerrar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </transition>
</template>