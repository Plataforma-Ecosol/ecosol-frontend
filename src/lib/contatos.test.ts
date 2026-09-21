/**
 * Normalização dos contatos digitados à mão.
 *
 * Cada caso aqui é uma forma real de preencher o campo no Admin. Link quebrado
 * num perfil público é pior do que ausência de link: parece que o coletivo
 * saiu do ar.
 */
import { describe, expect, it } from "vitest";

import { arrobaDoInstagram, urlDoInstagram, urlDoSite } from "@/lib/contatos";

describe("urlDoInstagram", () => {
  it("aceita as três formas de escrever o mesmo perfil", () => {
    const esperado = "https://instagram.com/sementesdovale";

    expect(urlDoInstagram("@sementesdovale")).toBe(esperado);
    expect(urlDoInstagram("sementesdovale")).toBe(esperado);
    expect(urlDoInstagram("instagram.com/sementesdovale")).toBe(esperado);
  });

  it("preserva o endereço completo já cadastrado", () => {
    // Reconstruir a URL quebraria um link com subcaminho ou parâmetro.
    const url = "https://www.instagram.com/sementesdovale/";

    expect(urlDoInstagram(url)).toBe(url);
  });

  it("devolve undefined para valor em branco", () => {
    expect(urlDoInstagram("   ")).toBeUndefined();
  });
});

describe("arrobaDoInstagram", () => {
  it("mostra sempre com @, venha como vier", () => {
    expect(arrobaDoInstagram("sementesdovale")).toBe("@sementesdovale");
    expect(arrobaDoInstagram("@sementesdovale")).toBe("@sementesdovale");
    expect(arrobaDoInstagram("https://www.instagram.com/sementesdovale/")).toBe(
      "@sementesdovale",
    );
  });
});

describe("urlDoSite", () => {
  it("acrescenta o esquema quando falta", () => {
    // Sem isto o href vira caminho RELATIVO: o navegador abriria
    // `/coletivos/ecosolniteroi.org`, um 404 dentro do próprio site.
    expect(urlDoSite("ecosolniteroi.org")).toBe("https://ecosolniteroi.org");
  });

  it("não mexe no endereço que já tem esquema", () => {
    expect(urlDoSite("http://ecosolniteroi.org")).toBe("http://ecosolniteroi.org");
  });

  it("devolve undefined para valor em branco", () => {
    expect(urlDoSite("")).toBeUndefined();
  });
});
