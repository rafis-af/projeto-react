// Catálogo fixo do app: grupos musculares (com sugestões de exercícios),
// objetivos de treino e frases motivacionais.

export const GRUPOS_MUSCULARES = [
  {
    id: "peito",
    nome: "Peito",
    sugestoes: [
      "Supino reto com barra",
      "Supino inclinado com halteres",
      "Supino declinado",
      "Crucifixo com halteres",
      "Peck deck (voador)",
      "Crossover na polia",
      "Flexão de braço",
      "Tríceps na polia (corda)",
    ],
  },
  {
    id: "costas",
    nome: "Costas",
    sugestoes: [
      "Puxada frontal",
      "Barra fixa",
      "Remada curvada com barra",
      "Remada baixa (triângulo)",
      "Remada unilateral com halter",
      "Pulldown com corda",
      "Levantamento terra",
      "Rosca direta com barra",
    ],
  },
  {
    id: "pernas",
    nome: "Pernas",
    sugestoes: [
      "Agachamento livre",
      "Leg press 45°",
      "Cadeira extensora",
      "Mesa flexora",
      "Stiff com halteres",
      "Afundo (passada)",
      "Cadeira abdutora",
      "Panturrilha em pé",
    ],
  },
  {
    id: "bracos",
    nome: "Braços",
    sugestoes: [
      "Rosca direta com barra",
      "Rosca alternada com halteres",
      "Rosca martelo",
      "Rosca concentrada",
      "Tríceps na polia (barra)",
      "Tríceps francês",
      "Tríceps testa",
      "Mergulho no banco",
    ],
  },
  {
    id: "ombros",
    nome: "Ombros",
    sugestoes: [
      "Desenvolvimento com halteres",
      "Desenvolvimento militar",
      "Elevação lateral",
      "Elevação frontal",
      "Crucifixo inverso",
      "Encolhimento com halteres",
      "Abdominal supra",
      "Prancha isométrica",
    ],
  },
];

export const OBJETIVOS = [
  "Hipertrofia",
  "Força",
  "Resistência",
  "Emagrecimento",
  "Condicionamento",
  "Reabilitação",
];

export function obterGrupo(id) {
  return GRUPOS_MUSCULARES.find((g) => g.id === id) ?? GRUPOS_MUSCULARES[0];
}

export const FRASES = [
  {
    texto:
      "O único lugar onde o sucesso vem antes do trabalho é no dicionário.",
    autor: "Vidal Sassoon",
  },
  {
    texto: "A dor que você sente hoje será a força que você sentirá amanhã.",
    autor: "Arnold Schwarzenegger",
  },
  { texto: "Não conte os dias, faça os dias contarem.", autor: "Muhammad Ali" },
  {
    texto: "O sucesso é a soma de pequenos esforços repetidos dia após dia.",
    autor: "Robert Collier",
  },
  {
    texto: "Acredite em si mesmo e todo o resto virá naturalmente.",
    autor: "Elissa Gabbert",
  },
  {
    texto:
      "A única maneira de fazer um excelente trabalho é amar o que você faz.",
    autor: "Steve Jobs",
  },
  { texto: "O corpo alcança o que a mente acredita.", autor: "Napoleon Hill" },
];

// Frase fixa por dia (não muda a cada renderização)
export function fraseDoDia(data = new Date()) {
  const diaDoAno = Math.floor(
    (data - new Date(data.getFullYear(), 0, 0)) / (24 * 60 * 60 * 1000)
  );
  return FRASES[diaDoAno % FRASES.length];
}
