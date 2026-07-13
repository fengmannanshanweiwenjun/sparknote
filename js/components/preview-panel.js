// 星火笔记 - Preview Panel (Right side of editor)
import { useContentStore } from '../stores/content.js';
import { useSettingsStore } from '../stores/settings.js';
import { useUiStore } from '../stores/ui.js';
import { XiaohongshuPreview, WeiboPreview, DouyinPreview } from './platform-cards.js';
import { Modal } from './ui-kit.js';
import { icons } from './layout.js';

export const PreviewPanel = {
  name: 'PreviewPanel',
  components: { XiaohongshuPreview, WeiboPreview, DouyinPreview, Modal },
  setup() {
    const { ref, computed } = Vue;
    const content = useContentStore();
    const settings = useSettingsStore();
    const ui = useUiStore();
    const showPublishModal = ref(false);
    const publishMode = ref('assisted');

    function formatForPublish() {
      const parts = [];
      if (content.currentTitle) parts.push(content.currentTitle);
      if (content.currentContent) parts.push('', content.currentContent);
      if (content.currentTags.length) parts.push('', content.currentTags.map(t => '#' + t).join(' '));
      return parts.join('\n');
    }

    async function copyContent() {
      const text = formatForPublish();
      try {
        await navigator.clipboard.writeText(text);
        ui.toast('内容已复制到剪贴板!', 'success');
      } catch {
        // Fallback
        const ta = document.createElement('textarea');
        ta.value = text; document.body.appendChild(ta); ta.select();
        document.execCommand('copy'); document.body.removeChild(ta);
        ui.toast('内容已复制!', 'success');
      }
    }

    function publish() {
      const mode = settings.getPublishMode(content.currentPlatform);
      if (mode === 'api') {
        ui.toast('API 发送功能请配置平台接口', 'info');
      }
      showPublishModal.value = true;
      publishMode.value = mode;
    }

    function openPlatform() {
      const urls = {
        xiaohongshu: 'https://creator.xiaohongshu.com/publish/publish',
        weibo: 'https://weibo.com/',
        douyin: 'https://creator.douyin.com/creator-micro/content/upload'
      };
      window.open(urls[content.currentPlatform] || '#', '_blank');
    }

    function saveDraft() {
      content.saveCurrent('draft');
      ui.toast('草稿已保存', 'success');
    }

    function exportMarkdown() {
      const text = `# ${content.currentTitle || '无标题'}\n\n${content.currentContent || ''}\n\n${content.currentTags.map(t => '#' + t).join(' ')}`;
      const blob = new Blob([text], { type: 'text/markdown' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      a.download = `${content.currentTitle || '笔记'}.md`; a.click();
      ui.toast('已导出 Markdown 文件', 'success');
    }

    return { content, settings, ui, showPublishModal, publishMode, formatForPublish, copyContent, publish, openPlatform, saveDraft, exportMarkdown, icons };
  },
  template: `
    <div class="preview-panel">
      <div class="preview-header">
        <div class="preview-header-left">
          <span style="font-size:13px;font-weight:600;color:var(--text-primary)">预览</span>
          <div class="device-toggle">
            <div class="device-btn" :class="{ active: ui.previewDevice === 'phone' }" @click="ui.previewDevice='phone'">
              <span v-html="icons.smartphone" style="width:14px;height:14px"></span>
            </div>
            <div class="device-btn" :class="{ active: ui.previewDevice === 'tablet' }" @click="ui.previewDevice='tablet'">
              <span v-html="icons.tablet" style="width:14px;height:14px"></span>
            </div>
          </div>
        </div>
        <div class="preview-header-right">
          <button class="btn btn-sm btn-secondary" @click="copyContent">
            <span v-html="icons.copy" style="width:14px;height:14px"></span> 复制
          </button>
          <button class="btn btn-sm btn-primary" @click="publish">
            <span v-html="icons.send" style="width:14px;height:14px"></span> 发布
          </button>
        </div>
      </div>

      <div class="preview-body">
        <div class="phone-frame" :class="{ tablet: ui.previewDevice === 'tablet' }">
          <div v-if="ui.previewDevice === 'phone'" class="phone-notch"></div>
          <XiaohongshuPreview v-if="content.currentPlatform === 'xiaohongshu'"
            :title="content.currentTitle" :content="content.currentContent"
            :tags="content.currentTags" :images="content.currentImages" />
          <WeiboPreview v-else-if="content.currentPlatform === 'weibo'"
            :title="content.currentTitle" :content="content.currentContent"
            :tags="content.currentTags" :images="content.currentImages" />
          <DouyinPreview v-else-if="content.currentPlatform === 'douyin'"
            :title="content.currentTitle" :content="content.currentContent"
            :tags="content.currentTags" :images="content.currentImages" />
        </div>
      </div>

      <div class="preview-footer">
        <div class="preview-footer-left">
          <button class="btn btn-sm btn-ghost" @click="saveDraft">
            <span v-html="icons.save" style="width:14px;height:14px"></span> 保存草稿
          </button>
          <button class="btn btn-sm btn-ghost" @click="exportMarkdown">
            <span v-html="icons.download" style="width:14px;height:14px"></span> 导出
          </button>
        </div>
        <div class="preview-footer-right">
          <span style="font-size:11px;color:var(--text-tertiary)">
            {{ content.currentPlatform === 'xiaohongshu' ? '小红书' : content.currentPlatform === 'weibo' ? '微博' : '抖音' }}
            · {{ content.currentType === 'image_text' ? '图文' : '视频' }}
          </span>
        </div>
      </div>

      <!-- Publish Modal -->
      <Modal :show="showPublishModal" title="发布内容" @close="showPublishModal = false">
        <div class="publish-content-preview">
          <pre>{{ formatForPublish() }}</pre>
        </div>
        <div class="publish-options">
          <div class="publish-option" @click="copyContent(); showPublishModal = false">
            <div class="publish-option-icon"><span v-html="icons.copy" style="width:20px;height:20px;color:var(--text-secondary)"></span></div>
            <div class="publish-option-info">
              <div class="publish-option-title">复制内容 + 打开平台</div>
              <div class="publish-option-desc">复制格式化内容到剪贴板，手动粘贴发布</div>
            </div>
          </div>
          <div class="publish-option" @click="openPlatform(); showPublishModal = false">
            <div class="publish-option-icon"><span v-html="icons.globe" style="width:20px;height:20px;color:var(--text-secondary)"></span></div>
            <div class="publish-option-info">
              <div class="publish-option-title">打开平台发布页</div>
              <div class="publish-option-desc">在新标签页打开对应平台的创作中心</div>
            </div>
          </div>
          <div class="publish-option" @click="copyContent(); openPlatform(); content.saveCurrent('published'); showPublishModal = false; ui.toast('已复制并标记为已发布','success')">
            <div class="publish-option-icon"><span v-html="icons.send" style="width:20px;height:20px;color:var(--primary)"></span></div>
            <div class="publish-option-info">
              <div class="publish-option-title">一键发布</div>
              <div class="publish-option-desc">复制内容 → 打开平台 → 标记已发布</div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  `
};
