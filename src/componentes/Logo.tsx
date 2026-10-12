import Image from "next/image";
import Link from "next/link";

/**
 * A logo da Casa da Economia Solidária Paul Singer, com link para a home.
 *
 * É o retrato no círculo branco. No cabeçalho, o nome "Casa Paul Singer" vem
 * ao lado (pedido do Jean, revendo o PRD); no rodapé, que já traz o nome
 * completo no texto, só o retrato. O mesmo arquivo de `public/brand/` serve o cabeçalho, o rodapé e,
 * depois, o Django Admin — trocar a logo é trocar o arquivo, sem mexer aqui.
 *
 * **Sem contorno, de propósito.** O PNG é só o círculo, com fundo
 * transparente, e o casaco azul do retrato encosta na borda: sobre o azul do
 * cabeçalho e do rodapé, ele se mistura ao fundo, que é a intenção da Casa.
 *
 * O `alt` é o nome acessível do link: quem usa leitor de tela ouve "Casa da
 * Economia Solidária Paul Singer, link", sem "logo" nem "imagem" repetidos.
 * O nome escrito ao lado fica `aria-hidden`, senão seria lido duas vezes.
 */

const ALT = "Casa da Economia Solidária Paul Singer";

/**
 * Altura da logo em cada lugar. O PNG atual tem 118 px: acima de ~59 px na
 * tela ele borra em telas retina, e nenhum destes chega perto disso.
 */
const TAMANHOS = {
  // 44 px no celular (360 px de largura), 52 px a partir do `sm`: o mesmo
  // espaço que a logo ocupava quando tinha o anel bege em volta.
  cabecalho: { px: 52, classe: "h-11 w-11 sm:h-13 sm:w-13" },
  rodape: { px: 40, classe: "h-10 w-10" },
} as const;

export default function Logo({ lugar }: { lugar: keyof typeof TAMANHOS }) {
  const { px, classe } = TAMANHOS[lugar];

  return (
    <Link href="/" className="inline-flex shrink-0 items-center gap-3 rounded-md">
      <Image
        src="/brand/logo.png"
        alt={ALT}
        width={px}
        height={px}
        className={classe}
        // Só o cabeçalho está na primeira dobra de toda página. No Next 16 é
        // `preload`: o `priority` que o PRD cita foi descontinuado.
        preload={lugar === "cabecalho"}
      />
      {lugar === "cabecalho" && (
        <span aria-hidden className="font-semibold sm:text-lg">
          Casa Paul Singer
        </span>
      )}
    </Link>
  );
}
