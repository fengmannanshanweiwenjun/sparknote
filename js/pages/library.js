// 星火笔记 - Library Page
import { useContentStore } from '../stores/content.js';
import { useUiStore } from '../stores/ui.js';
import { PlatformIcon, StatusTag } from '../components/ui-kit.js';
import { icons } from '../components/layout.js';

export const LibraryPage = {
  name: 'LibraryPage',
  components: { PlatformIcon, StatusTag },
  setup() {
    const { ref } = Vue;
    const content = useContentStore();
    const ui = useUiStore();
    const viewMode = ref('grid');
    const platformName = { xiaohongshu: '小红书', weibo: '微博', douyin: '抖音' };
    const platformEmojis = { xiaohongshu: '📕', weibo: '🟠', douyin: '🎵' };

    function editItem(id) {
      const item = content.getItem(id);
      if (item) { content.loadIntoEditor(item); ui.navigate('editor'); }
    }
    function deleteItem(id) {
      if (confirm('确定删除这条内容吗？')) { content.deleteItem(id); ui.toast('已删除', 'info'); }
    }
    function duplicateItem(id) {
      const newId = content.duplicateItem(id);
      if (newId) ui.toast('已复制', 'success');
    }
    function exportAll() {
      const json = content.exportData();
      const blob = new Blob([json], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      a.download = 'sparknote-export.json'; a.click();
      ui.toast('已导出全部内容', 'success');
    }
    function importData() {
      const input = document.createElement('input');
      input.type = 'file'; input.accept = '.json';
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const text = await file.text();
        if (content.importData(text)) ui.toast('导入成功!', 'success');
        else ui.toast('导入失败，请检查文件格式', 'error');
      };
      input.click();
    }

    return { content, ui, viewMode, platformName, platformEmojis, editItem, deleteItem, duplicateItem, exportAll, importData, icons };
  },
  template: `
    <div class="fade-in">
      <!-- Toolbar -->
      <div class="library-toolbar">
        <div class="library-toolbar-left">
          <div class="filter-chips">
            <span class="filter-chip" :class="{ active: content.filterPlatform === 'all' }" @click="content.filterPlatform = 'all'">全部</span>
            <span class="filter-chip" :class="{ active: content.filterPlatform === 'xiaohongshu' }" @click="content.filterPlatform = 'xiaohongshu'">📕 小红书</span>
            <span class="filter-chip" :class="{ active: content.filterPlatform === 'weibo' }" @click="content.filterPlatform = 'weibo'">🟠 微博</span>
            <span class="filter-chip" :class="{ active: content.filterPlatform === 'douyin' }" @click="content.filterPlatform = 'douyin'">🎵 抖音</span>
          </div>
          <div class="filter-chips" style="margin-left:8px">
            <span class="filter-chip" :class="{ active: content.filterStatus === 'all' }" @click="content.filterStatus = 'all'">全部状态</span>
            <span class="filter-chip" :class="{ active: content.filterStatus === 'draft' }" @click="content.filterStatus = 'draft'">草稿</span>
            <span class="filter-chip" :class="{ active: content.filterStatus === 'published' }" @click="content.filterStatus = 'published'">已发布</span>
            <span class="filter-chip" :class="{ active: content.filterStatus === 'scheduled' }" @click="content.filterStatus = 'scheduled'">定时</span>
          </div>
        </div>
        <div class="library-toolbar-right">
          <div class="view-toggle">
            <div class="view-btn" :class="{ active: viewMode === 'grid' }" @click="viewMode='grid'"><span v-html="icons.grid" style="width:16px;height:16px"></span></div>
            <div class="view-btn" :class="{ active: viewMode === 'list' }" @click="viewMode='list'"><span v-html="icons.list" style="width:16px;height:16px"></span></div>
          </div>
          <button class="btn btn-sm btn-ghost" @click="importData"><span v-html="icons.upload" style="width:14px;height:14px"></span> 导入</button>
          <button class="btn btn-sm btn-ghost" @click="exportAll"><span v-html="icons.download" style="width:14px;height:14px"></span> 导出</button>
        </div>
      </div>

      <!-- Empty -->
      <div v-if="content.filteredItems.length === 0" class="empty-state">
        <span v-html="icons.library" style="width:48px;height:48px;opacity:0.3"></span>
        <p>{{ content.searchQuery ? '没有找到匹配的内容' : '还没有内容，开始创作吧！' }}</p>
        <button class="btn btn-primary" @click="content.newDraft(); ui.navigate('editor')">新建笔记</button>
      </div>

      <!-- Grid View -->
      <div v-else-if="viewMode === 'grid'" class="content-grid">
        <div v-for="item in content.filteredItems" :key="item.id" class="content-card" @click="editItem(item.id)">
          <div class="content-card-cover">
            <div class="content-card-cover-placeholder">{{ platformEmojis[item.platform] || '📝' }}</div>
            <div class="content-card-badges">
              <PlatformIcon :platform="item.platform" :size="16" />
              <StatusTag :status="item.status" />
            </div>
          </div>
          <div class="content-card-body">
            <div class="content-card-title">{{ item.title || '无标题笔记' }}</div>
            <div class="content-card-meta">
              <span>{{ platformName[item.platform] }}</span>
              <span>{{ new Date(item.updatedAt).toLocaleDateString('zh-CN') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div v-else class="content-list">
        <div v-for="item in content.filteredItems" :key="item.id" class="content-list-item" @click="editItem(item.id)">
          <div class="content-list-thumb">
            <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:var(--bg-tertiary);font-size:24px">{{ platformEmojis[item.platform] || '📝' }}</div>
          </div>
          <div class="content-list-info">
            <div class="content-list-title">{{ item.title || '无标题笔记' }}</div>
            <div class="content-list-desc">{{ (item.content || '').slice(0, 60) }}...</div>
          </div>
          <StatusTag :status="item.status" />
          <div class="content-list-actions" @click.stop>
            <button class="btn btn-icon btn-ghost sm" @click="duplicateItem(item.id)" title="复制"><span v-html="icons.copy" style="width:14px;height:14px"></span></button>
            <button class="btn btn-icon btn-ghost sm" @click="deleteItem(item.id)" title="删除" style="color:var(--error)"><span v-html="icons.trash" style="width:14px;height:14px"></span></button>
          </div>
        </div>
      </div>
    </div>
  `
};
