/**
 * As seções do Admin na tela: título, imagem e texto, e nada além disso.
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SecoesDoSaibaMais } from "@/componentes/saiba-mais/SecoesDoSaibaMais";
import type { SecaoDoSaibaMais } from "@/tipos/api";

function secao(campos: Partial<SecaoDoSaibaMais> = {}): SecaoDoSaibaMais {
  return {
    id: 1,
    slug: "quem-somos",
    subgrupo: "casa-azul",
    titulo: "Quem somos",
    texto: "Primeiro parágrafo.\n\nSegundo parágrafo.",
    imagem: null,
    imagem_descricao: "",
    atualizado_em: "2026-11-20T10:00:00-03:00",
    ...campos,
  };
}

describe("SecoesDoSaibaMais", () => {
  it("um h2 por seção, na ordem recebida", () => {
    render(
      <SecoesDoSaibaMais
        secoes={[secao({ id: 2, titulo: "Primeira" }), secao({ id: 1, titulo: "Segunda" })]}
      />,
    );

    expect(
      screen.getAllByRole("heading", { level: 2 }).map((titulo) => titulo.textContent),
    ).toEqual(["Primeira", "Segunda"]);
  });

  it("o texto mantém os parágrafos da linha em branco", () => {
    render(<SecoesDoSaibaMais secoes={[secao()]} />);

    const texto = screen.getByText(/Primeiro parágrafo/);
    expect(texto.textContent).toBe("Primeiro parágrafo.\n\nSegundo parágrafo.");
    expect(texto).toHaveClass("whitespace-pre-line");
  });

  it("a imagem sai com o alt da descrição do Admin", () => {
    render(
      <SecoesDoSaibaMais
        secoes={[
          secao({
            imagem: "https://exemplo.supabase.co/storage/v1/object/public/divulgacao/casa.png",
            imagem_descricao: "Fachada azul da Casa Paul Singer",
          }),
        ]}
      />,
    );

    expect(screen.getByRole("img", { name: "Fachada azul da Casa Paul Singer" })).toBeInTheDocument();
  });

  it("sem imagem, nenhuma imagem", () => {
    render(<SecoesDoSaibaMais secoes={[secao()]} />);

    expect(screen.queryByRole("img")).toBeNull();
  });

  it("só título, texto e imagem vão para a tela, e os campos de controle não", () => {
    const { container } = render(
      <SecoesDoSaibaMais
        secoes={[secao({ id: 987654, slug: "slug-de-controle", atualizado_em: "2031-01-02T03:04:05Z" })]}
      />,
    );

    expect(container.textContent).not.toMatch(/987654|slug-de-controle|2031/);
  });
});
