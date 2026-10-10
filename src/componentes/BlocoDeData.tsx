import { partesDaData } from "@/lib/datas";

/**
 * O dia do evento desenhado como folha de calendário: mês, dia e dia da semana.
 *
 * É só visual, e por isso `aria-hidden`: o leitor de tela lê a data por
 * extenso no `<time>` que o cartão mantém ao lado. Ler "OUT 20 TER" em voz
 * alta não ajudaria ninguém.
 *
 * Com data impossível de ler, não desenha nada — o cartão mostra o texto cru.
 */
export function BlocoDeData({ iso }: { iso: string }) {
  const partes = partesDaData(iso);
  if (!partes) return null;

  return (
    <div
      aria-hidden
      className="w-16 shrink-0 overflow-hidden rounded-lg border border-azul-200 bg-white text-center"
    >
      <span className="block bg-azul py-0.5 text-xs font-bold tracking-wide text-bege">
        {partes.mes}
      </span>
      <span className="block pt-1 font-titulo text-2xl leading-none font-bold text-azul-900">
        {partes.dia}
      </span>
      <span className="block pt-1 pb-1.5 text-xs font-semibold text-dourado-escuro">
        {partes.diaDaSemana}
      </span>
    </div>
  );
}
