// Regras de negócio dos treinos que não dependem do banco de dados.

const SEGUNDOS_POR_SERIE = 40;

export function gerarId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function novoExercicio(nome = "") {
  return {
    id: gerarId(),
    nome,
    series: 3,
    repeticoes: "12",
    carga: "",
    descanso: 60,
  };
}

export function totalSeries(treino) {
  return (treino?.exercicios ?? []).reduce(
    (soma, ex) => soma + (Number(ex.series) || 0),
    0
  );
}

// Estimativa simples: tempo de execução + descanso de cada série
export function estimarDuracaoMin(treino) {
  const segundos = (treino?.exercicios ?? []).reduce((soma, ex) => {
    const series = Number(ex.series) || 0;
    const descanso = Number(ex.descanso) || 0;
    return soma + series * (SEGUNDOS_POR_SERIE + descanso);
  }, 0);
  return Math.max(5, Math.round(segundos / 60));
}

// "4 × 10 · 40 kg"
export function resumoExercicio(ex) {
  const partes = [`${ex.series} × ${ex.repeticoes}`];
  const carga = String(ex.carga ?? "").trim();
  if (carga) partes.push(/^\d+([.,]\d+)?$/.test(carga) ? `${carga} kg` : carga);
  return partes.join(" · ");
}

export function contarExercicios(treino) {
  const n = treino?.exercicios?.length ?? 0;
  return `${n} ${n === 1 ? "exercício" : "exercícios"}`;
}

// Valida o formulário de treino e devolve um mapa { campo: mensagem }
export function validarTreino(dados) {
  const erros = {};
  if (!dados.alunoId) erros.aluno = "Escolha o aluno que vai receber o treino.";
  if (!dados.nome?.trim()) erros.nome = "Dê um nome ao treino.";
  if (!dados.grupoMuscular)
    erros.grupo = "Selecione o grupo muscular principal.";
  if (!dados.exercicios?.length) {
    erros.exercicios = "Adicione pelo menos um exercício.";
  } else {
    const semNome = dados.exercicios.some((ex) => !ex.nome?.trim());
    const semSeries = dados.exercicios.some((ex) => !(Number(ex.series) > 0));
    if (semNome) erros.exercicios = "Todo exercício precisa de um nome.";
    else if (semSeries)
      erros.exercicios = "Cada exercício precisa de pelo menos 1 série.";
  }
  return erros;
}

// Normaliza os exercícios antes de salvar
export function limparExercicios(exercicios) {
  return exercicios.map((ex) => ({
    id: ex.id || gerarId(),
    nome: ex.nome.trim(),
    series: Math.max(1, Math.min(20, parseInt(ex.series, 10) || 1)),
    repeticoes: String(ex.repeticoes ?? "").trim() || "10",
    carga: String(ex.carga ?? "").trim(),
    descanso: Math.max(0, Math.min(600, parseInt(ex.descanso, 10) || 0)),
  }));
}
