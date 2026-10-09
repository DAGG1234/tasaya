<script setup lang="ts">
import { onMounted } from 'vue';
import { useThemeStore } from './stores/themeStore';
import HomeView from './views/HomeView.vue';

const themeStore = useThemeStore();

onMounted(() => {
  themeStore.initTheme();
});
</script>

<template>
  <div class="min-h-screen bg-zinc-100 dark:bg-[#121212] text-zinc-900 dark:text-white transition-colors duration-300">
    <HomeView />
  </div>
</template>