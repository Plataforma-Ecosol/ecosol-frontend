// Matchers de DOM (`toBeInTheDocument`, `toHaveTextContent`) para a suíte
// inteira. Importar em cada arquivo de teste seria repetição que uma hora
// alguém esquece — e o teste esquecido falha por motivo errado.
import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// `next/font/google` não é uma biblioteca de verdade: o compilador do Next
// troca a chamada pelo arquivo da fonte durante o build. Fora dele (aqui) o
// import não tem função nenhuma, e qualquer teste que importe o `layout.tsx`
// quebraria. A fonte é estética; o que a suíte confere não depende dela.
// O jsdom não implementa o `<dialog>` modal: não há `showModal()` nem
// `close()`. O mínimo do comportamento nativo de que o menu do celular
// depende — abrir, fechar avisando com o evento `close`, e o `Esc` — fica
// simulado aqui, para que os testes confiram só o que é do componente. Foco
// preso e página inerte são do navegador, e o jsdom não os teria de qualquer
// jeito.
if (typeof HTMLDialogElement !== "undefined" && !HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    if (!this.hasAttribute("open")) return;
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
  document.addEventListener("keydown", (evento) => {
    if (evento.key !== "Escape") return;
    document.querySelectorAll<HTMLDialogElement>("dialog[open]").forEach((d) => d.close());
  });
}

vi.mock("next/font/google", () => ({
  Bricolage_Grotesque: () => ({
    className: "",
    variable: "",
    style: { fontFamily: "system-ui" },
  }),
}));
