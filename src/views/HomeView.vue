<script setup lang="ts">
import { ref } from 'vue';
import Header from '../components/Header.vue';
import SwapConverter from '../components/SwapConverter.vue';
import DonationModal from '../components/DonationModal.vue';
import InstallPrompt from '../components/InstallPrompt.vue';

const isDonationModalOpen = ref(false);
</script>

<template>
  <div class="min-h-screen w-full bg-zinc-100 dark:bg-[#121212] text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors selection:bg-emerald-500 selection:text-white relative overflow-x-hidden">
    
    <!-- Cabecera Oficial -->
    <Header :onOpenDonation="() => isDonationModalOpen = true" />

    <!-- Contenido Principal Centrado -->
    <main class="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 my-auto">
      <div class="w-full max-w-md mx-auto space-y-6">
        
        <!-- Hero Section Limpio y Dinámico -->
        <div class="text-center">
          <h1 class="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-1">
            Tasa<span class="text-emerald-600 dark:text-[#00E676]">Ya</span>
          </h1>
          <p class="text-zinc-500 dark:text-zinc-400 text-sm sm:text-base font-medium">
            Tu conversor confiable
          </p>
        </div>

        <!-- Tarjeta del Conversor -->
        <SwapConverter />

      </div>
    </main>

    <!-- Modal de Donaciones -->
    <DonationModal 
      :isOpen="isDonationModalOpen" 
      :onClose="() => isDonationModalOpen = false" 
    />

    <!-- Componente Flotante para Instalar PWA -->
    <InstallPrompt />

  </div>
</template>