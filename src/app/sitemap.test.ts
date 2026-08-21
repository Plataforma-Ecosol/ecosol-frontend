/**
 * O mapa do site lista TUDO, inclusive o que está além da primeira página.
 *
 * É o defeito silencioso deste arquivo: um sitemap que só percorre a primeira
 * página fica válido, o buscador o aceita, e os coletivos de fora
 * simplesmente nunca são indexados. Ninguém percebe olhando o site — só o
 * coletivo que não aparece na busca do Google, meses depois.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Coletivo, Evento, Pagina } from "@/tipos/api";

const listarColetivos = vi.fn();
const listarEventos = vi.fn();
vi.mock("@/lib/api", () => ({
  listarColetivos: (f: unknown) => listarColetivos(f),
  listarEventos: (f: unknown) => listarEventos(f),
}));

const { default: sitemap } = await import("@/app/sitemap");

function coletivo(slug: string): Coletivo {
  return {
    id: 1, nome: slug, slug, descricao: "", bairro: "", site: "", categorias: [],
    criado_em: "2026-08-01T10:00:00-03:00",
    atualizado_em: "2026-08-02T10:00:00-03:00",
  };
}

function evento(slug: string): Evento {
  return {
    id: 1, titulo: slug, slug, descricao: "",
    data_inicio: "2026-09-01T18:00:00-03:00", data_fim: null,
    local: "", bairro: "", link: "", imagens: [],
    criado_em: "2026-08-01T10:00:00-03:00",
    atualizado_em: "2026-08-03T10:00:00-03:00",
  };
}

/** Devolve páginas de verdade, para exercitar o laço de paginação. */
function paginador<T>(itens: T[], porPagina: number) {
  return ({ page = 1 }: { page?: number } = {}): Promise<Pagina<T>> => {
    const inicio = (Number(page) - 1) * porPagina;
    return Promise.resolve({
      count: itens.length,
      next: null,
      previous: null,
      results: itens.slice(inicio, inicio + porPagina),
    });
  };
}

const vazio = () =>
  Promise.resolve({ count: 0, next: null, previous: null, results: [] });

beforeEach(() => {
  vi.clearAllMocks();
  listarColetivos.mockImplementation(vazio);
  listarEventos.mockImplementation(vazio);
});

describe("sitemap", () => {
  it("lista as quatro páginas fixas mesmo sem cadastro nenhum", async () => {
    const mapa = await sitemap();

    expect(mapa.map((e) => e.url)).toEqual([
      "http://localhost:3000/",
      "http://localhost:3000/coletivos",
      "http://localhost:3000/eventos",
      "http://localhost:3000/mapa",
    ]);
  });

  it("percorre TODAS as páginas da API, não só a primeira", async () => {
    // 250 coletivos em páginas de 100: quem parar na primeira lista 100.
    const muitos = Array.from({ length: 250 }, (_, i) => coletivo(`coletivo-${i}`));
    listarColetivos.mockImplementation(paginador(muitos, 100));

    const mapa = await sitemap();
    const deColetivo = mapa.filter((e) => e.url.includes("/coletivos/"));

    expect(deColetivo).toHaveLength(250);
    expect(deColetivo.at(-1)?.url).toBe("http://localhost:3000/coletivos/coletivo-249");
    expect(listarColetivos).toHaveBeenCalledTimes(3);
  });

  it("usa endereços absolutos", async () => {
    // Endereço relativo num sitemap é ignorado pelo buscador, em silêncio.
    listarColetivos.mockImplementation(paginador([coletivo("um")], 100));
    listarEventos.mockImplementation(paginador([evento("outro")], 100));

    const mapa = await sitemap();

    for (const entrada of mapa) {
      expect(entrada.url).toMatch(/^https?:\/\//);
    }
  });

  it("usa `atualizado_em` como data de modificação, e não a data de hoje", async () => {
    // Inventar `new Date()` faria o site inteiro parecer alterado a cada
    // geração, e o sinal de "vale revisitar" perderia o sentido.
    listarColetivos.mockImplementation(paginador([coletivo("sementes")], 100));

    const mapa = await sitemap();
    const entrada = mapa.find((e) => e.url.endsWith("/coletivos/sementes"));

    expect(entrada?.lastModified).toEqual(new Date("2026-08-02T10:00:00-03:00"));
  });

  it("não entra em laço quando `count` e `results` discordam", async () => {
    // Backend defeituoso: promete 999 e entrega página vazia. Sem a guarda, o
    // laço rodaria até o teto e a geração do sitemap travaria a cada visita.
    listarColetivos.mockResolvedValue({
      count: 999, next: null, previous: null, results: [],
    });

    const mapa = await sitemap();

    expect(listarColetivos).toHaveBeenCalledTimes(1);
    expect(mapa.filter((e) => e.url.includes("/coletivos/"))).toHaveLength(0);
  });
});
