export type Project = {
  id: string;
  number: string;
  name: string;
  category: string;
  title: string;
  description: string;
  technologies: string[];
  problem: string;
  solution: string;
  features: { title: string; description: string }[];
};

export const projects: Project[] = [
  {
    id: "sandbox",
    number: "01",
    name: "SANDBOX",
    category: "Simulação · Inteligência artificial",
    title: "Uma vida. Inúmeras possibilidades.",
    description:
      "Um simulador de custo de vida em que cada decisão conta. Finanças, escolhas e inteligência artificial se encontram em uma experiência interativa.",
    technologies: ["JavaScript", "Node.js", "Azure AI"],
    problem:
      "Entender como as escolhas do dia a dia afetam o dinheiro, as dívidas e a construção de uma reserva ao longo do tempo.",
    solution:
      "Uma simulação de vida financeira com decisões interativas e uma análise por IA que interpreta o estado da partida.",
    features: [
      {
        title: "Escolhas com consequências",
        description:
          "Contas, dívidas, investimentos e reserva fazem parte da mesma simulação.",
      },
      {
        title: "Análise da sua vida",
        description:
          "Uma leitura do momento financeiro da partida, integrada à inteligência artificial do Azure.",
      },
      {
        title: "Continuidade da experiência",
        description:
          "Tratamento de respostas incompletas e requisições concorrentes, preservando a análise enquanto a vida continua.",
      },
    ],
  },
  {
    id: "educacional",
    number: "02",
    name: "Sistema Educacional",
    category: "Educação · Aplicação desktop",
    title: "Aprender também pode ser jogar.",
    description:
      "Quiz, forca e caça-palavras em um só lugar. Uma aplicação em Python que aproxima o aprendizado da prática, com um tutor de IA para acompanhar.",
    technologies: ["Python", "Tkinter", "Azure AI Foundry"],
    problem:
      "Tornar o estudo de diferentes matérias mais participativo, com atividades adequadas ao nível de dificuldade escolhido.",
    solution:
      "Uma aplicação desktop que reúne três jogos educacionais, seleção de matérias e dificuldades e um tutor com IA.",
    features: [
      {
        title: "Três formas de aprender",
        description:
          "Quiz, forca e caça-palavras com seleção de matérias e níveis de dificuldade.",
      },
      {
        title: "Tutor com inteligência artificial",
        description:
          "Integração ao Azure AI Foundry para apoiar a experiência de estudo.",
      },
      {
        title: "Aprendizado que continua",
        description:
          "Banco local de atividades quando a IA está indisponível e chamadas assíncronas para manter a interface responsiva.",
      },
    ],
  },
];
