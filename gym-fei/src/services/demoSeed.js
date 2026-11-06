import { inicioDaSemana, somarDias } from "../utils/datas";

// Dados de exemplo do modo demonstração. As datas são relativas a "agora",
// então os gráficos sempre mostram uma rotina recente.

export const CONTAS_DEMO = {
  personal: { email: "personal@gymfei.app", senha: "123456" },
  aluno: { email: "aluno@gymfei.app", senha: "123456" },
};

const ex = (id, nome, series, repeticoes, carga, descanso) => ({
  id,
  nome,
  series,
  repeticoes,
  carga,
  descanso,
});

function treinosIniciais(agora) {
  const criado = somarDias(agora, -45).toISOString();
  const base = {
    personalId: "demo-personal",
    deletado: false,
    deletadoEm: null,
    criadoEm: criado,
    atualizadoEm: criado,
  };
  return [
    {
      ...base,
      id: "demo-treino-a",
      alunoId: "demo-ana",
      nome: "Treino A · Peito e tríceps",
      grupoMuscular: "peito",
      objetivo: "Hipertrofia",
      observacoes: "Controle a descida em 3 segundos no supino.",
      exercicios: [
        ex("a1", "Supino reto com barra", 4, "10", "40", 90),
        ex("a2", "Supino inclinado com halteres", 3, "12", "18", 75),
        ex("a3", "Peck deck (voador)", 3, "12", "35", 60),
        ex("a4", "Crossover na polia", 3, "15", "15", 60),
        ex("a5", "Tríceps na polia (corda)", 3, "12", "20", 60),
        ex("a6", "Tríceps francês", 3, "10", "12", 60),
      ],
    },
    {
      ...base,
      id: "demo-treino-b",
      alunoId: "demo-ana",
      nome: "Treino B · Costas e bíceps",
      grupoMuscular: "costas",
      objetivo: "Hipertrofia",
      observacoes: "",
      exercicios: [
        ex("b1", "Puxada frontal", 4, "10", "45", 90),
        ex("b2", "Remada curvada com barra", 4, "10", "35", 90),
        ex("b3", "Remada baixa (triângulo)", 3, "12", "40", 75),
        ex("b4", "Pulldown com corda", 3, "15", "25", 60),
        ex("b5", "Rosca direta com barra", 3, "12", "20", 60),
        ex("b6", "Rosca martelo", 3, "12", "10", 60),
      ],
    },
    {
      ...base,
      id: "demo-treino-c",
      alunoId: "demo-ana",
      nome: "Treino C · Pernas completo",
      grupoMuscular: "pernas",
      objetivo: "Força",
      observacoes: "Aqueça 5 minutos na bike antes de começar.",
      exercicios: [
        ex("c1", "Agachamento livre", 4, "8", "50", 120),
        ex("c2", "Leg press 45°", 4, "12", "120", 90),
        ex("c3", "Cadeira extensora", 3, "15", "40", 60),
        ex("c4", "Mesa flexora", 3, "12", "35", 60),
        ex("c5", "Stiff com halteres", 3, "12", "16", 75),
        ex("c6", "Panturrilha em pé", 4, "20", "60", 45),
      ],
    },
    {
      ...base,
      id: "demo-treino-d",
      alunoId: "demo-ana",
      nome: "Treino D · Ombros e abdômen",
      grupoMuscular: "ombros",
      objetivo: "Resistência",
      observacoes: "",
      exercicios: [
        ex("d1", "Desenvolvimento com halteres", 4, "10", "14", 75),
        ex("d2", "Elevação lateral", 4, "15", "8", 45),
        ex("d3", "Elevação frontal", 3, "12", "8", 45),
        ex("d4", "Crucifixo inverso", 3, "15", "6", 45),
        ex("d5", "Abdominal supra", 3, "20", "", 30),
        ex("d6", "Prancha isométrica", 3, "45s", "", 30),
      ],
    },
    {
      ...base,
      id: "demo-treino-e",
      alunoId: "demo-bruno",
      nome: "Braços · Bíceps e tríceps",
      grupoMuscular: "bracos",
      objetivo: "Hipertrofia",
      observacoes: "",
      exercicios: [
        ex("e1", "Rosca direta com barra", 4, "10", "25", 60),
        ex("e2", "Rosca alternada com halteres", 3, "12", "12", 60),
        ex("e3", "Tríceps testa", 4, "10", "20", 60),
        ex("e4", "Mergulho no banco", 3, "15", "", 45),
      ],
    },
    {
      ...base,
      id: "demo-treino-f",
      alunoId: "demo-bruno",
      nome: "Peito · Força",
      grupoMuscular: "peito",
      objetivo: "Força",
      observacoes: "",
      exercicios: [
        ex("f1", "Supino reto com barra", 5, "5", "70", 150),
        ex("f2", "Supino inclinado com halteres", 4, "8", "26", 90),
        ex("f3", "Flexão de braço", 3, "falha", "", 60),
      ],
    },
    {
      ...base,
      id: "demo-treino-g",
      alunoId: "demo-julia",
      nome: "Pernas e glúteos",
      grupoMuscular: "pernas",
      objetivo: "Emagrecimento",
      observacoes:
        "Mantenha o descanso curto para elevar a frequência cardíaca.",
      exercicios: [
        ex("g1", "Afundo (passada)", 3, "12", "8", 45),
        ex("g2", "Cadeira abdutora", 3, "15", "30", 45),
        ex("g3", "Leg press 45°", 3, "15", "60", 60),
        ex("g4", "Stiff com halteres", 3, "12", "10", 45),
      ],
    },
    {
      ...base,
      id: "demo-treino-h",
      alunoId: "demo-bruno",
      nome: "Costas · antigo",
      grupoMuscular: "costas",
      objetivo: "Hipertrofia",
      observacoes: "",
      deletado: true,
      deletadoEm: somarDias(agora, -3).toISOString(),
      exercicios: [
        ex("h1", "Puxada frontal", 3, "12", "40", 60),
        ex("h2", "Remada unilateral com halter", 3, "12", "18", 60),
      ],
    },
  ];
}

// Gera sessões concluídas nas últimas semanas, alternando os treinos
function historicoInicial(agora, treinos) {
  const registros = [];
  const rotina = [
    {
      aluno: "demo-ana",
      treinos: [
        "demo-treino-a",
        "demo-treino-b",
        "demo-treino-c",
        "demo-treino-d",
      ],
      semanas: [
        [0, 2, 4],
        [1, 3],
        [0, 2, 3, 5],
        [2],
        [0, 1, 3, 4],
        [0, 2, 4],
        [0, 1],
      ],
    },
    {
      aluno: "demo-bruno",
      treinos: ["demo-treino-e", "demo-treino-f"],
      semanas: [[], [1], [0, 3], [2, 4], [1], [0, 3], [1]],
    },
    {
      aluno: "demo-julia",
      treinos: ["demo-treino-g"],
      semanas: [[], [], [], [], [2], [1, 4], []],
    },
  ];
  const semanaAtual = inicioDaSemana(agora);

  rotina.forEach(({ aluno, treinos: ids, semanas }) => {
    let indice = 0;
    semanas.forEach((dias, s) => {
      const inicio = somarDias(semanaAtual, -7 * (semanas.length - 1 - s));
      dias.forEach((dia, k) => {
        const data = somarDias(inicio, dia);
        data.setHours(
          7 + ((s + k) % 3) * 5,
          10 + ((s * 7 + k * 13) % 40),
          0,
          0
        );
        if (data >= agora) return;
        const treino = treinos.find((t) => t.id === ids[indice % ids.length]);
        indice += 1;
        const total = treino.exercicios.reduce((soma, e) => soma + e.series, 0);
        registros.push({
          id: `demo-hist-${aluno}-${s}-${k}`,
          alunoId: aluno,
          treinoId: treino.id,
          nomeTreino: treino.nome,
          grupoMuscular: treino.grupoMuscular,
          quantidadeExercicios: treino.exercicios.length,
          seriesConcluidas: total,
          totalSeries: total,
          duracaoSegundos: (38 + ((s * 11 + k * 7) % 27)) * 60,
          concluidoEm: data.toISOString(),
        });
      });
    });
  });
  return registros.sort(
    (a, b) => new Date(b.concluidoEm) - new Date(a.concluidoEm)
  );
}

export function criarBancoDemo(agora = new Date()) {
  const criadoEm = somarDias(agora, -60).toISOString();
  const treinos = treinosIniciais(agora);
  return {
    usuarios: [
      {
        id: "demo-personal",
        email: CONTAS_DEMO.personal.email,
        senha: CONTAS_DEMO.personal.senha,
      },
      {
        id: "demo-ana",
        email: CONTAS_DEMO.aluno.email,
        senha: CONTAS_DEMO.aluno.senha,
      },
      { id: "demo-bruno", email: "bruno@gymfei.app", senha: "123456" },
      { id: "demo-julia", email: "julia@gymfei.app", senha: "123456" },
    ],
    perfis: [
      {
        id: "demo-personal",
        nome: "Carlos Mendes",
        email: CONTAS_DEMO.personal.email,
        tipo: "personal",
        personalId: null,
        codigoConvite: "GF7K2P",
        criadoEm,
      },
      {
        id: "demo-ana",
        nome: "Ana Souza",
        email: CONTAS_DEMO.aluno.email,
        tipo: "aluno",
        personalId: "demo-personal",
        codigoConvite: null,
        criadoEm,
      },
      {
        id: "demo-bruno",
        nome: "Bruno Lima",
        email: "bruno@gymfei.app",
        tipo: "aluno",
        personalId: "demo-personal",
        codigoConvite: null,
        criadoEm,
      },
      {
        id: "demo-julia",
        nome: "Júlia Costa",
        email: "julia@gymfei.app",
        tipo: "aluno",
        personalId: "demo-personal",
        codigoConvite: null,
        criadoEm,
      },
    ],
    treinos,
    historico: historicoInicial(agora, treinos),
  };
}
