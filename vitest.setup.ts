// Matchers de DOM (`toBeInTheDocument`, `toHaveTextContent`) para a suíte
// inteira. Importar em cada arquivo de teste seria repetição que uma hora
// alguém esquece — e o teste esquecido falha por motivo errado.
import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// `next/font/google` não é uma biblioteca de verdade: o compilador do Next
// troca a chamada pelo arquivo da fonte durante o build. Fora dele (aqui) o
// import não tem função nenhuma, e qualquer teste que importe o `layout.tsx`
// quebraria. A fonte é estética; o que a suíte confere não depende dela.
vi.mock("next/font/google", () => ({
  Bricolage_Grotesque: () => ({
    className: "",
    variable: "",
    style: { fontFamily: "system-ui" },
  }),
}));
