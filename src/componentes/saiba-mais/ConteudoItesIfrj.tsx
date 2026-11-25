import { ExternalLink, MapPin } from "lucide-react";

import { AvisoDeNovaAba, NOVA_ABA } from "@/componentes/saiba-mais/comum";

/** Endereço do ITES, no IFRJ Campus Niterói. Crédito do projeto, não contato da Casa. */
const ENDERECO_DO_ITES = "Estr. Washington Luís, 1596 - Sapê, Niterói - RJ, 24315-375";

/**
 * O subgrupo "ITES/IFRJ": quem faz a plataforma.
 *
 * Crédito do projeto e da licença, e não dado da Casa: fica fixo aqui mesmo
 * quando o resto passar a vir do Admin, e sem `<address>`.
 */
export function ConteudoItesIfrj() {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-bold text-azul">Quem faz a plataforma</h2>
      <p className="leading-relaxed text-texto">
        A plataforma é desenvolvida pela ITES, a Incubadora Tecnológica de
        Empreendimentos Solidários do IFRJ Campus Niterói, com apoio do CNPq
        pelo programa PIBITI. É software livre, sob a licença GPLv3, e o código
        está aberto.
      </p>
      <p>
        <a
          href="https://github.com/Plataforma-Ecosol"
          {...NOVA_ABA}
          className="inline-flex min-h-6 items-center gap-1 font-semibold text-azul underline underline-offset-4 hover:text-azul-900"
        >
          Ver o código no GitHub
          <ExternalLink aria-hidden className="size-4" />
          <AvisoDeNovaAba />
        </a>
      </p>
      <p className="flex gap-3 text-texto">
        <MapPin aria-hidden className="mt-0.5 size-5 shrink-0 text-dourado-escuro" />
        <span>
          <span className="sr-only">Endereço do ITES: </span>
          {ENDERECO_DO_ITES}
        </span>
      </p>
    </section>
  );
}
