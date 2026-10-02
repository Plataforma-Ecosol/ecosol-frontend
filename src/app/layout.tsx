/**
 * Estrutura comum a todas as páginas públicas.
 *
 * Os metadados daqui são o piso: cada página os especializa com
 * `generateMetadata`. O `template` do título é o que faz uma página de
 * coletivo chegar ao WhatsApp como "Sementes do Vale · Rede de Economia
 * Solidária de Niterói" sem que ninguém repita o sufixo à mão.
 */
import type { Metadata } from "next";
import Link from "next/link";

import {
  ENDERECO_DA_AREA_DA_EQUIPE,
  ENDERECO_DO_SITE,
  SITE_INDEXAVEL,
} from "@/lib/site";

import "./globals.css";

export const metadata: Metadata = {
  // Base para transformar em absolutos os endereços relativos de `canonical` e
  // Open Graph. Sem ela o Next avisa no build e o WhatsApp recebe um endereço
  // relativo, que não resolve para nada — a prévia do link some.
  metadataBase: new URL(ENDERECO_DO_SITE),
  title: {
    default: "Rede de Economia Solidária de Niterói",
    template: "%s · Rede de Economia Solidária de Niterói",
  },
  description:
    "Conheça os coletivos, as feiras e a agenda da economia solidária de " +
    "Niterói. Um projeto do Centro Público de Referência em Economia " +
    "Solidária (Casa Paul Singer).",
  openGraph: {
    siteName: "Rede de Economia Solidária de Niterói",
    locale: "pt_BR",
    type: "website",
  },
  // `noindex, nofollow` em todas as páginas da homologação. É a camada que vale
  // para quem chega por link externo, que o `robots.txt` não cobre. Nenhuma
  // página define `robots` no próprio `generateMetadata`; se alguma passar a
  // definir, sobrescreve este valor — e precisa respeitar `SITE_INDEXAVEL`.
  robots: SITE_INDEXAVEL ? undefined : { index: false, follow: false },
};

const NAVEGACAO = [
  { href: "/coletivos", rotulo: "Coletivos" },
  { href: "/eventos", rotulo: "Agenda" },
  { href: "/mapa", rotulo: "Mapa" },
];

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // `lang="pt-BR"` não é detalhe: é o que faz o leitor de tela pronunciar a
    // página em português e o navegador oferecer a tradução correta.
    <html lang="pt-BR">
      <body className="flex min-h-screen flex-col bg-bege text-texto antialiased">
        {/* Primeiro elemento focável da página: quem navega por teclado pula o
            menu em vez de percorrê-lo a cada troca de página. */}
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-3 focus:text-azul"
        >
          Pular para o conteúdo
        </a>

        <header className="border-b-2 border-dourado bg-azul text-bege">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-4">
            <Link href="/" className="text-lg font-semibold text-bege">
              Economia Solidária <span className="text-bege/80">Niterói</span>
            </Link>
            <nav aria-label="Principal" className="flex gap-4 text-sm">
              {NAVEGACAO.map(({ href, rotulo }) => (
                <Link
                  key={href}
                  href={href}
                  className="hover:underline"
                >
                  {rotulo}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main id="conteudo" className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
          {children}
        </main>

        <footer className="border-t-2 border-dourado bg-azul text-bege">
          <div className="mx-auto max-w-5xl px-4 py-6 text-sm">
            <p>
              Centro Público de Referência em Economia Solidária (Casa Paul
              Singer) · ITES / IFRJ Campus Niterói
            </p>
            <p className="mt-1">Software livre, sob licença GPLv3.</p>
            {/* Só quem já sabe o que procura encontra: nada em destaque,
                nenhum formulário de login aqui — o cadastro vive no Django
                Admin, em outro domínio. */}
            <p className="mt-1">
              <a
                href={ENDERECO_DA_AREA_DA_EQUIPE}
                rel="nofollow"
                className="text-bege/80 underline hover:text-bege"
              >
                Área da equipe
              </a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
