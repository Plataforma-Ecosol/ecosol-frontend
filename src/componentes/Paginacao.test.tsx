/**
 * Paginação da listagem.
 *
 * O jsdom não aplica CSS, então as duas listas — a do celular e a do
 * computador — estão no DOM ao mesmo tempo. Os testes olham cada uma com
 * `within`, ou usam `getAllBy…`, em vez de esperar um resultado só.
 */
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Paginacao } from "@/componentes/Paginacao";

function listas() {
  const nav = screen.getByRole("navigation", { name: "Paginação" });
  const [celular, desktop] = within(nav).getAllByRole("list");
  return { celular, desktop };
}

describe("Paginacao", () => {
  it("não aparece com uma página só", () => {
    const { container } = render(
      <Paginacao total={20} pagina={1} parametros={{}} rota="/coletivos" />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("na primeira página não há Anterior, e na última não há Próxima", () => {
    const { unmount } = render(
      <Paginacao total={100} pagina={1} parametros={{}} rota="/coletivos" />,
    );
    expect(screen.queryByRole("link", { name: "Anterior" })).toBeNull();
    expect(screen.getAllByRole("link", { name: "Próxima" })).toHaveLength(2);
    unmount();

    render(<Paginacao total={100} pagina={5} parametros={{}} rota="/coletivos" />);
    expect(screen.getAllByRole("link", { name: "Anterior" })).toHaveLength(2);
    expect(screen.queryByRole("link", { name: "Próxima" })).toBeNull();
  });

  it("marca a página atual sem fazer dela um link", () => {
    render(<Paginacao total={100} pagina={3} parametros={{}} rota="/coletivos" />);

    const atuais = screen.getAllByText("3").filter((el) => el.getAttribute("aria-current"));
    expect(atuais).toHaveLength(2);
    for (const atual of atuais) {
      expect(atual).toHaveAttribute("aria-current", "page");
      expect(atual.closest("a")).toBeNull();
    }
    expect(screen.queryByRole("link", { name: "Página 3" })).toBeNull();
  });

  it("dá nome de página aos números", () => {
    render(<Paginacao total={100} pagina={3} parametros={{}} rota="/coletivos" />);

    const { desktop } = listas();
    expect(within(desktop).getByRole("link", { name: "Página 4" })).toHaveTextContent("4");
  });

  it("preserva os outros filtros e troca só a página", () => {
    render(
      <Paginacao
        total={100}
        pagina={2}
        parametros={{ q: "feira", categoria: ["3", "5"], page: "2" }}
        rota="/coletivos"
      />,
    );

    const [proxima] = screen.getAllByRole("link", { name: "Próxima" });
    const url = new URL(proxima.getAttribute("href") ?? "", "http://x");

    expect(url.pathname).toBe("/coletivos");
    expect(url.searchParams.get("q")).toBe("feira");
    expect(url.searchParams.getAll("categoria")).toEqual(["3", "5"]);
    expect(url.searchParams.get("page")).toBe("3");
    expect(proxima).toHaveAttribute("rel", "next");
  });

  it("mostra menos números no celular que no computador", () => {
    // 400 itens = 20 páginas; na página 5: "1 … 5 … 20" e "1 … 4 5 6 … 20".
    render(<Paginacao total={400} pagina={5} parametros={{}} rota="/coletivos" />);

    const { celular, desktop } = listas();
    expect(within(celular).queryByRole("link", { name: "Página 4" })).toBeNull();
    expect(within(desktop).getByRole("link", { name: "Página 4" })).toBeInTheDocument();
    expect(celular).toHaveClass("sm:hidden");
    expect(desktop).toHaveClass("hidden", "sm:flex");
  });

  it("esconde as reticências do leitor de tela", () => {
    const { container } = render(
      <Paginacao total={400} pagina={10} parametros={{}} rota="/coletivos" />,
    );

    const reticencias = container.querySelectorAll('[data-slot="pagination-ellipsis"]');
    expect(reticencias.length).toBeGreaterThan(0);
    for (const item of reticencias) {
      expect(item).toHaveAttribute("aria-hidden", "true");
      expect(item).toHaveTextContent("");
    }
  });

  it("mantém o nome de Anterior e Próxima no celular, onde só a seta aparece", () => {
    render(<Paginacao total={100} pagina={2} parametros={{}} rota="/coletivos" />);

    const { celular } = listas();
    const texto = within(celular).getByText("Anterior");
    expect(texto).toHaveClass("sr-only", "sm:not-sr-only");
  });
});
