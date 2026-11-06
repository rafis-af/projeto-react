import { useId } from "react";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";

// Ilustração vetorial do corpo com o grupo muscular do treino em destaque.
// "corpo" mostra a figura inteira; "foco" aproxima na região trabalhada.
const CORPO = "#16253F";
const MUSCULO = "#203758";

const BRILHO = {
  peito: [60, 55, 34],
  costas: [60, 66, 40],
  pernas: [60, 160, 50],
  bracos: [60, 85, 60],
  ombros: [60, 50, 44],
};

const FOCO = {
  peito: "22 22 76 76",
  costas: "22 26 76 76",
  pernas: "18 106 84 104",
  bracos: "4 36 112 90",
  ombros: "14 24 92 64",
};

function Bracos({ cor }) {
  return (
    <G fill={cor}>
      <Rect
        x={24}
        y={57}
        width={11}
        height={28}
        rx={5.5}
        transform="rotate(9, 29.5, 57)"
      />
      <Rect
        x={85}
        y={57}
        width={11}
        height={28}
        rx={5.5}
        transform="rotate(-9, 90.5, 57)"
      />
      <Rect
        x={18}
        y={86}
        width={9.5}
        height={27}
        rx={4.75}
        transform="rotate(13, 22.75, 86)"
      />
      <Rect
        x={92.5}
        y={86}
        width={9.5}
        height={27}
        rx={4.75}
        transform="rotate(-13, 97.25, 86)"
      />
    </G>
  );
}

function Base() {
  return (
    <G fill={CORPO}>
      <Ellipse cx={60} cy={19} rx={10.5} ry={12.5} />
      <Rect x={54} y={29} width={12} height={11} rx={4} />
      <Path d="M40 41 Q60 33 80 41 L84 52 Q83 76 77 100 L43 100 Q37 76 36 52 Z" />
      <Path d="M43 100 L77 100 L80 118 L40 118 Z" />
      <Circle cx={16.5} cy={117} r={4.6} />
      <Circle cx={103.5} cy={117} r={4.6} />
      <Ellipse cx={49} cy={209} rx={7.5} ry={3.8} />
      <Ellipse cx={71} cy={209} rx={7.5} ry={3.8} />
    </G>
  );
}

function Frente({ c }) {
  return (
    <>
      <G fill={c("ombros")}>
        <Ellipse cx={34} cy={49} rx={9} ry={10} />
        <Ellipse cx={86} cy={49} rx={9} ry={10} />
      </G>
      <G fill={c("peito")}>
        <Path d="M59 45 L59 63 Q50 67 42 61 Q39 51 43 45 Q51 42 59 45 Z" />
        <Path d="M61 45 L61 63 Q70 67 78 61 Q81 51 77 45 Q69 42 61 45 Z" />
      </G>
      <G fill={c("abdomen")}>
        {[68, 77, 86].map((y) => (
          <G key={y}>
            <Rect x={51} y={y} width={8} height={7.5} rx={3} />
            <Rect x={61} y={y} width={8} height={7.5} rx={3} />
          </G>
        ))}
      </G>
      <Bracos cor={c("bracos")} />
      <G fill={c("pernas")}>
        <Rect x={41} y={116} width={17} height={46} rx={8.5} />
        <Rect x={62} y={116} width={17} height={46} rx={8.5} />
        <Rect x={43.5} y={166} width={12.5} height={38} rx={6.25} />
        <Rect x={64} y={166} width={12.5} height={38} rx={6.25} />
      </G>
    </>
  );
}

function Costas({ c }) {
  return (
    <>
      <G fill={c("ombros")}>
        <Ellipse cx={34} cy={49} rx={9} ry={10} />
        <Ellipse cx={86} cy={49} rx={9} ry={10} />
      </G>
      <G fill={c("costas")}>
        <Path d="M60 34 L75 44 L60 69 L45 44 Z" />
        <Path d="M44 48 Q38 66 45 90 L57 82 L57 72 L48 50 Z" />
        <Path d="M76 48 Q82 66 75 90 L63 82 L63 72 L72 50 Z" />
        <Rect x={54} y={74} width={12} height={24} rx={5} />
      </G>
      <Bracos cor={c("bracos")} />
      <G fill={c("pernas")}>
        <Ellipse cx={51} cy={110} rx={9} ry={8} />
        <Ellipse cx={69} cy={110} rx={9} ry={8} />
        <Rect x={41} y={119} width={17} height={43} rx={8.5} />
        <Rect x={62} y={119} width={17} height={43} rx={8.5} />
        <Rect x={43.5} y={166} width={12.5} height={38} rx={6.25} />
        <Rect x={64} y={166} width={12.5} height={38} rx={6.25} />
      </G>
    </>
  );
}

export default function MapaMuscular({
  grupo,
  enquadramento = "corpo",
  largura,
  altura,
  estilo,
}) {
  const base = useId().replace(/[^a-zA-Z0-9]/g, "");
  const idDestaque = `destaque${base}`;
  const idBrilho = `brilho${base}`;
  const c = (g) => (g === grupo ? `url(#${idDestaque})` : MUSCULO);
  const [bx, by, br] = BRILHO[grupo] ?? BRILHO.peito;
  const viewBox =
    enquadramento === "foco" ? (FOCO[grupo] ?? FOCO.peito) : "0 0 120 220";

  return (
    <Svg
      width={largura}
      height={altura}
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
      style={estilo}
    >
      <Defs>
        <LinearGradient id={idDestaque} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#8CBBFF" />
          <Stop offset="1" stopColor="#2F6BFF" />
        </LinearGradient>
        <RadialGradient id={idBrilho} cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor="#2F6BFF" stopOpacity={0.55} />
          <Stop offset="1" stopColor="#2F6BFF" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={bx} cy={by} r={br} fill={`url(#${idBrilho})`} />
      <Base />
      {grupo === "costas" ? <Costas c={c} /> : <Frente c={c} />}
    </Svg>
  );
}
