/**
 * O perfil leva o NAVEGADOR ao endereço canônico — não só o conteúdo.
 *
 * Este é o teste mais fácil de a suíte não ter. O `fetch` segue o `301` do
 * backend sozinho, então, sem o redirecionamento do frontend, a página do slug
 * antigo renderiza **certo**: abrindo no navegador, tudo parece funcionar. O
 * que quebra é invisível daqui — o buscador passa a indexar o mesmo coletivo
 * em dois endereços, e o mecanismo de histórico de slug que o backend
 * construiu se perde no último metro.
 *
 * Por isso o que se assere é a CHAMADA de `permanentRedirect`, e não o que
 * aparece na tela.
 */
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Coletivo } from "@/tipos/api";

const buscarColetivo = vi.fn();
vi.mock("@/lib/api", () => ({ buscarColetivo: (slug: string) => buscarColetivo(slug) }));

// No Next, `permanentRedirect` funciona lançando. Reproduzir isso importa: se
// o espião apenas registrasse a chamada, a página seguiria renderizando e o
// teste não notaria que o redirecionamento não interrompe o fluxo.
const permanentRedirect = vi.fn((destino: string) => {
  throw new Error(`NEXT_REDIRECT:${destino}`);
});
vi.mock("next/navigation", () => ({
  permanentRedirect: (destino: string) => permanentRedirect(destino),
}));

const { default: Perfil } = await import("@/app/coletivos/[slug]/page");

const COLETIVO: Coletivo = {
  id: 2,
  nome: "Ateliê Maré",
  slug: "atelie-mare-niteroi",
  descricao: "Artesanato têxtil em Niterói.",
  bairro: "Centro",
  site: "",
  categorias: [],
  criado_em: "2026-08-01T10:00:00-03:00",
  atualizado_em: "2026-08-01T10:00:00-03:00",
};

beforeEach(() => vi.clearAllMocks());

describe("perfil do coletivo", () => {
  it("com o slug atual, renderiza e não redireciona", async () => {
    buscarColetivo.mockResolvedValue(COLETIVO);

    const pagina = await Perfil({ params: Promise.resolve({ slug: COLETIVO.slug }) });
    render(pagina);

    expect(permanentRedirect).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: "Ateliê Maré" })).toBeInTheDocument();
  });

  it("com um slug antigo, redireciona para o canônico", async () => {
    // O backend devolveu 301 e o fetch seguiu: o corpo traz o slug NOVO,
    // enquanto a URL pedida era a antiga. É essa divergência que dispara.
    buscarColetivo.mockResolvedValue(COLETIVO);

    await expect(
      Perfil({ params: Promise.resolve({ slug: "atelie-mare" }) }),
    ).rejects.toThrow("NEXT_REDIRECT:/coletivos/atelie-mare-niteroi");

    expect(permanentRedirect).toHaveBeenCalledWith("/coletivos/atelie-mare-niteroi");
  });

  it("o 404 vem da camada de acesso, e a página não o engole", async () => {
    // `buscarColetivo` chama `notFound()` no 404, o que funciona lançando. A
    // página não pode ter try/catch em volta: engoliria o 404 e devolveria
    // 200 com uma tela vazia.
    buscarColetivo.mockRejectedValue(new Error("NEXT_NOT_FOUND"));

    await expect(
      Perfil({ params: Promise.resolve({ slug: "nao-existe" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
