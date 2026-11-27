import Image from "next/image";

import type { SecaoDoSaibaMais } from "@/tipos/api";

/**
 * As seções de um subgrupo, como a equipe as publicou no Admin.
 *
 * Uma `<section>` por seção, com `h2` abaixo do `h1` da página. Só três campos
 * saem na tela: `titulo`, `texto` e `imagem` (com `imagem_descricao` no
 * `alt`). O resto (`id`, `slug`, `atualizado_em`) é controle, e não conteúdo.
 *
 * O texto é simples, com parágrafos separados por linha em branco, e por isso
 * vai com `whitespace-pre-line`, como recomenda o README do backend.
 */
export function SecoesDoSaibaMais({ secoes }: { secoes: SecaoDoSaibaMais[] }) {
  return (
    <div className="space-y-8">
      {secoes.map((secao) => (
        <section key={secao.id} className="space-y-3">
          <h2 className="text-xl font-bold text-azul">{secao.titulo}</h2>
          {secao.imagem && (
            // A URL como a API devolve, sem `urlPublicaDeMidia`: quem busca a
            // imagem é o otimizador, no servidor (ver `lib/api.ts`). As
            // dimensões reservam o espaço antes de a imagem chegar; `h-auto`
            // deixa valer a proporção real dela.
            <Image
              src={secao.imagem}
              alt={secao.imagem_descricao}
              width={1200}
              height={800}
              sizes="(min-width: 1024px) 768px, 100vw"
              className="h-auto w-full rounded-xl"
            />
          )}
          <p className="text-lg leading-relaxed whitespace-pre-line text-texto">
            {secao.texto}
          </p>
        </section>
      ))}
    </div>
  );
}
