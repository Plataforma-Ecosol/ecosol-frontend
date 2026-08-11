import type { NextConfig } from "next";

/**
 * As imagens da plataforma NÃO são servidas por este projeto: elas vêm do
 * backend, como URL absoluta. Em produção é o Supabase Storage; no ambiente
 * local, o Django em `localhost:8001`. O `next/image` recusa host externo que
 * não esteja declarado aqui, então esta lista é pré-requisito, não ajuste.
 */
const emDesenvolvimento = process.env.NODE_ENV === "development";

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

    // O Next 16 passou a bloquear a otimização de imagem vinda de IP local,
    // como defesa contra SSRF. Isso derruba justamente o caso do ambiente de
    // desenvolvimento, em que as imagens vêm de `localhost:8001`.
    //
    // Ligado SÓ em desenvolvimento, e de propósito: em produção as imagens vêm
    // do Supabase por HTTPS, e manter a permissão ligada lá reabriria o risco
    // que o padrão do Next fecha, sem nenhum ganho.
    dangerouslyAllowLocalIP: emDesenvolvimento,
  },
};

export default nextConfig;
