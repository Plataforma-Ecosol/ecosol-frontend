/**
 * As pílulas dos subgrupos: links (e não abas de ARIA), na ordem de
 * `SUBGRUPOS`, com só o atual marcado.
 */
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { NavegacaoDosSubgrupos } from "@/componentes/saiba-mais/NavegacaoDosSubgrupos";
import { caminhoDoSubgrupo, SUBGRUPOS, type SlugDoSubgrupo } from "@/lib/saiba-mais";

function navegacao() {
  return screen.getByRole("navigation", { name: "Subgrupos do Saiba mais" });
}

describe("NavegacaoDosSubgrupos", () => {
  it("tem os três links, na ordem, com o endereço de cada subgrupo", () => {
    render(<NavegacaoDosSubgrupos atual="casa-azul" />);

    const links = within(navegacao()).getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual(SUBGRUPOS.map(({ nome }) => nome));
    expect(links.map((link) => link.getAttribute("href"))).toEqual(
      SUBGRUPOS.map(({ slug }) => caminhoDoSubgrupo(slug)),
    );
  });

  it("são links, e não abas de ARIA", () => {
    render(<NavegacaoDosSubgrupos atual="casa-azul" />);

    expect(screen.queryByRole("tablist")).toBeNull();
    expect(screen.queryByRole("tab")).toBeNull();
  });

  it.each(SUBGRUPOS.map(({ slug }) => slug))("em %s, só ele tem aria-current=page", (atual) => {
    render(<NavegacaoDosSubgrupos atual={atual as SlugDoSubgrupo} />);

    for (const { slug, nome } of SUBGRUPOS) {
      const link = within(navegacao()).getByRole("link", { name: nome });
      if (slug === atual) {
        expect(link).toHaveAttribute("aria-current", "page");
      } else {
        expect(link).not.toHaveAttribute("aria-current");
      }
    }
  });

  it("a lista quebra linha, sem rolagem horizontal no celular", () => {
    render(<NavegacaoDosSubgrupos atual="ites-ifrj" />);

    const lista = within(navegacao()).getByRole("list");
    expect(lista).toHaveClass("flex-wrap");
    expect(lista).not.toHaveClass("overflow-x-auto");
  });

  it("cada pílula tem alvo de toque de 44 px", () => {
    render(<NavegacaoDosSubgrupos atual="economia-solidaria" />);

    for (const link of within(navegacao()).getAllByRole("link")) {
      expect(link).toHaveClass("min-h-11");
    }
  });
});
