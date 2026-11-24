/**
 * `ENDERECO_DA_AREA_DA_EQUIPE` é lida quando o módulo carrega, então cada
 * caso define as variáveis e reimporta o módulo do zero.
 */
import { afterEach, describe, expect, it, vi } from "vitest";

async function enderecoDaAreaDaEquipeCom(env: {
  ADMIN_URL?: string;
  SITE_URL?: string;
  API_URL_PUBLICA?: string;
}) {
  vi.resetModules();
  vi.stubEnv("ADMIN_URL", env.ADMIN_URL);
  vi.stubEnv("SITE_URL", env.SITE_URL);
  vi.stubEnv("API_URL_PUBLICA", env.API_URL_PUBLICA);
  const { ENDERECO_DA_AREA_DA_EQUIPE } = await import("@/lib/site");
  return ENDERECO_DA_AREA_DA_EQUIPE;
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("ENDERECO_DA_AREA_DA_EQUIPE", () => {
  it("sem ADMIN_URL e sem SITE_URL, cai no /admin/ do Next local", async () => {
    const endereco = await enderecoDaAreaDaEquipeCom({});

    expect(endereco).toBe("http://localhost:3000/admin/");
  });

  it("sem ADMIN_URL, usa o /admin/ do próprio site", async () => {
    // O login só vale na Área da equipe se acontecer pelo endereço do site
    // (rewrite de `/admin/`, decisão 8.6). A API pública não entra na conta.
    const endereco = await enderecoDaAreaDaEquipeCom({
      SITE_URL: "https://site.exemplo.org/",
      API_URL_PUBLICA: "https://api.exemplo.org",
    });

    expect(endereco).toBe("https://site.exemplo.org/admin/");
  });

  it("ADMIN_URL vazia (ARG do Docker sem valor) conta como não definida", async () => {
    const endereco = await enderecoDaAreaDaEquipeCom({
      ADMIN_URL: "",
      SITE_URL: "https://site.exemplo.org",
    });

    expect(endereco).toBe("https://site.exemplo.org/admin/");
  });

  it("com ADMIN_URL, vale ela, terminando em /admin/ sem barra dupla", async () => {
    const endereco = await enderecoDaAreaDaEquipeCom({
      ADMIN_URL: "https://api.exemplo.org/admin",
      SITE_URL: "https://site.exemplo.org",
    });

    expect(endereco).toBe("https://api.exemplo.org/admin/");
  });
});
