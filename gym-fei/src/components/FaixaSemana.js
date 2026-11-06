import { StyleSheet, View } from "react-native";

import { cores, raio } from "../theme";
import {
  diasDaSemana,
  formatarDataCurta,
  inicioDoDia,
  letraDoDia,
  mesmoDia,
} from "../utils/datas";
import { diasTreinados } from "../utils/estatisticas";
import Icone from "./Icone";
import Texto from "./Texto";

// Semana atual (seg a dom) com os dias em que o aluno treinou.
export default function FaixaSemana({ historico }) {
  const hoje = new Date();
  const dias = diasDaSemana(hoje);
  const treinados = diasTreinados(historico, dias);

  return (
    <View style={estilos.base}>
      {dias.map((dia, i) => {
        const ehHoje = mesmoDia(dia, hoje);
        const feito = treinados[i];
        const futuro = inicioDoDia(dia) > inicioDoDia(hoje);
        return (
          <View
            key={dia.toISOString()}
            style={estilos.dia}
            accessible
            accessibilityLabel={`${formatarDataCurta(dia)}${ehHoje ? ", hoje" : ""}: ${feito ? "treino feito" : "sem treino"}`}
          >
            <Texto variante="pequeno" cor={ehHoje ? "texto" : "textoTerciario"}>
              {letraDoDia(dia)}
            </Texto>
            <View
              style={[
                estilos.circulo,
                feito && estilos.feito,
                ehHoje && !feito && estilos.hoje,
                futuro && estilos.futuro,
              ]}
            >
              {feito ? (
                <Icone nome="check" tamanho={15} cor="#FFFFFF" />
              ) : (
                <Texto
                  variante="legendaForte"
                  cor={ehHoje ? "texto" : "textoTerciario"}
                >
                  {dia.getDate()}
                </Texto>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  base: { flexDirection: "row", justifyContent: "space-between" },
  dia: { alignItems: "center", gap: 6, flex: 1 },
  circulo: {
    width: 36,
    height: 36,
    borderRadius: raio.pilula,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: cores.superficie2,
  },
  feito: { backgroundColor: cores.primaria },
  hoje: {
    borderWidth: 2,
    borderColor: cores.primariaClara,
    backgroundColor: cores.superficie,
  },
  futuro: { opacity: 0.5 },
});
