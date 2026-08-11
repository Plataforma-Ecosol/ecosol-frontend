/**
 * Testes da camada de acesso à API.
 *
 * Dois comportamentos que quebrariam em silêncio, e por isso merecem teste já
 * no PR que os cria: o descarte de parâmetro vazio (sem ele, limpar a busca
 * derruba a página com `400`) e a reescrita de URL de mídia (sem ela, as
 * imagens somem só dentro do Docker, que é onde a equipe confere o visual).
 */
import { describe, expect, it } from "vitest";

import { montarUrl, urlPublicaDeMidia } from "@/lib/api";

describe("montarUrl", () => {
  it("monta a URL absoluta a partir do caminho", () => {
    expect(montarUrl("/api/coletivos/")).toBe("http://localhost:8001/api/coletivos/");
  });

  it("acrescenta os parâmetros informados", () => {
    const url = new URL(montarUrl("/api/coletivos/", { q: "feira", page: 2 }));

    expect(url.searchParams.get("q")).toBe("feira");
    expect(url.searchParams.get("page")).toBe("2");
  });

  it("descarta parâmetro vazio, nulo ou ausente", () => {
    // O formulário de busca enviado em branco produz `q=""`. O backend
    // responde 400 a filtro vazio em vez de ignorá-lo, então deixar a chave
    // passar faria "limpar a busca" quebrar a listagem.
    const url = new URL(
      montarUrl("/api/coletivos/", {
        q: "",
        bairro: undefined,
        categoria: null,
        ordering: "nome",
      }),
    );

    expect(url.searchParams.has("q")).toBe(false);
    expect(url.searchParams.has("bairro")).toBe(false);
    expect(url.searchParams.has("categoria")).toBe(false);
    expect(url.searchParams.get("ordering")).toBe("nome");
  });

  it("preserva o zero, que é valor legítimo", () => {
    // `0` é falsy: um descarte escrito com `if (!valor)` o perderia junto com
    // a string vazia. Não há filtro que use zero hoje, mas o descuido é o
    // clássico da função — e o teste custa uma linha.
    const url = new URL(montarUrl("/api/coletivos/", { categoria: 0 }));

    expect(url.searchParams.get("categoria")).toBe("0");
  });
});

describe("urlPublicaDeMidia", () => {
  it("devolve a URL intacta quando as duas bases coincidem", () => {
    // É o caso do ambiente local sem Docker e o de produção — ou seja, o
    // comum. A função tem de sair do caminho.
    const url = "http://localhost:8001/media/eventos/cartaz.png";

    expect(urlPublicaDeMidia(url)).toBe(url);
  });

  it("não toca em URL de outro host", () => {
    // Em produção a imagem vem do Supabase Storage e não passa pelo host da
    // API. Reescrever aqui quebraria a imagem em vez de consertá-la.
    const url = "https://abc.supabase.co/storage/v1/object/public/divulgacao/capa.png";

    expect(urlPublicaDeMidia(url)).toBe(url);
  });
});
