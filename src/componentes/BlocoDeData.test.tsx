import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BlocoDeData } from "@/componentes/BlocoDeData";

describe("BlocoDeData", () => {
  it("mostra mês, dia e dia da semana", () => {
    const { container } = render(<BlocoDeData iso="2026-10-21T01:30:00Z" />);

    expect(container.textContent).toBe("OUT20TER");
  });

  it("fica fora da árvore de acessibilidade", () => {
    // A data por extenso está no `<time>` do cartão; o bloco seria repetição.
    const { container } = render(<BlocoDeData iso="2026-10-21T01:30:00Z" />);

    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("não desenha nada com data impossível de ler", () => {
    const { container } = render(<BlocoDeData iso="nao é uma data" />);

    expect(container).toBeEmptyDOMElement();
  });
});
