/**
 * A página "Saiba mais" mostra o contato da Casa — e só o que foi confirmado.
 *
 * Os dados vêm de `lib/casa.ts`, trocado aqui por um objeto que cada teste
 * pode esvaziar. É assim que se prova a regra que mais importa: campo ausente
 * some inteiro, com ícone e rótulo, sem deixar "Telefone:" sozinho na tela.
 */
import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Casa } from "@/lib/casa";

const { CASA: REAL } = await vi.importActual<typeof import("@/lib/casa")>("@/lib/casa");

const dados = vi.hoisted(() => ({ casa: {} as Casa }));
vi.mock("@/lib/casa", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/casa")>()),
  get CASA() {
    return dados.casa;
  },
}));

const { default: SaibaMais } = await import("@/app/saiba-mais/page");

/** Só o nome — o mínimo que a página aceita. */
const SO_O_NOME: Casa = { nome: REAL.nome };

beforeEach(() => {
  dados.casa = { ...REAL };
});

function renderizar() {
  return render(<SaibaMais />);
}

function contato() {
  const secao = document.getElementById("contato");
  expect(secao).not.toBeNull();
  const endereco = secao?.querySelector("address");
  expect(endereco).not.toBeNull();
  return endereco as HTMLElement;
}

describe("Saiba mais — com os dados confirmados", () => {
  it("o h1 é o nome da Casa, e não o nome da aba", () => {
    renderizar();

    expect(
      screen.getByRole("heading", { level: 1, name: "Casa da Economia Solidária Paul Singer" }),
    ).toBeInTheDocument();
  });

  it("os contatos ficam num <address> dentro do bloco #contato", () => {
    renderizar();
    const caixa = within(contato());

    expect(caixa.getByRole("link", { name: "(21) 2717-8350" })).toHaveAttribute(
      "href",
      "tel:+552127178350",
    );
    expect(caixa.getByRole("link", { name: "coordenaecosol@gmail.com" })).toHaveAttribute(
      "href",
      "mailto:coordenaecosol@gmail.com",
    );
    expect(
      caixa.getByRole("link", { name: "@casapaulsinger (abre em nova aba)" }),
    ).toHaveAttribute("href", "https://www.instagram.com/casapaulsinger/");
    expect(caixa.getByRole("link", { name: "Facebook (abre em nova aba)" })).toHaveAttribute(
      "href",
      "https://www.facebook.com/economiasolidaria.niteroirj/",
    );

    const mapa = caixa.getByRole("link", { name: "Ver no mapa (abre em nova aba)" });
    expect(mapa.getAttribute("href")).toMatch(/^https:\/\/www\.google\.com\/maps\/search\//);
    expect(mapa).toHaveAttribute("target", "_blank");
  });

  it("os links externos abrem em nova aba sem passar o `opener`", () => {
    renderizar();

    for (const link of screen.getAllByRole("link", { name: /abre em nova aba/ })) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  it("o horário aparece em duas linhas", () => {
    renderizar();

    const horario = screen.getByText(/Segunda a sexta-feira/);
    expect(horario).toHaveClass("whitespace-pre-line");
    expect(horario.textContent).toContain("das 10h às 16h\nPara cadastros, até as 17h");
  });

  it("o primeiro botão de contato é o cheio, e os outros são contorno", () => {
    renderizar();
    const caixa = within(contato());

    expect(caixa.getByRole("link", { name: "coordenaecosol@gmail.com" })).toHaveAttribute(
      "data-variant",
      "default",
    );
    expect(
      caixa.getByRole("link", { name: "@casapaulsinger (abre em nova aba)" }),
    ).toHaveAttribute("data-variant", "outline");
    expect(caixa.getByRole("link", { name: "Facebook (abre em nova aba)" })).toHaveAttribute(
      "data-variant",
      "outline",
    );
  });

  it("os botões da Rede levam aos coletivos e à agenda", () => {
    renderizar();

    expect(screen.getByRole("link", { name: "Conheça os coletivos" })).toHaveAttribute(
      "href",
      "/coletivos",
    );
    expect(screen.getByRole("link", { name: "Veja a agenda" })).toHaveAttribute(
      "href",
      "/eventos",
    );
  });

  it("o ITES aparece por extenso, com o endereço do campus fora do contato da Casa", () => {
    renderizar();

    expect(
      screen.getByText(/Incubadora Tecnológica de Empreendimentos Solidários/),
    ).toBeInTheDocument();
    const ites = screen.getByText(/Estr\. Washington Luís, 1596/);
    expect(contato()).not.toContainElement(ites);
  });
});

describe("Saiba mais — WhatsApp", () => {
  it("entra entre o e-mail e o Instagram", () => {
    dados.casa = { ...REAL, whatsapp: "5521999990000" };
    renderizar();

    const botoes = within(contato())
      .getAllByRole("listitem")
      .map((item) => item.textContent);
    expect(botoes).toEqual([
      "coordenaecosol@gmail.com",
      "WhatsApp (abre em nova aba)",
      "@casapaulsinger (abre em nova aba)",
      "Facebook (abre em nova aba)",
    ]);
    expect(screen.getByRole("link", { name: "WhatsApp (abre em nova aba)" })).toHaveAttribute(
      "href",
      "https://wa.me/5521999990000",
    );
  });
});

describe("Saiba mais — dado ausente não aparece", () => {
  it("sem telefone, WhatsApp, redes e horário, nada deles na tela", () => {
    dados.casa = { nome: REAL.nome, email: REAL.email, endereco: REAL.endereco };
    const { container } = renderizar();

    expect(container.querySelector('a[href^="tel:"]')).toBeNull();
    expect(container.querySelector('a[href*="wa.me"]')).toBeNull();
    expect(container.querySelector(".lucide-phone")).toBeNull();
    expect(container.querySelector(".lucide-clock")).toBeNull();
    expect(screen.queryByText(/Telefone:/)).toBeNull();
    expect(screen.queryByText(/Horário de atendimento:/)).toBeNull();
    expect(screen.queryByRole("link", { name: /Facebook/ })).toBeNull();
    expect(screen.queryByRole("link", { name: /@casapaulsinger/ })).toBeNull();
    expect(screen.queryByRole("button", { name: "Copiar" })).toBeNull();
  });

  it("sem e-mail, o primeiro contato presente ganha o botão cheio", () => {
    dados.casa = { ...REAL, email: undefined };
    renderizar();

    expect(
      screen.getByRole("link", { name: "@casapaulsinger (abre em nova aba)" }),
    ).toHaveAttribute("data-variant", "default");
  });

  it("sem texto, sem o título: nenhum 'Quem somos' na tela", () => {
    dados.casa = { ...REAL, quem_somos: undefined };
    renderizar();

    expect(screen.queryByRole("heading", { name: "Quem somos" })).toBeNull();
  });

  it("com o texto, o 'Quem somos' aparece, com os parágrafos preservados", () => {
    renderizar();

    expect(screen.getByRole("heading", { name: "Quem somos" })).toBeInTheDocument();
    const texto = screen.getByText(/Centro Público de Referência em Economia Solidária de Niterói/);
    expect(texto).toHaveClass("whitespace-pre-line");
    expect(texto.textContent).toContain("\n\n");
  });

  it("sem o texto da Rede, os botões continuam", () => {
    dados.casa = { ...REAL, sobre_a_rede: undefined };
    renderizar();

    expect(screen.queryByText(/reúne coletivos/)).toBeNull();
    expect(screen.getByRole("link", { name: "Conheça os coletivos" })).toBeInTheDocument();
  });

  it("sem nenhum contato, o bloco some com o título", () => {
    dados.casa = SO_O_NOME;
    renderizar();

    expect(document.getElementById("contato")).toBeNull();
    expect(screen.queryByRole("heading", { name: "Fale com a Casa" })).toBeNull();
    // A Rede continua com os botões: quem chegou aqui precisa de um caminho.
    expect(screen.getByRole("link", { name: "Conheça os coletivos" })).toBeInTheDocument();
  });
});

describe("Saiba mais — JSON-LD", () => {
  function jsonLd(container: HTMLElement) {
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    return JSON.parse(script?.textContent ?? "");
  }

  it("é JSON válido, com os dados da Casa", () => {
    const { container } = renderizar();
    const dadosEstruturados = jsonLd(container);

    expect(dadosEstruturados).toMatchObject({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: REAL.nome,
      telephone: "+552127178350",
      email: "coordenaecosol@gmail.com",
      address: REAL.endereco,
      sameAs: [
        "https://www.instagram.com/casapaulsinger/",
        "https://www.facebook.com/economiasolidaria.niteroirj/",
      ],
    });
  });

  it("não tem chave vazia quando falta dado", () => {
    dados.casa = SO_O_NOME;
    const { container } = renderizar();
    const dadosEstruturados = jsonLd(container);

    for (const [chave, valor] of Object.entries(dadosEstruturados)) {
      expect(valor, chave).not.toBeUndefined();
      expect(valor, chave).not.toBe("");
      expect(valor, chave).not.toEqual([]);
    }
    expect(dadosEstruturados).not.toHaveProperty("telephone");
    expect(dadosEstruturados).not.toHaveProperty("sameAs");
  });
});
