/**
 * A página índice do "Saiba mais": um cartão por subgrupo e o contato curto.
 *
 * O contato curto existe para os links antigos `/saiba-mais#contato`. Sem o
 * `id`, eles abririam a página no topo, sem o contato — este teste impede que
 * ele suma sem ninguém perceber.
 */
import { render, screen, within } from "@testing-library/react";
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

const { default: SaibaMais, metadata } = await import("@/app/saiba-mais/page");

beforeEach(() => {
  dados.casa = { ...REAL };
});

describe("Saiba mais — índice", () => {
  it("o h1 é 'Saiba mais'", () => {
    render(<SaibaMais />);

    expect(screen.getByRole("heading", { level: 1, name: "Saiba mais" })).toBeInTheDocument();
  });

  it("tem um cartão para cada subgrupo, na ordem, com o nome como link", () => {
    render(<SaibaMais />);

    const cartoes = screen.getAllByRole("listitem");
    const links = cartoes.map((cartao) => within(cartao).getByRole("link"));
    expect(links.map((link) => [link.textContent, link.getAttribute("href")])).toEqual([
      ["Casa Azul", "/saiba-mais/casa-azul"],
      ["Economia Solidária", "/saiba-mais/economia-solidaria"],
      ["ITES/IFRJ", "/saiba-mais/ites-ifrj"],
    ]);
  });

  it("cada cartão expõe um link só, e o resumo fica fora do nome dele", () => {
    render(<SaibaMais />);

    for (const cartao of screen.getAllByRole("listitem")) {
      expect(within(cartao).getAllByRole("link")).toHaveLength(1);
    }
    expect(screen.getByRole("link", { name: "Casa Azul" })).toBeInTheDocument();
  });

  it("canônico próprio", () => {
    expect(metadata.alternates?.canonical).toBe("/saiba-mais");
  });
});

describe("Saiba mais — contato curto (#contato)", () => {
  it("existe, com telefone, e-mail e o caminho para o contato completo", () => {
    render(<SaibaMais />);

    const secao = document.getElementById("contato");
    expect(secao).not.toBeNull();
    const caixa = within(secao as HTMLElement);

    expect(caixa.getByRole("link", { name: "(21) 2717-8350" })).toHaveAttribute(
      "href",
      "tel:+552127178350",
    );
    expect(caixa.getByRole("link", { name: "coordenaecosol@gmail.com" })).toHaveAttribute(
      "href",
      "mailto:coordenaecosol@gmail.com",
    );
    expect(
      caixa.getByRole("link", { name: "Endereço, horário e redes sociais" }),
    ).toHaveAttribute("href", "/saiba-mais/casa-azul#contato");
  });

  it("não é o contato oficial: nenhum <address> na índice", () => {
    const { container } = render(<SaibaMais />);

    expect(container.querySelector("address")).toBeNull();
  });

  it("sem nenhum contato, o bloco some, e os cartões continuam", () => {
    dados.casa = { nome: REAL.nome };
    render(<SaibaMais />);

    expect(document.getElementById("contato")).toBeNull();
    expect(screen.queryByRole("heading", { name: "Fale com a Casa" })).toBeNull();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("só com o e-mail, nada de telefone", () => {
    dados.casa = { nome: REAL.nome, email: REAL.email };
    const { container } = render(<SaibaMais />);

    expect(container.querySelector('a[href^="tel:"]')).toBeNull();
    expect(screen.queryByRole("button", { name: "Copiar" })).toBeNull();
    expect(screen.getByRole("link", { name: "coordenaecosol@gmail.com" })).toBeInTheDocument();
  });
});
