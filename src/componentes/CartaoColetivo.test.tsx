/**
 * O cartão da listagem não vaza contato.
 *
 * Este é o primeiro teste de exposição do frontend. A suíte completa de
 * regressão de LGPD é o PR Q; o que se prova aqui é o caso específico do
 * cartão, e ele é diferente do perfil: mesmo COM consentimento, contato não
 * aparece na listagem. Quem autorizou publicar o telefone no perfil não
 * autorizou que ele fosse varrido de uma listagem inteira de uma vez.
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CartaoColetivo } from "@/componentes/CartaoColetivo";
import type { Coletivo } from "@/tipos/api";

const BASE: Coletivo = {
  id: 1,
  nome: "Sementes do Vale",
  slug: "sementes-do-vale",
  descricao: "Agroecologia urbana no Fonseca.",
  bairro: "Fonseca",
  site: "https://exemplo.org",
  foto: null,
  foto_descricao: "",
  categorias: [{ id: 3, nome: "Agroecologia", slug: "agroecologia" }],
  criado_em: "2026-08-01T10:00:00-03:00",
  atualizado_em: "2026-08-01T10:00:00-03:00",
};

describe("CartaoColetivo", () => {
  it("mostra nome, bairro e categorias", () => {
    render(<CartaoColetivo coletivo={BASE} parametros={{}} />);

    expect(screen.getByRole("link", { name: "Sementes do Vale" })).toHaveAttribute(
      "href",
      "/coletivos/sementes-do-vale",
    );
    expect(screen.getByRole("link", { name: "Fonseca" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Agroecologia" })).toBeInTheDocument();
  });

  it("não mostra contato NEM quando há consentimento", () => {
    const comContatos: Coletivo = {
      ...BASE,
      telefone: "(21) 99999-0000",
      email: "contato@exemplo.org",
      instagram: "@exemplo",
    };

    const { container } = render(
      <CartaoColetivo coletivo={comContatos} parametros={{}} />,
    );

    const texto = container.textContent ?? "";
    expect(texto).not.toContain("99999-0000");
    expect(texto).not.toContain("contato@exemplo.org");
    expect(texto).not.toContain("@exemplo");
  });

  it("não deixa rastro de campo ausente", () => {
    // Um coletivo recém-cadastrado tem quase tudo em branco. Sem as checagens
    // de existência, o cartão renderizaria rótulo vazio ou o texto "undefined".
    const vazio: Coletivo = {
      ...BASE,
      descricao: "",
      bairro: "",
      site: "",
      categorias: [],
    };

    const { container } = render(<CartaoColetivo coletivo={vazio} parametros={{}} />);
    const texto = container.textContent ?? "";

    expect(texto).not.toContain("undefined");
    expect(texto).not.toContain("null");
    expect(screen.getByRole("link", { name: "Sementes do Vale" })).toBeInTheDocument();
  });

  it("preserva os filtros atuais nos links de filtro", () => {
    // Clicar no bairro estando dentro de uma busca não pode apagar a busca —
    // seria alargar o resultado no momento em que a pessoa tenta restringi-lo.
    render(<CartaoColetivo coletivo={BASE} parametros={{ q: "feira", page: "3" }} />);

    const link = screen.getByRole("link", { name: "Fonseca" });
    const href = link.getAttribute("href") ?? "";

    expect(href).toContain("q=feira");
    expect(href).toContain("bairro=Fonseca");
    // A página volta para a primeira: o filtro novo muda o tamanho do resultado.
    expect(href).not.toContain("page=");
  });

  describe("foto", () => {
    const COM_FOTO: Coletivo = {
      ...BASE,
      foto: "http://localhost:8001/media/coletivos/abc.jpg",
      foto_descricao: "Integrantes do coletivo na barraca da feira",
    };

    it("usa a descrição da foto como texto alternativo e declara `sizes`", () => {
      render(<CartaoColetivo coletivo={COM_FOTO} parametros={{}} />);

      const foto = screen.getByRole("img", {
        name: "Integrantes do coletivo na barraca da feira",
      });
      expect(foto).toHaveAttribute("sizes");
    });

    it("sem descrição, o texto alternativo diz de quem é a foto", () => {
      render(
        <CartaoColetivo coletivo={{ ...COM_FOTO, foto_descricao: "" }} parametros={{}} />,
      );

      expect(
        screen.getByRole("img", { name: "Foto do coletivo Sementes do Vale" }),
      ).toBeInTheDocument();
    });

    it("sem foto, mostra as iniciais escondidas do leitor de tela", () => {
      const { container } = render(<CartaoColetivo coletivo={BASE} parametros={{}} />);

      expect(container.querySelector("img")).toBeNull();
      const iniciais = screen.getByText("SV");
      expect(iniciais.closest("[aria-hidden]")).not.toBeNull();
    });
  });
});
