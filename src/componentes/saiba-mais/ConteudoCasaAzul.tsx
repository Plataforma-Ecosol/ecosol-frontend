import { AtSign, Clock, ExternalLink, Globe, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { BotaoCopiar } from "@/componentes/BotaoCopiar";
import { AvisoDeNovaAba, NOVA_ABA, type BotaoDeContato } from "@/componentes/saiba-mais/comum";
import { SecoesDoSaibaMais } from "@/componentes/saiba-mais/SecoesDoSaibaMais";
import { Button } from "@/componentes/ui/button";
import { CASA, telefoneDaCasa, temContato, urlDoMapa, urlDoWhatsapp } from "@/lib/casa";
import { arrobaDoInstagram, urlDoInstagram } from "@/lib/contatos";
import { caminhoDoSubgrupo } from "@/lib/saiba-mais";
import { urlAbsoluta } from "@/lib/site";
import type { SecaoDoSaibaMais } from "@/tipos/api";

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
    url: urlAbsoluta(caminhoDoSubgrupo("casa-azul")),
    // A mesma regra da página: sem o número de exibir, nada de telefone aqui.
    telephone: telefone && (telefone.discagem ?? telefone.exibir),
    email: CASA.email,
    address: CASA.endereco,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
  };
}

/**
 * O subgrupo "Casa Azul": quem é a Casa Paul Singer e como falar com ela.
 *
 * O texto vem das seções publicadas no Admin. Com `secoes` nulo (API fora do
 * ar no build), vale o "Quem somos" fixo de `lib/casa.ts`. O contato e o
 * JSON-LD são dados da Casa, e não texto editorial: ficam fixos nos dois
 * casos, lidos de `lib/casa.ts`.
 *
 * Mesma regra do perfil do coletivo: dado ausente some junto com o seu título,
 * ícone e rótulo. Assim a página vai ao ar com o que já estiver confirmado,
 * sem "a definir" na tela.
 */
export function ConteudoCasaAzul({ secoes = null }: { secoes?: SecaoDoSaibaMais[] | null }) {
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
  const temTexto = secoes ? secoes.length > 0 : Boolean(CASA.quem_somos);

  return (
    <>
      <script
        type="application/ld+json"
        // `<` escapado: o JSON vai cru para dentro de um `<script>`, e um
        // `</script>` num campo fecharia a tag antes da hora.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(dadosEstruturados()).replace(/</g, "\\u003c"),
        }}
      />

      {/* Lado a lado a partir do `md`, com o contato à direita. No celular,
          uma coluna, com o contato logo depois do "Quem somos": quem abre
          esta página no telefone quase sempre quer o contato. */}
      <div
        className={
          temTexto && contatoVisivel ? "grid items-start gap-8 md:grid-cols-2" : "space-y-8"
        }
      >
        {secoes
          ? secoes.length > 0 && <SecoesDoSaibaMais secoes={secoes} />
          : CASA.quem_somos && (
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
    </>
  );
}
