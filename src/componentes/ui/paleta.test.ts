/**
 * Guarda dos componentes do shadcn/ui.
 *
 * O código de `ui/` veio do CLI do shadcn e foi adaptado à paleta (PRD de
 * componentes, seção 1). Se alguém rodar `shadcn add` de novo — para um
 * componente novo ou para atualizar um destes — o arquivo volta com as cores
 * genéricas e as classes `dark:`. Este teste pega o esquecimento antes do
 * merge.
 *
 * Por que `dark:` é proibido: no Tailwind 4, sem configuração, ele segue o
 * modo escuro do sistema. Partes dos componentes escureceriam no celular de
 * quem usa modo escuro, com o resto do site claro — o "meio tema escuro" que
 * já quebrou o site uma vez (PRD do Frontend, seção 2).
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const PASTA = join(process.cwd(), "src", "componentes", "ui");

const arquivos = readdirSync(PASTA).filter(
  (nome) => nome.endsWith(".tsx") || (nome.endsWith(".ts") && !nome.endsWith(".test.ts")),
);

const PROIBIDOS: [descricao: string, padrao: RegExp][] = [
  ["classe `dark:`", /\bdark:/],
  ["cor do Tailwind fora da paleta", /\b[a-z]+-(neutral|zinc|slate|gray|stone)-\d/],
  [
    "nome de cor do shadcn",
    /\b(bg|text|border|ring|outline|fill|stroke|placeholder|divide|shadow|from|via|to)-(primary|secondary|muted|accent|destructive|foreground|background|popover|card|input|ring|border)(-foreground)?\b/,
  ],
  ["hex solto", /#[0-9a-fA-F]{3,8}\b/],
  // O CLI, com `--no-css-variables`, escreve as cores assim (`bg-oklch(...)`).
  ["cor solta em oklch/rgb/hsl", /\b(oklch|rgba?|hsla?)\(/],
  ["`aria-invalid:` (nenhum campo do site tem validação)", /aria-invalid:/],
  ["variante `destructive`", /\bdestructive\b/],
  ["classe de gancho `cn-*` (sem o CSS do shadcn, não faz nada)", /["'\s]cn-[a-z]/],
];

describe("componentes de ui/ seguem a paleta", () => {
  it("encontra os arquivos da pasta", () => {
    expect(arquivos).toEqual(
      expect.arrayContaining(["badge.tsx", "button.tsx", "input.tsx", "pagination.tsx"]),
    );
  });

  describe.each(arquivos)("%s", (arquivo) => {
    // Sem os comentários: o cabeçalho de origem cita `dark:` e companhia
    // justamente para dizer que saíram.
    const codigo = readFileSync(join(PASTA, arquivo), "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "");

    it.each(PROIBIDOS)("sem %s", (_descricao, padrao) => {
      const linha = codigo.split("\n").find((texto) => padrao.test(texto));
      expect(linha, `trecho proibido: ${linha?.trim()}`).toBeUndefined();
    });
  });
});
