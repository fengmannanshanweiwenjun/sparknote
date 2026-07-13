// 星火笔记 - Dashboard Page
import { useContentStore } from '../stores/content.js';
import { useUiStore } from '../stores/ui.js';
import { icons } from '../components/layout.js';
import { PlatformIcon, StatusTag } from '../components/ui-kit.js';

export const DashboardPage = {
  name: 'DashboardPage',
  components: { PlatformIcon, StatusTag },
  setup() {
    const content = useContentStore();
    const ui = useUiStore();
    const recentItems = Vue.computed(() => content.items.slice(0, 6));
    const platformName = { xiaohongshu: '小红书', weibo: '微博', douyin: '抖音' };
    function goToEditor(id) {
      if (id) { const item = content.getItem(id); if (item) content.loadIntoEditor(item); }
      else content.newDraft();
      ui.navigate('editor');
    }
    return { content, ui, recentItems, platformName, goToEditor, icons };
  },
  template: `
    <div class="fade-in">
      <!-- Stats -->
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-icon red"><span v-html="icons.edit" style="width:22px;height:22px"></span></div>
          <div class="stat-info">
            <div class="stat-label">总内容数</div>
            <div class="stat-value">{{ content.stats.total }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green"><span v-html="icons.send" style="width:22px;height:22px"></span></div>
          <div class="stat-info">
            <div class="stat-label">已发布</div>
            <div class="stat-value">{{ content.stats.published }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon blue"><span v-html="icons.clock" style="width:22px;height:22px"></span></div>
          <div class="stat-info">
            <div class="stat-label">草稿</div>
            <div class="stat-value">{{ content.stats.drafts }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon yellow"><span v-html="icons.barChart" style="width:22px;height:22px"></span></div>
          <div class="stat-info">
            <div class="stat-label">本周创作</div>
            <div class="stat-value">{{ content.stats.thisWeek }}</div>
            <div class="stat-change up">本周新增</div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div style="margin-bottom:24px">
        <h3 style="font-size:14px;font-weight:600;color:var(--text-primary);margin-bottom:12px">快速操作</h3>
        <div class="quick-actions">
          <div class="quick-action" @click="goToEditor()">
            <div class="quick-action-icon"><span v-html="icons.plus" style="width:22px;height:22px"></span></div>
            <span class="quick-action-text">新建笔记</span>
          </div>
          <div class="quick-action" @click="ui.navigate('library')">
            <div class="quick-action-icon" style="background:var(--success-bg);color:var(--success)"><span v-html="icons.library" style="width:22px;height:22px"></span></div>
            <span class="quick-action-text">内容库</span>
          </div>
          <div class="quick-action" @click="ui.navigate('calendar')">
            <div class="quick-action-icon" style="background:var(--info-bg);color:var(--info)"><span v-html="icons.calendar" style="width:22px;height:22px"></span></div>
            <span class="quick-action-text">内容日历</span>
          </div>
          <div class="quick-action" @click="ui.navigate('settings')">
            <div class="quick-action-icon" style="background:var(--warning-bg);color:var(--warning)"><span v-html="icons.settings" style="width:22px;height:22px"></span></div>
            <span class="quick-action-text">设置</span>
          </div>
        </div>
      </div>

      <!-- Recent Content -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">最近内容</span>
          <button class="btn btn-sm btn-ghost" @click="ui.navigate('library')">查看全部 →</button>
        </div>
        <div class="card-body" style="padding:8px">
          <div v-if="recentItems.length === 0" class="empty-state" style="padding:40px">
            <span v-html="icons.edit" style="width:40px;height:40px;opacity:0.3"></span>
            <p>还没有内容，开始创作吧！</p>
            <button class="btn btn-primary" @click="goToEditor()">新建笔记</button>
          </div>
          <div v-else class="recent-list">
            <div v-for="item in recentItems" :key="item.id" class="recent-item" @click="goToEditor(item.id)">
              <div class="recent-item-icon" :style="{ background: item.platform === 'xiaohongshu' ? 'rgba(255,36,66,0.1)' : item.platform === 'weibo' ? 'rgba(255,130,0,0.1)' : 'rgba(254,44,85,0.1)' }">
                <PlatformIcon :platform="item.platform" :size="18" />
              </div>
              <div class="recent-item-info">
                <div class="recent-item-title">{{ item.title || '无标题笔记' }}</div>
                <div class="recent-item-meta">
                  <span>{{ platformName[item.platform] || item.platform }}</span>
                  <span>{{ new Date(item.updatedAt).toLocaleDateString('zh-CN') }}</span>
                </div>
              </div>
              <StatusTag :status="item.status" />
            </div>
          </div>
        </div>
      </div>
    </div>
  `
};
