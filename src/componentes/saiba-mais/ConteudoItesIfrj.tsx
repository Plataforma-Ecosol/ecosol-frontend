import { ExternalLink, MapPin } from "lucide-react";

import { AvisoDeNovaAba, NOVA_ABA } from "@/componentes/saiba-mais/comum";
import { SecoesDoSaibaMais } from "@/componentes/saiba-mais/SecoesDoSaibaMais";
import type { SecaoDoSaibaMais } from "@/tipos/api";

/** Endereço do ITES, no IFRJ Campus Niterói. Crédito do projeto, não contato da Casa. */
const ENDERECO_DO_ITES = "Estr. Washington Luís, 1596 - Sapê, Niterói - RJ, 24315-375";

/**
 * O subgrupo "ITES/IFRJ": as seções do Admin e quem faz a plataforma.
 *
 * O bloco "Quem faz a plataforma" é crédito do projeto e da licença, e não
 * texto editorial: fica fixo, com ou sem a API, e sem `<address>`. As seções
 * publicadas no Admin vêm antes dele. Com `secoes` nulo (API fora do ar no
 * build), só o bloco fixo, como antes.
 */
export function ConteudoItesIfrj({ secoes = null }: { secoes?: SecaoDoSaibaMais[] | null }) {
  return (
    <div className="space-y-8">
      {secoes && secoes.length > 0 && <SecoesDoSaibaMais secoes={secoes} />}
      <QuemFazAPlataforma />
    </div>
  );
}

function QuemFazAPlataforma() {
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
