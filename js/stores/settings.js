// 星火笔记 - Settings Store
import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';

const STORAGE_KEY = 'sparknote-settings';

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveSettings(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

export const useSettingsStore = defineStore('settings', () => {
  const saved = loadSettings();

  // AI Provider
  const aiProvider = ref(saved?.aiProvider || 'openai');
  const aiBaseUrl = ref(saved?.aiBaseUrl || '');
  const aiApiKey = ref(saved?.aiApiKey || '');
  const aiModel = ref(saved?.aiModel || '');
  const aiQwenApiKey = ref(saved?.aiQwenApiKey || '');
  const aiQwenModel = ref(saved?.aiQwenModel || 'qwen-turbo');
  const aiErnieApiKey = ref(saved?.aiErnieApiKey || '');
  const aiErnieSecretKey = ref(saved?.aiErnieSecretKey || '');
  const aiErnieModel = ref(saved?.aiErnieModel || 'ernie-speed-128k');

  // GitHub
  const githubToken = ref(saved?.githubToken || '');
  const githubRepo = ref(saved?.githubRepo || '');
  const githubBranch = ref(saved?.githubBranch || 'main');
  const githubDataPath = ref(saved?.githubDataPath || 'data');

  // Platform APIs
  const xhsApiEndpoint = ref(saved?.xhsApiEndpoint || '');
  const xhsApiKey = ref(saved?.xhsApiKey || '');
  const xhsPublishMode = ref(saved?.xhsPublishMode || 'assisted');
  const weiboApiEndpoint = ref(saved?.weiboApiEndpoint || '');
  const weiboApiKey = ref(saved?.weiboApiKey || '');
  const weiboPublishMode = ref(saved?.weiboPublishMode || 'assisted');
  const douyinApiEndpoint = ref(saved?.douyinApiEndpoint || '');
  const douyinApiKey = ref(saved?.douyinApiKey || '');
  const douyinPublishMode = ref(saved?.douyinPublishMode || 'assisted');

  // UI Preferences
  const theme = ref(saved?.theme || 'light');
  const defaultPlatform = ref(saved?.defaultPlatform || 'xiaohongshu');
  const editorFontSize = ref(saved?.editorFontSize || 14);

  const isAiConfigured = computed(() => {
    if (aiProvider.value === 'openai') return !!(aiBaseUrl.value && aiApiKey.value);
    if (aiProvider.value === 'qwen') return !!aiQwenApiKey.value;
    if (aiProvider.value === 'ernie') return !!(aiErnieApiKey.value && aiErnieSecretKey.value);
    return !!(aiBaseUrl.value && aiApiKey.value);
  });

  const isGithubConfigured = computed(() => !!(githubToken.value && githubRepo.value));

  // Auto-save
  watch([
    aiProvider, aiBaseUrl, aiApiKey, aiModel,
    aiQwenApiKey, aiQwenModel, aiErnieApiKey, aiErnieSecretKey, aiErnieModel,
    githubToken, githubRepo, githubBranch, githubDataPath,
    xhsApiEndpoint, xhsApiKey, xhsPublishMode,
    weiboApiEndpoint, weiboApiKey, weiboPublishMode,
    douyinApiEndpoint, douyinApiKey, douyinPublishMode,
    theme, defaultPlatform, editorFontSize
  ], () => {
    saveSettings({
      aiProvider: aiProvider.value, aiBaseUrl: aiBaseUrl.value,
      aiApiKey: aiApiKey.value, aiModel: aiModel.value,
      aiQwenApiKey: aiQwenApiKey.value, aiQwenModel: aiQwenModel.value,
      aiErnieApiKey: aiErnieApiKey.value, aiErnieSecretKey: aiErnieSecretKey.value,
      aiErnieModel: aiErnieModel.value,
      githubToken: githubToken.value, githubRepo: githubRepo.value,
      githubBranch: githubBranch.value, githubDataPath: githubDataPath.value,
      xhsApiEndpoint: xhsApiEndpoint.value, xhsApiKey: xhsApiKey.value,
      xhsPublishMode: xhsPublishMode.value,
      weiboApiEndpoint: weiboApiEndpoint.value, weiboApiKey: weiboApiKey.value,
      weiboPublishMode: weiboPublishMode.value,
      douyinApiEndpoint: douyinApiEndpoint.value, douyinApiKey: douyinApiKey.value,
      douyinPublishMode: douyinPublishMode.value,
      theme: theme.value, defaultPlatform: defaultPlatform.value,
      editorFontSize: editorFontSize.value
    });
    applyTheme();
  }, { deep: true });

  function applyTheme() {
    const t = theme.value === 'auto'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme.value;
    document.documentElement.setAttribute('data-theme', t);
  }

  function getAiConfig() {
    if (aiProvider.value === 'qwen') return { provider: 'qwen', apiKey: aiQwenApiKey.value, model: aiQwenModel.value };
    if (aiProvider.value === 'ernie') return { provider: 'ernie', apiKey: aiErnieApiKey.value, secretKey: aiErnieSecretKey.value, model: aiErnieModel.value };
    return { provider: 'openai', baseUrl: aiBaseUrl.value, apiKey: aiApiKey.value, model: aiModel.value };
  }

  function getGithubConfig() {
    return { token: githubToken.value, repo: githubRepo.value, branch: githubBranch.value, dataPath: githubDataPath.value };
  }

  function getPublishMode(platform) {
    if (platform === 'xiaohongshu') return xhsPublishMode.value;
    if (platform === 'weibo') return weiboPublishMode.value;
    if (platform === 'douyin') return douyinPublishMode.value;
    return 'assisted';
  }

  function getPlatformConfig(platform) {
    if (platform === 'xiaohongshu') return { endpoint: xhsApiEndpoint.value, apiKey: xhsApiKey.value, mode: xhsPublishMode.value };
    if (platform === 'weibo') return { endpoint: weiboApiEndpoint.value, apiKey: weiboApiKey.value, mode: weiboPublishMode.value };
    if (platform === 'douyin') return { endpoint: douyinApiEndpoint.value, apiKey: douyinApiKey.value, mode: douyinPublishMode.value };
    return {};
  }

  applyTheme();

  return {
    aiProvider, aiBaseUrl, aiApiKey, aiModel,
    aiQwenApiKey, aiQwenModel, aiErnieApiKey, aiErnieSecretKey, aiErnieModel,
    githubToken, githubRepo, githubBranch, githubDataPath,
    xhsApiEndpoint, xhsApiKey, xhsPublishMode,
    weiboApiEndpoint, weiboApiKey, weiboPublishMode,
    douyinApiEndpoint, douyinApiKey, douyinPublishMode,
    theme, defaultPlatform, editorFontSize,
    isAiConfigured, isGithubConfigured,
    getAiConfig, getGithubConfig, getPublishMode, getPlatformConfig, applyTheme
  };
});
