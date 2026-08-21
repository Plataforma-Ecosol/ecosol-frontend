/**
 * A única porta deste sistema para a API do backend.
 *
 * Nenhum componente chama `fetch` direto. O motivo é de auditoria: quando
 * alguém perguntar "por onde este sistema fala com o Django?", a resposta tem
 * de ser um arquivo, e não uma busca no projeto inteiro. Numa plataforma que
 * trata dado de pessoa, saber onde ficam as fronteiras vale mais do que a
 * comodidade de buscar de qualquer lugar.
 *
 * **Tudo aqui roda no servidor.** Estas funções são chamadas de Server
 * Components; o navegador nunca fala com o Django. Isso sustenta duas coisas
 * de uma vez: a página chega pronta ao buscador (que é o propósito da
 * plataforma) e o backend segue sem precisar de CORS configurado.
 */
import { notFound } from "next/navigation";
import { connection } from "next/server";

import type { Coletivo, Evento, Pagina, PontoDeInteresse } from "@/tipos/api";

/** Onde o SERVIDOR do Next encontra a API. Dentro do compose, `backend:8001`. */
const BASE = process.env.API_URL ?? "http://localhost:8001";

/**
 * Onde o NAVEGADOR encontra a API — usado só para reescrever URL de mídia.
 * Quando as duas são iguais (o caso comum), a reescrita é no-op.
 */
const BASE_PUBLICA = process.env.API_URL_PUBLICA ?? BASE;

/** Segundos de cache das listagens: mudam mais, e são a porta mais visitada. */
const REVALIDACAO_LISTAGEM = 60;

/** Segundos de cache das páginas de detalhe, que mudam raramente. */
const REVALIDACAO_DETALHE = 300;

/**
 * Falha ao falar com a API que não é "não encontrado".
 *
 * O `404` não passa por aqui de propósito: ele vira `notFound()`, que é
 * navegação normal, não erro. Só chega a esta classe o que a pessoa não pode
 * resolver sozinha — parâmetro inválido ou backend fora do ar.
 */
export class ErroDaApi extends Error {
  constructor(
    mensagem: string,
    readonly status: number,
  ) {
    super(mensagem);
    this.name = "ErroDaApi";
  }
}

/**
 * Parâmetros de consulta aceitos por `montarUrl`.
 *
 * Os tipos de filtro abaixo são declarados com `type`, e não `interface`, por
 * exigência do TypeScript: só um alias de tipo é atribuível a um índice como
 * este. Uma `interface` não é — ela pode ganhar campos depois, por declaration
 * merging, e o compilador não tem como garantir que todos serão compatíveis.
 */
type Parametros = Record<string, string | number | undefined | null>;

/**
 * Monta a URL, descartando parâmetro vazio.
 *
 * O descarte importa: um formulário enviado em branco produziria `?q=`, e o
 * backend responde `400` a filtro com valor vazio em vez de ignorá-lo. Sem
 * isto, limpar a busca quebraria a página.
 */
export function montarUrl(caminho: string, parametros: Parametros = {}): string {
  const url = new URL(caminho, BASE);
  for (const [chave, valor] of Object.entries(parametros)) {
    if (valor === undefined || valor === null || valor === "") continue;
    url.searchParams.set(chave, String(valor));
  }
  return url.toString();
}

/**
 * Converte a URL de mídia devolvida pela API em uma que o navegador alcance.
 *
 * O Django monta a URL da imagem a partir do host da REQUISIÇÃO. Quando o Next
 * roda dentro do compose e chama `http://backend:8001`, as imagens voltam
 * apontando para `backend:8001` — endereço que só existe na rede do Docker. O
 * navegador não resolve, e a imagem quebra sem erro nenhum no console do
 * servidor, que é o pior tipo de falha.
 *
 * Em produção (`DJANGO_USE_S3=True`) a URL já vem do Supabase Storage e não
 * depende do host, então esta função é no-op — como também é sempre que
 * `API_URL` e `API_URL_PUBLICA` coincidem.
 */
export function urlPublicaDeMidia(url: string): string {
  if (BASE === BASE_PUBLICA || !url.startsWith(BASE)) return url;
  return BASE_PUBLICA + url.slice(BASE.length);
}

async function buscar<T>(
  caminho: string,
  parametros: Parametros,
  revalidacao: number,
): Promise<T> {
  // Interrompe a pré-renderização: daqui para baixo, só roda quando houver
  // requisição de verdade. Sem isto o `next build` tenta gerar as páginas
  // estáticas consultando a API, e o build inteiro falha com `ECONNREFUSED`
  // quando ela não está no ar — o que acontece SEMPRE no CI, que não sobe
  // backend, e aconteceria num deploy feito durante uma instabilidade.
  //
  // Fica aqui, e não em cada página, pelo mesmo motivo que a guarda de storage
  // do backend é `autouse`: proteção que cada arquivo precisa lembrar de pedir
  // falha na primeira página que esquecer.
  //
  // O custo é a página passar a ser renderizada sob demanda em vez de no
  // build. A velocidade continua vindo do cache de `fetch` abaixo, que
  // `connection()` não afeta — diferente de `force-dynamic`, que desligaria o
  // cache junto.
  await connection();

  const url = montarUrl(caminho, parametros);
  const resposta = await fetch(url, { next: { revalidate: revalidacao } });

  // "Não encontrado" não é erro: é uma página 404 de verdade, com o status
  // certo. Devolver 200 com uma tela vazia faria o buscador indexar o vazio.
  if (resposta.status === 404) notFound();

  if (resposta.status === 400) {
    throw new ErroDaApi(
      "A busca tem algum parâmetro inválido. Confira os filtros e tente de novo.",
      400,
    );
  }

  if (!resposta.ok) {
    throw new ErroDaApi(
      `A API respondeu ${resposta.status} para ${caminho}.`,
      resposta.status,
    );
  }

  return (await resposta.json()) as T;
}

// --- Coletivos --------------------------------------------------------------

export type FiltrosDeColetivo = {
  q?: string;
  categoria?: string | number;
  bairro?: string;
  ordering?: string;
  page?: string | number;
  /** Só o `sitemap.ts` usa: as telas ficam no padrão de 20 por página. */
  page_size?: number;
};

export function listarColetivos(filtros: FiltrosDeColetivo = {}) {
  return buscar<Pagina<Coletivo>>("/api/coletivos/", filtros, REVALIDACAO_LISTAGEM);
}

export function buscarColetivo(slug: string) {
  // Sem `redirect: "manual"`: deixamos o `fetch` seguir o 301 do backend, e
  // quem compara o slug pedido com o slug devolvido é a página — ver o
  // comentário em `app/coletivos/[slug]/page.tsx`.
  return buscar<Coletivo>(`/api/coletivos/${slug}/`, {}, REVALIDACAO_DETALHE);
}

// --- Eventos ----------------------------------------------------------------

export type FiltrosDeEvento = {
  q?: string;
  periodo?: "proximos" | "passados" | "todos";
  de?: string;
  ate?: string;
  bairro?: string;
  ordering?: string;
  page?: string | number;
  /** Só o `sitemap.ts` usa: as telas ficam no padrão de 20 por página. */
  page_size?: number;
};

export function listarEventos(filtros: FiltrosDeEvento = {}) {
  return buscar<Pagina<Evento>>("/api/eventos/", filtros, REVALIDACAO_LISTAGEM);
}

export function buscarEvento(slug: string) {
  return buscar<Evento>(`/api/eventos/${slug}/`, {}, REVALIDACAO_DETALHE);
}

// --- Pontos de interesse ----------------------------------------------------

export type FiltrosDePonto = {
  q?: string;
  tipo?: string;
  ordering?: string;
  page?: string | number;
  page_size?: number;
};

export function listarPontos(filtros: FiltrosDePonto = {}) {
  return buscar<Pagina<PontoDeInteresse>>(
    "/api/pontos-de-interesse/",
    filtros,
    REVALIDACAO_LISTAGEM,
  );
}
