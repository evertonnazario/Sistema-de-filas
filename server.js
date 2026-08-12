require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const DATA_FILE = path.join(__dirname, 'fila.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---------- Persistência simples em arquivo JSON ----------
function lerFila() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ proximaSenha: 1, itens: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function salvarFila(fila) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(fila, null, 2));
}

// ---------- E-mail ----------
function criarTransportador() {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function enviarEmailChamada(item) {
  const transportador = criarTransportador();
  if (!transportador || !item.email) return;

  try {
    await transportador.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: item.email,
      subject: `Chegou sua vez! Senha ${item.senha}`,
      text: `Olá ${item.nome}, chegou a sua vez de ser atendido. Sua senha é ${item.senha}. Por favor, dirija-se ao atendimento.`,
      html: `<p>Olá <strong>${item.nome}</strong>,</p><p>Chegou a sua vez de ser atendido.</p><p style="font-size:28px;font-weight:bold;color:#f0b429;">Senha ${item.senha}</p><p>Por favor, dirija-se ao atendimento.</p>`,
    });
    console.log(`E-mail enviado para ${item.email} (senha ${item.senha})`);
  } catch (erro) {
    console.error('Erro ao enviar e-mail:', erro.message);
  }
}

// ---------- Rotas públicas ----------

// Cliente entra na fila
app.post('/api/entrar', (req, res) => {
  const { nome, telefone, email } = req.body;
  if (!nome || !nome.trim()) {
    return res.status(400).json({ erro: 'Nome é obrigatório.' });
  }

  const fila = lerFila();
  const senha = fila.proximaSenha;
  const item = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    senha,
    nome: nome.trim(),
    telefone: (telefone || '').trim(),
    email: (email || '').trim(),
    status: 'aguardando', // aguardando | chamado | atendido
    criadoEm: new Date().toISOString(),
  };

  fila.proximaSenha += 1;
  fila.itens.push(item);
  salvarFila(fila);

  const posicao = fila.itens.filter(i => i.status === 'aguardando').length;
  res.json({ id: item.id, senha: item.senha, posicaoNaFila: posicao });
});

// Painel consulta o estado atual da fila
app.get('/api/fila', (req, res) => {
  const fila = lerFila();
  const aguardando = fila.itens.filter(i => i.status === 'aguardando');
  const chamados = fila.itens.filter(i => i.status === 'chamado').slice(-5).reverse();
  res.json({
    aguardando: aguardando.map(({ id, senha, nome }) => ({ id, senha, nome })),
    chamados: chamados.map(({ id, senha, nome }) => ({ id, senha, nome })),
    totalAguardando: aguardando.length,
  });
});

// Cliente consulta a própria posição
app.get('/api/status/:id', (req, res) => {
  const fila = lerFila();
  const item = fila.itens.find(i => i.id === req.params.id);
  if (!item) return res.status(404).json({ erro: 'Não encontrado.' });

  const aguardando = fila.itens.filter(i => i.status === 'aguardando');
  const posicao = aguardando.findIndex(i => i.id === item.id) + 1;
  res.json({ senha: item.senha, status: item.status, posicaoNaFila: item.status === 'aguardando' ? posicao : 0 });
});

// ---------- Rotas de atendente (protegidas por senha simples) ----------

function checarSenhaAdmin(req, res, next) {
  const senha = req.headers['x-admin-password'];
  if (senha !== ADMIN_PASSWORD) {
    return res.status(401).json({ erro: 'Senha de atendente inválida.' });
  }
  next();
}

// Chama o próximo da fila
app.post('/api/chamar-proximo', checarSenhaAdmin, async (req, res) => {
  const fila = lerFila();
  const proximo = fila.itens.find(i => i.status === 'aguardando');
  if (!proximo) return res.status(404).json({ erro: 'Fila vazia.' });

  proximo.status = 'chamado';
  proximo.chamadoEm = new Date().toISOString();
  salvarFila(fila);

  await enviarEmailChamada(proximo);
  res.json({ senha: proximo.senha, nome: proximo.nome });
});

// Marca como atendido
app.post('/api/finalizar/:id', checarSenhaAdmin, (req, res) => {
  const fila = lerFila();
  const item = fila.itens.find(i => i.id === req.params.id);
  if (!item) return res.status(404).json({ erro: 'Não encontrado.' });
  item.status = 'atendido';
  salvarFila(fila);
  res.json({ ok: true });
});

// Lista completa para o painel de atendente
app.get('/api/atendente/fila', checarSenhaAdmin, (req, res) => {
  const fila = lerFila();
  res.json(fila.itens.filter(i => i.status !== 'atendido'));
});

app.listen(PORT, () => {
  console.log(`Sistema de fila rodando em http://localhost:${PORT}`);
});
