/**
 * Os dados da Casa e os links montados a partir deles.
 *
 * A guarda dos dados é o teste que importa: `casa.ts` é editado à mão, e um
 * "a definir" ou um número sem DDI passaria pela revisão e chegaria à
 * produção como um telefone que ninguém consegue discar.
 */
import { describe, expect, it } from "vitest";

import { CASA, telefoneDaCasa, temContato, urlDoMapa, urlDoWhatsapp } from "@/lib/casa";

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
      expect(valor, campo).not.toMatch(TEXTO_PROVISORIO);
      expect(valor, campo).not.toMatch(MARCA_TODO);
      expect(String(valor).trim(), campo).not.toBe("");
    }
  });
});

// `TODO` fora do `/i` e com borda de palavra: senão "todos" e "todas", comuns
// no português, quebrariam o CI com um texto válido.
const TEXTO_PROVISORIO = /a definir|xxxx|lorem/i;
const MARCA_TODO = /\bTODO\b/;

describe("detecção de texto provisório", () => {
  it.each(["para todos os coletivos", "Todas as feiras", "todo mês"])(
    "aceita %j",
    (texto) => {
      expect(texto).not.toMatch(TEXTO_PROVISORIO);
      expect(texto).not.toMatch(MARCA_TODO);
    },
  );

  it.each(["TODO", "TODO: confirmar", "A definir", "Lorem ipsum"])("recusa %j", (texto) => {
    expect(TEXTO_PROVISORIO.test(texto) || MARCA_TODO.test(texto)).toBe(true);
  });
});

describe("telefoneDaCasa", () => {
  it("com os dois números, mostra um e disca o outro", () => {
    expect(
      telefoneDaCasa({ nome: "Casa", telefone: "(21) 2717-8350", telefone_discagem: "+552127178350" }),
    ).toEqual({ exibir: "(21) 2717-8350", discagem: "+552127178350" });
  });

  it("só com o de exibir, o telefone aparece sem número de discagem", () => {
    expect(telefoneDaCasa({ nome: "Casa", telefone: "(21) 2717-8350" })).toEqual({
      exibir: "(21) 2717-8350",
      discagem: undefined,
    });
  });

  it("só com o de discar, não há telefone", () => {
    expect(telefoneDaCasa({ nome: "Casa", telefone_discagem: "+552127178350" })).toBeUndefined();
  });
});

describe("temContato", () => {
  it("só com o nome, não há bloco de contato", () => {
    expect(temContato({ nome: "Casa" })).toBe(false);
  });

  it("qualquer contato visível basta", () => {
    expect(temContato({ nome: "Casa", endereco: "Rua A, 1" })).toBe(true);
    expect(temContato({ nome: "Casa", telefone: "(21) 2717-8350" })).toBe(true);
  });

  it("número só de discar e Instagram sem usuário não contam: a página não os mostra", () => {
    expect(temContato({ nome: "Casa", telefone_discagem: "+552127178350", instagram: "@" })).toBe(
      false,
    );
  });
});
