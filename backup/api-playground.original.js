let lastRaw = null;
let isStreaming = false;

const providers = {
  openai:    { url: 'https://api.openai.com',          model: 'gpt-4o' },
  anthropic: { url: 'https://api.anthropic.com',       model: 'claude-3-5-sonnet-20241022' },
  groq:      { url: 'https://api.groq.com/openai',     model: 'llama-3.3-70b-versatile' },
  mistral:   { url: 'https://api.mistral.ai',          model: 'mistral-large-latest' },
  ollama:    { url: 'http://localhost:11434/v1',        model: 'llama3.2' },
};

function setProvider(key) {
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  event.target.classList.add('active');
  const p = providers[key];
  document.getElementById('baseUrl').value = p.url;
  document.getElementById('model').value = p.model;
  if (key === 'ollama') document.getElementById('apiKey').value = 'ollama';
  updateEndpointLabel();
}

function updateEndpointLabel() {
  const base = document.getElementById('baseUrl').value.trim().replace(/\/$/, '');
  document.getElementById('endpointLabel').textContent = base + '/v1/chat/completions';
}

function usePreset(msg) {
  document.getElementById('userMessage').value = msg;
  document.getElementById('userMessage').focus();
}

function setStatus(msg, type = '') {
  const el = document.getElementById('statusText');
  el.textContent = msg;
  el.className = 'status-text ' + type;
}

function switchTab(name, btn) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.output-panel').forEach(p => p.classList.add('hidden'));
  document.getElementById('panel-' + name).classList.remove('hidden');
  if (name === 'code') renderCode();
  if (name === 'raw' && lastRaw) {
    document.getElementById('rawContent').textContent = JSON.stringify(lastRaw, null, 2);
  }
}

function showMeta(model, elapsed, usage, streaming) {
  const meta = document.getElementById('responseMeta');
  meta.style.display = 'flex';
  const tokens = usage ? usage.total_tokens : '—';
  const prompt_t = usage ? usage.prompt_tokens : '—';
  const comp_t = usage ? usage.completion_tokens : '—';
  meta.innerHTML = `
    <div class="meta-item"><div class="meta-dot green"></div> <span>${streaming ? 'stream' : 'sync'}</span></div>
    <div class="meta-item">modelo <span>${model}</span></div>
    <div class="meta-item">tempo <span>${elapsed}s</span></div>
    ${usage ? `<div class="meta-item">tokens <span>${prompt_t} → ${comp_t} (${tokens} total)</span></div>` : ''}
  `;
}

async function sendRequest(stream) {
  const apiKey = document.getElementById('apiKey').value.trim();
  const baseUrl = document.getElementById('baseUrl').value.trim().replace(/\/$/, '');
  const model = document.getElementById('model').value.trim();
  const temperature = parseFloat(document.getElementById('temperature').value);
  const maxTokens = parseInt(document.getElementById('maxTokens').value);
  const systemPrompt = document.getElementById('systemPrompt').value;
  const userMessage = document.getElementById('userMessage').value.trim();

  if (!apiKey) { setStatus('⚠ insira uma API key', 'err'); return; }
  if (!userMessage) { setStatus('⚠ escreva uma mensagem', 'err'); return; }

  document.getElementById('emptyState').style.display = 'none';
  document.getElementById('responseMeta').style.display = 'none';

  const rc = document.getElementById('responseContent');
  rc.textContent = '';
  rc.className = '';

  lastRaw = null;
  document.getElementById('rawContent').textContent = '';

  if (stream) {
    setStatus('⬡ streaming...', 'running');
    rc.innerHTML = '<span class="stream-cursor"></span>';
  } else {
    setStatus('⏳ aguardando...', 'running');
  }

  updateEndpointLabel();

  const body = {
    model, temperature, max_tokens: maxTokens, stream,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ]
  };

  const t0 = Date.now();

  try {
    const res = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Erro desconhecido' }));
      setStatus('✕ erro ' + res.status, 'err');
      rc.className = 'error';
      rc.textContent = JSON.stringify(err, null, 2);
      lastRaw = err;
      return;
    }

    if (!stream) {
      const data = await res.json();
      const elapsed = ((Date.now() - t0) / 1000).toFixed(2);
      rc.textContent = data.choices[0].message.content;
      lastRaw = data;
      showMeta(data.model || model, elapsed, data.usage, false);
      setStatus('✓ concluído', 'ok');
    } else {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = '';
      rc.innerHTML = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(l => l.startsWith('data:'));
        for (const line of lines) {
          const json = line.replace('data: ', '').trim();
          if (json === '[DONE]') continue;
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content ?? '';
            full += delta;
            rc.innerHTML = escapeHtml(full) + '<span class="stream-cursor"></span>';
          } catch (_) {}
        }
      }

      const elapsed = ((Date.now() - t0) / 1000).toFixed(2);
      rc.textContent = full;
      showMeta(model, elapsed, null, true);
      setStatus('✓ stream concluído', 'ok');
    }

  } catch (e) {
    setStatus('✕ erro de rede / CORS', 'err');
    rc.className = 'error';
    rc.textContent = e.message + '\n\nDica: verifique a URL base e se o CORS está habilitado para chamadas de browser.';
  }
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function clearAll() {
  document.getElementById('responseContent').textContent = '';
  document.getElementById('responseContent').className = '';
  document.getElementById('responseMeta').style.display = 'none';
  document.getElementById('emptyState').style.display = 'flex';
  document.getElementById('userMessage').value = '';
  lastRaw = null;
  setStatus('pronto', '');
}

function renderCode() {
  const base = document.getElementById('baseUrl').value.trim().replace(/\/$/, '');
  const model = document.getElementById('model').value.trim();
  const temp = parseFloat(document.getElementById('temperature').value).toFixed(1);
  const maxTok = parseInt(document.getElementById('maxTokens').value);
  const sys = (document.getElementById('systemPrompt').value || '').replace(/`/g, '\\`');
  const usr = (document.getElementById('userMessage').value || '').replace(/`/g, '\\`');

  document.getElementById('codeContent').innerHTML =
`<span class="cmt">// ─── Requisição para API OpenAI-compatible ──────────────────────────────</span>

<span class="kw">const</span> response = <span class="kw">await</span> fetch(<span class="str">"${base}/v1/chat/completions"</span>, {
  method: <span class="str">"POST"</span>,
  headers: {
    <span class="key">"Content-Type"</span>:  <span class="str">"application/json"</span>,
    <span class="key">"Authorization"</span>: <span class="str">"Bearer SUA_API_KEY"</span>
  },
  body: JSON.stringify({
    model:       <span class="str">"${model}"</span>,
    temperature: <span class="num">${temp}</span>,
    max_tokens:  <span class="num">${maxTok}</span>,
    stream:      <span class="num">false</span>,
    messages: [
      {
        role:    <span class="str">"system"</span>,
        content: <span class="str">\
\\`${sys}\\`</span>
      },
      {
        role:    <span class="str">"user"</span>,
        content: <span class="str">\
\\`${usr || 'Sua mensagem aqui...'}\\`</span>
      }
    ]
  })
});

<span class="kw">const</span> data = <span class="kw">await</span> response.json();

<span class="cmt">// Conteúdo da resposta</span>
console.log(data.choices[<span class="num">0</span>].message.content);

<span class="cmt">// ─── Estrutura da resposta ────────────────────────────────────────────────
// {
//   id:      "chatcmpl-abc123",
//   object:  "chat.completion",
//   model:   "${model}",
//   choices: [
//     {
//       index:         0,
//       message:       { role: "assistant", content: "..." },
//       finish_reason: "stop"
//     }
//   ],
//   usage: {
//     prompt_tokens:     42,
//     completion_tokens: 87,
//     total_tokens:      129
//   }
// }</span>`;
}

function copyCode() {
  const text = document.getElementById('codeContent').innerText;
  navigator.clipboard.writeText(text).then(() => setStatus('📋 código copiado!', 'ok'));
}

function copyRaw() {
  const text = document.getElementById('rawContent').textContent;
  navigator.clipboard.writeText(text).then(() => setStatus('📋 json copiado!', 'ok'));
}

document.getElementById('baseUrl').addEventListener('input', updateEndpointLabel);
updateEndpointLabel();
renderCode();

document.getElementById('userMessage').addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) sendRequest(false);
});
