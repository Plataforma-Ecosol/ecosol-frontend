/**
 * Todo link compartilhado tem prévia com imagem.
 *
 * O `app/opengraph-image.png` vale sozinho para as páginas que não declaram
 * `openGraph`. Uma página que declara SUBSTITUI o do layout por inteiro, imagem
 * inclusive — e foi assim que o perfil do coletivo e o evento sem cartaz, os
 * links que mais circulam no WhatsApp, ficaram sem prévia. Nada no site mostra
 * esse defeito: só aparece quando alguém cola o link numa conversa.
 */
import { describe, expect, it, vi } from "vitest";

import type { Coletivo, Evento } from "@/tipos/api";

const coletivo: Coletivo = {
  id: 1, nome: "Sementes do Vale", slug: "sementes-do-vale", descricao: "",
  bairro: "", site: "", categorias: [],
  criado_em: "2026-08-01T10:00:00-03:00", atualizado_em: "2026-08-02T10:00:00-03:00",
};

function evento(imagens: Evento["imagens"]): Evento {
  return {
    id: 1, titulo: "Feira", slug: "feira", descricao: "",
    data_inicio: "2026-10-15T09:00:00-03:00", data_fim: null,
    local: "", bairro: "", link: "", imagens,
    criado_em: "2026-08-01T10:00:00-03:00", atualizado_em: "2026-08-02T10:00:00-03:00",
  };
}

const buscarEvento = vi.fn();
vi.mock("@/lib/api", () => ({
  buscarColetivo: () => Promise.resolve(coletivo),
  buscarEvento: () => buscarEvento(),
  urlPublicaDeMidia: (url: string) => url,
}));

const { generateMetadata: metadataDoColetivo } = await import("@/app/coletivos/[slug]/page");
const { generateMetadata: metadataDoEvento } = await import("@/app/eventos/[slug]/page");

const params = Promise.resolve({ slug: "qualquer" });

function imagens(metadata: Awaited<ReturnType<typeof metadataDoColetivo>>) {
  const lista = metadata.openGraph?.images;
  return (Array.isArray(lista) ? lista : [lista]).map((i) =>
    typeof i === "object" && i !== null && "url" in i ? String(i.url) : String(i),
  );
}

describe("prévia de link", () => {
  it("o perfil do coletivo leva a logo da Casa", async () => {
    expect(imagens(await metadataDoColetivo({ params }))).toEqual(["/opengraph-image.png"]);
  });

  it("o evento sem cartaz leva a logo da Casa", async () => {
    buscarEvento.mockResolvedValue(evento([]));

    expect(imagens(await metadataDoEvento({ params }))).toEqual(["/opengraph-image.png"]);
  });

  it("o evento com cartaz continua levando o cartaz, e não a logo", async () => {
    // O cartaz é o que faz alguém parar de rolar o WhatsApp: a logo é só reserva.
    const cartaz = "https://exemplo.supabase.co/storage/v1/object/public/divulgacao/eventos/feira.png";
    buscarEvento.mockResolvedValue(evento([{ id: 1, imagem: cartaz, legenda: "", ordem: 0 }]));

    expect(imagens(await metadataDoEvento({ params }))).toEqual([cartaz]);
  });
});
