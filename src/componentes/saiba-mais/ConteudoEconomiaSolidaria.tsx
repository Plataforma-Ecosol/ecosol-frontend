import Link from "next/link";

import { SecoesDoSaibaMais } from "@/componentes/saiba-mais/SecoesDoSaibaMais";
import { Button } from "@/componentes/ui/button";
import { CASA } from "@/lib/casa";
import type { SecaoDoSaibaMais } from "@/tipos/api";

/**
 * O subgrupo "Economia Solidária": o que é a Rede de Economia Solidária de
 * Niterói, com os caminhos para os coletivos e a agenda.
 *
 * O texto vem das seções publicadas no Admin. Com `secoes` nulo (API fora do
 * ar no build), vale o texto fixo de `lib/casa.ts`. Os botões são navegação,
 * e não texto editorial: ficam fixos nos dois casos.
 */
export function ConteudoEconomiaSolidaria({
  secoes = null,
}: {
  secoes?: SecaoDoSaibaMais[] | null;
}) {
  return (
    <div className="space-y-4">
      {secoes ? (
        secoes.length > 0 && <SecoesDoSaibaMais secoes={secoes} />
      ) : (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-azul">
            A Rede de Economia Solidária de Niterói
          </h2>
          {CASA.sobre_a_rede && (
            <p className="text-lg leading-relaxed whitespace-pre-line text-texto">
              {CASA.sobre_a_rede}
            </p>
          )}
        </section>
      )}
      {/* Os botões ficam mesmo sem o texto: quem chegou pelo "Saiba mais"
          precisa de um caminho para continuar no site. */}
      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link href="/coletivos">Conheça os coletivos</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/eventos">Veja a agenda</Link>
        </Button>
      </div>
    </div>
  );
}
