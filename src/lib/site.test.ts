/**
 * `ENDERECO_DA_AREA_DA_EQUIPE` é lida quando o módulo carrega, então cada
 * caso define as variáveis e reimporta o módulo do zero.
 */
import { afterEach, describe, expect, it, vi } from "vitest";

async function enderecoDaAreaDaEquipeCom(env: {
  ADMIN_URL?: string;
  API_URL_PUBLICA?: string;
}) {
  vi.resetModules();
  vi.stubEnv("ADMIN_URL", env.ADMIN_URL);
  vi.stubEnv("API_URL_PUBLICA", env.API_URL_PUBLICA);
  const { ENDERECO_DA_AREA_DA_EQUIPE } = await import("@/lib/site");
  return ENDERECO_DA_AREA_DA_EQUIPE;
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("ENDERECO_DA_AREA_DA_EQUIPE", () => {
  it("sem ADMIN_URL e sem API_URL_PUBLICA, cai no padrão local do backend", async () => {
    const endereco = await enderecoDaAreaDaEquipeCom({});

    expect(endereco).toBe("http://localhost:8001/admin/");
  });

  it("sem ADMIN_URL, usa API_URL_PUBLICA como base", async () => {
    const endereco = await enderecoDaAreaDaEquipeCom({
      API_URL_PUBLICA: "https://api.exemplo.org/",
    });

    expect(endereco).toBe("https://api.exemplo.org/admin/");
  });

  it("com ADMIN_URL, termina em /admin/ sem barra dupla", async () => {
    const endereco = await enderecoDaAreaDaEquipeCom({
      ADMIN_URL: "https://api.exemplo.org/admin",
    });

    expect(endereco).toBe("https://api.exemplo.org/admin/");
  });
});
