import type { Metadata } from "next";

import { exigirEquipe } from "@/lib/equipe";

export const metadata: Metadata = {
  title: "Relatório da equipe",
  // Sempre fora do buscador, em qualquer ambiente.
  robots: { index: false, follow: false },
};

/**
 * Relatório de coletivos da Área da equipe, só para quem tem sessão de equipe
 * no Django Admin (`is_staff`).
 *
 * Por ora só a saudação, que prova o login valendo aqui (spike backend#24). Os
 * indicadores entram nesta mesma página no frontend#67; os estados próprios do
 * Relatório (carregando, vazio, erro), no frontend#70. Se o Django estiver fora
 * do ar, o `ErroDaApi` cai no `error.tsx` da raiz.
 */
export default async function RelatorioDaEquipe() {
  const usuario = await exigirEquipe("/equipe/relatorio");

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold text-azul">Relatório da equipe</h1>
      <p>Olá, {usuario.nome}.</p>
      <p className="text-texto/75">
        Os indicadores dos coletivos chegam aqui no próximo card.
      </p>
    </section>
  );
}
