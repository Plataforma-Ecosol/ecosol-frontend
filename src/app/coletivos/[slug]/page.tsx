import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";

import { PerfilDoColetivo } from "@/componentes/PerfilDoColetivo";
import { buscarColetivo } from "@/lib/api";

type Props = {
  // Promise desde o Next 15, e obrigatoriamente aguardado a partir do 16.
  params: Promise<{ slug: string }>;
};

/**
 * Metadados da página — é o que aparece ao compartilhar o link no WhatsApp.
 *
 * A busca aqui NÃO é uma segunda ida ao backend: o Next memoriza requisições
 * `fetch` idênticas dentro da mesma renderização, então esta e a da página
 * abaixo são a mesma chamada.
 *
 * O `canonical` é a outra metade do `301` do backend. Se alguém publicar o
 * endereço antigo, o buscador tem duas pistas concordantes de qual é o
 * endereço bom: o redirecionamento e esta etiqueta.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const coletivo = await buscarColetivo(slug);

  const descricao = coletivo.descricao
    ? coletivo.descricao.slice(0, 160)
    : `Perfil de ${coletivo.nome} na rede de economia solidária de Niterói.`;

  return {
    title: coletivo.nome,
    description: descricao,
    alternates: { canonical: `/coletivos/${coletivo.slug}` },
    openGraph: {
      title: coletivo.nome,
      description: descricao,
      url: `/coletivos/${coletivo.slug}`,
      type: "profile",
    },
  };
}

export default async function Perfil({ params }: Props) {
  const { slug } = await params;
  const coletivo = await buscarColetivo(slug);

  // O backend responde 301 quando o slug pedido é antigo, e o `fetch` segue o
  // redirecionamento sozinho — então a página renderizaria certo, mas na URL
  // ERRADA. Para um buscador isso é o mesmo coletivo em dois endereços, que é
  // exatamente o que o 301 do backend existe para evitar; o trabalho dele se
  // perderia no último metro.
  //
  // Comparar o slug devolvido com o pedido, em vez de inspecionar o status com
  // `redirect: "manual"`, é deliberado: não depende da semântica de modo de
  // redirecionamento do fetch, que difere entre servidor e navegador.
  //
  // `permanentRedirect` lança — por isso vem antes de qualquer renderização, e
  // nunca dentro de um try/catch.
  if (coletivo.slug !== slug) {
    permanentRedirect(`/coletivos/${coletivo.slug}`);
  }

  return <PerfilDoColetivo coletivo={coletivo} />;
}
