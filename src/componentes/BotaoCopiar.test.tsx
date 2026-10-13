/**
 * Botão de copiar o telefone.
 *
 * O jsdom não tem `navigator.clipboard` e não é contexto seguro. Cada teste
 * monta o navegador que quer simular com `Object.defineProperty`.
 */
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BotaoCopiar } from "@/componentes/BotaoCopiar";

function simularNavegador({
  seguro,
  writeText,
}: {
  seguro: boolean;
  writeText?: (texto: string) => Promise<void>;
}) {
  Object.defineProperty(window, "isSecureContext", { value: seguro, configurable: true });
  Object.defineProperty(navigator, "clipboard", {
    value: writeText ? { writeText } : undefined,
    configurable: true,
  });
}

afterEach(() => {
  vi.useRealTimers();
  simularNavegador({ seguro: false });
});

describe("BotaoCopiar", () => {
  it("não aparece quando o navegador não consegue copiar", () => {
    simularNavegador({ seguro: false, writeText: vi.fn() });
    const { container } = render(<BotaoCopiar texto="(21) 99999-0000" rotulo="telefone" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("não aparece sem a API de cópia, mesmo em contexto seguro", () => {
    simularNavegador({ seguro: true });
    const { container } = render(<BotaoCopiar texto="(21) 99999-0000" rotulo="telefone" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("copia o texto exatamente como veio e avisa", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    simularNavegador({ seguro: true, writeText });
    render(<BotaoCopiar texto="(21) 99999-0000" rotulo="telefone" />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copiar" }));
    });

    expect(writeText).toHaveBeenCalledWith("(21) 99999-0000");
    expect(screen.getByRole("button", { name: "Copiado" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Telefone copiado");
  });

  it("avisa quando a cópia falha", async () => {
    simularNavegador({
      seguro: true,
      writeText: vi.fn().mockRejectedValue(new Error("permissão negada")),
    });
    render(<BotaoCopiar texto="(21) 99999-0000" rotulo="telefone" />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copiar" }));
    });

    expect(screen.getByRole("button", { name: "Não deu para copiar" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Não foi possível copiar o telefone");
  });

  it("volta a Copiar depois de 2 segundos", async () => {
    vi.useFakeTimers();
    simularNavegador({ seguro: true, writeText: vi.fn().mockResolvedValue(undefined) });
    render(<BotaoCopiar texto="(21) 99999-0000" rotulo="telefone" />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copiar" }));
    });
    expect(screen.getByRole("button", { name: "Copiado" })).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByRole("button", { name: "Copiar" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });
});
