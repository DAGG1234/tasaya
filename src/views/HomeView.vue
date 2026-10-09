<script setup lang="ts">
import { ref } from 'vue';
import Header from '../components/Header.vue';
import SwapConverter from '../components/SwapConverter.vue';
import DonationModal from '../components/DonationModal.vue';
import InstallPrompt from '../components/InstallPrompt.vue'; // <-- Importar

const isDonationModalOpen = ref(false);
</script>

<template>
  <div class="h-screen w-screen overflow-hidden bg-zinc-100 dark:bg-[#121212] text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors selection:bg-emerald-500 selection:text-white relative">
    
    <!-- Cabecera -->
    <Header :onOpenDonation="() => isDonationModalOpen = true" />

    <!-- Contenido Principal -->
    <main class="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 space-y-6 overflow-hidden">
      <div class="text-center space-y-1.5">
        <h2 class="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-white">
          Tasa<span class="text-emerald-600 dark:text-brandGreen">Ya</span>
        </h2>
        <p class="text-sm sm:text-base font-medium text-zinc-500 dark:text-zinc-400">
          Tu conversor confiable
        </p>
      </div>

      <SwapConverter />
    </main>

    <!-- Modal de Donaciones -->
    <DonationModal 
      :isOpen="isDonationModalOpen" 
      :onClose="() => isDonationModalOpen = false" 
    />

    <!-- Banner Flotante de Instalación PWA -->
    <InstallPrompt />

  </div>
</template>