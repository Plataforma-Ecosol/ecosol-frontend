/**
 * Testes do estado de busca que vive na URL.
 *
 * São funções pequenas, mas cada uma guarda um comportamento que, errado,
 * produz um bug difícil de reproduzir: filtro que some ao buscar, página que
 * não existe, ou "limpar filtro" que não limpa.
 */
import { describe, expect, it } from "vitest";

import { comParametros, paginaAtual, primeiro } from "@/lib/consulta";

describe("primeiro", () => {
  it("devolve o valor quando é único", () => {
    expect(primeiro("Centro")).toBe("Centro");
  });

  it("reduz a repetição da chave a um valor só", () => {
    // `?bairro=Centro&bairro=Fonseca` é URL válida. Sem esta redução, o filtro
    // receberia um array onde espera texto.
    expect(primeiro(["Centro", "Fonseca"])).toBe("Centro");
  });

  it("devolve undefined quando a chave não existe", () => {
    expect(primeiro(undefined)).toBeUndefined();
  });
});

describe("comParametros", () => {
  it("preserva os filtros atuais", () => {
    expect(comParametros({ bairro: "Centro", q: "feira" }, {})).toContain("bairro=Centro");
  });

  it("sobrescreve o que foi informado", () => {
    const busca = new URLSearchParams(comParametros({ page: "3" }, { page: 1 }));

    expect(busca.get("page")).toBe("1");
  });

  it("remove a chave quando o valor é undefined", () => {
    // É exatamente o que o botão "limpar filtro" faz. Se em vez de remover a
    // chave o código escrevesse `bairro=undefined`, o backend filtraria por um
    // bairro chamado "undefined" e a listagem viria vazia.
    const busca = new URLSearchParams(
      comParametros({ bairro: "Centro", q: "feira" }, { bairro: undefined }),
    );

    expect(busca.has("bairro")).toBe(false);
    expect(busca.get("q")).toBe("feira");
  });

  it("devolve string vazia quando não sobra nenhum parâmetro", () => {
    // Sem isto, o link viria como `/coletivos?`, que suja a barra de endereço
    // e conta como URL diferente para o buscador.
    expect(comParametros({ bairro: "Centro" }, { bairro: undefined })).toBe("");
  });
});

describe("paginaAtual", () => {
  it("lê o número da URL", () => {
    expect(paginaAtual("4")).toBe(4);
  });

  it("cai para a primeira página quando o valor não é utilizável", () => {
    // URL adulterada não merece página de erro: o backend responderia 404 a
    // todos estes, e a pessoa veria uma falha por ter mexido no endereço.
    for (const valor of ["abc", "-3", "0", "1.5", "", undefined]) {
      expect(paginaAtual(valor)).toBe(1);
    }
  });
});
