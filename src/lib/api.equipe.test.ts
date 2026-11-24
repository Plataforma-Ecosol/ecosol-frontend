/**
 * A fronteira da equipe em `lib/api.ts`.
 *
 * O que quebraria em silêncio, e por isso tem teste: uma resposta de quem está
 * logado guardada em cache (e servida a outra pessoa), um cookie do navegador
 * além do `sessionid` vazando para o Django, e um 403 virando tela de erro em
 * vez de "não é da equipe".
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const cookiesDoNavegador = new Map<string, string>();

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (nome: string) =>
      cookiesDoNavegador.has(nome)
        ? { name: nome, value: cookiesDoNavegador.get(nome) }
        : undefined,
  }),
}));

const { ErroDaApi, buscarUsuarioDaEquipe } = await import("@/lib/api");

function respondeCom(status: number, corpo: unknown = {}) {
  const fetch = vi.fn().mockResolvedValue(
    new Response(JSON.stringify(corpo), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
  vi.stubGlobal("fetch", fetch);
  return fetch;
}

beforeEach(() => {
  cookiesDoNavegador.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("buscarUsuarioDaEquipe", () => {
  it("sem cookie de sessão, devolve null sem chamar a API", async () => {
    const fetch = respondeCom(200, { nome: "Ana" });

    expect(await buscarUsuarioDaEquipe()).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each([401, 403])("com %i, devolve null (não é da equipe)", async (status) => {
    cookiesDoNavegador.set("sessionid", "abc");
    respondeCom(status, { detail: "..." });

    expect(await buscarUsuarioDaEquipe()).toBeNull();
  });

  it("com 200, devolve o nome", async () => {
    cookiesDoNavegador.set("sessionid", "abc");
    respondeCom(200, { nome: "Ana" });

    expect(await buscarUsuarioDaEquipe()).toEqual({ nome: "Ana" });
  });

  it("com 500, lança ErroDaApi (cai no error.tsx)", async () => {
    cookiesDoNavegador.set("sessionid", "abc");
    respondeCom(500);

    const erro = await buscarUsuarioDaEquipe().catch((e: unknown) => e);

    expect(erro).toBeInstanceOf(ErroDaApi);
    expect((erro as InstanceType<typeof ErroDaApi>).status).toBe(500);
  });

  it("consulta /api/equipe/eu/ sem cache e repassando só o sessionid", async () => {
    cookiesDoNavegador.set("sessionid", "abc");
    // Outros cookies do navegador não podem chegar ao Django.
    cookiesDoNavegador.set("csrftoken", "xyz");
    cookiesDoNavegador.set("preferencia", "1");
    const fetch = respondeCom(200, { nome: "Ana" });

    await buscarUsuarioDaEquipe();

    expect(fetch).toHaveBeenCalledOnce();
    const [url, opcoes] = fetch.mock.calls[0];
    expect(url).toBe("http://localhost:8001/api/equipe/eu/");
    expect(opcoes).toEqual({
      headers: { cookie: "sessionid=abc" },
      cache: "no-store",
    });
  });
});
