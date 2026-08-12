# Sistema de fila para atendimento

Sistema simples de fila: o cliente digita nome, telefone e e-mail para entrar na fila,
o painel exibe as senhas chamadas, e o atendente chama o próximo com um clique —
o cliente recebe um e-mail avisando que chegou a vez dele.

## Páginas

- `index.html` → tela para o cliente entrar na fila (retirar senha)
- `painel.html` → painel público, pensado para ficar numa TV/monitor mostrando as senhas chamadas
- `atendente.html` → painel do atendente, protegido por senha, com o botão "Chamar próximo"

## Como rodar no seu computador 

1. Instale o [Node.js](https://nodejs.org) (versão 18 ou mais recente).
2. Abra o terminal na pasta do projeto e instale as dependências:
   ```
   npm install
   ```
3. Copie o arquivo de configuração e preencha com seus dados de e-mail:
   ```
   cp .env.example .env
   ```
   Edite o `.env` com um editor de texto. Para usar Gmail, veja "Configurando o e-mail" abaixo.
4. Rode o servidor:
   ```
   npm start
   ```
5. Abra no navegador:
   - `http://localhost:3000` → entrar na fila
   - `http://localhost:3000/painel.html` → painel público
   - `http://localhost:3000/atendente.html` → painel do atendente (pede a senha definida em `ADMIN_PASSWORD`)

## Configurando o e-mail 

1. Ative a verificação em duas etapas na sua conta Google.
2. Crie uma "senha de app" em https://myaccount.google.com/apppasswords
3. Use essa senha de app no campo `SMTP_PASS` do `.env` (não a senha normal da conta).

Se preferir outro provedor de e-mail (Outlook, provedor da sua empresa, etc.), troque
`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER` e `SMTP_PASS` pelos dados fornecidos por ele.

Se o `.env` não tiver `SMTP_HOST` preenchido, o sistema funciona normalmente
(fila e painel funcionam), só não envia o e-mail.

## Publicando online 

Como você escolheu que o sistema fica online, o jeito mais simples é publicar em um
serviço gratuito/barato que rode Node.js, como o [Render](https://render.com):

1. Crie uma conta no Render e um novo "Web Service".
2. Suba este projeto para um repositório no GitHub e conecte ao Render (ou use o deploy manual).
3. Configure:
   - **Build command:** `npm install`
   - **Start command:** `npm start`
4. Em "Environment", adicione as mesmas variáveis do seu `.env` (`ADMIN_PASSWORD`, `SMTP_HOST`, etc.).
5. Depois do deploy, você terá uma URL pública, por exemplo:
   `https://sua-fila.onrender.com` → entrar na fila
   `https://sua-fila.onrender.com/painel.html` → painel público
   `https://sua-fila.onrender.com/atendente.html` → painel do atendente

Posso te ajudar a fazer esse deploy passo a passo quando estiver pronto.

## Como funciona por dentro

- O backend (`server.js`) guarda a fila num arquivo `fila.json` na pasta do projeto.
- O painel público e o painel do atendente atualizam automaticamente a cada poucos segundos
  (não precisa recarregar a página).
- Ao clicar em "Chamar próximo", o sistema marca a pessoa como chamada e dispara o e-mail.
- A senha do atendente evita que qualquer visitante consiga chamar senhas.
