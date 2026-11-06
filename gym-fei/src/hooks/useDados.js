import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useRef, useState } from "react";

import { traduzirErro } from "../services/erros";

// Carrega dados para uma tela e recarrega sempre que ela volta a ficar visível
// (ex.: depois de salvar um treino e voltar para a lista).
export function useDados(carregar, dependencias = []) {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState(null);
  const montado = useRef(true);

  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
    };
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const executar = useCallback(async (manual = false) => {
    if (manual) setAtualizando(true);
    try {
      const resultado = await carregar();
      if (montado.current) {
        setDados(resultado);
        setErro(null);
      }
    } catch (e) {
      if (montado.current) setErro(traduzirErro(e));
    } finally {
      if (montado.current) {
        setCarregando(false);
        setAtualizando(false);
      }
    }
  }, dependencias);

  useFocusEffect(
    useCallback(() => {
      executar();
    }, [executar])
  );

  return {
    dados,
    carregando,
    atualizando,
    erro,
    recarregar: () => executar(true),
    definirDados: setDados,
  };
}
