import {
  BookOpen,
  BrainCircuit,
  Check,
  GraduationCap,
  Grid2X2,
  HelpCircle,
  Sparkles,
} from "lucide-react";

export function ProjectPreview({
  id,
  compact = false,
}: {
  id: string;
  compact?: boolean;
}) {
  if (id === "sandbox")
    return (
      <div className="sandbox-preview">
        <div className="window-bar" aria-hidden="true">
          <span />
          <span />
          <span />
          <p>sandbox / vida contínua</p>
        </div>
        <img
          src="/images/sandbox.png"
          width="1280"
          height="720"
          alt="Captura real do SANDBOX: cenário de bairro, saldo da simulação e controles de decisão e passagem do tempo."
          loading={compact ? "eager" : "lazy"}
        />
      </div>
    );
  return (
    <div
      className="education-preview"
      role="img"
      aria-label="Representação visual das funcionalidades do Sistema Educacional: quiz, forca, caça-palavras e tutor com IA."
    >
      <div className="education-top">
        <div>
          <GraduationCap size={24} />
          <strong>Espaço de aprendizado</strong>
        </div>
        <span>PYTHON + IA</span>
      </div>
      <div className="education-content">
        <span className="education-eyebrow">CURIOSIDADE EM MOVIMENTO</span>
        <h3>
          Seu próximo
          <br />
          conhecimento começa aqui.
        </h3>
        <p>Uma matéria. Novas descobertas.</p>
        <div className="game-tiles">
          <div>
            <HelpCircle />
            <strong>Quiz</strong>
            <span>Teste o que você sabe</span>
          </div>
          <div>
            <BookOpen />
            <strong>Forca</strong>
            <span>Descubra a palavra</span>
          </div>
          <div>
            <Grid2X2 />
            <strong>Caça-palavras</strong>
            <span>Encontre as conexões</span>
          </div>
        </div>
        <div className="tutor-strip">
          <BrainCircuit />
          <div>
            <strong>Um tutor para cada descoberta.</strong>
            <span>Inteligência artificial como companhia de estudo.</span>
          </div>
          <Sparkles size={18} />
        </div>
        <div className="education-bottom">
          <span>
            <Check size={13} /> Atividades locais
          </span>
          <span>Matérias e dificuldades</span>
        </div>
      </div>
      <span className="illustration-label">
        Representação das funcionalidades · aplicação original em Tkinter
      </span>
    </div>
  );
}
