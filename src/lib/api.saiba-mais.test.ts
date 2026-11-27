/**
 * A chamada ao "Saiba mais" na API.
 *
 * Duas promessas que quebrariam em silêncio: a página continuar estática (a
 * chamada não pode passar por `connection()`) e uma resposta fora do contrato
 * contar como falha, e não como "nenhuma seção" — senão uma API quebrada
 * apagaria o texto das três páginas.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const connection = vi.fn().mockResolvedValue(undefined);
vi.mock("next/server", () => ({ connection: () => connection() }));

const { buscarSaibaMais, ErroDaApi } = await import("@/lib/api");

function respondeCom(status: number, corpo: unknown) {
  const fetch = vi.fn().mockResolvedValue({
    status,
    ok: status >= 200 && status < 300,
    json: async () => corpo,
  });
  vi.stubGlobal("fetch", fetch);
  return fetch;
}

const RESPOSTA = {
  subgrupos: [
    { slug: "casa-azul", nome: "Casa Azul", secoes: [] },
    { slug: "economia-solidaria", nome: "Economia Solidária", secoes: [] },
    { slug: "ites-ifrj", nome: "ITES/IFRJ", secoes: [] },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe("buscarSaibaMais", () => {
  it("busca a listagem com ISR de 5 minutos e tempo-limite", async () => {
    const fetch = respondeCom(200, RESPOSTA);

    expect(await buscarSaibaMais()).toEqual(RESPOSTA);

    const [url, opcoes] = fetch.mock.calls[0];
    expect(url).toBe("http://localhost:8001/api/saiba-mais/");
    expect(opcoes.next).toEqual({ revalidate: 300 });
    expect(opcoes.signal).toBeInstanceOf(AbortSignal);
  });

  it("não chama connection(): as páginas dos subgrupos continuam estáticas", async () => {
    respondeCom(200, RESPOSTA);

    await buscarSaibaMais();

    expect(connection).not.toHaveBeenCalled();
  });

  it.each([404, 500, 503])("lança ErroDaApi quando a API responde %i", async (status) => {
    respondeCom(status, {});

    await expect(buscarSaibaMais()).rejects.toBeInstanceOf(ErroDaApi);
  });

  it.each([
    ["sem a lista", {}],
    ["lista que não é lista", { subgrupos: "x" }],
    ["corpo nulo", null],
  ])("resposta fora do contrato (%s) conta como falha", async (_, corpo) => {
    respondeCom(200, corpo);

    await expect(buscarSaibaMais()).rejects.toBeInstanceOf(ErroDaApi);
  });

  it("deixa passar a falha de rede, para quem chama decidir", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fetch failed")));

    await expect(buscarSaibaMais()).rejects.toThrow("fetch failed");
  });
});
