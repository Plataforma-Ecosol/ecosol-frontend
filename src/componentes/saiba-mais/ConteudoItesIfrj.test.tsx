/**
 * O subgrupo "ITES/IFRJ": o crédito do projeto, que não é contato da Casa.
 *
 * Casos vindos de `app/saiba-mais/page.test.tsx`. Antes, o endereço do campus
 * precisava ficar fora do `<address>` da Casa, na mesma página; agora as duas
 * coisas moram em páginas diferentes, e o que se prova é que aqui não há
 * `<address>` nenhum.
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ConteudoItesIfrj } from "@/componentes/saiba-mais/ConteudoItesIfrj";

describe("ITES/IFRJ", () => {
  it("o ITES aparece por extenso, com o endereço do campus fora de qualquer <address>", () => {
    const { container } = render(<ConteudoItesIfrj />);

    expect(
      screen.getByText(/Incubadora Tecnológica de Empreendimentos Solidários/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Estr\. Washington Luís, 1596/)).toBeInTheDocument();
    expect(container.querySelector("address")).toBeNull();
  });

  it("o link do GitHub abre em nova aba sem passar o `opener`", () => {
    render(<ConteudoItesIfrj />);

    const github = screen.getByRole("link", { name: "Ver o código no GitHub (abre em nova aba)" });
    expect(github).toHaveAttribute("href", "https://github.com/Plataforma-Ecosol");
    expect(github).toHaveAttribute("target", "_blank");
    expect(github).toHaveAttribute("rel", "noopener noreferrer");
  });
});

describe("ITES/IFRJ — com as seções do Admin", () => {
  const secao = {
    id: 1, slug: "a-ites", subgrupo: "ites-ifrj",
    titulo: "A ITES", texto: "Texto vindo do Admin.",
    imagem: null, imagem_descricao: "", atualizado_em: "2026-11-20T10:00:00-03:00",
  };

  it("as seções vêm antes do crédito, que continua fixo", () => {
    render(<ConteudoItesIfrj secoes={[secao]} />);

    expect(
      screen.getAllByRole("heading", { level: 2 }).map((titulo) => titulo.textContent),
    ).toEqual(["A ITES", "Quem faz a plataforma"]);
    expect(screen.getByText(/Estr\. Washington Luís, 1596/)).toBeInTheDocument();
  });

  it("sem seção publicada, fica só o crédito", () => {
    render(<ConteudoItesIfrj secoes={[]} />);

    expect(
      screen.getAllByRole("heading", { level: 2 }).map((titulo) => titulo.textContent),
    ).toEqual(["Quem faz a plataforma"]);
  });
});
