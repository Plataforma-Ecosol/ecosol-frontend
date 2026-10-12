/**
 * A logo é o link para a home, no cabeçalho e no rodapé.
 *
 * O que se prova aqui é o que um leitor de tela e um visitante dependem: o
 * link leva a `/` e o nome dele é o da Casa (e não "logo" ou "imagem").
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Logo from "@/componentes/Logo";

const NOME = "Casa da Economia Solidária Paul Singer";

describe.each(["cabecalho", "rodape"] as const)("Logo no %s", (lugar) => {
  it("é um link para a home, com o nome da Casa", () => {
    render(<Logo lugar={lugar} />);

    const link = screen.getByRole("link", { name: NOME });
    expect(link).toHaveAttribute("href", "/");
  });

  it("mostra o retrato com alt descritivo, sem 'logo' nem 'imagem'", () => {
    render(<Logo lugar={lugar} />);

    const retrato = screen.getByRole("img", { name: NOME });
    expect(retrato.getAttribute("alt")).not.toMatch(/logo|imagem/i);
  });
});
