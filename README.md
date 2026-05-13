# API Playground

Este projeto é uma pequena interface web para testar APIs de LLM compatíveis com OpenAI, usando requisições `fetch` no navegador.

## Estrutura do projeto

- `index.html` — página principal da interface.
- `css/style.css` — estilos da aplicação.
- `js/api-playground.js` — lógica de interação, envio de requisições e renderização.
- `backup/` — cópias ou versões antigas do HTML/JS.

## Como usar localmente

### Abrir no navegador

1. Abra `index.html` diretamente no navegador.
2. Configure a URL base (`Base URL`), `API Key` e `Modelo`.
3. Escreva uma mensagem e clique em `Enviar` ou `Stream`.

> Observação: algumas APIs podem exigir CORS habilitado para chamadas diretas do navegador.

### Usar um servidor local

Para evitar problemas de carregamento local, use um servidor HTTP simples:

- Python 3:

```powershell
cd c:\Users\bruno\Downloads\api-playground
    python -m http.server 8000
```

- Navegue para:

```text
http://localhost:8000/
```

## Testar a interface

1. Selecione um provedor ou ajuste manualmente `Base URL`, `API Key` e `Modelo`.
2. Preencha o `System Prompt` e a `Mensagem` do usuário.
3. Clique em `Enviar` para requisição normal ou `Stream` para receber a resposta em tempo real.
4. Use as abas `Resposta`, `Código` e `JSON Raw` para inspecionar o resultado.
5. Copie o código ou JSON, se necessário.

## Git / publicação no repositório

Se ainda não houver repositório Git:

```powershell
git init
git add .
git commit -m "Adicionar API Playground"
```

Se já houver remoto configurado:

```powershell
git add .
git commit -m "Atualizar README e interface de testes"
git push origin main
```

## Dicas

- Se for usar uma API OpenAI, verifique se a chave e o endpoint estão corretos.
- Para `ollama`, o projeto já tenta preencher um valor padrão de `apiKey` quando selecionado.
- Caso use um servidor local, abra o console do navegador para ver erros de rede/CORS.
