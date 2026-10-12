/**
 * Estrutura comum a todas as páginas públicas.
 *
 * Os metadados daqui são o piso: cada página os especializa com
 * `generateMetadata`. O `template` do título é o que faz uma página de
 * coletivo chegar ao WhatsApp como "Sementes do Vale · Rede de Economia
 * Solidária de Niterói" sem que ninguém repita o sufixo à mão.
 */
import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";

import Logo from "@/componentes/Logo";
import { NavegacaoPrincipal } from "@/componentes/NavegacaoPrincipal";
import {
  ENDERECO_DA_AREA_DA_EQUIPE,
  ENDERECO_DO_SITE,
  SITE_INDEXAVEL,
} from "@/lib/site";

import "./globals.css";

/**
 * A fonte dos títulos — só deles; o texto corrido segue na fonte do sistema.
 *
 * Um peso só (700) e subset latino. O `next/font` baixa o arquivo durante o
 * `next build` e o serve pelo próprio site: nenhum pedido ao Google parte do
 * navegador. Por isso o build (CI, Docker, Vercel) precisa de acesso a
 * `fonts.googleapis.com`; sem rede ali, trocar por `next/font/local`.
 */
const fonteDosTitulos = Bricolage_Grotesque({
  weight: "700",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bricolage",
});

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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // `lang="pt-BR"` não é detalhe: é o que faz o leitor de tela pronunciar a
    // página em português e o navegador oferecer a tradução correta.
    <html lang="pt-BR" className={fonteDosTitulos.variable}>
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
          {/* Uma linha só, também no celular: logo à esquerda, menu à direita.
              O `flex-wrap` só entra em jogo sem JavaScript, quando os links do
              `<noscript>` descem para a linha de baixo. */}
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-4">
            <Logo lugar="cabecalho" />
            <NavegacaoPrincipal />
          </div>
        </header>

        <main id="conteudo" className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
          {children}
        </main>

        <footer className="border-t-2 border-dourado bg-azul text-bege">
          <div className="mx-auto flex max-w-5xl items-start gap-4 px-4 py-6 text-sm">
            <Logo lugar="rodape" />
            <div>
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
          </div>
        </footer>
      </body>
    </html>
  );
}
