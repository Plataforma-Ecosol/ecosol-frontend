/**
 * A rota de cada subgrupo do "Saiba mais": só os três existem, cada um com o
 * seu título, o seu canônico e o seu conteúdo.
 *
 * O conteúdo em si é testado nos componentes (`componentes/saiba-mais/`).
 * Aqui se prova que cada slug mostra o bloco certo, e só ele.
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import PaginaDoSubgrupo, {
  dynamicParams,
  generateMetadata,
  generateStaticParams,
} from "@/app/saiba-mais/[subgrupo]/page";

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
  ])("%s tem o h1 certo e o link de volta para a índice", async (subgrupo, titulo) => {
    await renderizar(subgrupo);

    expect(screen.getByRole("heading", { level: 1, name: titulo })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Saiba mais" })).toHaveAttribute(
      "href",
      "/saiba-mais",
    );
  });

  it("na Casa Azul, o h1 é o nome oficial, e não o apelido", async () => {
    await renderizar("casa-azul");

    expect(screen.queryByRole("heading", { level: 1, name: "Casa Azul" })).toBeNull();
  });

  it("só a Casa Azul tem o contato e o JSON-LD", async () => {
    const { container, unmount } = await renderizar("casa-azul");
    expect(document.getElementById("contato")).not.toBeNull();
    expect(container.querySelector('script[type="application/ld+json"]')).not.toBeNull();
    unmount();

    for (const subgrupo of ["economia-solidaria", "ites-ifrj"]) {
      const outra = await renderizar(subgrupo);
      expect(document.getElementById("contato")).toBeNull();
      expect(outra.container.querySelector('script[type="application/ld+json"]')).toBeNull();
      outra.unmount();
    }
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

  it("slug desconhecido não ganha metadados", async () => {
    expect(await generateMetadata({ params: Promise.resolve({ subgrupo: "x" }) })).toEqual({});
  });
});
