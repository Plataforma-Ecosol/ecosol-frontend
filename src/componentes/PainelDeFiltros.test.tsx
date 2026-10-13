/**
 * Painel de filtros: o botão, o `<dialog>` e o formulário.
 *
 * O `showModal()` e o `close()` do jsdom são simulados no `vitest.setup.ts`.
 */
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CamposDeColetivo, CamposDeEvento } from "@/componentes/CamposDeFiltro";
import { PainelDeFiltros } from "@/componentes/PainelDeFiltros";
import type { ParametrosDaRota } from "@/lib/consulta";
import { CHAVES_DE_COLETIVO } from "@/lib/filtros";

const OPCOES = {
  categorias: [
    { id: 1, nome: "Alimentação", slug: "alimentacao" },
    { id: 3, nome: "Moda", slug: "moda" },
  ],
  bairros: ["Centro", "Icaraí"],
};

/** Renderiza o painel já aberto: fechado, o `<dialog>` some da árvore de acessibilidade. */
function painelDeColetivos(parametros: ParametrosDaRota, quantidade = 0) {
  const resultado = render(
    <PainelDeFiltros
      rota="/coletivos"
      parametros={parametros}
      chaves={CHAVES_DE_COLETIVO}
      quantidade={quantidade}
    >
      <CamposDeColetivo opcoes={OPCOES} parametros={parametros} />
    </PainelDeFiltros>,
  );
  fireEvent.click(screen.getByRole("button", { name: /^Filtros/ }));
  return resultado;
}

const dialogo = () => screen.getByRole("dialog", { hidden: true });

it("começa fechado", () => {
  render(
    <PainelDeFiltros rota="/coletivos" parametros={{}} chaves={CHAVES_DE_COLETIVO} quantidade={0}>
      <CamposDeColetivo opcoes={OPCOES} parametros={{}} />
    </PainelDeFiltros>,
  );

  expect(dialogo()).not.toHaveAttribute("open");
});

describe("PainelDeFiltros", () => {
  it("abre pelo botão e fecha pelo X", () => {
    painelDeColetivos({});
    expect(dialogo()).toHaveAttribute("open");

    fireEvent.click(within(dialogo()).getByRole("button", { name: "Fechar filtros" }));
    expect(dialogo()).not.toHaveAttribute("open");
  });

  it("mostra no botão quantos filtros estão em vigor", () => {
    painelDeColetivos({ categoria: ["1", "3"] }, 2);

    expect(screen.getByRole("button", { name: "Filtros 2 ativos", hidden: true })).toBeInTheDocument();
  });

  it("mantém a busca em campo oculto, sem a página nem as chaves do painel", () => {
    painelDeColetivos({ q: "feira", page: "3", categoria: "1", bairro: "Centro" });

    const ocultos = [
      ...dialogo().querySelectorAll<HTMLInputElement>('input[type="hidden"]'),
    ].map((campo) => `${campo.name}=${campo.value}`);
    expect(ocultos).toEqual(["q=feira"]);
  });

  it("Limpar tira os filtros do painel e mantém a busca", () => {
    painelDeColetivos({ q: "feira", page: "3", categoria: ["1", "3"], bairro: "Centro" });

    const limpar = within(dialogo()).getByRole("link", { name: "Limpar" });
    expect(limpar).toHaveAttribute("href", "/coletivos?q=feira");
  });

  it("fecha ao aplicar os filtros", () => {
    painelDeColetivos({});

    fireEvent.submit(dialogo().querySelector("form") as HTMLFormElement);

    expect(dialogo()).not.toHaveAttribute("open");
  });
});

describe("CamposDeColetivo", () => {
  it("marca as categorias da URL, com o mesmo name para gerar a chave repetida", () => {
    painelDeColetivos({ categoria: ["3"] });

    const moda = within(dialogo()).getByRole("checkbox", { name: "Moda" });
    const alimentacao = within(dialogo()).getByRole("checkbox", { name: "Alimentação" });
    expect(moda).toBeChecked();
    expect(alimentacao).not.toBeChecked();
    expect(moda).toHaveAttribute("name", "categoria");
    expect(alimentacao).toHaveAttribute("name", "categoria");
  });

  it("seleciona o bairro da URL mesmo com outra grafia", () => {
    // O link do cartão usa a grafia daquele coletivo; a lista, a da API.
    painelDeColetivos({ bairro: "centro" });

    expect(within(dialogo()).getByRole("combobox", { name: "Bairro" })).toHaveValue("Centro");
  });

  it("mantém um bairro da URL que não está na lista, em vez de apagá-lo", () => {
    painelDeColetivos({ bairro: "Jurujuba" });

    expect(within(dialogo()).getByRole("combobox", { name: "Bairro" })).toHaveValue("Jurujuba");
  });

  it("sem as opções, avisa em vez de mostrar um painel vazio", () => {
    render(<CamposDeColetivo opcoes={null} parametros={{}} />);

    expect(screen.getByText(/Não foi possível carregar as opções/)).toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).toBeNull();
  });
});

describe("CamposDeEvento", () => {
  it("preenche as datas da URL e cruza min e max", () => {
    const { container } = render(
      <CamposDeEvento
        opcoes={{ bairros: ["Centro"] }}
        parametros={{ de: "2026-10-01", ate: "2026-10-31" }}
      />,
    );

    const de = container.querySelector<HTMLInputElement>('input[name="de"]');
    const ate = container.querySelector<HTMLInputElement>('input[name="ate"]');
    expect(de).toHaveValue("2026-10-01");
    expect(de).toHaveAttribute("max", "2026-10-31");
    expect(ate).toHaveValue("2026-10-31");
    expect(ate).toHaveAttribute("min", "2026-10-01");
  });

  it("ignora data fora do formato da API", () => {
    const { container } = render(
      <CamposDeEvento opcoes={{ bairros: [] }} parametros={{ de: "01/10/2026" }} />,
    );

    expect(container.querySelector('input[name="de"]')).toHaveValue("");
  });

  it("sem as opções, as datas continuam e o bairro dá lugar ao aviso", () => {
    const { container } = render(<CamposDeEvento opcoes={null} parametros={{}} />);

    expect(container.querySelector('input[name="de"]')).not.toBeNull();
    expect(screen.queryByRole("combobox")).toBeNull();
    expect(screen.getByText(/Não foi possível carregar as opções/)).toBeInTheDocument();
  });
});
