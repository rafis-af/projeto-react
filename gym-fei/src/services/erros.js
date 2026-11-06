// Erros com mensagem pronta para o usuário (em português).

export class ErroApp extends Error {
  constructor(mensagem, codigo) {
    super(mensagem);
    this.name = "ErroApp";
    this.codigo = codigo;
  }
}

const MENSAGENS = {
  invalid_credentials: "E-mail ou senha incorretos.",
  user_already_exists: "Este e-mail já está cadastrado. Que tal entrar?",
  email_exists: "Este e-mail já está cadastrado. Que tal entrar?",
  weak_password: "A senha precisa ter pelo menos 6 caracteres.",
  email_not_confirmed:
    "Confirme seu e-mail pelo link que enviamos antes de entrar.",
  email_address_invalid: "Digite um e-mail válido.",
  over_email_send_rate_limit:
    "Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.",
  over_request_rate_limit:
    "Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.",
  signup_disabled: "Novos cadastros estão desativados no momento.",
  42501: "Você não tem permissão para fazer isso.",
  PGRST116: "Registro não encontrado.",
};

const SEM_CONEXAO =
  /failed to fetch|network request failed|networkerror|load failed|fetch failed/i;

export function traduzirErro(erro) {
  if (!erro) return "Algo deu errado. Tente novamente.";
  if (erro instanceof ErroApp) return erro.message;

  const codigo = erro.code ?? erro.codigo;
  if (codigo && MENSAGENS[codigo]) return MENSAGENS[codigo];

  const mensagem = String(erro.message ?? erro);
  if (/invalid login credentials/i.test(mensagem))
    return MENSAGENS.invalid_credentials;
  if (/already registered|already exists/i.test(mensagem))
    return MENSAGENS.user_already_exists;
  if (/at least 6 characters|password should/i.test(mensagem))
    return MENSAGENS.weak_password;
  if (/email not confirmed/i.test(mensagem))
    return MENSAGENS.email_not_confirmed;
  if (/invalid format|unable to validate email/i.test(mensagem))
    return MENSAGENS.email_address_invalid;
  if (/rate limit/i.test(mensagem)) return MENSAGENS.over_request_rate_limit;
  if (SEM_CONEXAO.test(mensagem))
    return "Sem conexão com o servidor. Verifique sua internet.";

  // Mensagens lançadas pelas funções SQL (raise exception) já vêm em português
  return mensagem || "Algo deu errado. Tente novamente.";
}
