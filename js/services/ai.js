// 星火笔记 - AI Service (Multi-format adapter)
import { useSettingsStore } from '../stores/settings.js';
import { useUiStore } from '../stores/ui.js';

export async function generateContent(prompt, template, onChunk) {
  const settings = useSettingsStore();
  const ui = useUiStore();
  const config = settings.getAiConfig();

  if (!settings.isAiConfigured) {
    ui.toast('请先在设置中配置 AI 接口', 'warning');
    return null;
  }

  ui.isGenerating = true;
  try {
    let result;
    if (config.provider === 'qwen') {
      result = await callQwen(config, prompt, template, onChunk);
    } else if (config.provider === 'ernie') {
      result = await callErnie(config, prompt, template, onChunk);
    } else {
      result = await callOpenAICompatible(config, prompt, template, onChunk);
    }
    return result;
  } catch (err) {
    ui.toast('AI 生成失败: ' + err.message, 'error');
    return null;
  } finally {
    ui.isGenerating = false;
  }
}

async function callOpenAICompatible(config, prompt, template, onChunk) {
  const baseUrl = config.baseUrl.replace(/\/+$/, '');
  const systemPrompt = template?.systemPrompt || '你是一位专业的小红书内容创作者。';
  const userPrompt = template?.userPrompt
    ? template.userPrompt.replace('{{topic}}', prompt.topic || '')
      .replace('{{style}}', prompt.style || '')
      .replace('{{audience}}', prompt.audience || '')
      .replace('{{keywords}}', prompt.keywords || '')
    : prompt.topic;

  const body = {
    model: config.model || 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.8,
    max_tokens: 2000,
    stream: !!onChunk
  };

  const resp = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.apiKey}` },
    body: JSON.stringify(body)
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`API 错误 (${resp.status}): ${err}`);
  }

  if (onChunk && resp.body) {
    return await readStream(resp.body, onChunk);
  }
  const data = await resp.json();
  return data.choices?.[0]?.message?.content || '';
}

async function callQwen(config, prompt, template, onChunk) {
  const systemPrompt = template?.systemPrompt || '你是一位专业的小红书内容创作者。';
  const userPrompt = template?.userPrompt
    ? template.userPrompt.replace('{{topic}}', prompt.topic || '')
      .replace('{{style}}', prompt.style || '')
      .replace('{{audience}}', prompt.audience || '')
      .replace('{{keywords}}', prompt.keywords || '')
    : prompt.topic;

  const body = {
    model: config.model || 'qwen-turbo',
    input: { messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]},
    parameters: { temperature: 0.8, max_tokens: 2000, incremental_output: !!onChunk }
  };

  const resp = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.apiKey}`, 'X-DashScope-SSE': onChunk ? 'enable' : 'disable' },
    body: JSON.stringify(body)
  });

  if (!resp.ok) throw new Error(`Qwen API 错误 (${resp.status})`);

  if (onChunk && resp.body) {
    return await readSSEStream(resp.body, onChunk, 'qwen');
  }
  const data = await resp.json();
  return data.output?.text || data.output?.choices?.[0]?.message?.content || '';
}

async function callErnie(config, prompt, template, onChunk) {
  // Step 1: Get access token
  const tokenResp = await fetch(`https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${config.apiKey}&client_secret=${config.secretKey}`, { method: 'POST' });
  if (!tokenResp.ok) throw new Error('获取百度 access_token 失败');
  const tokenData = await tokenResp.json();
  const accessToken = tokenData.access_token;

  const systemPrompt = template?.systemPrompt || '你是一位专业的小红书内容创作者。';
  const userPrompt = template?.userPrompt
    ? template.userPrompt.replace('{{topic}}', prompt.topic || '')
      .replace('{{style}}', prompt.style || '')
      .replace('{{audience}}', prompt.audience || '')
      .replace('{{keywords}}', prompt.keywords || '')
    : prompt.topic;

  const model = config.model || 'ernie-speed-128k';
  const body = {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.8,
    max_output_tokens: 2000
  };

  const resp = await fetch(`https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/${model}?access_token=${accessToken}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!resp.ok) throw new Error(`ERNIE API 错误 (${resp.status})`);
  const data = await resp.json();
  return data.result || '';
}

async function readStream(body, onChunk) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let full = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
    for (const line of lines) {
      const data = line.slice(6).trim();
      if (data === '[DONE]') continue;
      try {
        const parsed = JSON.parse(data);
        const text = parsed.choices?.[0]?.delta?.content || '';
        if (text) { full += text; onChunk(full); }
      } catch {}
    }
  }
  return full;
}

async function readSSEStream(body, onChunk, provider) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let full = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n');
    for (const line of lines) {
      if (line.startsWith('data:')) {
        try {
          const data = JSON.parse(line.slice(5));
          const text = data.output?.text || '';
          if (text) { full += text; onChunk(full); }
        } catch {}
      }
    }
  }
  return full;
}

export function parseAIResponse(raw) {
  // Try to extract JSON from the response
  try {
    // Find JSON block in the response
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        titles: parsed.titles || parsed.title_suggestions || [],
        content: parsed.content || parsed.body || '',
        tags: parsed.tags || [],
        coverSuggestion: parsed.coverSuggestion || parsed.cover_suggestion || ''
      };
    }
  } catch {}
  // Fallback: return raw as content
  return { titles: [], content: raw, tags: [], coverSuggestion: '' };
}
