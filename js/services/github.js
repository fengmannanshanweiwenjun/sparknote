// 星火笔记 - GitHub Storage Service
import { useSettingsStore } from '../stores/settings.js';
import { useUiStore } from '../stores/ui.js';

const API = 'https://api.github.com';

async function ghFetch(path, options = {}) {
  const settings = useSettingsStore();
  const config = settings.getGithubConfig();
  const headers = { 'Accept': 'application/vnd.github.v3+json', ...options.headers };
  if (config.token) headers['Authorization'] = `token ${config.token}`;
  const resp = await fetch(`${API}${path}`, { ...options, headers });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.message || `GitHub API ${resp.status}`);
  }
  return resp;
}

async function getFile(path) {
  const settings = useSettingsStore();
  const config = settings.getGithubConfig();
  try {
    const resp = await ghFetch(`/repos/${config.repo}/contents/${path}?ref=${config.branch}`);
    const data = await resp.json();
    const content = decodeURIComponent(escape(atob(data.content)));
    return { content, sha: data.sha };
  } catch (e) {
    if (e.message.includes('404')) return null;
    throw e;
  }
}

async function putFile(path, content, sha, message) {
  const settings = useSettingsStore();
  const config = settings.getGithubConfig();
  const body = { message: message || `Update ${path}`, content: btoa(unescape(encodeURIComponent(content))), branch: config.branch };
  if (sha) body.sha = sha;
  const resp = await ghFetch(`/repos/${config.repo}/contents/${path}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  });
  return resp.json();
}

async function deleteFile(path, sha, message) {
  const settings = useSettingsStore();
  const config = settings.getGithubConfig();
  await ghFetch(`/repos/${config.repo}/contents/${path}`, {
    method: 'DELETE', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: message || `Delete ${path}`, sha, branch: config.branch })
  });
}

export async function saveContentToGithub(items) {
  const settings = useSettingsStore();
  const ui = useUiStore();
  if (!settings.isGithubConfigured) return false;
  const config = settings.getGithubConfig();
  try {
    const dataPath = `${config.dataPath}/content.json`;
    const existing = await getFile(dataPath);
    const content = JSON.stringify({ items, updatedAt: new Date().toISOString() }, null, 2);
    await putFile(dataPath, content, existing?.sha, 'Update content via SparkNote');
    ui.toast('已同步到 GitHub', 'success');
    return true;
  } catch (e) {
    ui.toast('GitHub 同步失败: ' + e.message, 'error');
    return false;
  }
}

export async function loadContentFromGithub() {
  const settings = useSettingsStore();
  if (!settings.isGithubConfigured) return null;
  const config = settings.getGithubConfig();
  try {
    const dataPath = `${config.dataPath}/content.json`;
    const existing = await getFile(dataPath);
    if (existing) return JSON.parse(existing.content);
    return null;
  } catch { return null; }
}

export async function saveSettingsToGithub(settingsData) {
  const settings = useSettingsStore();
  if (!settings.isGithubConfigured) return false;
  const config = settings.getGithubConfig();
  try {
    const path = `${config.dataPath}/settings.json`;
    const existing = await getFile(path);
    // Don't save sensitive keys to GitHub
    const safeData = { ...settingsData, aiApiKey: '***', aiQwenApiKey: '***', aiErnieApiKey: '***', aiErnieSecretKey: '***', githubToken: '***', xhsApiKey: '***', weiboApiKey: '***', douyinApiKey: '***' };
    await putFile(path, JSON.stringify(safeData, null, 2), existing?.sha, 'Update settings via SparkNote');
    return true;
  } catch { return false; }
}

export async function testGithubConnection() {
  const settings = useSettingsStore();
  const ui = useUiStore();
  if (!settings.isGithubConfigured) {
    ui.toast('请先配置 GitHub Token 和仓库', 'warning');
    return false;
  }
  try {
    const config = settings.getGithubConfig();
    await ghFetch(`/repos/${config.repo}`);
    ui.toast('GitHub 连接成功!', 'success');
    return true;
  } catch (e) {
    ui.toast('GitHub 连接失败: ' + e.message, 'error');
    return false;
  }
}
