import type { NextConfig } from "next";

/**
 * As imagens da plataforma NÃO são servidas por este projeto: elas vêm do
 * backend, como URL absoluta. Em produção é o Supabase Storage; no ambiente
 * local, o Django em `localhost:8001`. O `next/image` recusa host externo que
 * não esteja declarado aqui, então esta lista é pré-requisito, não ajuste.
 */

/** O host de onde as imagens virão, do ponto de vista do navegador. */
const API_PUBLICA =
  process.env.API_URL_PUBLICA ?? process.env.API_URL ?? "http://localhost:8001";

/**
 * O backend está num endereço da própria máquina ou da rede do Docker?
 *
 * O Next 16 bloqueia por padrão a otimização de imagem vinda de endereço
 * local, como defesa contra SSRF — o sintoma é um `400 "url" parameter is not
 * allowed` e a imagem quebrada. Liberar é necessário enquanto as imagens vêm
 * do Django local.
 *
 * A condição olha PARA ONDE as imagens apontam, e não para `NODE_ENV`. Amarrar
 * ao modo de execução parece equivalente e não é: `npm run start` e o container
 * do compose rodam em modo produção contra o backend local — exatamente os
 * cenários em que a equipe confere o visual antes de subir — e a permissão
 * ficaria desligada onde é mais necessária. Do jeito atual ela se desliga
 * sozinha no dia em que `API_URL_PUBLICA` passar a ser o domínio real, que é
 * quando o risco de SSRF passa a existir de verdade.
 */
const IMAGENS_VEM_DE_HOST_LOCAL = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\]|backend)(:|\/|$)/i.test(
  API_PUBLICA,
);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Supabase Storage (produção e homologação). O `**` cobre qualquer
      // referência de projeto, para não versionar o identificador aqui.
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
      // Django local do docker-compose, servindo `media/` enquanto DEBUG=True.
      { protocol: "http", hostname: "localhost", port: "8001", pathname: "/media/**" },
      { protocol: "http", hostname: "backend", port: "8001", pathname: "/media/**" },
    ],

    dangerouslyAllowLocalIP: IMAGENS_VEM_DE_HOST_LOCAL,
  },
};

export default nextConfig;
