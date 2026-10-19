/**
 * Os dados da Casa e os links montados a partir deles.
 *
 * A guarda dos dados é o teste que importa: `casa.ts` é editado à mão, e um
 * "a definir" ou um número sem DDI passaria pela revisão e chegaria à
 * produção como um telefone que ninguém consegue discar.
 */
import { describe, expect, it } from "vitest";

import { CASA, urlDoMapa, urlDoWhatsapp } from "@/lib/casa";

describe("urlDoMapa", () => {
  it("codifica acentos e vírgulas", () => {
    const url = urlDoMapa("Av. Ernani do Amaral Peixoto, 901 - Centro, Niterói - RJ");

    expect(url).toMatch(/^https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=/);
    expect(url).toContain("Niter%C3%B3i");
    expect(url).toContain("%2C");
    expect(url).not.toContain(" ");
  });
});

describe("urlDoWhatsapp", () => {
  it("monta o wa.me só com dígitos", () => {
    expect(urlDoWhatsapp("+55 (21) 99999-0000")).toBe("https://wa.me/5521999990000");
  });
});

describe("guarda dos dados da Casa", () => {
  it("telefone de discagem no formato internacional", () => {
    if (CASA.telefone_discagem) expect(CASA.telefone_discagem).toMatch(/^\+55\d{10,11}$/);
  });

  it("WhatsApp só com dígitos e DDI", () => {
    if (CASA.whatsapp) expect(CASA.whatsapp).toMatch(/^55\d{10,11}$/);
  });

  it("telefone de exibir e de discar existem juntos, ou nenhum dos dois", () => {
    expect(Boolean(CASA.telefone)).toBe(Boolean(CASA.telefone_discagem));
  });

  it("os dois números são o mesmo telefone", () => {
    if (!CASA.telefone || !CASA.telefone_discagem) return;
    expect(`+55${CASA.telefone.replace(/\D/g, "")}`).toBe(CASA.telefone_discagem);
  });

  it("Facebook e Instagram são endereços completos, com https", () => {
    if (CASA.facebook) expect(CASA.facebook).toMatch(/^https:\/\//);
    if (CASA.instagram) expect(CASA.instagram).toMatch(/^https:\/\//);
  });

  it("nenhum campo com texto provisório", () => {
    for (const [campo, valor] of Object.entries(CASA)) {
      expect(valor, campo).not.toMatch(/a definir|xxxx|TODO|lorem/i);
      expect(String(valor).trim(), campo).not.toBe("");
    }
  });
});
