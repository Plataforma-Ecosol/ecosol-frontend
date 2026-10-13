/**
 * Os filtros em vigor e o texto de cada chip.
 */
import { describe, expect, it } from "vitest";

import {
  dataDoFiltro,
  filtrosAtivosDeColetivos,
  filtrosAtivosDeEventos,
} from "@/lib/filtros";

const CATEGORIAS = [
  { id: 1, nome: "Alimentação", slug: "alimentacao" },
  { id: 3, nome: "Moda", slug: "moda" },
];

describe("filtrosAtivosDeColetivos", () => {
  it("um chip por categoria, mais o bairro", () => {
    const ativos = filtrosAtivosDeColetivos(
      { categoria: ["1", "3"], bairro: "Centro", q: "feira", page: "2" },
      CATEGORIAS,
    );

    expect(ativos.map((filtro) => filtro.rotulo)).toEqual([
      "Categoria: Alimentação",
      "Categoria: Moda",
      "Bairro: Centro",
    ]);
  });

  it("mostra o id quando o nome da categoria não está nas opções", () => {
    const [filtro] = filtrosAtivosDeColetivos({ categoria: "9" }, CATEGORIAS);

    expect(filtro).toEqual({ chave: "categoria", valor: "9", rotulo: "Categoria: 9" });
  });

  it("busca e página não são filtro", () => {
    expect(filtrosAtivosDeColetivos({ q: "feira", page: "2" }, CATEGORIAS)).toEqual([]);
  });
});

describe("filtrosAtivosDeEventos", () => {
  it("datas no formato da tela, mais o bairro", () => {
    const ativos = filtrosAtivosDeEventos({
      de: "2026-10-01",
      ate: "2026-10-31",
      bairro: "Icaraí",
      periodo: "passados",
    });

    expect(ativos.map((filtro) => filtro.rotulo)).toEqual([
      "A partir de 01/10/2026",
      "Até 31/10/2026",
      "Bairro: Icaraí",
    ]);
  });

  it("ignora data fora do formato", () => {
    expect(filtrosAtivosDeEventos({ de: "01/10/2026" })).toEqual([]);
  });
});

describe("dataDoFiltro", () => {
  it("aceita só AAAA-MM-DD de um dia que existe", () => {
    expect(dataDoFiltro("2026-02-28")).toBe("2026-02-28");
    expect(dataDoFiltro("2026-02-30")).toBeUndefined();
    expect(dataDoFiltro("2026-2-3")).toBeUndefined();
    expect(dataDoFiltro("ontem")).toBeUndefined();
    expect(dataDoFiltro(undefined)).toBeUndefined();
  });
});
