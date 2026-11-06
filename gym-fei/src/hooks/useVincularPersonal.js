import { useAuth } from "../context/AuthContext";
import { useFeedback } from "../context/FeedbackContext";
import { api } from "../services/api";

// Abre o diálogo para o aluno digitar o código do personal (Início, Treinos e Perfil)
export function useVincularPersonal() {
  const { atualizarPerfil } = useAuth();
  const { pedirTexto, toast } = useFeedback();
  return () =>
    pedirTexto({
      titulo: "Vincular ao personal",
      mensagem: "Digite o código de 6 caracteres que o seu personal enviou.",
      rotulo: "Código do personal",
      placeholder: "Ex.: GF7K2P",
      icone: "ticket",
      textoConfirmar: "Vincular",
      autoCapitalize: "characters",
      autoCorrect: false,
      maxLength: 6,
      aoConfirmar: async (codigo) =>
        atualizarPerfil(await api.vincularPersonal(codigo)),
    }).then(
      (ok) =>
        ok && toast("Pronto! Agora você recebe os treinos do seu personal.")
    );
}
