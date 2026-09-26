/**
 * O perfil mostra o contato autorizado — e não deixa rastro do que não é.
 *
 * É o teste central desta fatia. Os dois lados importam, e um sozinho não vale
 * nada: sem o caso "com consentimento", a suíte passaria com um componente que
 * nunca mostra contato nenhum; sem o caso "sem consentimento", passaria com um
 * que mostra tudo sempre.
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PerfilDoColetivo } from "@/componentes/PerfilDoColetivo";
import type { Coletivo } from "@/tipos/api";

/** Coletivo SEM nenhuma chave de contato — como a API o devolve sem consentimento. */
const SEM_CONSENTIMENTO: Coletivo = {
  id: 2,
  nome: "Ateliê Maré",
  slug: "atelie-mare",
  descricao: "Artesanato têxtil em Niterói.",
  bairro: "Centro",
  site: "",
  categorias: [{ id: 2, nome: "Artesanato", slug: "artesanato" }],
  criado_em: "2026-08-01T10:00:00-03:00",
  atualizado_em: "2026-08-01T10:00:00-03:00",
};

const COM_CONSENTIMENTO: Coletivo = {
  ...SEM_CONSENTIMENTO,
  id: 1,
  nome: "Sementes do Vale",
  slug: "sementes-do-vale",
  site: "https://sementesdovale.org",
  telefone: "(21) 99999-0000",
  email: "contato@sementesdovale.org",
  instagram: "@sementesdovale",
};

describe("PerfilDoColetivo — sem consentimento", () => {
  it("não deixa NENHUM rastro dos contatos", () => {
    const { container } = render(<PerfilDoColetivo coletivo={SEM_CONSENTIMENTO} />);
    const texto = container.textContent ?? "";

    // Nem o rótulo. Um "Telefone:" seguido de nada denuncia que existe um
    // telefone cadastrado e escondido — o oposto do que a omissão pretende.
    expect(texto).not.toContain("Telefone");
    expect(texto).not.toContain("E-mail");
    expect(texto).not.toContain("Instagram");

    // Nem a seção inteira: um cartão "Contato" vazio comunica a mesma coisa.
    expect(texto).not.toContain("Contato");

    expect(texto).not.toContain("undefined");
    expect(texto).not.toContain("null");
  });

  it("ainda assim mostra o que é público", () => {
    render(<PerfilDoColetivo coletivo={SEM_CONSENTIMENTO} />);

    expect(screen.getByRole("heading", { name: "Ateliê Maré" })).toBeInTheDocument();
    expect(screen.getByText("Artesanato têxtil em Niterói.")).toBeInTheDocument();
  });
});

describe("PerfilDoColetivo — com consentimento", () => {
  it("mostra os três contatos", () => {
    render(<PerfilDoColetivo coletivo={COM_CONSENTIMENTO} />);

    expect(screen.getByText("(21) 99999-0000")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "contato@sementesdovale.org" })).toHaveAttribute(
      "href",
      "mailto:contato@sementesdovale.org",
    );
    expect(screen.getByRole("link", { name: "@sementesdovale" })).toHaveAttribute(
      "href",
      "https://instagram.com/sementesdovale",
    );
  });

  it("mostra apenas o contato presente, quando só um foi autorizado", () => {
    // O caso mais comum na prática: a equipe autoriza o instagram e mais nada.
    const soInstagram: Coletivo = { ...SEM_CONSENTIMENTO, instagram: "@atelie" };

    const { container } = render(<PerfilDoColetivo coletivo={soInstagram} />);
    const texto = container.textContent ?? "";

    expect(texto).toContain("@atelie");
    expect(texto).not.toContain("Telefone");
    expect(texto).not.toContain("E-mail");
  });

  it("abre links externos sem entregar a página de origem", () => {
    render(<PerfilDoColetivo coletivo={COM_CONSENTIMENTO} />);

    const instagram = screen.getByRole("link", { name: "@sementesdovale" });
    expect(instagram).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });
});
