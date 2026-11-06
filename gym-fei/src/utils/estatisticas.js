import { GRUPOS_MUSCULARES } from "../data/catalogo";
import { inicioDaSemana, mesmoDia, somarDias } from "./datas";

// Todas as funções recebem o histórico de treinos concluídos (lista de registros).

export function naSemana(historico, referencia = new Date()) {
  const inicio = inicioDaSemana(referencia).getTime();
  const fim = somarDias(inicio, 7).getTime();
  return historico.filter((h) => {
    const t = new Date(h.concluidoEm).getTime();
    return t >= inicio && t < fim;
  });
}

export function minutosTotais(historico) {
  return Math.round(
    historico.reduce((s, h) => s + (h.duracaoSegundos || 0), 0) / 60
  );
}

export function diasTreinados(historico, dias) {
  return dias.map((dia) => historico.some((h) => mesmoDia(h.concluidoEm, dia)));
}

// Semanas seguidas (até a atual) com pelo menos um treino
export function sequenciaDeSemanas(historico, agora = new Date()) {
  if (!historico.length) return 0;
  let semana = inicioDaSemana(agora);
  // A semana atual ainda está em andamento: se não houver treino nela, começa a contar da anterior
  if (!naSemana(historico, semana).length) semana = somarDias(semana, -7);
  let total = 0;
  while (naSemana(historico, semana).length) {
    total += 1;
    semana = somarDias(semana, -7);
  }
  return total;
}

export function porSemana(historico, quantidade = 8, agora = new Date()) {
  const atual = inicioDaSemana(agora);
  return Array.from({ length: quantidade }, (_, i) => {
    const inicio = somarDias(atual, -7 * (quantidade - 1 - i));
    return { inicio, total: naSemana(historico, inicio).length };
  });
}

export function porGrupo(historico) {
  const total = historico.length || 1;
  return GRUPOS_MUSCULARES.map((g) => {
    const qtd = historico.filter((h) => h.grupoMuscular === g.id).length;
    return {
      grupo: g,
      total: qtd,
      percentual: Math.round((qtd / total) * 100),
    };
  }).sort((a, b) => b.total - a.total);
}

// Sugere o treino feito há mais tempo (ou nunca feito)
export function sugerirProximoTreino(treinos, historico) {
  if (!treinos.length) return null;
  const ultimaVez = (treino) => {
    const registros = historico.filter((h) => h.treinoId === treino.id);
    if (!registros.length) return 0;
    return Math.max(...registros.map((h) => new Date(h.concluidoEm).getTime()));
  };
  return [...treinos].sort((a, b) => ultimaVez(a) - ultimaVez(b))[0];
}

export function ultimaAtividade(historico, alunoId) {
  const doAluno = historico.filter((h) => h.alunoId === alunoId);
  if (!doAluno.length) return null;
  return doAluno.reduce((maisRecente, h) =>
    new Date(h.concluidoEm) > new Date(maisRecente.concluidoEm)
      ? h
      : maisRecente
  ).concluidoEm;
}
