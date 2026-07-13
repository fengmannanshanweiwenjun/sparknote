// 星火笔记 - Settings Page
import { useSettingsStore } from '../stores/settings.js';
import { useUiStore } from '../stores/ui.js';
import { testGithubConnection } from '../services/github.js';
import { Modal } from '../components/ui-kit.js';
import { icons } from '../components/layout.js';

export const SettingsPage = {
  name: 'SettingsPage',
  components: { Modal },
  setup() {
    const { ref } = Vue;
    const settings = useSettingsStore();
    const ui = useUiStore();
    const showTestResult = ref(false);
    const testResultText = ref('');
    const testResultOk = ref(false);

    async function testAI() {
      if (!settings.isAiConfigured) { ui.toast('请先填写 AI 配置', 'warning'); return; }
      try {
        const config = settings.getAiConfig();
        let url, headers, body;
        if (config.provider === 'qwen') {
          url = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
          headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.apiKey}` };
          body = JSON.stringify({ model: config.model || 'qwen-turbo', input: { messages: [{ role: 'user', content: '你好' }] }, parameters: { max_tokens: 10 } });
        } else if (config.provider === 'ernie') {
          const tokenResp = await fetch(`https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${config.apiKey}&client_secret=${config.secretKey}`, { method: 'POST' });
          if (!tokenResp.ok) throw new Error('获取 Token 失败');
          testResultOk.value = true; testResultText.value = '百度认证成功!'; showTestResult.value = true;
          setTimeout(() => showTestResult.value = false, 3000);
          return;
        } else {
          url = `${config.baseUrl.replace(/\/+$/, '')}/chat/completions`;
          headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.apiKey}` };
          body = JSON.stringify({ model: config.model || 'gpt-3.5-turbo', messages: [{ role: 'user', content: 'hi' }], max_tokens: 5 });
        }
        const resp = await fetch(url, { method: 'POST', headers, body });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        testResultOk.value = true; testResultText.value = 'AI 接口连接成功!'; showTestResult.value = true;
        ui.toast('AI 接口测试成功!', 'success');
      } catch (e) {
        testResultOk.value = false; testResultText.value = '连接失败: ' + e.message; showTestResult.value = true;
        ui.toast('AI 接口测试失败: ' + e.message, 'error');
      }
      setTimeout(() => showTestResult.value = false, 4000);
    }

    async function testGithub() {
      await testGithubConnection();
    }

    function testPlatform(platform) {
      ui.toast(`${platform} API 测试功能需要配置接口地址`, 'info');
    }

    return { settings, ui, showTestResult, testResultText, testResultOk, testAI, testGithub, testPlatform, icons };
  },
  template: `
    <div class="fade-in" style="max-width:800px">
      <!-- AI Config -->
      <div class="settings-section">
        <h3 class="settings-section-title"><span v-html="icons.sparkles" style="width:20px;height:20px;color:var(--primary)"></span> AI 接口配置</h3>
        <div class="settings-card">
          <div class="form-label" style="margin-bottom:10px">选择 AI 提供商</div>
          <div class="provider-grid">
            <div class="provider-card" :class="{ active: settings.aiProvider === 'openai' }" @click="settings.aiProvider = 'openai'">
              <div style="font-size:24px">🤖</div>
              <div class="provider-card-name">OpenAI 兼容</div>
              <div class="provider-card-desc">通用 / DeepSeek / Kimi</div>
            </div>
            <div class="provider-card" :class="{ active: settings.aiProvider === 'qwen' }" @click="settings.aiProvider = 'qwen'">
              <div style="font-size:24px">☁️</div>
              <div class="provider-card-name">通义千问</div>
              <div class="provider-card-desc">阿里云 DashScope</div>
            </div>
            <div class="provider-card" :class="{ active: settings.aiProvider === 'ernie' }" @click="settings.aiProvider = 'ernie'">
              <div style="font-size:24px">🧠</div>
              <div class="provider-card-name">文心一言</div>
              <div class="provider-card-desc">百度智能云</div>
            </div>
          </div>

          <!-- OpenAI Compatible -->
          <div v-if="settings.aiProvider === 'openai'" class="settings-row" style="margin-top:16px">
            <div class="form-group">
              <label class="form-label">API Base URL</label>
              <input class="form-input" v-model="settings.aiBaseUrl" placeholder="https://api.openai.com/v1" />
              <div class="form-hint">兼容 OpenAI 格式的接口地址</div>
            </div>
            <div class="form-group">
              <label class="form-label">Model</label>
              <input class="form-input" v-model="settings.aiModel" placeholder="gpt-4o-mini" />
            </div>
            <div class="form-group" style="grid-column: 1/-1">
              <label class="form-label">API Key</label>
              <input class="form-input" type="password" v-model="settings.aiApiKey" placeholder="sk-..." />
            </div>
          </div>

          <!-- Qwen -->
          <div v-if="settings.aiProvider === 'qwen'" class="settings-row" style="margin-top:16px">
            <div class="form-group">
              <label class="form-label">API Key</label>
              <input class="form-input" type="password" v-model="settings.aiQwenApiKey" placeholder="sk-..." />
            </div>
            <div class="form-group">
              <label class="form-label">Model</label>
              <select class="form-select" v-model="settings.aiQwenModel">
                <option value="qwen-turbo">qwen-turbo</option>
                <option value="qwen-plus">qwen-plus</option>
                <option value="qwen-max">qwen-max</option>
                <option value="qwen-long">qwen-long</option>
              </select>
            </div>
          </div>

          <!-- ERNIE -->
          <div v-if="settings.aiProvider === 'ernie'" class="settings-row" style="margin-top:16px">
            <div class="form-group">
              <label class="form-label">API Key (Client ID)</label>
              <input class="form-input" type="password" v-model="settings.aiErnieApiKey" placeholder="百度 API Key" />
            </div>
            <div class="form-group">
              <label class="form-label">Secret Key</label>
              <input class="form-input" type="password" v-model="settings.aiErnieSecretKey" placeholder="百度 Secret Key" />
            </div>
            <div class="form-group">
              <label class="form-label">Model</label>
              <select class="form-select" v-model="settings.aiErnieModel">
                <option value="ernie-speed-128k">ERNIE Speed 128K</option>
                <option value="ernie-4.0-8k">ERNIE 4.0</option>
                <option value="ernie-3.5-8k">ERNIE 3.5</option>
              </select>
            </div>
          </div>

          <div class="settings-actions">
            <button class="btn btn-primary" @click="testAI">测试连接</button>
          </div>
          <div v-if="showTestResult" style="margin-top:8px;padding:8px 12px;border-radius:var(--radius-sm);font-size:12px" :style="{ background: testResultOk ? 'var(--success-bg)' : 'var(--error-bg)', color: testResultOk ? 'var(--success)' : 'var(--error)' }">{{ testResultText }}</div>
        </div>
      </div>

      <!-- GitHub Config -->
      <div class="settings-section">
        <h3 class="settings-section-title"><span v-html="icons.globe" style="width:20px;height:20px;color:var(--primary)"></span> GitHub 存储配置</h3>
        <div class="settings-card">
          <div class="settings-row">
            <div class="form-group">
              <label class="form-label">Personal Access Token</label>
              <input class="form-input" type="password" v-model="settings.githubToken" placeholder="ghp_..." />
              <div class="form-hint">需要 repo 权限</div>
            </div>
            <div class="form-group">
              <label class="form-label">仓库 (owner/repo)</label>
              <input class="form-input" v-model="settings.githubRepo" placeholder="yourname/sparknote-data" />
            </div>
            <div class="form-group">
              <label class="form-label">分支</label>
              <input class="form-input" v-model="settings.githubBranch" placeholder="main" />
            </div>
            <div class="form-group">
              <label class="form-label">数据目录</label>
              <input class="form-input" v-model="settings.githubDataPath" placeholder="data" />
            </div>
          </div>
          <div class="settings-actions">
            <button class="btn btn-primary" @click="testGithub">测试连接</button>
          </div>
        </div>
      </div>

      <!-- Platform APIs -->
      <div class="settings-section">
        <h3 class="settings-section-title"><span v-html="icons.send" style="width:20px;height:20px;color:var(--primary)"></span> 平台发布配置</h3>
        <div v-for="p in [{ key: 'xhs', name: '小红书', emoji: '📕', ep: 'xhsApiEndpoint', ak: 'xhsApiKey', pm: 'xhsPublishMode' }, { key: 'weibo', name: '微博', emoji: '🟠', ep: 'weiboApiEndpoint', ak: 'weiboApiKey', pm: 'weiboPublishMode' }, { key: 'douyin', name: '抖音', emoji: '🎵', ep: 'douyinApiEndpoint', ak: 'douyinApiKey', pm: 'douyinPublishMode' }]" :key="p.key" class="settings-card" style="margin-bottom:12px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px">
            <span style="font-size:20px">{{ p.emoji }}</span>
            <span style="font-size:14px;font-weight:600">{{ p.name }}</span>
          </div>
          <div class="settings-row">
            <div class="form-group">
              <label class="form-label">API Endpoint</label>
              <input class="form-input" v-model="settings[p.ep]" placeholder="可选 - 第三方发布接口地址" />
            </div>
            <div class="form-group">
              <label class="form-label">API Key</label>
              <input class="form-input" type="password" v-model="settings[p.ak]" placeholder="可选" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">发布模式</label>
            <select class="form-select" v-model="settings[p.pm]" style="max-width:300px">
              <option value="assisted">辅助模式 (复制+跳转)</option>
              <option value="api">API 模式 (自动发布)</option>
              <option value="manual">手动模式 (仅导出)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- UI Preferences -->
      <div class="settings-section">
        <h3 class="settings-section-title"><span v-html="icons.settings" style="width:20px;height:20px;color:var(--primary)"></span> 界面偏好</h3>
        <div class="settings-card">
          <div class="settings-row">
            <div class="form-group">
              <label class="form-label">主题</label>
              <select class="form-select" v-model="settings.theme">
                <option value="light">亮色</option>
                <option value="dark">暗色</option>
                <option value="auto">跟随系统</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">默认平台</label>
              <select class="form-select" v-model="settings.defaultPlatform">
                <option value="xiaohongshu">小红书</option>
                <option value="weibo">微博</option>
                <option value="douyin">抖音</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
};
