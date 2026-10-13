/**
 * Quais números a paginação mostra.
 *
 * A tabela é a da seção 4 do PRD de componentes, com os dois valores de
 * `vizinhos`: 1 no computador e 0 no celular.
 */
import { describe, expect, it } from "vitest";

import { paginasVisiveis } from "@/lib/paginacao";

/** `"1 … 4 5 6 … 20"` → a lista que a função devolve. */
function lista(texto: string) {
  return texto.split(" ").map((item) => (item === "…" ? "…" : Number(item)));
}

const CASOS: [atual: number, total: number, desktop: string, celular: string][] = [
  [3, 5, "1 2 3 4 5", "1 2 3 4 5"],
  [4, 7, "1 2 3 4 5 6 7", "1 … 4 … 7"],
  [1, 20, "1 2 … 20", "1 … 20"],
  [3, 20, "1 2 3 4 … 20", "1 2 3 … 20"],
  [4, 20, "1 2 3 4 5 … 20", "1 … 4 … 20"],
  [5, 20, "1 … 4 5 6 … 20", "1 … 5 … 20"],
  [17, 20, "1 … 16 17 18 19 20", "1 … 17 … 20"],
  [20, 20, "1 … 19 20", "1 … 20"],
];

describe("paginasVisiveis", () => {
  it.each(CASOS)("%i de %i", (atual, total, desktop, celular) => {
    expect(paginasVisiveis(atual, total, 1)).toEqual(lista(desktop));
    expect(paginasVisiveis(atual, total, 0)).toEqual(lista(celular));
  });

  it("traz a página atual para dentro do intervalo", () => {
    expect(paginasVisiveis(30, 20, 1)).toEqual(paginasVisiveis(20, 20, 1));
    expect(paginasVisiveis(0, 20, 1)).toEqual(paginasVisiveis(1, 20, 1));
  });

  it("nunca passa de 7 itens no computador nem de 5 no celular", () => {
    // É o que faz a paginação caber nos 328 px úteis de um celular de 360 px.
    for (let atual = 1; atual <= 50; atual++) {
      expect(paginasVisiveis(atual, 50, 1).length).toBeLessThanOrEqual(7);
      expect(paginasVisiveis(atual, 50, 0).length).toBeLessThanOrEqual(5);
    }
  });

  it("mostra sempre a página atual, em ordem e sem repetir número", () => {
    for (let atual = 1; atual <= 30; atual++) {
      const numeros = paginasVisiveis(atual, 30, 1).filter((item) => item !== "…");
      expect(numeros).toEqual([...numeros].sort((a, b) => Number(a) - Number(b)));
      expect(new Set(numeros).size).toBe(numeros.length);
      expect(numeros).toContain(atual);
    }
  });
});
