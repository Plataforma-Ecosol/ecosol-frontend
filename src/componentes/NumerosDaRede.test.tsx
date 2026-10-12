import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { NumerosDaRede } from "@/componentes/NumerosDaRede";

describe("NumerosDaRede", () => {
  it("usa o plural acima de um", () => {
    render(<NumerosDaRede coletivos={7} pontos={3} eventos={2} />);

    const itens = screen.getAllByRole("listitem").map((item) => item.textContent);
    expect(itens).toEqual(["7coletivos", "3pontos no mapa", "2próximos eventos"]);
  });

  it("usa o singular com um", () => {
    render(<NumerosDaRede coletivos={1} pontos={1} eventos={1} />);

    const itens = screen.getAllByRole("listitem").map((item) => item.textContent);
    expect(itens).toEqual(["1coletivo", "1ponto no mapa", "1próximo evento"]);
  });

  it("esconde o item com zero", () => {
    render(<NumerosDaRede coletivos={7} pontos={3} eventos={0} />);

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.queryByText(/evento/)).not.toBeInTheDocument();
  });

  it("não renderiza nada com os três zerados", () => {
    const { container } = render(<NumerosDaRede coletivos={0} pontos={0} eventos={0} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("formata o número no padrão brasileiro", () => {
    render(<NumerosDaRede coletivos={1234} pontos={0} eventos={0} />);

    expect(screen.getByText("1.234")).toBeInTheDocument();
  });
});
