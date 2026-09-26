import type { MetadataRoute } from "next";

import { listarColetivos, listarEventos } from "@/lib/api";
import { urlAbsoluta } from "@/lib/site";
import type { Pagina } from "@/tipos/api";

/**
 * O mapa do site — a lista que o buscador usa para achar tudo.
 *
 * Descoberta é o propósito da plataforma, e o buscador só indexa o que
 * alcança. As páginas de coletivo e de evento não são linkadas de lugar nenhum
 * a não ser das listagens paginadas: sem este arquivo, o rastreador teria de
 * percorrer página por página para chegar ao último coletivo — e normalmente
 * não percorre.
 *
 * O mapa lista **coletivos e eventos**, e não pontos de interesse: ponto não
 * tem página própria (o detalhe é por id, dentro do mapa), então não há
 * endereço para indexar. Ver a decisão de detalhe por `id` na Seção 5 do PRD.
 */

/** Teto da API. Pedir o máximo por vez reduz o número de idas ao backend. */
const POR_PAGINA = 100;

/**
 * Limite de segurança para o laço de paginação.
 *
 * 100 páginas × 100 itens = 10 000 registros, muito além do horizonte da ES de
 * Niterói. O limite não existe para esse volume: existe para que um bug de
 * paginação — no backend ou aqui — vire um sitemap incompleto em vez de um
 * laço infinito que trava a geração da página.
 */
const MAXIMO_DE_PAGINAS = 100;

/**
 * Percorre todas as páginas de uma listagem e devolve os itens somados.
 *
 * Pagina por `page` crescente, e não seguindo o `next` do envelope: aquele
 * aponta para a API (dentro do Docker, para um endereço que nem existe fora da
 * rede dele). O envelope serve para saber quantos itens há; o caminho é
 * decisão do frontend — mesma regra do componente de paginação.
 */
async function todosOsItens<T>(
  buscarPagina: (page: number) => Promise<Pagina<T>>,
): Promise<T[]> {
  const itens: T[] = [];

  for (let page = 1; page <= MAXIMO_DE_PAGINAS; page++) {
    const resposta = await buscarPagina(page);
    itens.push(...resposta.results);

    // Para quando já se tem tudo, ou quando a página veio vazia — a segunda
    // condição evita laço eterno se `count` e `results` discordarem.
    if (itens.length >= resposta.count || resposta.results.length === 0) break;
  }

  return itens;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [coletivos, eventos] = await Promise.all([
    todosOsItens((page) =>
      listarColetivos({ page, page_size: POR_PAGINA, ordering: "nome" }),
    ),
    todosOsItens((page) =>
      listarEventos({ page, page_size: POR_PAGINA, ordering: "data_inicio" }),
    ),
  ]);

  // As fixas primeiro, na ordem de importância para quem chega de fora.
  const fixas: MetadataRoute.Sitemap = [
    { url: urlAbsoluta("/"), changeFrequency: "weekly", priority: 1 },
    { url: urlAbsoluta("/coletivos"), changeFrequency: "weekly", priority: 0.9 },
    { url: urlAbsoluta("/eventos"), changeFrequency: "daily", priority: 0.9 },
    { url: urlAbsoluta("/mapa"), changeFrequency: "weekly", priority: 0.8 },
  ];

  return [
    ...fixas,
    ...coletivos.map((coletivo) => ({
      url: urlAbsoluta(`/coletivos/${coletivo.slug}`),
      // `atualizado_em` é a data real da última edição no Admin. É ela que diz
      // ao buscador o que vale revisitar — inventar `new Date()` faria o site
      // inteiro parecer alterado a cada geração, e o sinal perderia o sentido.
      lastModified: new Date(coletivo.atualizado_em),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...eventos.map((evento) => ({
      url: urlAbsoluta(`/eventos/${evento.slug}`),
      lastModified: new Date(evento.atualizado_em),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
