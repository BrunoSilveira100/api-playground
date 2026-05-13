# API Playground

Uma interface leve e moderna para testar APIs de LLM compatíveis com OpenAI diretamente no navegador.

## ✨ O que é

Este projeto permite testar rapidamente chamadas a APIs de modelos de linguagem usando `fetch` no browser. Ele oferece:

- seleção de provedores e configuração de endpoint
- envio de prompts e system prompts
- resposta normal e modo de streaming
- visualização de JSON raw e código de exemplo

## 📁 Estrutura do projeto

- `index.html` — interface principal.
- `css/style.css` — estilo da interface.
- `js/api-playground.js` — lógica de envio de requisições e renderização.
- `backup/` — cópias de versões antigas.

## 🚀 Como usar

### 1. Abrir direto no navegador

1. Abra `index.html` no seu navegador.
2. Informe `Base URL`, `API Key` e `Modelo`.
3. Digite a mensagem no campo e clique em `Enviar` ou `Stream`.

> Caso tenha problemas ao abrir direto, use um servidor local, pois isso resolve muitos erros de carregamento de arquivo.

### 2. Usar servidor local

Recomendado para um teste mais estável:

```powershell
cd c:\Users\bruno\Downloads\api-playground
python -m http.server 8000
```

Acesse:

```text
http://localhost:8000/
```

## 🧪 Testando a interface

1. Selecione um provedor ou configure manualmente o `Base URL`, `API Key` e `Modelo`.
2. Ajuste `System Prompt` e `Mensagem`.
3. Clique em `Enviar` para resposta completa ou `Stream` para resposta em tempo real.
4. Veja o resultado em `Resposta`, `Código` ou `JSON Raw`.
5. Use os botões de copiar quando precisar salvar o conteúdo.

## 🔧 Configuração de Git

Se ainda não houver repositório Git local:

```powershell
git init
git add .
git commit -m "Adicionar API Playground"
```

Se já existir remoto configurado:

```powershell
git add .
git commit -m "Atualizar README e interface de testes"
git push origin master
```

> Observação: o branch do repositório atual está em `master`.

## 💡 Dicas importantes

- Em `API Key`, coloque a chave secreta do provedor (por exemplo `sk-...` para OpenAI).
- Para OpenAI, `Base URL` deve ser `https://api.openai.com`.
- Se usar `Ollama`, o app preenche `apiKey` automaticamente com `ollama` quando selecionado.
- Abra o console do navegador (F12) se aparecer erro de rede ou CORS.

## 📌 Publicação no GitHub

Se quiser, publique o site como GitHub Pages usando o branch `master` ou `main`.

1. Crie o repositório no GitHub.
2. Configure o remoto:

```powershell
git remote add origin https://github.com/BrunoSilveira100/api-playground.git
```

3. Envie o código:

```powershell
git push -u origin master
```

---

Made with ❤️ para testar APIs de LLM de forma simples e rápida.

