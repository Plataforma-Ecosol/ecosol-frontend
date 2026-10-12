import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";

import { NumerosDaRede } from "@/componentes/NumerosDaRede";

/** Foto da abertura, com o texto alternativo que descreve a cena de verdade. */
export type FotoDaAbertura = {
  imagem: StaticImageData;
  alt: string;
};

/**
 * Abertura da página inicial: título, chamadas, números da rede e a foto.
 *
 * Duas colunas a partir de `md` (texto à esquerda, foto à direita); no celular,
 * uma coluna só, com a foto depois dos números. Sem foto, a abertura fica em
 * uma coluna também no desktop — nada de banco de imagens nem de espaço
 * reservado no ar.
 *
 * A foto chega como prop, e não por import aqui dentro: no Vitest o import de
 * um `.jpg` devolve uma string, e não o objeto (`src`, `width`, `height`) que o
 * `next/image` espera. Assim o teste passa um objeto falso.
 */
export function AberturaDaHome({
  totais,
  foto,
}: {
  totais: { coletivos: number; pontos: number; eventos: number };
  foto?: FotoDaAbertura;
}) {
  return (
    <section
      className={foto ? "grid items-center gap-8 md:grid-cols-2" : "max-w-prose"}
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-dourado-escuro">
            <MapPin aria-hidden className="size-4 shrink-0" />
            Niterói · Casa Paul Singer
          </p>

          {/* O nome da rede continua no `<title>` e na descrição da página
              (`layout.tsx`), que é o que aparece no buscador e no WhatsApp. */}
          <h1 className="text-4xl font-bold leading-tight text-azul-900 md:text-5xl">
            A economia solidária de Niterói{" "}
            <span className="text-azul">em um só lugar</span>
          </h1>

          <p className="max-w-prose text-lg text-texto/85">
            Conheça os coletivos, encontre as feiras e acompanhe a agenda da rede.
          </p>
        </div>

        {/* `Link`, e não `button`: os dois levam para outra página. `min-h-11`
            é o alvo de toque mínimo de 44 px. */}
        <div className="flex flex-wrap gap-3">
          <Link
            href="/coletivos"
            className="inline-flex min-h-11 grow items-center justify-center gap-2 rounded-lg bg-azul px-4 font-semibold text-bege hover:bg-azul-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul sm:grow-0"
          >
            Conhecer os coletivos
            <ArrowRight aria-hidden className="size-4 shrink-0" />
          </Link>
          <Link
            href="/eventos"
            className="inline-flex min-h-11 grow items-center justify-center gap-2 rounded-lg border border-azul-200 bg-white px-4 font-semibold text-azul hover:border-azul focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul sm:grow-0"
          >
            <CalendarDays aria-hidden className="size-4 shrink-0" />
            Ver a agenda
          </Link>
        </div>

        <NumerosDaRede {...totais} />
      </div>

      {foto && (
        // `preload` é o `priority` de antes (Next 16): no desktop a foto é o
        // maior elemento da primeira dobra e vira o LCP. O import estático
        // entrega largura e altura, que reservam o espaço antes de carregar.
        <Image
          src={foto.imagem}
          alt={foto.alt}
          preload
          placeholder="blur"
          sizes="(min-width: 768px) 460px, 100vw"
          className="aspect-[4/3] w-full rounded-2xl rounded-bl-sm object-cover"
        />
      )}
    </section>
  );
}
