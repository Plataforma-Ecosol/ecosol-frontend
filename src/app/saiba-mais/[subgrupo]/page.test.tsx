/**
 * A rota de cada subgrupo do "Saiba mais": só os três existem, cada um com o
 * seu título, o seu canônico e o seu conteúdo.
 *
 * O conteúdo em si é testado nos componentes (`componentes/saiba-mais/`).
 * Aqui se prova que cada slug mostra o bloco certo, e só ele.
 */
import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { SecaoDoSaibaMais } from "@/tipos/api";

// A busca das seções é testada em `lib/saiba-mais.test.ts`. Aqui ela devolve
// `null` (o conteúdo fixo) por padrão, e cada teste pode trocar.
const secoesDoSubgrupo = vi.hoisted(() => vi.fn());
vi.mock("@/lib/saiba-mais", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/saiba-mais")>()),
  secoesDoSubgrupo: (slug: string) => secoesDoSubgrupo(slug),
}));

const {
  default: PaginaDoSubgrupo,
  dynamicParams,
  generateMetadata,
  generateStaticParams,
} = await import("@/app/saiba-mais/[subgrupo]/page");
const { SUBGRUPOS } = await import("@/lib/saiba-mais");
const { IMAGEM_DE_COMPARTILHAMENTO } = await import("@/lib/site");

beforeEach(() => {
  secoesDoSubgrupo.mockReset();
  secoesDoSubgrupo.mockResolvedValue(null);
});

async function renderizar(subgrupo: string) {
  return render(await PaginaDoSubgrupo({ params: Promise.resolve({ subgrupo }) }));
}

describe("Saiba mais — rotas dos subgrupos", () => {
  it("gera as três páginas no build, e nenhuma outra", () => {
    expect(generateStaticParams()).toEqual([
      { subgrupo: "casa-azul" },
      { subgrupo: "economia-solidaria" },
      { subgrupo: "ites-ifrj" },
    ]);
    // Slug fora da lista responde 404 (HU22, cenário 5).
    expect(dynamicParams).toBe(false);
  });

  it("slug desconhecido cai no 404", async () => {
    await expect(
      PaginaDoSubgrupo({ params: Promise.resolve({ subgrupo: "nao-existe" }) }),
    ).rejects.toThrow();
  });

  it.each([
    ["casa-azul", "Casa da Economia Solidária Paul Singer"],
    ["economia-solidaria", "Economia Solidária"],
    ["ites-ifrj", "ITES/IFRJ"],
  ])("%s tem o h1 certo e a trilha de volta para a índice", async (subgrupo, titulo) => {
    await renderizar(subgrupo);

    expect(screen.getByRole("heading", { level: 1, name: titulo })).toBeInTheDocument();
    const trilha = screen.getByRole("navigation", { name: "Trilha de navegação" });
    expect(within(trilha).getByRole("link", { name: "Saiba mais" })).toHaveAttribute(
      "href",
      "/saiba-mais",
    );
  });

  it.each(["casa-azul", "economia-solidaria", "ites-ifrj"])(
    "%s tem a trilha e as pílulas, com nomes diferentes do menu principal",
    async (subgrupo) => {
      await renderizar(subgrupo);

      const nomes = screen
        .getAllByRole("navigation")
        .map((nav) => nav.getAttribute("aria-label"));
      expect(nomes).toEqual(["Trilha de navegação", "Subgrupos do Saiba mais"]);
      expect(nomes).not.toContain("Principal");

      const pilulas = screen.getByRole("navigation", { name: "Subgrupos do Saiba mais" });
      const atual = within(pilulas).getByRole("link", { current: "page" });
      expect(atual).toHaveAttribute("href", `/saiba-mais/${subgrupo}`);
    },
  );

  it("na Casa Azul, o h1 é o nome oficial, e não o apelido", async () => {
    await renderizar("casa-azul");

    expect(screen.queryByRole("heading", { level: 1, name: "Casa Azul" })).toBeNull();
  });

  it("só a Casa Azul tem o contato e o JSON-LD da Organization; todos têm o da trilha", async () => {
    /** Os `@type` dos JSON-LD da página, na ordem do HTML. */
    function tiposDeJsonLd(container: HTMLElement) {
      return [...container.querySelectorAll('script[type="application/ld+json"]')].map(
        (script) => JSON.parse(script.textContent ?? "")["@type"],
      );
    }

    const { container, unmount } = await renderizar("casa-azul");
    expect(document.getElementById("contato")).not.toBeNull();
    expect(tiposDeJsonLd(container).sort()).toEqual(["BreadcrumbList", "Organization"]);
    unmount();

    for (const subgrupo of ["economia-solidaria", "ites-ifrj"]) {
      const outra = await renderizar(subgrupo);
      expect(document.getElementById("contato")).toBeNull();
      expect(tiposDeJsonLd(outra.container)).toEqual(["BreadcrumbList"]);
      outra.unmount();
    }
  });

  it.each(["casa-azul", "economia-solidaria", "ites-ifrj"])(
    "%s mostra as seções que a API devolve para ele",
    async (subgrupo) => {
      const secao: SecaoDoSaibaMais = {
        id: 1, slug: "s", subgrupo, titulo: `Seção do Admin em ${subgrupo}`,
        texto: "Texto.", imagem: null, imagem_descricao: "",
        atualizado_em: "2026-11-20T10:00:00-03:00",
      };
      secoesDoSubgrupo.mockResolvedValue([secao]);

      await renderizar(subgrupo);

      expect(secoesDoSubgrupo).toHaveBeenCalledWith(subgrupo);
      expect(
        screen.getByRole("heading", { level: 2, name: `Seção do Admin em ${subgrupo}` }),
      ).toBeInTheDocument();
    },
  );

  it("a falha da API fora do build sobe, para o Next manter a última página boa", async () => {
    secoesDoSubgrupo.mockRejectedValue(new Error("API fora do ar"));

    await expect(
      PaginaDoSubgrupo({ params: Promise.resolve({ subgrupo: "casa-azul" }) }),
    ).rejects.toThrow("API fora do ar");
  });

  it("a Economia Solidária leva aos coletivos e à agenda", async () => {
    await renderizar("economia-solidaria");

    expect(screen.getByRole("link", { name: "Conheça os coletivos" })).toHaveAttribute(
      "href",
      "/coletivos",
    );
    expect(screen.getByRole("link", { name: "Veja a agenda" })).toHaveAttribute(
      "href",
      "/eventos",
    );
  });

  it("a ITES/IFRJ tem o nome por extenso e o endereço do campus", async () => {
    await renderizar("ites-ifrj");

    expect(
      screen.getByText(/Incubadora Tecnológica de Empreendimentos Solidários/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Estr\. Washington Luís, 1596/)).toBeInTheDocument();
  });
});

describe("Saiba mais — metadados dos subgrupos", () => {
  it.each([
    ["casa-azul", "Casa Azul"],
    ["economia-solidaria", "Economia Solidária"],
    ["ites-ifrj", "ITES/IFRJ"],
  ])("%s tem título e canônico próprios", async (subgrupo, titulo) => {
    const metadados = await generateMetadata({ params: Promise.resolve({ subgrupo }) });

    expect(metadados.title).toBe(titulo);
    expect(metadados.alternates?.canonical).toBe(`/saiba-mais/${subgrupo}`);
  });

  it.each(SUBGRUPOS.map((subgrupo) => [subgrupo.slug, subgrupo]))(
    "%s tem descrição própria e prévia de link com o subgrupo",
    async (slug, { nome, descricao }) => {
      const metadados = await generateMetadata({
        params: Promise.resolve({ subgrupo: slug as string }),
      });

      expect(metadados.description).toBe(descricao);
      expect(metadados.openGraph).toMatchObject({
        title: nome,
        description: descricao,
        url: `/saiba-mais/${slug}`,
        images: [IMAGEM_DE_COMPARTILHAMENTO],
      });
    },
  );

  it("slug desconhecido não ganha metadados", async () => {
    expect(await generateMetadata({ params: Promise.resolve({ subgrupo: "x" }) })).toEqual({});
  });
});
