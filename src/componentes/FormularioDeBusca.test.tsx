/**
 * Formulário de busca da listagem.
 *
 * Duas coisas importam: que ele continue sendo um formulário GET, que
 * funciona sem JavaScript e leva os filtros junto sem levar a página; e que o
 * envio automático espere a pessoa parar de digitar.
 *
 * Fora do Next não há roteador, e o `<Form>` cai no envio nativo, que o
 * jsdom não implementa. Os testes do envio automático espionam o
 * `requestSubmit`, que é o que o componente chama.
 */
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FormularioDeBusca } from "@/componentes/FormularioDeBusca";
import type { ParametrosDaRota } from "@/lib/consulta";

function renderizar(parametros: ParametrosDaRota) {
  return render(
    <FormularioDeBusca
      parametros={parametros}
      rotulo="Buscar coletivos por nome ou descrição"
      placeholder="Buscar por nome ou descrição"
    />,
  );
}

const campo = () => screen.getByRole("searchbox", { name: "Buscar coletivos por nome ou descrição" });

describe("FormularioDeBusca", () => {
  it("é um formulário GET para a própria rota", () => {
    const { container } = renderizar({});
    const form = container.querySelector("form");

    // Sem `method`, o formulário é GET — é o que vale sem JavaScript.
    expect(form).not.toHaveAttribute("method", "post");
    expect(form?.method).toBe("get");
  });

  it("leva os filtros em campos ocultos, mas não a página nem a busca antiga", () => {
    const { container } = renderizar({
      q: "feira",
      categoria: ["1", "3"],
      bairro: "Centro",
      page: "4",
    });

    const ocultos = [...container.querySelectorAll<HTMLInputElement>('input[type="hidden"]')];
    const pares = ocultos.map((oculto) => `${oculto.name}=${oculto.value}`);

    expect(pares).toEqual(["categoria=1", "categoria=3", "bairro=Centro"]);
  });

  it("tem o campo de busca com rótulo e com o valor atual", () => {
    renderizar({ q: "feira" });

    expect(campo()).toHaveAttribute("type", "search");
    expect(campo()).toHaveAttribute("name", "q");
    expect(campo()).toHaveValue("feira");
  });

  it("tem a lupa escondida do leitor de tela", () => {
    const { container } = renderizar({});

    expect(container.querySelector(".lucide-search")).toHaveAttribute("aria-hidden", "true");
  });

  it("não tem botão, e o Enter envia: um campo de texto só, e a tecla Buscar no celular", () => {
    // O envio implícito do HTML só funciona sem botão quando há UM campo que
    // o bloqueia. Um segundo campo visível tiraria o Enter de quem está sem
    // JavaScript.
    const { container } = renderizar({ categoria: "1" });

    expect(screen.queryByRole("button")).toBeNull();
    expect(container.querySelectorAll('input:not([type="hidden"])')).toHaveLength(1);
    expect(campo()).toHaveAttribute("enterkeyhint", "search");
    expect(screen.getByRole("search")).toBeInTheDocument();
  });
});

describe("FormularioDeBusca — envio automático", () => {
  let enviar: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.useFakeTimers();
    enviar = vi.spyOn(HTMLFormElement.prototype, "requestSubmit").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    enviar.mockRestore();
  });

  it("espera a pessoa parar de digitar, e busca uma vez só", () => {
    renderizar({});

    fireEvent.change(campo(), { target: { value: "fe" } });
    vi.advanceTimersByTime(200);
    fireEvent.change(campo(), { target: { value: "feira" } });
    vi.advanceTimersByTime(399);
    expect(enviar).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(enviar).toHaveBeenCalledOnce();
  });

  it("não busca com uma letra só", () => {
    renderizar({});

    fireEvent.change(campo(), { target: { value: "f" } });
    vi.advanceTimersByTime(1000);

    expect(enviar).not.toHaveBeenCalled();
  });

  it("apagar tudo busca, para a lista voltar inteira", () => {
    renderizar({ q: "feira" });

    fireEvent.change(campo(), { target: { value: "" } });
    vi.advanceTimersByTime(400);

    expect(enviar).toHaveBeenCalledOnce();
  });

  it("não busca de novo o que já está na URL", () => {
    renderizar({ q: "feira" });

    fireEvent.change(campo(), { target: { value: "feira " } });
    vi.advanceTimersByTime(1000);

    expect(enviar).not.toHaveBeenCalled();
  });

  it("enviar com Enter cancela o envio automático pendente", () => {
    const { container } = renderizar({});

    fireEvent.change(campo(), { target: { value: "feira" } });
    fireEvent.submit(container.querySelector("form") as HTMLFormElement);
    vi.advanceTimersByTime(1000);

    expect(enviar).not.toHaveBeenCalled();
  });
});
