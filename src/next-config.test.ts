/**
 * O rewrite que faz o Admin abrir pelo endereço do site (decisão 8.6).
 *
 * Duas coisas quebrariam o login sem erro nenhum no build: o Next tirando a
 * barra do fim de `/admin/login/` (laço de 308/301 com o Django) e um
 * `/api/*` entrando no rewrite (o navegador passaria a falar com a API).
 *
 * `API_URL` é lida quando o módulo carrega, então cada caso define a variável
 * e reimporta o módulo do zero.
 */
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

  it("não repassa /api: o navegador continua sem falar com a API", async () => {
    const config = await configCom(undefined);
    const regras = (await config.rewrites!()) as { source: string }[];

    expect(regras.some((regra) => regra.source.startsWith("/api"))).toBe(false);
  });
});
