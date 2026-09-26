/**
 * A lista textual do mapa.
 *
 * Dois assuntos: ela existe mesmo sem o mapa (é o conteúdo que o buscador e o
 * leitor de tela alcançam), e a guarda do coletivo vinculado não é furada por
 * um texto bem-intencionado.
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ListaDePontos } from "@/componentes/ListaDePontos";
import type { PontoDeInteresse } from "@/tipos/api";

const BASE: PontoDeInteresse = {
  id: 1,
  nome: "Casa Paul Singer",
  tipo: "orgao_es",
  tipo_display: "Órgão da Economia Solidária",
  descricao: "Centro Público de Referência.",
  latitude: -22.883712,
  longitude: -43.103456,
  endereco: "Rua Visconde de Sepetiba, Centro",
  imagem_capa: null,
  coletivo: null,
  criado_em: "2026-08-01T10:00:00-03:00",
  atualizado_em: "2026-08-01T10:00:00-03:00",
};

describe("ListaDePontos", () => {
  it("renderiza os pontos como texto, sem depender do mapa", () => {
    render(<ListaDePontos pontos={[BASE]} />);

    expect(screen.getByRole("heading", { name: "Casa Paul Singer" })).toBeInTheDocument();
    expect(screen.getByText("Órgão da Economia Solidária")).toBeInTheDocument();
    expect(screen.getByText("Rua Visconde de Sepetiba, Centro")).toBeInTheDocument();
  });

  it("usa o rótulo que veio da API, não uma tradução própria", () => {
    // Se alguém reimplementar a tradução no frontend, ela sai de sincronia com
    // o Admin no dia em que a equipe criar um tipo novo. O teste finge um tipo
    // com rótulo inesperado: só passa quem estiver lendo `tipo_display`.
    const inventado: PontoDeInteresse = {
      ...BASE,
      tipo_display: "Rótulo que só a API conhece",
    };

    render(<ListaDePontos pontos={[inventado]} />);

    expect(screen.getByText("Rótulo que só a API conhece")).toBeInTheDocument();
  });

  it("com coletivo vinculado visível, mostra o link", () => {
    const comVinculo: PontoDeInteresse = {
      ...BASE,
      coletivo: { id: 1, nome: "Sementes do Vale", slug: "sementes-do-vale" },
    };

    render(<ListaDePontos pontos={[comVinculo]} />);

    expect(screen.getByRole("link", { name: "Sementes do Vale" })).toHaveAttribute(
      "href",
      "/coletivos/sementes-do-vale",
    );
  });

  it("com coletivo null, não diz nada sobre vínculo", () => {
    // `null` vale para "sem vínculo" E para "vínculo com coletivo fora do ar".
    // Qualquer texto aqui — "sem coletivo", "coletivo indisponível" — seria uma
    // pista sobre qual dos dois casos é, e a indistinguibilidade É a proteção.
    const { container } = render(<ListaDePontos pontos={[BASE]} />);
    const texto = container.textContent ?? "";

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(texto).not.toContain("indisponível");
    expect(texto).not.toContain("sem coletivo");
    expect(texto).not.toContain("undefined");
    expect(texto).not.toContain("null");
  });

  it("não deixa rastro de endereço ou descrição em branco", () => {
    const magro: PontoDeInteresse = { ...BASE, endereco: "", descricao: "" };

    const { container } = render(<ListaDePontos pontos={[magro]} />);

    expect(container.textContent).not.toContain("undefined");
    expect(screen.getByRole("heading", { name: "Casa Paul Singer" })).toBeInTheDocument();
  });

  it("avisa quando não há ponto nenhum", () => {
    render(<ListaDePontos pontos={[]} />);

    expect(screen.getByText("Nenhum ponto para mostrar.")).toBeInTheDocument();
  });
});
