/**
 * A trilha "Saiba mais › subgrupo": o primeiro item leva à índice, o atual não
 * é link, e o JSON-LD diz o mesmo caminho ao buscador.
 */
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TrilhaDoSaibaMais } from "@/componentes/saiba-mais/TrilhaDoSaibaMais";
import { SUBGRUPOS, type SlugDoSubgrupo } from "@/lib/saiba-mais";

function trilha() {
  return screen.getByRole("navigation", { name: "Trilha de navegação" });
}

describe("TrilhaDoSaibaMais", () => {
  it("é uma lista ordenada com dois itens", () => {
    render(<TrilhaDoSaibaMais atual="casa-azul" />);

    const lista = within(trilha()).getByRole("list");
    expect(lista.tagName).toBe("OL");
    expect(within(lista).getAllByRole("listitem")).toHaveLength(2);
  });

  it("o primeiro item é um link para a índice", () => {
    render(<TrilhaDoSaibaMais atual="casa-azul" />);

    const links = within(trilha()).getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveTextContent("Saiba mais");
    expect(links[0]).toHaveAttribute("href", "/saiba-mais");
  });

  it.each(SUBGRUPOS.map(({ slug, nome }) => [slug, nome]))(
    "em %s, o item atual é o nome curto, sem link e com aria-current=page",
    (slug, nome) => {
      render(<TrilhaDoSaibaMais atual={slug as SlugDoSubgrupo} />);

      const atual = within(trilha()).getByText(nome);
      expect(atual).toHaveAttribute("aria-current", "page");
      expect(atual.closest("a")).toBeNull();
    },
  );

  it("o separador fica escondido do leitor de tela", () => {
    render(<TrilhaDoSaibaMais atual="ites-ifrj" />);

    expect(within(trilha()).getByText("›")).toHaveAttribute("aria-hidden");
  });

  it.each(SUBGRUPOS.map(({ slug, nome }) => [slug, nome]))(
    "em %s, o JSON-LD é um BreadcrumbList com os dois endereços absolutos",
    (slug, nome) => {
      const { container } = render(
        <TrilhaDoSaibaMais atual={slug as SlugDoSubgrupo} />,
      );

      const script = container.querySelector('script[type="application/ld+json"]');
      const dados = JSON.parse(script?.textContent ?? "");

      expect(dados["@type"]).toBe("BreadcrumbList");
      const [indice, atual] = dados.itemListElement;
      expect(dados.itemListElement).toHaveLength(2);
      expect(indice).toMatchObject({ position: 1, name: "Saiba mais" });
      expect(atual).toMatchObject({ position: 2, name: nome });
      expect(indice.item).toMatch(/^https?:\/\/.+\/saiba-mais$/);
      expect(atual.item).toMatch(new RegExp(`^https?://.+/saiba-mais/${slug}$`));
    },
  );
});
