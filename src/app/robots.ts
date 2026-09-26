import type { MetadataRoute } from "next";

import { ENDERECO_DO_SITE, SITE_INDEXAVEL, urlAbsoluta } from "@/lib/site";

/**
 * Instruções para os rastreadores.
 *
 * **Em produção, tudo é liberado, e isso é a decisão certa aqui.** Não há área
 * restrita neste projeto: o site é somente leitura e só mostra o que a equipe
 * marcou como público no Admin. O que não pode aparecer nunca chega à API — a
 * proteção está lá, não num arquivo que o rastreador é livre para ignorar.
 *
 * O valor deste arquivo é o `sitemap`: é ele que aponta o caminho para as
 * páginas de coletivo e de evento, que de outro modo só seriam alcançadas
 * percorrendo listagens paginadas.
 *
 * **Em homologação (`SITE_INDEXAVEL=false`), tudo é bloqueado**, e sem
 * `sitemap`: apontar o mapa do site e ao mesmo tempo proibir o acesso é
 * mensagem contraditória. Este arquivo sozinho não basta — buscador que chega
 * por link externo pode indexar a URL mesmo bloqueada —, por isso o layout
 * também põe `noindex` em todas as páginas.
 */
export default function robots(): MetadataRoute.Robots {
  if (!SITE_INDEXAVEL) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: urlAbsoluta("/sitemap.xml"),
    host: ENDERECO_DO_SITE,
  };
}
