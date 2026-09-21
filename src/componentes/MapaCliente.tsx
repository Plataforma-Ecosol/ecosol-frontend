"use client";

import dynamic from "next/dynamic";

import type { PontoDeInteresse } from "@/tipos/api";

/**
 * A fronteira entre o servidor e o Leaflet.
 *
 * **Este arquivo existe por uma exigência do Next 16**, e não por gosto de
 * indireção. O Leaflet lê `window` no import, então o mapa precisa ser
 * carregado com `ssr: false` — e `ssr: false` é **proibido em Server
 * Component**: o build falha com "`ssr: false` is not allowed with
 * `next/dynamic` in Server Components".
 *
 * Ou seja: `dynamic(..., { ssr: false })` tem de morar dentro de um componente
 * que já seja de cliente. É o que este invólucro faz, e nada mais. A página
 * `/mapa` continua sendo Server Component e continua entregando a lista dos
 * pontos em HTML.
 *
 * (O PRD desta fatia, na Seção 4.4, mostra a chamada direto da página — texto
 * escrito para uma versão anterior do Next, e que precisa ser corrigido.)
 */
const Mapa = dynamic(() => import("@/componentes/Mapa"), {
  ssr: false,
  // Reserva a mesma altura do mapa. Sem isso o conteúdo abaixo salta quando o
  // mapa termina de carregar, e quem estiver lendo a lista perde o lugar.
  loading: () => (
    <div
      className="h-[28rem] w-full animate-pulse rounded border border-stone-200 bg-stone-100"
      aria-hidden="true"
    />
  ),
});

export function MapaCliente({ pontos }: { pontos: PontoDeInteresse[] }) {
  return <Mapa pontos={pontos} />;
}
