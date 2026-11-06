import { MODO_DEMO } from "../lib/config";
import * as demoApi from "./demoApi";
import * as supabaseApi from "./supabaseApi";

// As telas conversam só com este objeto. Com o .env configurado ele usa o
// Supabase; sem ele, o modo demonstração (mesmas funções, dados locais).
//
// Autenticação: entrar, cadastrar, sair, aoMudarSessao
// Perfis:       obterPerfil, atualizarNome, verificarCodigo, vincularPersonal,
//               desvincularPersonal, obterPessoa, listarAlunos, removerAluno
// Treinos:      listarTreinosDoPersonal, listarTreinosDoAluno, obterTreino,
//               criarTreino, atualizarTreino, moverParaLixeira, restaurarTreino,
//               excluirTreinoDefinitivo
// Histórico:    registrarConclusao, listarHistorico
export const api = MODO_DEMO ? demoApi : supabaseApi;
