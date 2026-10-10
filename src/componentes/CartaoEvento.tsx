import { Clock, MapPin } from "lucide-react";
import Link from "next/link";

import { BlocoDeData } from "@/componentes/BlocoDeData";
import { formatarDataCurta, formatarHorario, partesDaData } from "@/lib/datas";
import type { Evento } from "@/tipos/api";

/**
 * Um evento na agenda.
 *
 * O dia vem em destaque à esquerda, como folha de calendário: quem rola a
 * agenda acha a data sem ler o texto. O bloco é só visual; a data que conta
 * para máquina e leitor de tela é o `<time dateTime={...}>`, que carrega o
 * valor ISO original. É o que permite ao navegador e ao buscador entenderem a
 * data como data — inclusive para gerar o botão "adicionar à agenda" —,
 * enquanto a pessoa lê a versão em português.
 *
 * Data impossível de ler não ganha bloco: o `<time>` volta a aparecer com o
 * texto cru, e um registro estranho não derruba a agenda.
 */
export function CartaoEvento({ evento }: { evento: Evento }) {
  const temBloco = partesDaData(evento.data_inicio) !== null;
  const horario = formatarHorario(evento.data_inicio, evento.data_fim);

  return (
    <article className="flex gap-4 rounded border border-dourado/60 bg-white p-4">
      {temBloco && <BlocoDeData iso={evento.data_inicio} />}

      <div className="min-w-0 flex-1">
        <p className={temBloco ? "sr-only" : "text-sm font-medium text-dourado-escuro"}>
          <time dateTime={evento.data_inicio}>{formatarDataCurta(evento.data_inicio)}</time>
        </p>

        <h3 className="font-titulo text-lg font-bold">
          <Link href={`/eventos/${evento.slug}`} className="text-azul hover:underline">
            {evento.titulo}
          </Link>
        </h3>

        {/* O local aparece antes da descrição: quem olha a agenda decide primeiro
            se consegue chegar, e só depois se interessa pelo conteúdo. */}
        {(horario || evento.local || evento.bairro) && (
          <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-texto/75">
            {horario && (
              <span className="inline-flex items-center gap-1.5">
                <Clock aria-hidden className="size-4 shrink-0 text-dourado-escuro" />
                {horario}
              </span>
            )}
            {(evento.local || evento.bairro) && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin aria-hidden className="size-4 shrink-0 text-dourado-escuro" />
                {[evento.local, evento.bairro].filter(Boolean).join(" · ")}
              </span>
            )}
          </p>
        )}

        {evento.descricao && (
          <p className="mt-2 line-clamp-2 text-texto/85">{evento.descricao}</p>
        )}
      </div>
    </article>
  );
}
