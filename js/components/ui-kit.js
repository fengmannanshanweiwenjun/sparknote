// 星火笔记 - UI Kit Components
import { useUiStore } from '../stores/ui.js';
import { icons } from './layout.js';

// Toast Container
export const ToastContainer = {
  name: 'ToastContainer',
  setup() {
    const ui = useUiStore();
    const iconMap = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
    return { ui, iconMap };
  },
  template: `
    <div class="toast-container">
      <div v-for="t in ui.toasts" :key="t.id" class="toast" :class="t.type">
        <span style="font-weight:600">{{ iconMap[t.type] || 'ℹ' }}</span>
        <span>{{ t.message }}</span>
      </div>
    </div>
  `
};

// Modal
export const Modal = {
  name: 'Modal',
  props: { show: Boolean, title: String, width: { type: String, default: '560px' } },
  emits: ['close'],
  setup(props, { emit }) {
    function onMaskClick(e) { if (e.target === e.currentTarget) emit('close'); }
    return { onMaskClick, icons };
  },
  template: `
    <teleport to="body">
      <div v-if="show" class="modal-mask" @click="onMaskClick">
        <div class="modal" :style="{ maxWidth: width }">
          <div class="modal-header">
            <h3 class="modal-title">{{ title }}</h3>
            <button class="modal-close" @click="$emit('close')">
              <span v-html="icons.x" style="width:18px;height:18px"></span>
            </button>
          </div>
          <div class="modal-body"><slot /></div>
          <div class="modal-footer" v-if="$slots.footer"><slot name="footer" /></div>
        </div>
      </div>
    </teleport>
  `
};

// Platform Icon
export const PlatformIcon = {
  name: 'PlatformIcon',
  props: { platform: String, size: { type: Number, default: 20 } },
  template: `
    <span :style="{ display: 'inline-flex', width: size+'px', height: size+'px', alignItems: 'center', justifyContent: 'center' }">
      <svg v-if="platform === 'xiaohongshu'" :width="size" :height="size" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
      </svg>
      <svg v-else-if="platform === 'weibo'" :width="size" :height="size" viewBox="0 0 24 24" fill="currentColor">
        <path d="M10.4 18.2c-3.2.4-6-1.2-6.2-3.6-.2-2.3 2.2-4.5 5.4-4.9 3.2-.4 6 1.2 6.2 3.5.2 2.4-2.2 4.6-5.4 5zm7.6-9.5c-.2-.7-.8-1.1-1.4-.9-.6.2-1 .8-.8 1.5.5 1.8-.2 3.4-1.8 4.5-1.5 1.1-3.4 1.2-5 .3-.3-.2-.7-.1-.9.2-.2.3-.1.7.2.9 2.1 1.2 4.6 1.1 6.6-.3 1.9-1.4 2.9-3.5 3.1-5.2v-.2-.8zM20 6.5c-.9-1.7-2.8-2.5-4.6-2.1-.4.1-.8-.2-.9-.6-.1-.4.2-.8.6-.9 2.4-.5 4.9.6 6.1 2.8.2.4.1.8-.3 1-.3.1-.7 0-.9-.2z"/>
      </svg>
      <svg v-else-if="platform === 'douyin'" :width="size" :height="size" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9a6.27 6.27 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.3a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.37a8.2 8.2 0 0 0 4.8 1.56V7.48a4.83 4.83 0 0 1-1.04-.79z"/>
      </svg>
    </span>
  `
};

// Status Tag
export const StatusTag = {
  props: { status: String },
  computed: {
    label() { return { draft: '草稿', published: '已发布', scheduled: '定时' }[this.status] || this.status; },
    cls() { return 'tag status-' + this.status; }
  },
  template: `<span :class="cls">{{ label }}</span>`
};
