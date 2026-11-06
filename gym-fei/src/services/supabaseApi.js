import { supabase } from "../lib/supabase";
import { ErroApp } from "./erros";

// Implementação da API usando o Supabase (PostgreSQL + Auth).
// O banco usa snake_case; o app usa camelCase. As funções abaixo convertem.

const ALUNO_DO_TREINO = "aluno:perfis!treinos_aluno_id_fkey(id, nome)";
const ALUNO_DO_HISTORICO =
  "aluno:perfis!historico_treinos_aluno_id_fkey(id, nome)";

function paraPerfil(r) {
  if (!r) return null;
  return {
    id: r.id,
    nome: r.nome,
    email: r.email,
    tipo: r.tipo,
    personalId: r.personal_id,
    codigoConvite: r.codigo_convite,
    criadoEm: r.criado_em,
  };
}

function paraTreino(r) {
  if (!r) return null;
  return {
    id: r.id,
    personalId: r.personal_id,
    alunoId: r.aluno_id,
    nome: r.nome,
    grupoMuscular: r.grupo_muscular,
    objetivo: r.objetivo,
    observacoes: r.observacoes,
    exercicios: r.exercicios ?? [],
    deletado: r.deletado,
    deletadoEm: r.deletado_em,
    criadoEm: r.criado_em,
    atualizadoEm: r.atualizado_em,
    aluno: r.aluno ? { id: r.aluno.id, nome: r.aluno.nome } : null,
  };
}

function paraHistorico(r) {
  return {
    id: r.id,
    alunoId: r.aluno_id,
    treinoId: r.treino_id,
    nomeTreino: r.nome_treino,
    grupoMuscular: r.grupo_muscular,
    quantidadeExercicios: r.quantidade_exercicios,
    seriesConcluidas: r.series_concluidas,
    totalSeries: r.total_series,
    duracaoSegundos: r.duracao_segundos,
    concluidoEm: r.concluido_em,
    aluno: r.aluno ? { id: r.aluno.id, nome: r.aluno.nome } : null,
  };
}

function colunasDoTreino(dados) {
  return {
    aluno_id: dados.alunoId,
    nome: dados.nome.trim(),
    grupo_muscular: dados.grupoMuscular,
    objetivo: dados.objetivo || null,
    observacoes: dados.observacoes?.trim() || null,
    exercicios: dados.exercicios,
  };
}

// Lança o erro do Supabase (se houver) e devolve os dados
function resultado({ data, error }) {
  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------- Autenticação

export async function entrar({ email, senha }) {
  const data = resultado(
    await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: senha,
    })
  );
  return data.session;
}

export async function cadastrar({ nome, email, senha, tipo, codigoPersonal }) {
  const data = resultado(
    await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password: senha,
      // Lido pelo gatilho "criar_perfil" no banco para montar o perfil
      options: {
        data: {
          nome: nome.trim(),
          tipo,
          codigo_personal: codigoPersonal?.trim().toUpperCase() || null,
        },
      },
    })
  );
  // Com a confirmação de e-mail ativa, o Supabase não acusa e-mail repetido:
  // devolve um usuário sem identidades.
  if (
    data.user &&
    Array.isArray(data.user.identities) &&
    data.user.identities.length === 0
  ) {
    throw new ErroApp(
      "Este e-mail já está cadastrado. Que tal entrar?",
      "user_already_exists"
    );
  }
  return { sessao: data.session, precisaConfirmarEmail: !data.session };
}

export async function sair() {
  resultado(await supabase.auth.signOut());
}

export function aoMudarSessao(callback) {
  const { data } = supabase.auth.onAuthStateChange((_evento, sessao) =>
    callback(sessao)
  );
  return () => data.subscription.unsubscribe();
}

// ---------------------------------------------------------------- Perfis

export async function obterPerfil(id) {
  return paraPerfil(
    resultado(
      await supabase.from("perfis").select("*").eq("id", id).maybeSingle()
    )
  );
}

export async function atualizarNome(id, nome) {
  return paraPerfil(
    resultado(
      await supabase
        .from("perfis")
        .update({ nome: nome.trim() })
        .eq("id", id)
        .select()
        .single()
    )
  );
}

// Valida o código antes do cadastro (devolve o nome do personal ou null)
export async function verificarCodigo(codigo) {
  const nome = resultado(
    await supabase.rpc("verificar_codigo_convite", {
      p_codigo: codigo.trim().toUpperCase(),
    })
  );
  return nome ? { nome } : null;
}

export async function vincularPersonal(codigo) {
  return paraPerfil(
    resultado(
      await supabase.rpc("vincular_personal", {
        p_codigo: codigo.trim().toUpperCase(),
      })
    )
  );
}

export async function desvincularPersonal() {
  return paraPerfil(resultado(await supabase.rpc("desvincular_personal")));
}

// Dados públicos de outra pessoa (o personal do aluno, ou um aluno do personal)
export async function obterPessoa(id) {
  if (!id) return null;
  return paraPerfil(
    resultado(
      await supabase
        .from("perfis")
        .select("id, nome, email, tipo, criado_em")
        .eq("id", id)
        .maybeSingle()
    )
  );
}

// Alunos do personal, com total de treinos ativos e data da última atividade
export async function listarAlunos(personalId) {
  const [alunos, treinos, historico] = await Promise.all([
    supabase
      .from("perfis")
      .select("*")
      .eq("personal_id", personalId)
      .order("nome"),
    supabase
      .from("treinos")
      .select("aluno_id")
      .eq("personal_id", personalId)
      .eq("deletado", false),
    supabase
      .from("historico_treinos")
      .select("aluno_id, concluido_em")
      .order("concluido_em", { ascending: false })
      .limit(1000),
  ]).then((respostas) => respostas.map(resultado));

  return alunos.map((r) => {
    const ultimo = historico.find((h) => h.aluno_id === r.id);
    return {
      ...paraPerfil(r),
      totalTreinos: treinos.filter((t) => t.aluno_id === r.id).length,
      ultimoTreinoEm: ultimo?.concluido_em ?? null,
    };
  });
}

export async function removerAluno(alunoId) {
  resultado(await supabase.rpc("remover_aluno", { p_aluno: alunoId }));
}

// ---------------------------------------------------------------- Treinos

export async function listarTreinosDoPersonal(
  personalId,
  { deletados = false } = {}
) {
  const linhas = resultado(
    await supabase
      .from("treinos")
      .select(`*, ${ALUNO_DO_TREINO}`)
      .eq("personal_id", personalId)
      .eq("deletado", deletados)
      .order(deletados ? "deletado_em" : "atualizado_em", { ascending: false })
  );
  return linhas.map(paraTreino);
}

export async function listarTreinosDoAluno(alunoId) {
  const linhas = resultado(
    await supabase
      .from("treinos")
      .select("*")
      .eq("aluno_id", alunoId)
      .eq("deletado", false)
      .order("criado_em", { ascending: true })
  );
  return linhas.map(paraTreino);
}

export async function obterTreino(id) {
  return paraTreino(
    resultado(
      await supabase
        .from("treinos")
        .select(`*, ${ALUNO_DO_TREINO}`)
        .eq("id", id)
        .maybeSingle()
    )
  );
}

export async function criarTreino(personalId, dados) {
  return paraTreino(
    resultado(
      await supabase
        .from("treinos")
        .insert({ ...colunasDoTreino(dados), personal_id: personalId })
        .select()
        .single()
    )
  );
}

export async function atualizarTreino(id, dados) {
  return paraTreino(
    resultado(
      await supabase
        .from("treinos")
        .update(colunasDoTreino(dados))
        .eq("id", id)
        .select()
        .single()
    )
  );
}

export async function moverParaLixeira(id) {
  resultado(
    await supabase
      .from("treinos")
      .update({ deletado: true, deletado_em: new Date().toISOString() })
      .eq("id", id)
  );
}

export async function restaurarTreino(id) {
  resultado(
    await supabase
      .from("treinos")
      .update({ deletado: false, deletado_em: null })
      .eq("id", id)
  );
}

export async function excluirTreinoDefinitivo(id) {
  resultado(await supabase.from("treinos").delete().eq("id", id));
}

// ---------------------------------------------------------------- Histórico

export async function registrarConclusao(
  alunoId,
  { treino, duracaoSegundos, seriesConcluidas, totalSeries }
) {
  return paraHistorico(
    resultado(
      await supabase
        .from("historico_treinos")
        .insert({
          aluno_id: alunoId,
          treino_id: treino.id,
          nome_treino: treino.nome,
          grupo_muscular: treino.grupoMuscular,
          quantidade_exercicios: treino.exercicios.length,
          series_concluidas: seriesConcluidas,
          total_series: totalSeries,
          duracao_segundos: duracaoSegundos,
        })
        .select()
        .single()
    )
  );
}

// Sem alunoId: o aluno recebe o próprio histórico e o personal o de todos
// os seus alunos (quem filtra é a política de segurança RLS do banco).
export async function listarHistorico({ alunoId, limite } = {}) {
  let consulta = supabase
    .from("historico_treinos")
    .select(`*, ${ALUNO_DO_HISTORICO}`)
    .order("concluido_em", { ascending: false });
  if (alunoId) consulta = consulta.eq("aluno_id", alunoId);
  if (limite) consulta = consulta.limit(limite);
  return resultado(await consulta).map(paraHistorico);
}

export async function restaurarDemo() {
  throw new ErroApp("Disponível apenas no modo demonstração.");
}
