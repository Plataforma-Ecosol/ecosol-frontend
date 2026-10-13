/**
 * Filtros em vigor, nas duas listagens.
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FiltrosAtivos } from "@/componentes/FiltrosAtivos";
import type { ParametrosDaRota } from "@/lib/consulta";
import { filtrosAtivosDeColetivos, filtrosAtivosDeEventos } from "@/lib/filtros";

const CATEGORIAS = [
  { id: 1, nome: "Alimentação", slug: "alimentacao" },
  { id: 3, nome: "Moda", slug: "moda" },
];

function deColetivos(parametros: ParametrosDaRota) {
  return render(
    <FiltrosAtivos
      filtros={filtrosAtivosDeColetivos(parametros, CATEGORIAS)}
      parametros={parametros}
      rota="/coletivos"
    />,
  );
}

/** Os parâmetros de um `href`, com as chaves repetidas em lista. */
function parametrosDe(link: HTMLElement) {
  const url = new URL(link.getAttribute("href") ?? "", "http://x");
  const resultado: Record<string, string[]> = {};
  for (const chave of new Set(url.searchParams.keys())) {
    resultado[chave] = url.searchParams.getAll(chave);
  }
  return resultado;
}

describe("FiltrosAtivos", () => {
  it("não aparece sem filtro", () => {
    const { container } = deColetivos({ q: "feira" });

    expect(container).toBeEmptyDOMElement();
  });

  it("com um filtro, mostra um chip e nenhum Limpar tudo", () => {
    deColetivos({ bairro: "Centro" });

    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(screen.queryByRole("link", { name: "Limpar tudo" })).toBeNull();
  });

  it("o chip tira só o seu filtro, e volta para a primeira página", () => {
    deColetivos({ q: "feira", categoria: "3", bairro: "Centro", page: "2" });

    const chip = screen.getByRole("link", { name: /Bairro: Centro/ });
    expect(chip.getAttribute("href")).toMatch(/^\/coletivos\?/);
    expect(parametrosDe(chip)).toEqual({ q: ["feira"], categoria: ["3"] });
  });

  it("com duas categorias, remover uma mantém a outra", () => {
    deColetivos({ categoria: ["1", "3"] });

    const moda = screen.getByRole("link", { name: /Categoria: Moda/ });
    expect(parametrosDe(moda)).toEqual({ categoria: ["1"] });
  });

  it("Limpar tudo tira os filtros e a página, mas mantém a busca", () => {
    deColetivos({ q: "feira", categoria: ["1", "3"], bairro: "Centro", page: "2" });

    const limpar = screen.getByRole("link", { name: "Limpar tudo" });
    expect(parametrosDe(limpar)).toEqual({ q: ["feira"] });
  });

  it("na agenda, mantém a aba ao limpar", () => {
    const parametros = { periodo: "passados", de: "2026-10-01", bairro: "Centro" };
    render(
      <FiltrosAtivos
        filtros={filtrosAtivosDeEventos(parametros)}
        parametros={parametros}
        rota="/eventos"
      />,
    );

    expect(screen.getByRole("link", { name: /A partir de 01\/10\/2026/ })).toBeInTheDocument();
    const limpar = screen.getByRole("link", { name: "Limpar tudo" });
    expect(limpar.getAttribute("href")).toBe("/eventos?periodo=passados");
  });

  it("cada chip diz ao leitor de tela que remove o filtro", () => {
    deColetivos({ categoria: "3", bairro: "Centro" });

    const chips = screen.getAllByRole("link", { name: /\(remover este filtro\)$/ });
    expect(chips).toHaveLength(2);
    for (const chip of chips) {
      expect(chip.querySelector(".lucide-x")?.closest("[aria-hidden]")).not.toBeNull();
    }
  });
});
