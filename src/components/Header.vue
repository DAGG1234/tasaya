<script setup lang="ts">
import { useThemeStore } from '../stores/themeStore';
import logoSvgRaw from '../assets/logoTasaYa.svg?raw';

defineProps<{
  onOpenDonation: () => void;
}>();

const themeStore = useThemeStore();
</script>

<template>
  <header class="w-full h-20 flex items-center justify-between px-6 sm:px-10 border-b border-zinc-300/60 dark:border-zinc-800/80 bg-zinc-200/50 dark:bg-[#121212]/80 backdrop-blur-md shrink-0 transition-colors">
    
    <!-- Logotipo con color adaptativo según el modo -->
    <div class="flex items-center space-x-3.5">
      <div 
        class="logo-gigante w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center shrink-0 drop-shadow-[0_0_10px_rgba(0,230,118,0.3)]"
        v-html="logoSvgRaw"
      ></div>

      <h1 class="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
        Tasa<span class="text-emerald-600 dark:text-brandGreen">Ya</span>
      </h1>
    </div>

    <!-- Botones de Acción -->
    <div class="flex items-center space-x-3">
      <!-- Apoyar -->
      <button
        @click="onOpenDonation"
        class="h-11 px-4 rounded-full bg-white hover:bg-zinc-50 dark:bg-zinc-800/60 dark:hover:bg-zinc-700/60 text-zinc-700 dark:text-zinc-200 hover:text-emerald-600 dark:hover:text-brandGreen transition-all flex items-center gap-2 text-sm font-semibold border border-zinc-300/80 dark:border-zinc-700/40 shadow-sm cursor-pointer"
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
        class="h-11 w-11 rounded-full bg-white hover:bg-zinc-50 dark:bg-zinc-800/60 dark:hover:bg-zinc-700/60 text-zinc-700 dark:text-zinc-200 transition-all flex items-center justify-center border border-zinc-300/80 dark:border-zinc-700/40 shadow-sm cursor-pointer active:scale-95"
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
/* Color dinámico para el logo en modo claro / oscuro */
.logo-gigante :deep(path),
.logo-gigante :deep(polygon),
.logo-gigante :deep(circle),
.logo-gigante :deep(g) {
  fill: #059669 !important;
}
:global(.dark) .logo-gigante :deep(path),
:global(.dark) .logo-gigante :deep(polygon),
:global(.dark) .logo-gigante :deep(circle),
:global(.dark) .logo-gigante :deep(g) {
  fill: #00E676 !important;
}
</style>