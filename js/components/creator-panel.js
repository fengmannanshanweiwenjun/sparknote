// 星火笔记 - Creator Panel (Left side of editor)
import { useContentStore } from '../stores/content.js';
import { useSettingsStore } from '../stores/settings.js';
import { useUiStore } from '../stores/ui.js';
import { generateContent, parseAIResponse } from '../services/ai.js';
import { icons } from './layout.js';

export const CreatorPanel = {
  name: 'CreatorPanel',
  setup() {
    const { ref, computed, onMounted } = Vue;
    const content = useContentStore();
    const settings = useSettingsStore();
    const ui = useUiStore();

    // Prompt inputs
    const topic = ref('');
    const style = ref('warm');
    const audience = ref('');
    const keywords = ref('');
    const selectedTemplateId = ref('xhs-recommend');
    const showAdvanced = ref(false);
    const newTagInput = ref('');
    const rawStream = ref('');

    // Templates
    let templates = [];
    onMounted(async () => {
      try {
        const resp = await fetch('./data/prompts.json');
        const data = await resp.json();
        templates = data.templates || [];
      } catch { templates = []; }
    });

    const platformTypes = computed(() => {
      if (content.currentPlatform === 'xiaohongshu') return [{ v: 'image_text', l: '图文笔记' }, { v: 'video', l: '视频笔记' }];
      if (content.currentPlatform === 'weibo') return [{ v: 'long_text', l: '长文微博' }, { v: 'image_text', l: '图片微博' }];
      if (content.currentPlatform === 'douyin') return [{ v: 'video', l: '短视频' }];
      return [{ v: 'image_text', l: '图文' }];
    });

    async function generate() {
      if (!topic.value.trim()) { ui.toast('请输入创作主题', 'warning'); return; }
      if (!settings.isAiConfigured) { ui.toast('请先在设置中配置 AI 接口', 'warning'); return; }

      const tpl = templates.find(t => t.id === selectedTemplateId.value);
      rawStream.value = '';
      ui.isGenerating = true;

      const result = await generateContent(
        { topic: topic.value, style: style.value, audience: audience.value, keywords: keywords.value },
        tpl,
        (chunk) => { rawStream.value = chunk; }
      );

      ui.isGenerating = false;
      if (!result) return;

      const parsed = parseAIResponse(rawStream.value || result);
      if (parsed.titles.length) {
        content.currentTitleSuggestions = parsed.titles;
        content.currentTitle = parsed.titles[0];
        content.selectedTitleIndex = 0;
      }
      if (parsed.content) content.currentContent = parsed.content;
      if (parsed.tags.length) {
        const existing = new Set(content.currentTags);
        parsed.tags.forEach(t => { if (!existing.has(t)) content.currentTags.push(t); });
      }
      if (parsed.coverSuggestion) content.currentCoverDesc = parsed.coverSuggestion;
      ui.toast('AI 内容生成完成!', 'success');
    }

    function selectTitle(idx) {
      content.selectedTitleIndex = idx;
      content.currentTitle = content.currentTitleSuggestions[idx];
    }
    function addTag() {
      const t = newTagInput.value.trim();
      if (t && !content.currentTags.includes(t)) { content.currentTags.push(t); newTagInput.value = ''; }
    }
    function removeTag(idx) { content.currentTags.splice(idx, 1); }
    function addSuggestedTag(tag) {
      if (!content.currentTags.includes(tag)) content.currentTags.push(tag);
    }

    return {
      content, settings, ui, topic, style, audience, keywords,
      selectedTemplateId, showAdvanced, newTagInput, rawStream,
      platformTypes, generate, selectTitle, addTag, removeTag, addSuggestedTag, icons,
      promptImageUrl() { const url = prompt("请输入图片 URL:"); if (url && url.trim()) content.currentImages.push(url.trim()); }
    };
  },
  template: `
    <div class="creator-panel">
      <div class="creator-header">
        <div class="tabs" style="border-bottom:none">
          <div class="tab" :class="{ active: content.currentPlatform === 'xiaohongshu' }" @click="content.currentPlatform='xiaohongshu'">小红书</div>
          <div class="tab" :class="{ active: content.currentPlatform === 'weibo' }" @click="content.currentPlatform='weibo'">微博</div>
          <div class="tab" :class="{ active: content.currentPlatform === 'douyin' }" @click="content.currentPlatform='douyin'">抖音</div>
        </div>
        <div style="display:flex;gap:6px">
          <button class="btn btn-sm btn-secondary" @click="content.saveCurrent('draft'); ui.toast('已保存草稿','success')">
            <span v-html="icons.save" style="width:14px;height:14px"></span> 保存
          </button>
        </div>
      </div>

      <div class="creator-body">
        <!-- Content Type -->
        <div class="type-selector">
          <span v-for="t in platformTypes" :key="t.v" class="type-chip"
            :class="{ active: content.currentType === t.v }" @click="content.currentType = t.v">
            {{ t.l }}
          </span>
        </div>

        <!-- AI Creation Section -->
        <div class="ai-section">
          <div class="ai-section-title"><span v-html="icons.sparkles" style="width:16px;height:16px;color:var(--primary)"></span> AI 创作助手</div>

          <textarea class="prompt-input" v-model="topic" placeholder="描述你想要创作的内容主题...&#10;例如：分享一家隐藏在老城区的独立咖啡店" rows="3"></textarea>

          <div class="ai-options">
            <select class="ai-option-select" v-model="style">
              <option value="warm">温暖治愈</option>
              <option value="professional">专业严谨</option>
              <option value="humorous">幽默搞笑</option>
              <option value="recommend">种草安利</option>
              <option value="tutorial">教程干货</option>
              <option value="review">测评对比</option>
              <option value="literary">文艺清新</option>
              <option value="story">故事叙事</option>
            </select>
            <input class="form-input" v-model="audience" placeholder="目标人群 (可选)" style="padding:8px 12px;font-size:13px" />
          </div>

          <div class="advanced-toggle" :class="{ open: showAdvanced }" @click="showAdvanced = !showAdvanced">
            <span v-html="icons.chevronRight" style="width:14px;height:14px"></span> 高级选项
          </div>
          <div v-if="showAdvanced" style="margin-top:8px">
            <input class="form-input" v-model="keywords" placeholder="关键词 (用逗号分隔)" style="padding:8px 12px;font-size:13px" />
          </div>

          <button class="generate-btn" @click="generate" :disabled="ui.isGenerating">
            <span v-if="ui.isGenerating" class="loading-spinner" style="width:18px;height:18px;border-top-color:#fff"></span>
            <span v-else v-html="icons.sparkles" style="width:18px;height:18px"></span>
            {{ ui.isGenerating ? '正在生成...' : '✨ 生成内容' }}
          </button>
        </div>

        <!-- Streaming Output -->
        <div v-if="ui.isGenerating && rawStream" class="ai-section">
          <div class="streaming-indicator"><span class="streaming-dot"></span><span class="streaming-dot"></span><span class="streaming-dot"></span> AI 正在创作中...</div>
          <div style="margin-top:8px;padding:12px;background:var(--bg-secondary);border-radius:var(--radius-sm);font-size:12px;color:var(--text-secondary);max-height:200px;overflow-y:auto;white-space:pre-wrap;line-height:1.6">{{ rawStream }}</div>
        </div>

        <!-- AI Output -->
        <div v-if="!ui.isGenerating && content.currentTitleSuggestions.length" class="ai-output fade-in">
          <div class="section-divider"></div>
          <div class="ai-section-title">标题方案</div>
          <div class="title-suggestions">
            <div v-for="(t, i) in content.currentTitleSuggestions" :key="i"
              class="title-suggestion" :class="{ selected: content.selectedTitleIndex === i }"
              @click="selectTitle(i)">
              <span class="number">{{ i + 1 }}</span>
              <span>{{ t }}</span>
            </div>
          </div>

          <div class="ai-section-title" style="margin-top:16px">正文内容</div>
          <textarea class="content-editor" v-model="content.currentContent" placeholder="正文内容..." rows="8"></textarea>

          <!-- Tags -->
          <div class="tag-section">
            <div class="tag-section-header">
              <span class="tag-section-title">标签</span>
            </div>
            <div class="tag-list">
              <span v-for="(tag, i) in content.currentTags" :key="i" class="tag-item">
                # {{ tag }}
                <span class="remove" @click="removeTag(i)"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span>
              </span>
            </div>
            <div class="tag-input-wrap">
              <input class="tag-input" v-model="newTagInput" @keyup.enter="addTag" placeholder="添加标签..." />
              <button class="btn btn-sm btn-secondary" @click="addTag">添加</button>
            </div>
          </div>

          <!-- Cover Description -->
          <div class="image-section" v-if="content.currentCoverDesc">
            <div class="ai-section-title" style="font-size:12px">📸 封面建议</div>
            <div style="padding:10px;background:var(--bg-secondary);border-radius:var(--radius-sm);font-size:12px;color:var(--text-secondary);line-height:1.6">{{ content.currentCoverDesc }}</div>
          </div>

          <!-- Manual Content Editor (when no AI output) -->
        </div>

        <!-- Manual Editor (when no AI output yet) -->
        <div v-if="!ui.isGenerating && !content.currentTitleSuggestions.length" class="fade-in">
          <div class="section-divider"></div>
          <div class="ai-section-title">手动编辑</div>
          <div class="form-group">
            <label class="form-label">标题</label>
            <input class="form-input" v-model="content.currentTitle" placeholder="输入标题..." />
          </div>
          <div class="form-group">
            <label class="form-label">正文</label>
            <textarea class="content-editor" v-model="content.currentContent" placeholder="输入正文内容..." rows="10"></textarea>
          </div>
          <div class="tag-section">
            <div class="tag-section-header"><span class="tag-section-title">标签</span></div>
            <div class="tag-list">
              <span v-for="(tag, i) in content.currentTags" :key="i" class="tag-item">
                # {{ tag }} <span class="remove" @click="removeTag(i)"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span>
              </span>
            </div>
            <div class="tag-input-wrap">
              <input class="tag-input" v-model="newTagInput" @keyup.enter="addTag" placeholder="添加标签..." />
              <button class="btn btn-sm btn-secondary" @click="addTag">添加</button>
            </div>
          </div>
          <div class="image-section">
            <div class="tag-section-title" style="margin-bottom:8px">图片</div>
            <div class="image-upload-area" @click="promptImageUrl">
              <span v-html="icons.upload" style="width:32px;height:32px;color:var(--text-tertiary)"></span>
              <p>点击输入图片 URL</p>
            </div>
            <div v-if="content.currentImages.length" class="image-preview-grid">
              <div v-for="(img, i) in content.currentImages" :key="i" class="image-preview-item">
                <img :src="img" alt="图片" />
                <div class="remove-btn" @click="content.currentImages.splice(i, 1)">✕</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
};
