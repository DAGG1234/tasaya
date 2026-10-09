import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { useThemeStore } from '../src/stores/themeStore.ts';
import './style.css'; // Tus estilos de Tailwind CSS

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);

// Inicializar y sincronizar el tema globalmente antes de montar la app
const themeStore = useThemeStore(pinia);
themeStore.initTheme();

app.mount('#app');