import Link from "next/link";

import { formatarDataCurta } from "@/lib/datas";
import type { Evento } from "@/tipos/api";

/**
 * Um evento na agenda.
 *
 * O `<time dateTime={...}>` carrega o valor ISO original. É o que permite ao
 * navegador e ao buscador entenderem a data como data — inclusive para gerar o
 * botão "adicionar à agenda" —, enquanto a pessoa lê a versão em português.
 */
export function CartaoEvento({ evento }: { evento: Evento }) {
  return (
    <article className="rounded border border-stone-200 bg-white p-4">
      <p className="text-sm font-medium text-emerald-800">
        <time dateTime={evento.data_inicio}>{formatarDataCurta(evento.data_inicio)}</time>
      </p>

      <h3 className="mt-1 text-lg font-medium">
        <Link href={`/eventos/${evento.slug}`} className="hover:underline">
          {evento.titulo}
        </Link>
      </h3>

      {/* O local aparece antes da descrição: quem olha a agenda decide primeiro
          se consegue chegar, e só depois se interessa pelo conteúdo. */}
      {(evento.local || evento.bairro) && (
        <p className="mt-1 text-sm text-stone-600">
          {[evento.local, evento.bairro].filter(Boolean).join(" · ")}
        </p>
      )}

      {evento.descricao && (
        <p className="mt-2 line-clamp-2 text-stone-700">{evento.descricao}</p>
      )}
    </article>
  );
}
