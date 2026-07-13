// 星火笔记 - Platform Preview Components
import { icons } from './layout.js';

// 小红书 Preview
export const XiaohongshuPreview = {
  name: 'XiaohongshuPreview',
  props: {
    title: String, content: String, tags: Array, images: Array, authorName: { type: String, default: '星火笔记' }
  },
  setup(props) {
    const { ref, computed, watch } = Vue;
    const currentSlide = ref(0);
    const hasImages = computed(() => props.images && props.images.length > 0);
    const displayImages = computed(() => props.images || []);
    const displayTitle = computed(() => (props.title || '笔记标题').slice(0, 20));
    const formatContent = computed(() => {
      if (!props.content) return '笔记正文内容将显示在这里...';
      return props.content
        .replace(/#([^\s#]+)/g, '<span class="hashtag">#$1</span>')
        .replace(/@([^\s@]+)/g, '<span class="mention">@$1</span>');
    });
    const sampleComments = [
      { name: '小红薯', avatar: '🍠', text: '太棒了，收藏！' },
      { name: '种草达人', avatar: '🌿', text: '求链接！在哪里买的？' }
    ];
    function nextSlide() { if (currentSlide.value < displayImages.value.length - 1) currentSlide.value++; }
    function prevSlide() { if (currentSlide.value > 0) currentSlide.value--; }
    return { currentSlide, hasImages, displayImages, displayTitle, formatContent, sampleComments, nextSlide, prevSlide, icons };
  },
  template: `
    <div class="xhs-preview">
      <!-- Image Carousel -->
      <div class="xhs-carousel">
        <div v-if="hasImages" class="xhs-carousel-inner" :style="{ transform: 'translateX(-' + (currentSlide * 100) + '%)' }">
          <div v-for="(img, i) in displayImages" :key="i" class="xhs-carousel-item">
            <img :src="img" alt="图片" @error="$event.target.style.display='none'" />
          </div>
        </div>
        <div v-else class="xhs-carousel-placeholder">📷</div>
        <div v-if="hasImages && displayImages.length > 1" class="xhs-carousel-dots">
          <div v-for="(_, i) in displayImages" :key="i" class="xhs-carousel-dot" :class="{ active: i === currentSlide }"></div>
        </div>
      </div>

      <!-- Content -->
      <div class="xhs-content">
        <div class="xhs-author">
          <div class="xhs-avatar">{{ (authorName || '星')[0] }}</div>
          <div class="xhs-author-info">
            <div class="xhs-author-name">{{ authorName }}</div>
            <div class="xhs-author-desc">热爱生活 ✨</div>
          </div>
          <button class="xhs-follow-btn">+ 关注</button>
        </div>
        <h3 class="xhs-title">{{ displayTitle || '笔记标题' }}</h3>
        <div class="xhs-text" v-html="formatContent"></div>
        <div v-if="tags && tags.length" class="xhs-tags">
          <span v-for="tag in tags" :key="tag" class="xhs-tag"># {{ tag }}</span>
        </div>
        <div class="xhs-actions">
          <span class="xhs-action liked"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> 128</span>
          <span class="xhs-action"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> 32</span>
          <span class="xhs-action"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> 256</span>
          <span class="xhs-action"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg></span>
        </div>
      </div>

      <!-- Comments -->
      <div class="xhs-comments">
        <div class="xhs-comment-count">共 2 条评论</div>
        <div v-for="c in sampleComments" :key="c.name" class="xhs-comment">
          <div class="xhs-comment-avatar">{{ c.avatar }}</div>
          <div class="xhs-comment-body">
            <div class="xhs-comment-name">{{ c.name }}</div>
            <div class="xhs-comment-text">{{ c.text }}</div>
          </div>
        </div>
      </div>
    </div>
  `
};

// 微博 Preview
export const WeiboPreview = {
  name: 'WeiboPreview',
  props: { title: String, content: String, tags: Array, images: Array, authorName: { type: String, default: '星火笔记' } },
  setup(props) {
    const { computed } = Vue;
    const formatContent = computed(() => {
      const text = (props.title ? props.title + '\n\n' : '') + (props.content || '微博正文内容将显示在这里...');
      return text
        .replace(/#([^#]+)#/g, '<span class="topic">#$1#</span>')
        .replace(/@([^\s@]+)/g, '<span class="mention">@$1</span>');
    });
    const imageGridClass = computed(() => {
      const len = props.images?.length || 0;
      if (len <= 1) return 'g1';
      if (len <= 2) return 'g2';
      if (len <= 3) return 'g3';
      if (len <= 4) return 'g4';
      if (len <= 6) return 'g6';
      return 'g9';
    });
    return { formatContent, imageGridClass };
  },
  template: `
    <div class="weibo-preview">
      <div class="weibo-header">
        <div class="weibo-avatar">{{ (authorName || '星')[0] }}</div>
        <div class="weibo-info">
          <div class="weibo-name">{{ authorName }} <svg class="weibo-verified" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg></div>
          <div class="weibo-time">刚刚 · 来自 星火笔记</div>
        </div>
      </div>
      <div class="weibo-text" v-html="formatContent"></div>
      <div v-if="images && images.length" class="weibo-images" :class="imageGridClass">
        <div v-for="(img, i) in images" :key="i" class="weibo-image-item">
          <img :src="img" alt="图片" @error="$event.target.style.display='none'" />
        </div>
      </div>
      <div class="weibo-actions">
        <span class="weibo-action"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>转发</svg> 12</span>
        <span class="weibo-action"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> 28</span>
        <span class="weibo-action"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> 156</span>
      </div>
    </div>
  `
};

// 抖音 Preview
export const DouyinPreview = {
  name: 'DouyinPreview',
  props: { title: String, content: String, tags: Array, images: Array, authorName: { type: String, default: '星火笔记' } },
  setup(props) {
    const { computed } = Vue;
    const formatDesc = computed(() => {
      const text = (props.title ? props.title + '\n' : '') + (props.content || '视频描述将显示在这里...');
      return text
        .replace(/#([^\s#]+)/g, '<span class="hashtag">#$1</span>')
        .replace(/@([^\s@]+)/g, '<span class="mention">@$1</span>');
    });
    const hasCover = computed(() => props.images && props.images.length > 0);
    return { formatDesc, hasCover, icons };
  },
  template: `
    <div class="douyin-preview">
      <div class="douyin-cover">
        <img v-if="hasCover" :src="images[0]" alt="封面" style="width:100%;height:100%;object-fit:cover" />
        <div v-else class="douyin-cover-placeholder">🎬</div>
        <div class="douyin-overlay">
          <div class="douyin-author">
            <div class="douyin-avatar">{{ (authorName || '星')[0] }}</div>
            <div class="douyin-name">{{ authorName }}</div>
          </div>
          <div class="douyin-desc" v-html="formatDesc"></div>
          <div class="douyin-music">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
            原创音乐 - {{ authorName }}
          </div>
        </div>
        <div class="douyin-side-actions">
          <div class="douyin-side-action">
            <div class="douyin-side-action-icon liked">
              <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </div>
            <span class="douyin-side-action-count">1.2w</span>
          </div>
          <div class="douyin-side-action">
            <div class="douyin-side-action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <span class="douyin-side-action-count">368</span>
          </div>
          <div class="douyin-side-action">
            <div class="douyin-side-action-icon">
              <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <span class="douyin-side-action-count">2.8w</span>
          </div>
          <div class="douyin-side-action">
            <div class="douyin-side-action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            </div>
            <span class="douyin-side-action-count">分享</span>
          </div>
        </div>
      </div>
    </div>
  `
};
