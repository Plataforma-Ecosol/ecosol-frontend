/**
 * Como a camada de acesso traduz cada resposta da API em comportamento.
 *
 * É a tradução que decide se um coletivo tirado do ar vira 404 de verdade ou
 * página vazia com status 200 — e a diferença não aparece na tela, só no
 * cabeçalho da resposta. Um buscador indexaria a segunda como conteúdo válido.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

// `connection()` interrompe a pré-renderização e só funciona dentro de uma
// requisição real. Fora do Next ele não tem contexto, então a suíte o
// neutraliza — o que se testa aqui é a tradução de status, não o Next.
vi.mock("next/server", () => ({ connection: vi.fn().mockResolvedValue(undefined) }));

// `notFound()` funciona lançando uma exceção que o Next intercepta. Aqui ela
// vira espião: o que interessa é SE foi chamada.
const notFound = vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});
vi.mock("next/navigation", () => ({
  notFound: () => notFound(),
}));

const { ErroDaApi, buscarColetivo, listarColetivos, opcoesDeFiltroDeColetivos } = await import(
  "@/lib/api"
);

function respondeCom(status: number, corpo: unknown = {}) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      status,
      ok: status >= 200 && status < 300,
      json: async () => corpo,
    }),
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe("tradução de status", () => {
  it("200 devolve o corpo já tipado", async () => {
    respondeCom(200, { count: 1, next: null, previous: null, results: [] });

    const pagina = await listarColetivos();

    expect(pagina.count).toBe(1);
  });

  it("404 vira notFound(), e não erro", async () => {
    // É o caso do coletivo inativo e o do slug que nunca existiu. Os dois
    // precisam de 404 no cabeçalho — não de tela de erro, nem de 200 vazio.
    respondeCom(404);

    await expect(buscarColetivo("nao-existe")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFound).toHaveBeenCalledOnce();
  });

  it("400 vira erro com mensagem em português", async () => {
    // Filtro inválido na URL. A pessoa precisa entender o que fazer; a
    // mensagem crua da API não ajudaria e poderia expor detalhe interno.
    respondeCom(400);

    await expect(listarColetivos({ categoria: ["texto"] })).rejects.toThrow(ErroDaApi);
    await expect(listarColetivos({ categoria: ["texto"] })).rejects.toThrow(/filtros/i);
    expect(notFound).not.toHaveBeenCalled();
  });

  it("500 vira erro, sem virar 404", async () => {
    // Confundir os dois seria grave: o buscador desindexaria as páginas de uma
    // rede inteira por causa de uma instabilidade passageira do backend.
    respondeCom(500);

    await expect(listarColetivos()).rejects.toThrow(ErroDaApi);
    expect(notFound).not.toHaveBeenCalled();
  });
});

describe("a URL que chega ao backend", () => {
  it("leva os filtros informados", async () => {
    respondeCom(200, { count: 0, next: null, previous: null, results: [] });

    await listarColetivos({ q: "feira", bairro: "Centro" });

    const [url] = vi.mocked(fetch).mock.calls[0];
    expect(String(url)).toContain("q=feira");
    expect(String(url)).toContain("bairro=Centro");
  });

  it("pede cache com revalidação, e não busca a cada requisição", async () => {
    // Sem `revalidate`, cada visita a uma listagem viraria uma consulta ao
    // Django. O cadastro muda algumas vezes por semana.
    respondeCom(200, { count: 0, next: null, previous: null, results: [] });

    await listarColetivos();

    const [, opcoes] = vi.mocked(fetch).mock.calls[0];
    expect(opcoes).toMatchObject({ next: { revalidate: expect.any(Number) } });
  });
});

describe("opções do painel de filtros", () => {
  it("devolve as opções quando a API responde", async () => {
    respondeCom(200, { categorias: [{ id: 1, nome: "Moda", slug: "moda" }], bairros: ["Centro"] });

    expect(await opcoesDeFiltroDeColetivos()).toEqual({
      categorias: [{ id: 1, nome: "Moda", slug: "moda" }],
      bairros: ["Centro"],
    });
  });

  it("404 NÃO vira notFound(): sem opções, a listagem continua de pé", async () => {
    // É o que acontece com o frontend publicado antes do backend que traz o
    // endpoint. Derrubar a listagem por causa do painel seria desproporcional.
    respondeCom(404);

    expect(await opcoesDeFiltroDeColetivos()).toBeNull();
    expect(notFound).not.toHaveBeenCalled();
  });

  it("backend fora do ar também devolve null", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fetch failed")));

    expect(await opcoesDeFiltroDeColetivos()).toBeNull();
  });
});
