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
  <HomeView />
</template>