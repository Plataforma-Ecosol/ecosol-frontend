import { X } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/componentes/ui/badge";
import { Button } from "@/componentes/ui/button";
import { comParametros, todos, type ParametrosDaRota } from "@/lib/consulta";
import type { FiltroAtivo } from "@/lib/filtros";

/**
 * Mostra os filtros em vigor, cada um removível.
 *
 * Existe por um motivo concreto: sem estes chips, a única pista de que a
 * listagem está recortada seria a barra de endereço. Quem chega por um link
 * compartilhado não viu o filtro ser aplicado — veria uma lista incompleta
 * achando que é a rede inteira.
 *
 * Serve às duas listagens: quem decide quais filtros existem e o texto de
 * cada chip é `lib/filtros.ts`. Cada chip tira só o seu valor — com duas
 * categorias marcadas, remover uma mantém a outra.
 *
 * "Limpar tudo" só aparece com dois filtros ou mais: com um só, o próprio
 * chip já faz isso. E ele mantém a busca digitada (e, na agenda, a aba) — a
 * busca tem o próprio campo, e quem limpa os filtros não espera perder o que
 * escreveu.
 *
 * Sem contêiner próprio: os chips entram na mesma linha do botão do painel
 * de filtros, que a página monta.
 */
export function FiltrosAtivos({
  filtros,
  parametros,
  rota,
}: {
  filtros: FiltroAtivo[];
  parametros: ParametrosDaRota;
  rota: string;
}) {
  if (filtros.length === 0) return null;

  const semEste = ({ chave, valor }: FiltroAtivo) =>
    comParametros(parametros, {
      [chave]: todos(parametros[chave]).filter((atual) => atual !== valor),
      page: undefined,
    });

  const semNenhum = comParametros(parametros, {
    ...Object.fromEntries(filtros.map(({ chave }) => [chave, undefined])),
    page: undefined,
  });

  return (
    <>
      {filtros.map((filtro) => (
        <Badge key={`${filtro.chave}-${filtro.valor}`} asChild className="pr-1.5">
          <Link href={`${rota}${semEste(filtro)}`}>
            {filtro.rotulo}
            {/* O × é decorativo; quem usa leitor de tela ouve o texto abaixo. */}
            <span
              aria-hidden="true"
              className="flex size-5 items-center justify-center rounded-full bg-bege/20"
            >
              <X className="size-3.5" />
            </span>{" "}
            <span className="sr-only">(remover este filtro)</span>
          </Link>
        </Badge>
      ))}

      {filtros.length >= 2 && (
        <Button asChild variant="link" className="px-2">
          <Link href={`${rota}${semNenhum}`}>Limpar tudo</Link>
        </Button>
      )}
    </>
  );
}
