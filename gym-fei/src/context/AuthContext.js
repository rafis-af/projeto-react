import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { api } from "../services/api";
import { ErroApp, traduzirErro } from "../services/erros";

// Guarda quem está logado (sessão) e o perfil (nome, tipo personal/aluno...).
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [sessao, setSessao] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [iniciando, setIniciando] = useState(true);
  const [erroPerfil, setErroPerfil] = useState(null);
  const perfilCarregadoDe = useRef(null);

  const carregarPerfil = useCallback(async (usuarioId) => {
    setErroPerfil(null);
    try {
      const dados = await api.obterPerfil(usuarioId);
      if (!dados) throw new ErroApp("Não encontramos o seu perfil.");
      perfilCarregadoDe.current = usuarioId;
      setPerfil(dados);
    } catch (erro) {
      setErroPerfil(traduzirErro(erro));
    } finally {
      setIniciando(false);
    }
  }, []);

  useEffect(() => {
    const cancelar = api.aoMudarSessao((novaSessao) => {
      setSessao(novaSessao);
      if (!novaSessao) {
        perfilCarregadoDe.current = null;
        setPerfil(null);
        setErroPerfil(null);
        setIniciando(false);
        return;
      }
      // Renovação de token: mesmo usuário, não precisa buscar o perfil de novo
      if (perfilCarregadoDe.current === novaSessao.user.id) return;
      // Fora do callback, como recomenda a documentação do Supabase
      setTimeout(() => carregarPerfil(novaSessao.user.id), 0);
    });
    return cancelar;
  }, [carregarPerfil]);

  const valor = useMemo(
    () => ({
      sessao,
      perfil,
      iniciando,
      erroPerfil,
      entrar: (dados) => api.entrar(dados),
      cadastrar: (dados) => api.cadastrar(dados),
      sair: () => api.sair(),
      atualizarPerfil: setPerfil,
      recarregarPerfil: () => sessao && carregarPerfil(sessao.user.id),
    }),
    [sessao, perfil, iniciando, erroPerfil, carregarPerfil]
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto)
    throw new Error("useAuth precisa estar dentro de <AuthProvider>");
  return contexto;
}
