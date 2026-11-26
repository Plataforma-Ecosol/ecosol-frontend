import Link from "next/link";

import { Button } from "@/componentes/ui/button";
import { CASA } from "@/lib/casa";

/**
 * O subgrupo "Economia Solidária": o que é a Rede de Economia Solidária de
 * Niterói, com os caminhos para os coletivos e a agenda.
 */
export function ConteudoEconomiaSolidaria() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-azul">
        A Rede de Economia Solidária de Niterói
      </h2>
      {CASA.sobre_a_rede && (
        <p className="text-lg leading-relaxed whitespace-pre-line text-texto">
          {CASA.sobre_a_rede}
        </p>
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
    </section>
  );
}
