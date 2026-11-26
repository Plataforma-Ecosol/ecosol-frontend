/**
 * O subgrupo "Economia Solidária": o texto da Rede e os caminhos para o site.
 *
 * Casos vindos de `app/saiba-mais/page.test.tsx`, sem mudança nas asserções.
 */
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Casa } from "@/lib/casa";

const { CASA: REAL } = await vi.importActual<typeof import("@/lib/casa")>("@/lib/casa");

const dados = vi.hoisted(() => ({ casa: {} as Casa }));
vi.mock("@/lib/casa", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/casa")>()),
  get CASA() {
    return dados.casa;
  },
}));

const { ConteudoEconomiaSolidaria } = await import(
  "@/componentes/saiba-mais/ConteudoEconomiaSolidaria"
);

beforeEach(() => {
  dados.casa = { ...REAL };
});

describe("Economia Solidária", () => {
  it("mostra o texto da Rede", () => {
    render(<ConteudoEconomiaSolidaria />);

    expect(
      screen.getByRole("heading", { name: "A Rede de Economia Solidária de Niterói" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/reúne coletivos/)).toHaveClass("whitespace-pre-line");
  });

  it("os botões da Rede levam aos coletivos e à agenda", () => {
    render(<ConteudoEconomiaSolidaria />);

    expect(screen.getByRole("link", { name: "Conheça os coletivos" })).toHaveAttribute(
      "href",
      "/coletivos",
    );
    expect(screen.getByRole("link", { name: "Veja a agenda" })).toHaveAttribute(
      "href",
      "/eventos",
    );
  });

  it("sem o texto da Rede, os botões continuam", () => {
    dados.casa = { ...REAL, sobre_a_rede: undefined };
    render(<ConteudoEconomiaSolidaria />);

    expect(screen.queryByText(/reúne coletivos/)).toBeNull();
    expect(screen.getByRole("link", { name: "Conheça os coletivos" })).toBeInTheDocument();
  });
});
