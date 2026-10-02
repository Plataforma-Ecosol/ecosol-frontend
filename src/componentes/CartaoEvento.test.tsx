import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CartaoEvento } from "@/componentes/CartaoEvento";
import type { Evento } from "@/tipos/api";

const BASE: Evento = {
  id: 1,
  titulo: "Feira do Circuito Arariboia",
  slug: "feira-arariboia-agosto",
  descricao: "Feira mensal de agroecologia e artesanato.",
  data_inicio: "2026-08-15T18:00:00-03:00",
  data_fim: "2026-08-15T21:00:00-03:00",
  local: "Praça Arariboia",
  bairro: "Centro",
  link: "https://exemplo.org/feira",
  imagens: [],
  criado_em: "2026-08-01T10:00:00-03:00",
  atualizado_em: "2026-08-01T10:00:00-03:00",
};

describe("CartaoEvento", () => {
  it("mostra data, título e local", () => {
    render(<CartaoEvento evento={BASE} />);

    expect(screen.getByText("15 de ago., 18h")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Feira do Circuito Arariboia" }),
    ).toHaveAttribute("href", "/eventos/feira-arariboia-agosto");
    expect(screen.getByText("Praça Arariboia · Centro")).toBeInTheDocument();
  });

  it("guarda o valor ISO no atributo da tag time", () => {
    // É o que faz a data ser legível por máquina — buscador e "adicionar à
    // agenda" leem daqui, não do texto em português.
    const { container } = render(<CartaoEvento evento={BASE} />);

    expect(container.querySelector("time")).toHaveAttribute(
      "dateTime",
      "2026-08-15T18:00:00-03:00",
    );
  });

  it("não deixa rastro quando o evento tem só o mínimo", () => {
    // Evento recém-cadastrado: sem descrição, sem local, sem bairro, sem fim.
    const minimo: Evento = {
      ...BASE,
      descricao: "",
      local: "",
      bairro: "",
      link: "",
      data_fim: null,
    };

    const { container } = render(<CartaoEvento evento={minimo} />);
    const texto = container.textContent ?? "";

    expect(texto).not.toContain("undefined");
    expect(texto).not.toContain("null");
    // O separador só existe entre dois valores — sem local nem bairro, some.
    expect(texto).not.toContain("·");
  });

  it("mostra só o bairro quando não há local", () => {
    render(<CartaoEvento evento={{ ...BASE, local: "" }} />);

    expect(screen.getByText("Centro")).toBeInTheDocument();
  });

  it("mostra o dia em bloco de calendário e o horário na linha de metadados", () => {
    const { container } = render(<CartaoEvento evento={BASE} />);

    expect(container.querySelector("[aria-hidden]")?.textContent).toBe("AGO15SÁB");
    expect(screen.getByText("18h às 21h")).toBeInTheDocument();
  });

  it("com data impossível de ler, mostra o texto cru e não quebra", () => {
    const quebrado: Evento = { ...BASE, data_inicio: "nao é uma data", data_fim: null };

    const { container } = render(<CartaoEvento evento={quebrado} />);

    expect(screen.getByText("nao é uma data")).toBeVisible();
    expect(container.querySelector("time")).toHaveAttribute("dateTime", "nao é uma data");
    // Sem bloco: nada de calendário vazio ao lado do título.
    expect(container.querySelector("[aria-hidden]")).toBeNull();
  });
});
