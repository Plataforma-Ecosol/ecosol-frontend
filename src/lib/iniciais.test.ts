import { describe, expect, it } from "vitest";

import { iniciaisDoNome } from "@/lib/iniciais";

describe("iniciaisDoNome", () => {
  it.each([
    ["Mãos de Barro", "MB"],
    ["Sementes do Vale", "SV"],
    ["Costura", "C"],
    ["Ágape e Arte", "ÁA"],
    ["(Re)Costura Solidária", "RS"],
    ["Grupo das Mulheres da Engenhoca", "GM"],
  ])("%s → %s", (nome, esperado) => {
    expect(iniciaisDoNome(nome)).toBe(esperado);
  });

  it("devolve string vazia para nome só com símbolos", () => {
    expect(iniciaisDoNome("*** — !!")).toBe("");
  });
});
