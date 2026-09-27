import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { buscarEvento, urlPublicaDeMidia } from "@/lib/api";
import { formatarQuando } from "@/lib/datas";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const evento = await buscarEvento(slug);

  const descricao = evento.descricao
    ? evento.descricao.slice(0, 160)
    : `${formatarQuando(evento.data_inicio, evento.data_fim)}${
        evento.local ? ` · ${evento.local}` : ""
      }`;

  // A primeira imagem da galeria vira a prévia do link. É ela que o cartaz do
  // evento normalmente é — e é o que faz alguém parar de rolar o WhatsApp.
  const cartaz = evento.imagens[0];

  return {
    title: evento.titulo,
    description: descricao,
    alternates: { canonical: `/eventos/${evento.slug}` },
    openGraph: {
      title: evento.titulo,
      description: descricao,
      url: `/eventos/${evento.slug}`,
      type: "article",
      images: cartaz ? [{ url: urlPublicaDeMidia(cartaz.imagem) }] : undefined,
    },
  };
}

/**
 * Detalhe de um evento.
 *
 * Não há tratamento de slug antigo aqui, ao contrário do perfil do coletivo:
 * o backend não guarda histórico de slug de evento, porque o link de um evento
 * tem a vida útil do evento. Trocar o título depois de divulgado quebra o link
 * antigo, e isso é aceito por decisão de arquitetura.
 */
export default async function DetalheDoEvento({ params }: Props) {
  const { slug } = await params;
  const evento = await buscarEvento(slug);

  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <p className="font-medium text-emerald-800">
          <time dateTime={evento.data_inicio}>
            {formatarQuando(evento.data_inicio, evento.data_fim)}
          </time>
        </p>

        <h1 className="text-3xl font-semibold text-emerald-900">{evento.titulo}</h1>

        {(evento.local || evento.bairro) && (
          <p className="text-stone-600">
            {[evento.local, evento.bairro].filter(Boolean).join(" · ")}
          </p>
        )}
      </header>

      {evento.descricao && (
        <section className="whitespace-pre-line text-lg leading-relaxed text-stone-800">
          {evento.descricao}
        </section>
      )}

      {evento.link && (
        <p>
          <a
            href={evento.link}
            rel="noopener noreferrer"
            target="_blank"
            className="inline-block rounded bg-emerald-800 px-4 py-2 text-white hover:bg-emerald-900"
          >
            Mais informações e inscrição
          </a>
        </p>
      )}

      {evento.imagens.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-medium">Imagens de divulgação</h2>

          <ul className="grid gap-4 sm:grid-cols-2">
            {evento.imagens.map((imagem) => (
              <li key={imagem.id}>
                <figure>
                  <Image
                    src={urlPublicaDeMidia(imagem.imagem)}
                    // A legenda é o texto alternativo quando existe. Sem ela,
                    // descrever o papel da imagem é melhor do que `alt=""`:
                    // um cartaz não é decoração, é a informação do evento.
                    alt={imagem.legenda || `Imagem de divulgação de ${evento.titulo}`}
                    width={800}
                    height={600}
                    sizes="(min-width: 640px) 50vw, 100vw"
                    className="h-auto w-full rounded border border-stone-200"
                  />
                  {imagem.legenda && (
                    <figcaption className="mt-1 text-sm text-stone-600">
                      {imagem.legenda}
                    </figcaption>
                  )}
                </figure>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p>
        <Link href="/eventos" className="text-emerald-800 hover:underline">
          ← Ver a agenda
        </Link>
      </p>
    </article>
  );
}
