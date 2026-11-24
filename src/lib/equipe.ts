/**
 * Guarda das páginas da Área da equipe (`/equipe/...`).
 *
 * Quem autoriza é o Django (`buscarUsuarioDaEquipe`, em `lib/api.ts`). Este
 * módulo só traduz a resposta em navegação: sem sessão de equipe, a pessoa vai
 * para o login do Admin, que abre por este mesmo site (rewrite de `/admin/`).
 */
import { redirect } from "next/navigation";

import { buscarUsuarioDaEquipe, type UsuarioDaEquipe } from "@/lib/api";

/**
 * Chamada no topo de toda página de `/equipe`. Sem sessão de equipe, manda
 * para o login do Admin, que devolve a pessoa a `voltarPara` depois.
 *
 * Fica na página, e não num layout: o layout não roda de novo a cada
 * navegação, e a checagem precisa valer em toda requisição.
 */
export async function exigirEquipe(voltarPara: string): Promise<UsuarioDaEquipe> {
  const usuario = await buscarUsuarioDaEquipe();
  if (!usuario) redirect(`/admin/login/?next=${encodeURIComponent(voltarPara)}`);
  return usuario;
}
