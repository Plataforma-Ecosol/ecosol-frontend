/**
 * A homologação não pode ser encontrada por buscador.
 *
 * O propósito do site oficial é ser encontrado — e justamente por isso a
 * homologação não pode: um coletivo de teste no Google, ou a mesma página em
 * dois domínios, prejudica o site de verdade. Uma variável só,
 * `SITE_INDEXAVEL`, controla as duas camadas: o `robots.txt` e o `noindex` do
 * layout.
 *
 * `SITE_INDEXAVEL` é lida quando o módulo carrega, então cada caso define a
 * variável e reimporta o módulo do zero.
 */
import { afterEach, describe, expect, it, vi } from "vitest";

async function robotsCom(valor: string | undefined) {
  vi.resetModules();
  vi.stubEnv("SITE_INDEXAVEL", valor);
  const { default: robots } = await import("@/app/robots");
  return robots();
}

async function metadataCom(valor: string | undefined) {
  vi.resetModules();
  vi.stubEnv("SITE_INDEXAVEL", valor);
  const { metadata } = await import("@/app/layout");
  return metadata;
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("robots", () => {
  it("sem SITE_INDEXAVEL, libera tudo e aponta o sitemap", async () => {
    const regras = await robotsCom(undefined);

    expect(regras.rules).toEqual({ userAgent: "*", allow: "/" });
    expect(regras.sitemap).toBe("http://localhost:3000/sitemap.xml");
  });

  it("com SITE_INDEXAVEL=false, bloqueia tudo e não aponta o sitemap", async () => {
    // Apontar o mapa do site e proibir o acesso é mensagem contraditória.
    const regras = await robotsCom("false");

    expect(regras.rules).toEqual({ userAgent: "*", disallow: "/" });
    expect(regras.sitemap).toBeUndefined();
  });

  it.each(["FALSE", " false "])(
    "aceita %j como não indexável — maiúscula e espaço vêm do painel",
    async (valor) => {
      const regras = await robotsCom(valor);

      expect(regras.rules).toEqual({ userAgent: "*", disallow: "/" });
    },
  );

  it("trata valor inesperado como indexável", async () => {
    // Decisão de `site.ts`: o erro de digitação cai no comportamento de
    // produção. Esconder o site oficial por engano custaria mais que
    // expor uma homologação por um deploy.
    const regras = await robotsCom("nao");

    expect(regras.rules).toEqual({ userAgent: "*", allow: "/" });
  });
});

describe("metadata do layout", () => {
  it("com SITE_INDEXAVEL=false, põe noindex, nofollow em todas as páginas", async () => {
    const metadata = await metadataCom("false");

    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  it("sem SITE_INDEXAVEL, não declara robots", async () => {
    const metadata = await metadataCom(undefined);

    expect(metadata.robots).toBeUndefined();
  });
});
