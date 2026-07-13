// 星火笔记 - Main App
import { createApp, ref, watch, onMounted } from 'vue';
import { createPinia } from 'pinia';
import { useUiStore } from './stores/ui.js';
import { useContentStore } from './stores/content.js';
import { useSettingsStore } from './stores/settings.js';
import { Sidebar, Topbar } from './components/layout.js';
import { ToastContainer } from './components/ui-kit.js';
import { DashboardPage } from './pages/dashboard.js';
import { EditorPage } from './pages/editor.js';
import { LibraryPage } from './pages/library.js';
import { CalendarPage } from './pages/calendar.js';
import { SettingsPage } from './pages/settings.js';
import { loadContentFromGithub } from './services/github.js';

const App = {
  name: 'App',
  components: { Sidebar, Topbar, ToastContainer, DashboardPage, EditorPage, LibraryPage, CalendarPage, SettingsPage },
  setup() {
    const ui = useUiStore();
    const content = useContentStore();
    const settings = useSettingsStore();

    // Load from GitHub on startup
    onMounted(async () => {
      if (settings.isGithubConfigured) {
        try {
          const data = await loadContentFromGithub();
          if (data && data.items && data.items.length > content.items.length) {
            if (confirm('发现 GitHub 上有更新的数据，是否同步？')) {
              content.items = data.items;
              content.persist();
            }
          }
        } catch {}
      }
    });

    // Keyboard shortcuts
    onMounted(() => {
      document.addEventListener('keydown', (e) => {
        const isMod = e.ctrlKey || e.metaKey;
        if (isMod && e.key === 's') { e.preventDefault(); content.saveCurrent('draft'); ui.toast('已保存', 'success'); }
        if (isMod && e.shiftKey && e.key === 'P') { e.preventDefault(); /* publish handled by component */ }
      });
    });

    const pageMap = {
      dashboard: 'DashboardPage',
      editor: 'EditorPage',
      library: 'LibraryPage',
      calendar: 'CalendarPage',
      settings: 'SettingsPage'
    };

    return { ui, pageMap };
  },
  template: `
    <div class="app-layout">
      <Sidebar />
      <div class="app-main">
        <Topbar v-if="ui.currentRoute !== 'editor'" />
        <div class="app-content" :class="{ 'no-padding': ui.currentRoute === 'editor' }">
          <component :is="pageMap[ui.currentRoute] || 'DashboardPage'" />
        </div>
      </div>
      <ToastContainer />
    </div>
  `
};

// Create and mount app
const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.mount('#app');
