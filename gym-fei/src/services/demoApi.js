import AsyncStorage from "@react-native-async-storage/async-storage";

import { gerarId } from "../utils/treino";
import { criarBancoDemo } from "./demoSeed";
import { ErroApp } from "./erros";

// Implementação "de mentira" da API, salva no próprio aparelho (AsyncStorage,
// que na web vira localStorage). Segue as mesmas regras do banco real para
// o app funcionar igual antes de o Supabase ser configurado.

const CHAVE_BANCO = "@gymfei/demo-banco-v1";
const CHAVE_SESSAO = "@gymfei/demo-sessao";
const ALFABETO_CODIGO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

let banco = null;
const ouvintes = new Set();

const esperar = (ms = 220) =>
  new Promise((resolver) => setTimeout(resolver, ms));
const copiar = (valor) =>
  valor == null ? valor : JSON.parse(JSON.stringify(valor));

async function carregar() {
  if (banco) return banco;
  try {
    const json = await AsyncStorage.getItem(CHAVE_BANCO);
    banco = json ? JSON.parse(json) : null;
  } catch {
    banco = null;
  }
  if (!banco) {
    banco = criarBancoDemo();
    await salvar();
  }
  return banco;
}

async function salvar() {
  try {
    await AsyncStorage.setItem(CHAVE_BANCO, JSON.stringify(banco));
  } catch {
    // Sem armazenamento disponível (ex.: aba anônima): mantém só em memória
  }
}

async function usuarioLogadoId() {
  try {
    return await AsyncStorage.getItem(CHAVE_SESSAO);
  } catch {
    return null;
  }
}

async function sessaoAtual() {
  const id = await usuarioLogadoId();
  if (!id) return null;
  const db = await carregar();
  const usuario = db.usuarios.find((u) => u.id === id);
  return usuario ? { user: { id: usuario.id, email: usuario.email } } : null;
}

function emitir(sessao) {
  ouvintes.forEach((callback) => callback(sessao));
}

function gerarCodigo(db) {
  let codigo;
  do {
    codigo = Array.from(
      { length: 6 },
      () => ALFABETO_CODIGO[Math.floor(Math.random() * ALFABETO_CODIGO.length)]
    ).join("");
  } while (db.perfis.some((p) => p.codigoConvite === codigo));
  return codigo;
}

const resumoAluno = (db, alunoId) => {
  const aluno = db.perfis.find((p) => p.id === alunoId);
  return aluno ? { id: aluno.id, nome: aluno.nome } : null;
};

function comAluno(db, treino, personalId) {
  const aluno = db.perfis.find((p) => p.id === treino.alunoId);
  // Igual ao banco real: o personal só enxerga quem ainda é aluno dele
  const visivel = aluno && (!personalId || aluno.personalId === personalId);
  return {
    ...copiar(treino),
    aluno: visivel ? { id: aluno.id, nome: aluno.nome } : null,
  };
}

// Treinos de um aluno que sai do personal vão para a lixeira desse personal
function arquivarTreinosDoVinculo(db, alunoId, personalId) {
  const agora = new Date().toISOString();
  db.treinos.forEach((t) => {
    if (t.alunoId === alunoId && t.personalId === personalId && !t.deletado) {
      t.deletado = true;
      t.deletadoEm = agora;
    }
  });
}

// ---------------------------------------------------------------- Autenticação

export function aoMudarSessao(callback) {
  ouvintes.add(callback);
  sessaoAtual().then(callback);
  return () => ouvintes.delete(callback);
}

export async function entrar({ email, senha }) {
  await esperar(450);
  const db = await carregar();
  const usuario = db.usuarios.find(
    (u) => u.email === email.trim().toLowerCase()
  );
  if (!usuario || usuario.senha !== senha) {
    throw new ErroApp("E-mail ou senha incorretos.", "invalid_credentials");
  }
  await AsyncStorage.setItem(CHAVE_SESSAO, usuario.id);
  const sessao = { user: { id: usuario.id, email: usuario.email } };
  emitir(sessao);
  return sessao;
}

export async function cadastrar({ nome, email, senha, tipo, codigoPersonal }) {
  await esperar(550);
  const db = await carregar();
  const emailNormalizado = email.trim().toLowerCase();
  if (senha.length < 6)
    throw new ErroApp(
      "A senha precisa ter pelo menos 6 caracteres.",
      "weak_password"
    );
  if (db.usuarios.some((u) => u.email === emailNormalizado)) {
    throw new ErroApp(
      "Este e-mail já está cadastrado. Que tal entrar?",
      "user_already_exists"
    );
  }

  const id = `demo-${gerarId()}`;
  const codigo = codigoPersonal?.trim().toUpperCase();
  const personal =
    tipo === "aluno" && codigo
      ? db.perfis.find(
          (p) => p.tipo === "personal" && p.codigoConvite === codigo
        )
      : null;

  db.usuarios.push({ id, email: emailNormalizado, senha });
  db.perfis.push({
    id,
    nome: nome.trim(),
    email: emailNormalizado,
    tipo,
    personalId: personal?.id ?? null,
    codigoConvite: tipo === "personal" ? gerarCodigo(db) : null,
    criadoEm: new Date().toISOString(),
  });
  await salvar();
  await AsyncStorage.setItem(CHAVE_SESSAO, id);
  const sessao = { user: { id, email: emailNormalizado } };
  emitir(sessao);
  return { sessao, precisaConfirmarEmail: false };
}

export async function sair() {
  await AsyncStorage.removeItem(CHAVE_SESSAO);
  emitir(null);
}

// ---------------------------------------------------------------- Perfis

export async function obterPerfil(id) {
  await esperar(150);
  const db = await carregar();
  return copiar(db.perfis.find((p) => p.id === id) ?? null);
}

export async function atualizarNome(id, nome) {
  await esperar();
  const db = await carregar();
  const perfil = db.perfis.find((p) => p.id === id);
  perfil.nome = nome.trim();
  await salvar();
  return copiar(perfil);
}

export async function verificarCodigo(codigo) {
  await esperar(300);
  const db = await carregar();
  const personal = db.perfis.find(
    (p) =>
      p.tipo === "personal" && p.codigoConvite === codigo.trim().toUpperCase()
  );
  return personal ? { nome: personal.nome } : null;
}

export async function vincularPersonal(codigo) {
  await esperar(350);
  const db = await carregar();
  const personal = db.perfis.find(
    (p) =>
      p.tipo === "personal" && p.codigoConvite === codigo.trim().toUpperCase()
  );
  if (!personal)
    throw new ErroApp("Código não encontrado. Confira com seu personal.");
  const idAtual = await usuarioLogadoId();
  const aluno = db.perfis.find((p) => p.id === idAtual);
  if (!aluno || aluno.tipo !== "aluno")
    throw new ErroApp("Apenas alunos podem se vincular a um personal.");
  if (aluno.personalId && aluno.personalId !== personal.id) {
    arquivarTreinosDoVinculo(db, aluno.id, aluno.personalId);
  }
  aluno.personalId = personal.id;
  await salvar();
  return copiar(aluno);
}

export async function desvincularPersonal() {
  await esperar();
  const db = await carregar();
  const idAtual = await usuarioLogadoId();
  const eu = db.perfis.find((p) => p.id === idAtual);
  if (eu?.personalId) arquivarTreinosDoVinculo(db, eu.id, eu.personalId);
  if (eu) eu.personalId = null;
  await salvar();
  return copiar(eu);
}

export async function obterPessoa(id) {
  if (!id) return null;
  await esperar(120);
  const db = await carregar();
  const pessoa = db.perfis.find((p) => p.id === id);
  return pessoa
    ? {
        id: pessoa.id,
        nome: pessoa.nome,
        email: pessoa.email,
        tipo: pessoa.tipo,
        criadoEm: pessoa.criadoEm,
      }
    : null;
}

export async function listarAlunos(personalId) {
  await esperar();
  const db = await carregar();
  return db.perfis
    .filter((p) => p.personalId === personalId)
    .sort((a, b) => a.nome.localeCompare(b.nome))
    .map((aluno) => {
      const ultimo = db.historico
        .filter((h) => h.alunoId === aluno.id)
        .sort((a, b) => new Date(b.concluidoEm) - new Date(a.concluidoEm))[0];
      return {
        ...copiar(aluno),
        totalTreinos: db.treinos.filter(
          (t) =>
            t.alunoId === aluno.id && t.personalId === personalId && !t.deletado
        ).length,
        ultimoTreinoEm: ultimo?.concluidoEm ?? null,
      };
    });
}

export async function removerAluno(alunoId) {
  await esperar();
  const db = await carregar();
  const aluno = db.perfis.find((p) => p.id === alunoId);
  if (aluno?.personalId)
    arquivarTreinosDoVinculo(db, aluno.id, aluno.personalId);
  if (aluno) aluno.personalId = null;
  await salvar();
}

// ---------------------------------------------------------------- Treinos

export async function listarTreinosDoPersonal(
  personalId,
  { deletados = false } = {}
) {
  await esperar();
  const db = await carregar();
  const campoData = deletados ? "deletadoEm" : "atualizadoEm";
  return db.treinos
    .filter((t) => t.personalId === personalId && t.deletado === deletados)
    .sort((a, b) => new Date(b[campoData]) - new Date(a[campoData]))
    .map((t) => comAluno(db, t, personalId));
}

export async function listarTreinosDoAluno(alunoId) {
  await esperar();
  const db = await carregar();
  return copiar(
    db.treinos
      .filter((t) => t.alunoId === alunoId && !t.deletado)
      .sort((a, b) => new Date(a.criadoEm) - new Date(b.criadoEm))
  );
}

export async function obterTreino(id) {
  await esperar(150);
  const db = await carregar();
  const treino = db.treinos.find((t) => t.id === id);
  return treino ? comAluno(db, treino) : null;
}

export async function criarTreino(personalId, dados) {
  await esperar(400);
  const db = await carregar();
  const agora = new Date().toISOString();
  const treino = {
    id: `demo-${gerarId()}`,
    personalId,
    alunoId: dados.alunoId,
    nome: dados.nome.trim(),
    grupoMuscular: dados.grupoMuscular,
    objetivo: dados.objetivo || null,
    observacoes: dados.observacoes?.trim() || null,
    exercicios: copiar(dados.exercicios),
    deletado: false,
    deletadoEm: null,
    criadoEm: agora,
    atualizadoEm: agora,
  };
  db.treinos.push(treino);
  await salvar();
  return comAluno(db, treino, personalId);
}

export async function atualizarTreino(id, dados) {
  await esperar(400);
  const db = await carregar();
  const treino = db.treinos.find((t) => t.id === id);
  if (!treino) throw new ErroApp("Treino não encontrado.");
  Object.assign(treino, {
    alunoId: dados.alunoId,
    nome: dados.nome.trim(),
    grupoMuscular: dados.grupoMuscular,
    objetivo: dados.objetivo || null,
    observacoes: dados.observacoes?.trim() || null,
    exercicios: copiar(dados.exercicios),
    atualizadoEm: new Date().toISOString(),
  });
  await salvar();
  return comAluno(db, treino, treino.personalId);
}

async function alterarTreino(id, campos) {
  await esperar();
  const db = await carregar();
  const treino = db.treinos.find((t) => t.id === id);
  if (!treino) throw new ErroApp("Treino não encontrado.");
  Object.assign(treino, campos);
  await salvar();
}

export const moverParaLixeira = (id) =>
  alterarTreino(id, { deletado: true, deletadoEm: new Date().toISOString() });

export async function restaurarTreino(id) {
  const db = await carregar();
  const treino = db.treinos.find((t) => t.id === id);
  const aluno = db.perfis.find((p) => p.id === treino?.alunoId);
  if (!aluno || aluno.personalId !== treino.personalId) {
    throw new ErroApp(
      "Este aluno não está mais vinculado a você, então o treino não pode ser restaurado."
    );
  }
  return alterarTreino(id, { deletado: false, deletadoEm: null });
}

export async function excluirTreinoDefinitivo(id) {
  await esperar();
  const db = await carregar();
  db.treinos = db.treinos.filter((t) => t.id !== id);
  db.historico.forEach((h) => {
    if (h.treinoId === id) h.treinoId = null;
  });
  await salvar();
}

// ---------------------------------------------------------------- Histórico

export async function registrarConclusao(
  alunoId,
  { treino, duracaoSegundos, seriesConcluidas, totalSeries }
) {
  await esperar(400);
  const db = await carregar();
  const registro = {
    id: `demo-${gerarId()}`,
    alunoId,
    treinoId: treino.id,
    nomeTreino: treino.nome,
    grupoMuscular: treino.grupoMuscular,
    quantidadeExercicios: treino.exercicios.length,
    seriesConcluidas,
    totalSeries,
    duracaoSegundos,
    concluidoEm: new Date().toISOString(),
  };
  db.historico.unshift(registro);
  await salvar();
  return copiar(registro);
}

export async function listarHistorico({ alunoId, limite } = {}) {
  await esperar();
  const db = await carregar();
  const idAtual = await usuarioLogadoId();
  const eu = db.perfis.find((p) => p.id === idAtual);
  // Mesma regra do banco real: aluno vê o próprio, personal vê o dos seus alunos
  const permitidos = new Set(
    eu?.tipo === "personal"
      ? db.perfis.filter((p) => p.personalId === eu.id).map((p) => p.id)
      : [idAtual]
  );
  let lista = db.historico
    .filter(
      (h) => permitidos.has(h.alunoId) && (!alunoId || h.alunoId === alunoId)
    )
    .sort((a, b) => new Date(b.concluidoEm) - new Date(a.concluidoEm));
  if (limite) lista = lista.slice(0, limite);
  return lista.map((h) => ({
    ...copiar(h),
    aluno: resumoAluno(db, h.alunoId),
  }));
}

// Volta os dados de exemplo ao estado original
export async function restaurarDemo() {
  banco = criarBancoDemo();
  await salvar();
  const sessao = await sessaoAtual();
  if (!sessao) await sair();
  else emitir(sessao);
}
