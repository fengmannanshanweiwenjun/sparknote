// 星火笔记 - Editor Page
import { CreatorPanel } from '../components/creator-panel.js';
import { PreviewPanel } from '../components/preview-panel.js';

export const EditorPage = {
  name: 'EditorPage',
  components: { CreatorPanel, PreviewPanel },
  setup() {
    const { ref, onMounted, onBeforeUnmount } = Vue;
    const splitRatio = ref(45);
    const isDragging = ref(false);
    const container = ref(null);

    function onMouseDown(e) {
      isDragging.value = true;
      e.preventDefault();
    }
    function onMouseMove(e) {
      if (!isDragging.value || !container.value) return;
      const rect = container.value.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      splitRatio.value = Math.max(30, Math.min(70, pct));
    }
    function onMouseUp() { isDragging.value = false; }

    onMounted(() => {
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
    onBeforeUnmount(() => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    });

    return { splitRatio, isDragging, container };
  },
  template: `
    <div class="editor-page" ref="container" style="height:100%">
      <div style="display:flex;height:100%;overflow:hidden">
        <div :style="{ width: splitRatio + '%', minWidth: '300px' }" style="height:100%;overflow:hidden">
          <CreatorPanel style="height:100%" />
        </div>
        <div class="resize-handle" :class="{ active: isDragging }" @mousedown="onMouseDown"></div>
        <div style="flex:1;height:100%;overflow:hidden">
          <PreviewPanel style="height:100%" />
        </div>
      </div>
    </div>
  `
};
