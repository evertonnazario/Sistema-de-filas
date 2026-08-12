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
