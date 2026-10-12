/**
 * O menu marca a página atual — e no celular abre e fecha o painel.
 *
 * Os links existem duas vezes no HTML (cabeçalho do desktop e painel do
 * celular; o CSS mostra um ou outro), e as duas cópias precisam dizer a mesma
 * coisa. Por isso os testes conferem todas as ocorrências de cada link.
 */
import { fireEvent, render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { NavegacaoPrincipal } from "@/componentes/NavegacaoPrincipal";

vi.mock("next/navigation", () => ({ usePathname: vi.fn() }));

const rotaAtual = vi.mocked(usePathname);

/** Todas as cópias de um link, inclusive as do painel fechado. */
function links(nome: string) {
  return screen.getAllByRole("link", { name: nome, hidden: true });
}

describe("NavegacaoPrincipal — página atual", () => {
  it("marca a seção com aria-current=page na própria página", () => {
    rotaAtual.mockReturnValue("/eventos");
    render(<NavegacaoPrincipal />);

    for (const link of links("Agenda")) {
      expect(link).toHaveAttribute("aria-current", "page");
    }
    for (const link of [...links("Coletivos"), ...links("Mapa")]) {
      expect(link).not.toHaveAttribute("aria-current");
    }
  });

  it("marca a seção com aria-current=true numa subpágina", () => {
    // O perfil de um coletivo está "dentro" de Coletivos, mas não é a página
    // de Coletivos — por isso `true`, e não `page`.
    rotaAtual.mockReturnValue("/coletivos/sementes-do-vale");
    render(<NavegacaoPrincipal />);

    for (const link of links("Coletivos")) {
      expect(link).toHaveAttribute("aria-current", "true");
    }
    for (const link of [...links("Agenda"), ...links("Mapa")]) {
      expect(link).not.toHaveAttribute("aria-current");
    }
  });

  it("não marca nada na home", () => {
    rotaAtual.mockReturnValue("/");
    const { container } = render(<NavegacaoPrincipal />);

    expect(container.querySelector("[aria-current]")).toBeNull();
  });

  it("não confunde seção com prefixo parecido", () => {
    // `/mapas-antigos` não está dentro de `/mapa`.
    rotaAtual.mockReturnValue("/mapas-antigos");
    const { container } = render(<NavegacaoPrincipal />);

    expect(container.querySelector("[aria-current]")).toBeNull();
  });
});

describe("NavegacaoPrincipal — painel do celular", () => {
  beforeEach(() => {
    rotaAtual.mockReturnValue("/");
  });

  function abrir() {
    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    return document.querySelector("dialog") as HTMLDialogElement;
  }

  it("o botão anuncia que abre um diálogo e o abre", () => {
    render(<NavegacaoPrincipal />);
    const botao = screen.getByRole("button", { name: "Menu" });

    expect(botao).toHaveAttribute("aria-haspopup", "dialog");
    expect(document.querySelector("dialog")).not.toHaveAttribute("open");

    expect(abrir()).toHaveAttribute("open");
  });

  it("fecha com Esc", () => {
    render(<NavegacaoPrincipal />);
    const painel = abrir();

    fireEvent.keyDown(painel, { key: "Escape" });

    expect(painel).not.toHaveAttribute("open");
  });

  it("fecha pelo botão de fechar, que tem nome acessível", () => {
    render(<NavegacaoPrincipal />);
    const painel = abrir();

    fireEvent.click(screen.getByRole("button", { name: "Fechar menu" }));

    expect(painel).not.toHaveAttribute("open");
  });

  it("fecha ao tocar num link", () => {
    render(<NavegacaoPrincipal />);
    const painel = abrir();

    const doPainel = links("Agenda").find((link) => painel.contains(link));
    fireEvent.click(doPainel as HTMLElement);

    expect(painel).not.toHaveAttribute("open");
  });

  it("fecha ao tocar fora, no fundo escurecido", () => {
    render(<NavegacaoPrincipal />);
    const painel = abrir();

    // O clique no `::backdrop` chega com o próprio `<dialog>` como alvo.
    fireEvent.click(painel);

    expect(painel).not.toHaveAttribute("open");
  });

  it("não fecha ao tocar dentro do painel", () => {
    render(<NavegacaoPrincipal />);
    const painel = abrir();

    fireEvent.click(screen.getByText("Menu", { selector: "span" }));

    expect(painel).toHaveAttribute("open");
  });

  it("fecha quando a rota muda", () => {
    const { rerender } = render(<NavegacaoPrincipal />);
    const painel = abrir();

    rotaAtual.mockReturnValue("/mapa");
    rerender(<NavegacaoPrincipal />);

    expect(painel).not.toHaveAttribute("open");
  });
});
