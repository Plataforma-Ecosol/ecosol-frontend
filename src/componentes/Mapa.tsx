"use client";

import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

import type { PontoDeInteresse } from "@/tipos/api";

import "leaflet/dist/leaflet.css";

/**
 * O mapa dos pontos de interesse.
 *
 * Componente de cliente por necessidade, não por escolha: o Leaflet lê `window`
 * no momento do import. Quem garante que ele nunca chegue ao servidor é o
 * `MapaCliente`, que o carrega com `ssr: false`.
 *
 * Nada aqui busca dados. Os pontos chegam prontos, já renderizados também como
 * texto pela página — de modo que a informação existe mesmo para quem não
 * executa JavaScript.
 */

/** Niterói, centro. Enquadramento inicial quando não há ponto para ajustar. */
const CENTRO_DE_NITEROI: [number, number] = [-22.8832, -43.1034];

/**
 * Pino desenhado em HTML, e não a imagem padrão do Leaflet.
 *
 * O ícone padrão resolve o caminho do PNG de um jeito que os empacotadores
 * quebram — o sintoma é um mapa correto com marcadores invisíveis, sem erro
 * no console. Um `divIcon` não depende de arquivo nenhum, então não há o que
 * quebrar.
 *
 * Todo pino é azul com contorno dourado (PRD da paleta): o tipo do ponto
 * aparece no balão e na lista abaixo do mapa, não na cor. As cores vêm das
 * variáveis do `@theme`, e não de hex repetido aqui — o SVG fica fora do
 * Tailwind, mas não fora da paleta. Vão em `style`, e não no atributo `fill`,
 * porque `var()` em atributo de apresentação do SVG não vale em todo navegador.
 */
const PINO = L.divIcon({
  className: "", // sem isto o Leaflet acrescenta a moldura branca dele
  // O viewBox sobra 1,5 de cada lado para o contorno não ser cortado na borda.
  html: `<svg width="26" height="36" viewBox="-1.5 -1.5 29 39" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M13 0C5.8 0 0 5.8 0 13c0 9.7 13 23 13 23s13-13.3 13-23C26 5.8 20.2 0 13 0z" style="fill: var(--color-azul); stroke: var(--color-dourado); stroke-width: 1.5"/>
    <circle cx="13" cy="13" r="5" style="fill: var(--color-bege)"/>
  </svg>`,
  iconSize: [26, 36],
  // A ponta do pino é que marca o lugar, não o centro do desenho.
  iconAnchor: [13, 36],
  popupAnchor: [0, -34],
});

export default function Mapa({ pontos }: { pontos: PontoDeInteresse[] }) {
  // Enquadra todos os pontos. Com um só, `fitBounds` daria zoom máximo — daí
  // o centro fixo nesse caso.
  const limites =
    pontos.length > 1
      ? L.latLngBounds(pontos.map((p) => [p.latitude, p.longitude] as [number, number]))
      : undefined;

  const centro: [number, number] =
    pontos.length === 1 ? [pontos[0].latitude, pontos[0].longitude] : CENTRO_DE_NITEROI;

  return (
    <MapContainer
      bounds={limites}
      boundsOptions={{ padding: [40, 40] }}
      center={limites ? undefined : centro}
      zoom={limites ? undefined : 14}
      scrollWheelZoom={false}
      className="h-[28rem] w-full rounded border border-dourado/60"
    >
      <TileLayer
        // OpenStreetMap: código aberto, custo zero e sem dependência de
        // fornecedor — a atribuição é exigência da licença dos dados.
        attribution='&copy; colaboradores do <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />

      {pontos.map((ponto) => (
        <Marker
          key={ponto.id}
          position={[ponto.latitude, ponto.longitude]}
          icon={PINO}
          title={ponto.nome}
        >
          <Popup>
            <strong className="block text-base">{ponto.nome}</strong>
            <span className="text-texto/75">{ponto.tipo_display}</span>

            {ponto.endereco && <span className="mt-1 block">{ponto.endereco}</span>}

            {/* `coletivo` é `null` tanto para "sem vínculo" quanto para
                "coletivo fora do ar", e os dois casos são indistinguíveis de
                propósito: aqui simplesmente não há bloco de vínculo. */}
            {ponto.coletivo && (
              <a
                href={`/coletivos/${ponto.coletivo.slug}`}
                className="mt-2 block text-azul underline"
              >
                {ponto.coletivo.nome}
              </a>
            )}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
