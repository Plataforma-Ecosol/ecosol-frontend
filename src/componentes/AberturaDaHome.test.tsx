import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AberturaDaHome } from "@/componentes/AberturaDaHome";

const TOTAIS = { coletivos: 7, pontos: 3, eventos: 3 };

describe("AberturaDaHome", () => {
  it("leva aos coletivos e à agenda", () => {
    render(<AberturaDaHome totais={TOTAIS} />);

    expect(screen.getByRole("link", { name: "Conhecer os coletivos" })).toHaveAttribute(
      "href",
      "/coletivos",
    );
    expect(screen.getByRole("link", { name: "Ver a agenda" })).toHaveAttribute(
      "href",
      "/eventos",
    );
  });

  it("tem um único h1", () => {
    render(<AberturaDaHome totais={TOTAIS} />);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("mostra a foto com o texto alternativo da cena", () => {
    // No Vitest o import de um `.jpg` vira string; aqui vai o objeto que o
    // import estático entrega no build.
    const foto = {
      imagem: {
        src: "/abertura-feira.jpg",
        width: 1600,
        height: 1200,
        blurDataURL: "data:image/jpeg;base64,AAAA",
      },
      alt: "Barracas e visitantes numa feira de economia solidária",
    };

    render(<AberturaDaHome totais={TOTAIS} foto={foto} />);

    expect(
      screen.getByRole("img", {
        name: "Barracas e visitantes numa feira de economia solidária",
      }),
    ).toBeInTheDocument();
  });

  it("sem foto, não reserva espaço para ela", () => {
    const { container } = render(<AberturaDaHome totais={TOTAIS} />);

    expect(container.querySelector("img")).toBeNull();
  });
});
