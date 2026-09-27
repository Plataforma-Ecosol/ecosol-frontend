import type { MetadataRoute } from "next";

import { ENDERECO_DO_SITE, urlAbsoluta } from "@/lib/site";

/**
 * Instruções para os rastreadores.
 *
 * **Tudo é liberado, e isso é a decisão certa aqui.** Não há área restrita
 * neste projeto: o site é somente leitura e só mostra o que a equipe marcou
 * como público no Admin. O que não pode aparecer nunca chega à API — a
 * proteção está lá, não num arquivo que o rastreador é livre para ignorar.
 *
 * O valor deste arquivo é o `sitemap`: é ele que aponta o caminho para as
 * páginas de coletivo e de evento, que de outro modo só seriam alcançadas
 * percorrendo listagens paginadas.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: urlAbsoluta("/sitemap.xml"),
    host: ENDERECO_DO_SITE,
  };
}
