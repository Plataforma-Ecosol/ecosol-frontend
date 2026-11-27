/**
 * O subgrupo "Casa Azul" mostra o contato da Casa — e só o que foi confirmado.
 *
 * Os dados vêm de `lib/casa.ts`, trocado aqui por um objeto que cada teste
 * pode esvaziar. É assim que se prova a regra que mais importa: campo ausente
 * some inteiro, com ícone e rótulo, sem deixar "Telefone:" sozinho na tela.
 *
 * Estes casos vieram de `app/saiba-mais/page.test.tsx` quando a página se
 * dividiu em subgrupos, sem mudança nas asserções. As exceções: a `url` do
 * JSON-LD, que agora é a da página da Casa, e o h1, testado na rota.
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

const { ConteudoCasaAzul } = await import("@/componentes/saiba-mais/ConteudoCasaAzul");

/** Só o nome — o mínimo que a página aceita. */
const SO_O_NOME: Casa = { nome: REAL.nome };

beforeEach(() => {
  dados.casa = { ...REAL };
});

function renderizar() {
  return render(<ConteudoCasaAzul />);
}

function contato() {
  const secao = document.getElementById("contato");
  expect(secao).not.toBeNull();
  const endereco = secao?.querySelector("address");
  expect(endereco).not.toBeNull();
  return endereco as HTMLElement;
}

describe("Casa Azul — com os dados confirmados", () => {
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
});

describe("Casa Azul — WhatsApp", () => {
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

describe("Casa Azul — dado ausente não aparece", () => {
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

  it("só com o telefone de exibir, ele aparece sem link, e o JSON-LD publica o mesmo número", () => {
    dados.casa = { nome: REAL.nome, telefone: REAL.telefone };
    const { container } = renderizar();

    expect(within(contato()).getByText("(21) 2717-8350")).toBeInTheDocument();
    expect(container.querySelector('a[href^="tel:"]')).toBeNull();
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(JSON.parse(script?.textContent ?? "")).toHaveProperty("telephone", "(21) 2717-8350");
  });

  it("só com o telefone de discar, nada de telefone na página nem no JSON-LD", () => {
    dados.casa = { nome: REAL.nome, telefone_discagem: REAL.telefone_discagem };
    const { container } = renderizar();

    expect(document.getElementById("contato")).toBeNull();
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(JSON.parse(script?.textContent ?? "")).not.toHaveProperty("telephone");
  });

  it("sem nenhum contato, o bloco some com o título", () => {
    dados.casa = SO_O_NOME;
    renderizar();

    expect(document.getElementById("contato")).toBeNull();
    expect(screen.queryByRole("heading", { name: "Fale com a Casa" })).toBeNull();
  });
});

describe("Casa Azul — JSON-LD", () => {
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

  it("aponta para a página da Casa, onde o contato completo mora", () => {
    const { container } = renderizar();

    expect(jsonLd(container).url).toMatch(/\/saiba-mais\/casa-azul$/);
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

/** A grade de duas colunas (texto e contato lado a lado) a partir do `md`. */
const GRADE = '[class~="md:grid-cols-2"]';

describe("Casa Azul — com as seções do Admin", () => {
  const secao = {
    id: 1, slug: "quem-somos", subgrupo: "casa-azul",
    titulo: "Quem somos, pelo Admin", texto: "Texto vindo do Admin.",
    imagem: null, imagem_descricao: "", atualizado_em: "2026-11-20T10:00:00-03:00",
  };

  it("mostra as seções no lugar do 'Quem somos' fixo, ao lado do contato", () => {
    const { container } = render(<ConteudoCasaAzul secoes={[secao]} />);

    expect(screen.getByRole("heading", { name: "Quem somos, pelo Admin" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Quem somos" })).toBeNull();
    expect(container.querySelector(GRADE)).not.toBeNull();
    expect(document.getElementById("contato")).not.toBeNull();
  });

  it("sem seção publicada, fica só o contato, sem o texto fixo", () => {
    const { container } = render(<ConteudoCasaAzul secoes={[]} />);

    expect(screen.queryByRole("heading", { name: "Quem somos" })).toBeNull();
    expect(screen.getByRole("heading", { name: "Fale com a Casa" })).toBeInTheDocument();
    // Uma coluna só: sem texto, a grade deixaria metade da largura vazia.
    expect(container.querySelector(GRADE)).toBeNull();
  });

  it("o JSON-LD da Casa continua, com ou sem a API", () => {
    for (const secoes of [[secao], [], null]) {
      const { container, unmount } = render(<ConteudoCasaAzul secoes={secoes} />);
      expect(container.querySelector('script[type="application/ld+json"]')).not.toBeNull();
      unmount();
    }
  });
});
