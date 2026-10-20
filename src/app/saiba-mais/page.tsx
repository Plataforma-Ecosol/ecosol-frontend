import {
  AtSign,
  Clock,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  type LucideIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { BotaoCopiar } from "@/componentes/BotaoCopiar";
import { Button } from "@/componentes/ui/button";
import { CASA, telefoneDaCasa, temContato, urlDoMapa, urlDoWhatsapp } from "@/lib/casa";
import { arrobaDoInstagram, urlDoInstagram } from "@/lib/contatos";
import { urlAbsoluta } from "@/lib/site";

// Sem `openGraph` próprio: declarar um descartaria o do layout, e a prévia
// padrão, com a logo da Casa, é justamente a que esta página deve ter.
export const metadata: Metadata = {
  title: "Saiba mais",
  description:
    `${CASA.nome}, o Centro Público de Referência em Economia Solidária de ` +
    "Niterói: contato, endereço e horário de atendimento.",
  alternates: { canonical: "/saiba-mais" },
};

/** Endereço do ITES, no IFRJ Campus Niterói. Crédito do projeto, não contato da Casa. */
const ENDERECO_DO_ITES = "Estr. Washington Luís, 1596 - Sapê, Niterói - RJ, 24315-375";

const NOVA_ABA = { target: "_blank", rel: "noopener noreferrer" } as const;

/**
 * Avisa o leitor de tela antes de a aba mudar debaixo dele. O espaço fica fora
 * do `<span>`: dentro dele, o cálculo do nome acessível o descarta e o leitor
 * ouve "Facebook(abre em nova aba)".
 */
const AvisoDeNovaAba = () => (
  <>
    {" "}
    <span className="sr-only">(abre em nova aba)</span>
  </>
);

type BotaoDeContato = {
  chave: string;
  href: string;
  texto: string;
  Icone: LucideIcon;
  externo: boolean;
};

/**
 * Os dados da Casa em JSON-LD, para o Google mostrar telefone e endereço na
 * busca pelo nome dela. Campo ausente em `CASA` fica ausente aqui também —
 * `JSON.stringify` descarta `undefined`, e `sameAs` só entra se tiver item.
 */
function dadosEstruturados() {
  const instagram = CASA.instagram ? urlDoInstagram(CASA.instagram) : undefined;
  const sameAs = [instagram, CASA.facebook].filter(Boolean);
  const telefone = telefoneDaCasa(CASA);

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: CASA.nome,
    url: urlAbsoluta("/saiba-mais"),
    // A mesma regra da página: sem o número de exibir, nada de telefone aqui.
    telephone: telefone && (telefone.discagem ?? telefone.exibir),
    email: CASA.email,
    address: CASA.endereco,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
  };
}

/**
 * A página "Saiba mais": quem é a Casa Paul Singer e como falar com ela.
 *
 * **Estática, sem chamada à API.** Os dados moram em `lib/casa.ts`; o Next
 * gera a página no build, ela abre instantânea e continua no ar com o backend
 * fora.
 *
 * Mesma regra do perfil do coletivo: dado ausente some junto com o seu título,
 * ícone e rótulo. Assim a página vai ao ar com o que já estiver confirmado,
 * sem "a definir" na tela.
 */
export default function SaibaMais() {
  const instagram = CASA.instagram ? urlDoInstagram(CASA.instagram) : undefined;

  // Nesta ordem. O primeiro presente ganha o botão cheio, os outros são
  // contorno — a mesma regra do perfil do coletivo.
  const botoes = [
    CASA.email && {
      chave: "email",
      href: `mailto:${CASA.email}`,
      texto: CASA.email,
      Icone: Mail,
      externo: false,
    },
    CASA.whatsapp && {
      chave: "whatsapp",
      href: urlDoWhatsapp(CASA.whatsapp),
      texto: "WhatsApp",
      Icone: MessageCircle,
      externo: true,
    },
    instagram &&
      CASA.instagram && {
        chave: "instagram",
        href: instagram,
        texto: arrobaDoInstagram(CASA.instagram),
        Icone: AtSign,
        externo: true,
      },
    // `Globe` e o nome por extenso, sem logo de marca — como o `AtSign` do
    // Instagram no perfil do coletivo.
    CASA.facebook && {
      chave: "facebook",
      href: CASA.facebook,
      texto: "Facebook",
      Icone: Globe,
      externo: true,
    },
  ].filter((botao): botao is BotaoDeContato => Boolean(botao));

  // O telefone aparece com o número de exibir e só vira link quando também há
  // o de discar. O número de discar é escrito uma vez, já no formato
  // internacional, e revisado no PR — por isso aqui há `tel:`, e no perfil do
  // coletivo não.
  const telefone = telefoneDaCasa(CASA);
  const contatoVisivel = temContato(CASA);

  return (
    <article className="space-y-10">
      <script
        type="application/ld+json"
        // `<` escapado: o JSON vai cru para dentro de um `<script>`, e um
        // `</script>` num campo fecharia a tag antes da hora.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(dadosEstruturados()).replace(/</g, "\\u003c"),
        }}
      />

      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-azul">{CASA.nome}</h1>
        {CASA.subtitulo && <p className="text-lg text-texto">{CASA.subtitulo}</p>}
      </header>

      {/* Lado a lado a partir do `md`, com o contato à direita. No celular,
          uma coluna, com o contato logo depois do "Quem somos": quem abre
          esta página no telefone quase sempre quer o contato. */}
      <div
        className={
          CASA.quem_somos && contatoVisivel
            ?"grid items-start gap-8 md:grid-cols-2"
            : "space-y-8"
        }
      >
        {CASA.quem_somos && (
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-azul">Quem somos</h2>
            <p className="text-lg leading-relaxed whitespace-pre-line text-texto">
              {CASA.quem_somos}
            </p>
          </section>
        )}

        {contatoVisivel && (
          <section
            id="contato"
            className="scroll-mt-4 space-y-4 rounded-xl border border-dourado-200 bg-white p-5"
          >
            <h2 className="text-xl font-bold text-azul">Fale com a Casa</h2>

            {/* `<address>`: o elemento feito para o contato de quem publica a
                página. Só o que é da Casa entra aqui. */}
            <address className="space-y-4 not-italic">
              {telefone && (
                <div className="flex flex-wrap items-center gap-3 rounded-lg bg-azul-50 px-3 py-2">
                  <Phone aria-hidden className="size-5 shrink-0 text-azul" />
                  <p>
                    <span className="sr-only">Telefone: </span>
                    {telefone.discagem ? (
                      <a
                        href={`tel:${telefone.discagem}`}
                        className="font-semibold text-azul-900 tabular-nums underline-offset-4 hover:underline"
                      >
                        {telefone.exibir}
                      </a>
                    ) : (
                      <span className="font-semibold text-azul-900 tabular-nums">
                        {telefone.exibir}
                      </span>
                    )}
                  </p>
                  <BotaoCopiar texto={telefone.exibir} rotulo="telefone" />
                </div>
              )}

              {botoes.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                  {botoes.map(({ chave, href, texto, Icone, externo }, indice) => (
                    <li key={chave} className="max-w-full">
                      <Button
                        asChild
                        variant={indice === 0 ? "default" : "outline"}
                        className="h-auto py-2 text-left break-all whitespace-normal"
                      >
                        <a href={href} {...(externo && NOVA_ABA)}>
                          <Icone aria-hidden className="size-5" />
                          {texto}
                          {externo && <AvisoDeNovaAba />}
                        </a>
                      </Button>
                    </li>
                  ))}
                </ul>
              )}

              {CASA.endereco && (
                <div className="flex gap-3">
                  <MapPin aria-hidden className="mt-0.5 size-5 shrink-0 text-dourado-escuro" />
                  <div className="space-y-1">
                    <p>
                      <span className="sr-only">Endereço: </span>
                      {CASA.endereco}
                    </p>
                    <a
                      href={urlDoMapa(CASA.endereco)}
                      {...NOVA_ABA}
                      className="inline-flex min-h-6 items-center gap-1 font-semibold text-azul underline underline-offset-4 hover:text-azul-900"
                    >
                      Ver no mapa
                      <ExternalLink aria-hidden className="size-4" />
                      <AvisoDeNovaAba />
                    </a>
                  </div>
                </div>
              )}

              {CASA.horario_atendimento && (
                <div className="flex gap-3">
                  <Clock aria-hidden className="mt-0.5 size-5 shrink-0 text-dourado-escuro" />
                  <p className="whitespace-pre-line">
                    <span className="sr-only">Horário de atendimento: </span>
                    {CASA.horario_atendimento}
                  </p>
                </div>
              )}
            </address>
          </section>
        )}
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-azul">
          A Rede de Economia Solidária de Niterói
        </h2>
        {CASA.sobre_a_rede && (
          <p className="text-lg leading-relaxed whitespace-pre-line text-texto">
            {CASA.sobre_a_rede}
          </p>
        )}
        {/* Os botões ficam mesmo sem o texto: quem chegou pelo "Saiba mais"
            precisa de um caminho para continuar no site. */}
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/coletivos">Conheça os coletivos</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/eventos">Veja a agenda</Link>
          </Button>
        </div>
      </section>

      {/* Crédito do projeto e da licença, e não dado da Casa: fica fixo aqui
          mesmo quando o resto passar a vir do Admin, e fora do `<address>`. */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-azul">Quem faz a plataforma</h2>
        <p className="leading-relaxed text-texto">
          A plataforma é desenvolvida pela ITES, a Incubadora Tecnológica de
          Empreendimentos Solidários do IFRJ Campus Niterói, com apoio do CNPq
          pelo programa PIBITI. É software livre, sob a licença GPLv3, e o código
          está aberto.
        </p>
        <p>
          <a
            href="https://github.com/Plataforma-Ecosol"
            {...NOVA_ABA}
            className="inline-flex min-h-6 items-center gap-1 font-semibold text-azul underline underline-offset-4 hover:text-azul-900"
          >
            Ver o código no GitHub
            <ExternalLink aria-hidden className="size-4" />
            <AvisoDeNovaAba />
          </a>
        </p>
        <p className="flex gap-3 text-texto">
          <MapPin aria-hidden className="mt-0.5 size-5 shrink-0 text-dourado-escuro" />
          <span>
            <span className="sr-only">Endereço do ITES: </span>
            {ENDERECO_DO_ITES}
          </span>
        </p>
      </section>
    </article>
  );
}
