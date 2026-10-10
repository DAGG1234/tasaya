import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<'dark' | 'light'>('dark');

  const isDark = computed(() => theme.value === 'dark');

  const applyTheme = (newTheme: 'dark' | 'light') => {
    theme.value = newTheme;
    const root = document.documentElement;
    
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    localStorage.setItem('theme', newTheme);
  };

  const toggleTheme = () => {
    const nextTheme = theme.value === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  };

  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      applyTheme(savedTheme);
    } else {
      // Si no hay preferencia guardada, usamos el esquema del sistema o por defecto 'dark'
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(prefersDark ? 'dark' : 'dark');
    }
  };

  return {
    theme,
    isDark,
    toggleTheme,
    initTheme,
  };
});