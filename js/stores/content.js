// 星火笔记 - Content Store
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

const STORAGE_KEY = 'sparknote-content';

function loadContent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { items: [] };
  } catch { return { items: [] }; }
}

function saveContent(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

function uuid() {
  return 'xxxx-xxxx-xxxx'.replace(/x/g, () => ((Math.random()*16)|0).toString(16));
}

export const useContentStore = defineStore('content', () => {
  const data = loadContent();
  const items = ref(data.items || []);

  // Current editing state
  const currentId = ref(null);
  const currentPlatform = ref('xiaohongshu');
  const currentType = ref('image_text');
  const currentTitle = ref('');
  const currentContent = ref('');
  const currentTags = ref([]);
  const currentImages = ref([]);
  const currentCoverDesc = ref('');
  const currentTitleSuggestions = ref([]);
  const selectedTitleIndex = ref(0);

  // Filters
  const filterPlatform = ref('all');
  const filterStatus = ref('all');
  const searchQuery = ref('');

  function persist() { saveContent({ items: items.value }); }

  const filteredItems = computed(() => {
    let result = [...items.value];
    if (filterPlatform.value !== 'all') result = result.filter(i => i.platform === filterPlatform.value);
    if (filterStatus.value !== 'all') result = result.filter(i => i.status === filterStatus.value);
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase();
      result = result.filter(i => i.title.toLowerCase().includes(q) || i.content.toLowerCase().includes(q));
    }
    return result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  });

  const stats = computed(() => {
    const all = items.value;
    const published = all.filter(i => i.status === 'published');
    const drafts = all.filter(i => i.status === 'draft');
    const scheduled = all.filter(i => i.status === 'scheduled');
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    const thisWeek = all.filter(i => new Date(i.createdAt) >= weekAgo);
    const totalLikes = published.reduce((s, i) => s + (i.analytics?.likes || 0), 0);
    const totalComments = published.reduce((s, i) => s + (i.analytics?.comments || 0), 0);
    return { total: all.length, published: published.length, drafts: drafts.length, scheduled: scheduled.length, thisWeek: thisWeek.length, totalLikes, totalComments };
  });

  function newDraft(platform = 'xiaohongshu', type = 'image_text') {
    const id = uuid();
    const now = new Date().toISOString();
    const item = { id, platform, type, title: '', content: '', tags: [], images: [], coverDescription: '', status: 'draft', createdAt: now, updatedAt: now, publishedAt: null, scheduledAt: null, analytics: { likes: 0, comments: 0, shares: 0, saves: 0 }, aiMetadata: {} };
    items.value.unshift(item);
    persist();
    loadIntoEditor(item);
    return id;
  }

  function loadIntoEditor(item) {
    currentId.value = item.id;
    currentPlatform.value = item.platform;
    currentType.value = item.type;
    currentTitle.value = item.title;
    currentContent.value = item.content;
    currentTags.value = [...(item.tags || [])];
    currentImages.value = [...(item.images || [])];
    currentCoverDesc.value = item.coverDescription || '';
  }

  function saveCurrent(status) {
    const idx = items.value.findIndex(i => i.id === currentId.value);
    const now = new Date().toISOString();
    const data = {
      id: currentId.value || uuid(),
      platform: currentPlatform.value,
      type: currentType.value,
      title: currentTitle.value,
      content: currentContent.value,
      tags: [...currentTags.value],
      images: [...currentImages.value],
      coverDescription: currentCoverDesc.value,
      status: status || 'draft',
      updatedAt: now,
    };
    if (idx >= 0) {
      items.value[idx] = { ...items.value[idx], ...data };
    } else {
      data.createdAt = now;
      data.publishedAt = null;
      data.scheduledAt = null;
      data.analytics = { likes: 0, comments: 0, shares: 0, saves: 0 };
      data.aiMetadata = {};
      items.value.unshift(data);
      currentId.value = data.id;
    }
    persist();
    return data.id;
  }

  function deleteItem(id) {
    items.value = items.value.filter(i => i.id !== id);
    if (currentId.value === id) {
      currentId.value = null; currentTitle.value = ''; currentContent.value = '';
      currentTags.value = []; currentImages.value = [];
    }
    persist();
  }

  function duplicateItem(id) {
    const src = items.value.find(i => i.id === id);
    if (!src) return;
    const now = new Date().toISOString();
    const dup = { ...JSON.parse(JSON.stringify(src)), id: uuid(), status: 'draft', createdAt: now, updatedAt: now, publishedAt: null, scheduledAt: null };
    dup.title = dup.title + ' (副本)';
    items.value.unshift(dup);
    persist();
    return dup.id;
  }

  function getItem(id) { return items.value.find(i => i.id === id); }

  function updateAnalytics(id, data) {
    const idx = items.value.findIndex(i => i.id === id);
    if (idx >= 0) { items.value[idx].analytics = { ...items.value[idx].analytics, ...data }; persist(); }
  }

  function exportData() { return JSON.stringify({ items: items.value }, null, 2); }
  function importData(json) {
    try {
      const d = JSON.parse(json);
      if (d.items && Array.isArray(d.items)) { items.value = d.items; persist(); return true; }
    } catch {}
    return false;
  }

  return {
    items, currentId, currentPlatform, currentType, currentTitle, currentContent,
    currentTags, currentImages, currentCoverDesc, currentTitleSuggestions, selectedTitleIndex,
    filterPlatform, filterStatus, searchQuery,
    filteredItems, stats,
    newDraft, loadIntoEditor, saveCurrent, deleteItem, duplicateItem, getItem,
    updateAnalytics, exportData, importData, persist
  };
});
