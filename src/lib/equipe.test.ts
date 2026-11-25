/**
 * A guarda das páginas da Área da equipe: sem sessão de equipe, login do
 * Admin, com a volta para a página pedida.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const buscarUsuarioDaEquipe = vi.fn();
vi.mock("@/lib/api", () => ({
  buscarUsuarioDaEquipe: () => buscarUsuarioDaEquipe(),
}));

// `redirect()` funciona lançando uma exceção que o Next intercepta. Aqui ela
// vira espião, e a exceção é mantida para provar que a página para ali.
const redirect = vi.fn((destino: string) => {
  throw new Error(`NEXT_REDIRECT ${destino}`);
});
vi.mock("next/navigation", () => ({
  redirect: (destino: string) => redirect(destino),
}));

const { exigirEquipe } = await import("@/lib/equipe");

beforeEach(() => {
  buscarUsuarioDaEquipe.mockReset();
  redirect.mockClear();
});

describe("exigirEquipe", () => {
  it("sem usuário da equipe, manda para o login do Admin com a volta", async () => {
    buscarUsuarioDaEquipe.mockResolvedValue(null);

    await expect(exigirEquipe("/equipe/relatorio")).rejects.toThrow("NEXT_REDIRECT");
    expect(redirect).toHaveBeenCalledWith("/admin/login/?next=%2Fequipe%2Frelatorio");
  });

  it("com usuário da equipe, devolve o usuário e não redireciona", async () => {
    buscarUsuarioDaEquipe.mockResolvedValue({ nome: "Ana" });

    expect(await exigirEquipe("/equipe/relatorio")).toEqual({ nome: "Ana" });
    expect(redirect).not.toHaveBeenCalled();
  });
});
