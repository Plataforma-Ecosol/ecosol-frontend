/**
 * A lista dos subgrupos do "Saiba mais".
 *
 * O primeiro teste é a guarda contra o frontend divergir do backend: os slugs
 * são os valores de `SecaoSaibaMais.Subgrupo` (`rede/models/secao_saiba_mais.py`),
 * e o conteúdo vindo da API (frontend#75) depende dessa igualdade.
 */
import { PHASE_PRODUCTION_BUILD } from "next/constants";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CASA } from "@/lib/casa";
import {
  buscarSubgrupo,
  caminhoDoContato,
  caminhoDoSubgrupo,
  secoesDoSubgrupo,
  SUBGRUPOS,
} from "@/lib/saiba-mais";
import type { SecaoDoSaibaMais } from "@/tipos/api";

const buscarSaibaMais = vi.hoisted(() => vi.fn());
vi.mock("@/lib/api", () => ({ buscarSaibaMais: () => buscarSaibaMais() }));

describe("SUBGRUPOS", () => {
  it("tem exatamente os slugs do backend, nesta ordem", () => {
    expect(SUBGRUPOS.map(({ slug }) => slug)).toEqual([
      "casa-azul",
      "economia-solidaria",
      "ites-ifrj",
    ]);
  });

  it("não repete slug, e todo nome e todo resumo estão preenchidos", () => {
    expect(new Set(SUBGRUPOS.map(({ slug }) => slug)).size).toBe(SUBGRUPOS.length);
    for (const { nome, resumo } of SUBGRUPOS) {
      expect(nome.trim()).not.toBe("");
      expect(resumo.trim()).not.toBe("");
    }
  });

  it("cada descrição cabe no Google, é própria e não repete o resumo", () => {
    // Até 160 caracteres é o que o Google costuma mostrar sem cortar.
    for (const { descricao, resumo } of SUBGRUPOS) {
      expect(descricao.trim()).not.toBe("");
      expect(descricao.length).toBeLessThanOrEqual(160);
      expect(descricao).not.toBe(resumo);
    }
    expect(new Set(SUBGRUPOS.map(({ descricao }) => descricao)).size).toBe(SUBGRUPOS.length);
  });

  it("nenhum texto divide com a Casa a autoria da plataforma", () => {
    // A ITES desenvolve a plataforma sozinha; a Casa Azul consulta e aprova.
    for (const { resumo, descricao } of SUBGRUPOS) {
      expect(`${resumo} ${descricao}`).not.toMatch(/junto com a Casa|Casa mantém/i);
    }
  });

  it("os nomes são os rótulos do backend", () => {
    expect(SUBGRUPOS.map(({ nome }) => nome)).toEqual([
      "Casa Azul",
      "Economia Solidária",
      "ITES/IFRJ",
    ]);
  });
});

describe("buscarSubgrupo", () => {
  it("acha os três", () => {
    for (const { slug } of SUBGRUPOS) {
      expect(buscarSubgrupo(slug)?.slug).toBe(slug);
    }
  });

  it.each(["nao-existe", "", "Casa-Azul", "casa-azul/"])("não acha %j", (slug) => {
    expect(buscarSubgrupo(slug)).toBeUndefined();
  });
});

describe("caminhoDoSubgrupo", () => {
  it("monta o caminho sob /saiba-mais", () => {
    expect(caminhoDoSubgrupo("ites-ifrj")).toBe("/saiba-mais/ites-ifrj");
  });
});

describe("caminhoDoContato (o link do rodapé)", () => {
  it("com contato, vai direto ao contato completo da Casa", () => {
    expect(caminhoDoContato(CASA)).toBe("/saiba-mais/casa-azul#contato");
  });

  it("sem contato, vai só para a página, e não para uma âncora que não existe", () => {
    expect(caminhoDoContato({ nome: CASA.nome })).toBe("/saiba-mais/casa-azul");
  });
});

describe("secoesDoSubgrupo", () => {
  function secao(id: number, subgrupo: string, titulo: string): SecaoDoSaibaMais {
    return {
      id, slug: `secao-${id}`, subgrupo, titulo, texto: "Texto.",
      imagem: null, imagem_descricao: "", atualizado_em: "2026-11-20T10:00:00-03:00",
    };
  }

  const RESPOSTA = {
    subgrupos: [
      { slug: "casa-azul", nome: "Casa Azul", secoes: [secao(1, "casa-azul", "Quem somos")] },
      {
        slug: "economia-solidaria",
        nome: "Economia Solidária",
        secoes: [
          secao(3, "economia-solidaria", "Segunda pelo id, primeira no Admin"),
          secao(2, "economia-solidaria", "Depois"),
        ],
      },
      { slug: "ites-ifrj", nome: "ITES/IFRJ", secoes: [] },
    ],
  };

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("devolve as seções do subgrupo pedido, na ordem da API", async () => {
    buscarSaibaMais.mockResolvedValue(RESPOSTA);

    const secoes = await secoesDoSubgrupo("economia-solidaria");

    expect(secoes?.map(({ titulo }) => titulo)).toEqual([
      "Segunda pelo id, primeira no Admin",
      "Depois",
    ]);
  });

  it("subgrupo sem seção publicada devolve lista vazia, e não o conteúdo fixo", async () => {
    // Lista vazia é "a equipe despublicou tudo": a página não pode trazer de
    // volta o texto fixo.
    buscarSaibaMais.mockResolvedValue(RESPOSTA);

    expect(await secoesDoSubgrupo("ites-ifrj")).toEqual([]);
  });

  it("no next build, a API fora do ar devolve null (conteúdo fixo)", async () => {
    vi.stubEnv("NEXT_PHASE", PHASE_PRODUCTION_BUILD);
    buscarSaibaMais.mockRejectedValue(new TypeError("fetch failed"));

    expect(await secoesDoSubgrupo("casa-azul")).toBeNull();
  });

  it("fora do build, a falha sobe, para o Next manter a última página boa", async () => {
    vi.stubEnv("NEXT_PHASE", "");
    buscarSaibaMais.mockRejectedValue(new TypeError("fetch failed"));

    await expect(secoesDoSubgrupo("casa-azul")).rejects.toThrow("fetch failed");
  });
});
