// 星火笔记 - UI Store
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUiStore = defineStore('ui', () => {
  const sidebarExpanded = ref(false);
  const currentRoute = ref('dashboard');
  const toasts = ref([]);
  const modals = ref({});
  const isGenerating = ref(false);
  const previewDevice = ref('phone');

  function toggleSidebar() { sidebarExpanded.value = !sidebarExpanded.value; }
  function navigate(route) { currentRoute.value = route; }

  function toast(message, type = 'info', duration = 3000) {
    const id = Date.now() + Math.random();
    toasts.value.push({ id, message, type });
    setTimeout(() => { toasts.value = toasts.value.filter(t => t.id !== id); }, duration);
  }

  function openModal(name) { modals.value[name] = true; }
  function closeModal(name) { modals.value[name] = false; }
  function isModalOpen(name) { return !!modals.value[name]; }

  return { sidebarExpanded, currentRoute, toasts, modals, isGenerating, previewDevice, toggleSidebar, navigate, toast, openModal, closeModal, isModalOpen };
});
