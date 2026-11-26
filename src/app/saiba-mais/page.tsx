import { ArrowRight, Mail, Phone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { BotaoCopiar } from "@/componentes/BotaoCopiar";
import { CASA, telefoneDaCasa, temContato } from "@/lib/casa";
import { caminhoDoSubgrupo, SUBGRUPOS } from "@/lib/saiba-mais";

// Sem `openGraph` próprio: declarar um descartaria o do layout, e a prévia
// padrão, com a logo da Casa, é justamente a que esta página deve ter.
export const metadata: Metadata = {
  title: "Saiba mais",
  description:
    "Informações sobre a Casa Paul Singer, a economia solidária em Niterói e a " +
    "ITES/IFRJ, que desenvolve a plataforma.",
  alternates: { canonical: "/saiba-mais" },
};

/**
 * A página índice do "Saiba mais": um cartão para cada subgrupo.
 *
 * **Estática, sem chamada à API.**
 *
 * O contato curto, com `id="contato"`, existe por causa dos links antigos:
 * `/saiba-mais#contato` ficou no rodapé por meses e pode estar salvo fora do
 * site. O fragmento nunca chega ao servidor, então não há como redirecioná-lo.
 * Sem esse `id`, o link antigo abriria a página no topo, sem o contato. O
 * contato completo e oficial mora na página da Casa Azul.
 */
export default function SaibaMais() {
  const telefone = telefoneDaCasa(CASA);
  const contatoCompleto = `${caminhoDoSubgrupo("casa-azul")}#contato`;

  return (
    <article className="space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-azul">Saiba mais</h1>
        <p className="text-lg text-texto">
          Conheça quem está por trás da rede e da plataforma.
        </p>
      </header>

      <ul className="grid gap-4 md:grid-cols-3">
        {SUBGRUPOS.map(({ slug, nome, resumo }) => (
          // O cartão inteiro abre o subgrupo pelo "link esticado": o `::after`
          // do link do nome cobre o `<li>`, que é `relative`. Para o leitor de
          // tela continua um link só, com o nome do subgrupo.
          <li
            key={slug}
            className="relative rounded-xl border border-dourado-200 bg-white p-5 shadow-sm transition-[box-shadow,border-color] duration-200 focus-within:border-azul-300 focus-within:shadow-md focus-within:ring-2 focus-within:ring-azul hover:border-azul-300 hover:shadow-md motion-reduce:transition-none"
          >
            <h2 className="text-xl font-bold">
              <Link
                href={caminhoDoSubgrupo(slug)}
                className="text-azul outline-none after:absolute after:inset-0 hover:underline"
              >
                {nome}
              </Link>
            </h2>
            <p className="mt-2 text-texto">{resumo}</p>
          </li>
        ))}
      </ul>

      {temContato(CASA) && (
        <section
          id="contato"
          className="scroll-mt-4 space-y-4 rounded-xl border border-dourado-200 bg-white p-5"
        >
          <h2 className="text-xl font-bold text-azul">Fale com a Casa</h2>

          {telefone && (
            <div className="flex flex-wrap items-center gap-3 rounded-lg bg-azul-50 px-3 py-2">
              <Phone aria-hidden className="size-5 shrink-0 text-azul" />
              <p>
                <span className="sr-only">Telefone: </span>
                {telefone.discagem ? (
                  <a
                    href={`tel:${telefone.discagem}`}
                    className="font-semibold text-azul-900 tabular-nums underline-offset-4 hover:underline"
                  >
                    {telefone.exibir}
                  </a>
                ) : (
                  <span className="font-semibold text-azul-900 tabular-nums">
                    {telefone.exibir}
                  </span>
                )}
              </p>
              <BotaoCopiar texto={telefone.exibir} rotulo="telefone" />
            </div>
          )}

          {CASA.email && (
            <p className="flex items-center gap-3">
              <Mail aria-hidden className="size-5 shrink-0 text-azul" />
              <a
                href={`mailto:${CASA.email}`}
                className="font-semibold break-all text-azul underline underline-offset-4 hover:text-azul-900"
              >
                {CASA.email}
              </a>
            </p>
          )}

          <p>
            <Link
              href={contatoCompleto}
              className="inline-flex min-h-11 items-center gap-1 font-semibold text-azul underline underline-offset-4 hover:text-azul-900"
            >
              Endereço, horário e redes sociais
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          </p>
        </section>
      )}
    </article>
  );
}
