/**
 * O rewrite que faz o Admin abrir pelo endereço do site (decisão 8.6).
 *
 * Duas coisas quebrariam o login sem erro nenhum no build: o Next tirando a
 * barra do fim de `/admin/login/` (laço de 308/301 com o Django) e um
 * `/api/*` entrando no rewrite (o navegador passaria a falar com a API).
 *
 * E o inverso: como `skipTrailingSlashRedirect` vale para o site todo, o
 * resto do site precisa continuar tirando a barra, senão cada página passa a
 * existir em dois endereços para o buscador (RNF20).
 *
 * `API_URL` é lida quando o módulo carrega, então cada caso define a variável
 * e reimporta o módulo do zero.
 */
// O matcher e o montador de destino que o próprio Next usa para `redirects()`.
// São internos: se mudarem de lugar num upgrade, este teste quebra alto, que é
// melhor do que aproximar a regra com uma regex escrita à mão.
import { getPathMatch } from "next/dist/shared/lib/router/utils/path-match";
import { prepareDestination } from "next/dist/shared/lib/router/utils/prepare-destination";
import { afterEach, describe, expect, it, vi } from "vitest";

async function configCom(apiUrl: string | undefined) {
  vi.resetModules();
  vi.stubEnv("API_URL", apiUrl);
  const { default: config } = await import("../next.config");
  return config;
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("next.config", () => {
  it("não tira a barra do fim (o Django Admin exige)", async () => {
    const config = await configCom(undefined);

    expect(config.skipTrailingSlashRedirect).toBe(true);
  });

  it("repassa /admin e /static ao Django de API_URL, sem barra dupla", async () => {
    const config = await configCom("https://backend.exemplo/");

    expect(await config.rewrites!()).toEqual([
      { source: "/admin", destination: "https://backend.exemplo/admin/" },
      // Com barra antes da genérica: o `:caminho*` sozinho perde a barra final.
      { source: "/admin/:caminho*/", destination: "https://backend.exemplo/admin/:caminho*/" },
      { source: "/admin/:caminho*", destination: "https://backend.exemplo/admin/:caminho*" },
      { source: "/static/:caminho*", destination: "https://backend.exemplo/static/:caminho*" },
    ]);
  });

  it("sem API_URL, aponta para o Django local", async () => {
    const config = await configCom(undefined);
    const regras = (await config.rewrites!()) as { destination: string }[];

    expect(regras[0].destination).toBe("http://localhost:8001/admin/");
  });

  describe("barra no fim fora do Admin", () => {
    /**
     * Avalia a regra com o mesmo matcher que o Next usa em produção. Devolve o
     * destino do redirecionamento, ou `null` se o caminho não é redirecionado.
     */
    async function redirecionaPara(caminho: string): Promise<string | null> {
      const config = await configCom(undefined);
      const regras = await config.redirects!();
      for (const regra of regras) {
        const casa = getPathMatch(regra.source, { strict: true, removeUnnamedParams: true });
        const params = casa(caminho);
        if (params) {
          return prepareDestination({
            appendParamsToQuery: false,
            destination: regra.destination,
            params,
            query: {},
          }).parsedDestination.pathname;
        }
      }
      return null;
    }

    it("é permanente (308), para o buscador ficar só com o endereço sem barra", async () => {
      const config = await configCom(undefined);
      const regras = await config.redirects!();

      expect(regras.every((regra) => regra.permanent === true)).toBe(true);
    });

    it.each([
      ["/saiba-mais/", "/saiba-mais"],
      ["/coletivos/", "/coletivos"],
      ["/eventos/", "/eventos"],
      ["/mapa/", "/mapa"],
      ["/coletivos/um-slug/", "/coletivos/um-slug"],
      ["/equipe/relatorio/", "/equipe/relatorio"],
      // Só o prefixo exato fica de fora; parecido com "admin" não conta.
      ["/administracao/", "/administracao"],
    ])("tira a barra de %s", async (caminho, destino) => {
      expect(await redirecionaPara(caminho)).toBe(destino);
    });

    it.each([
      // O Django Admin precisa da barra: tirá-la recria o laço de 308/301.
      "/admin",
      "/admin/",
      "/admin/login/",
      "/admin/rede/coletivo/1/change/",
      "/static/admin/css/base.css",
      "/static/admin/",
      "/_next/static/",
      // A raiz e quem já está sem barra não mudam.
      "/",
      "/saiba-mais",
    ])("não redireciona %s", async (caminho) => {
      expect(await redirecionaPara(caminho)).toBeNull();
    });
  });

  it("não repassa /api: o navegador continua sem falar com a API", async () => {
    const config = await configCom(undefined);
    const regras = (await config.rewrites!()) as { source: string }[];

    expect(regras.some((regra) => regra.source.startsWith("/api"))).toBe(false);
  });
});
