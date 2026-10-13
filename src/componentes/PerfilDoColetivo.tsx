import { AtSign, Globe, Mail, MapPin, Phone, type LucideIcon } from "lucide-react";
import Link from "next/link";

import { BotaoCopiar } from "@/componentes/BotaoCopiar";
import { Badge } from "@/componentes/ui/badge";
import { Button } from "@/componentes/ui/button";
import {
  arrobaDoInstagram,
  textoDoSite,
  urlDoInstagram,
  urlDoSite,
} from "@/lib/contatos";
import type { Coletivo } from "@/tipos/api";

/**
 * O perfil público de um coletivo.
 *
 * **Este é o único lugar do frontend onde contato aparece.** E cada um só
 * aparece se a chave existir na resposta — o backend a remove quando não há
 * consentimento, e é essa ausência que o `&&` abaixo respeita.
 *
 * Repare que o rótulo — e o ícone ao lado dele — vive DENTRO da condição,
 * sempre. Escrever `<dt>Telefone</dt>` fora dela produziria o rótulo com nada
 * ao lado, o que denuncia que existe um telefone cadastrado e escondido —
 * exatamente o que a omissão de chave no backend existe para impedir. É a
 * diferença entre "não há telefone público" e "há um telefone que você não
 * pode ver". Um ícone de telefone órfão denunciaria a mesma coisa. Vale
 * também para os botões de contato e para o botão Copiar: cada um só entra
 * na tela junto com o seu campo.
 *
 * Componente separado da página, e não JSX solto dentro dela, para que a suíte
 * possa renderizá-lo com um coletivo forjado e conferir o que sai — sem
 * precisar de servidor, rede ou banco.
 */
type BotaoDeContato = {
  chave: string;
  href: string;
  texto: string;
  Icone: LucideIcon;
  /** Instagram e site abrem em nova aba; o e-mail abre o programa de e-mail. */
  externo: boolean;
};

export function PerfilDoColetivo({ coletivo }: { coletivo: Coletivo }) {
  const site = urlDoSite(coletivo.site);
  const instagram = coletivo.instagram ? urlDoInstagram(coletivo.instagram) : undefined;

  const temContato = Boolean(coletivo.telefone || coletivo.email || instagram || site);

  // Só os contatos presentes, nesta ordem. O primeiro da lista ganha o botão
  // cheio: assim o destaque nunca cai num contato que o coletivo não
  // autorizou. O texto do botão é o próprio contato, e não "Instagram" ou
  // "E-mail": quem está num computador sem programa de e-mail ainda consegue
  // ler e copiar o endereço, e quem procura o coletivo no aplicativo vê o @.
  const botoes = [
    instagram &&
      coletivo.instagram && {
        chave: "instagram",
        href: instagram,
        texto: arrobaDoInstagram(coletivo.instagram),
        Icone: AtSign,
        externo: true,
      },
    coletivo.email && {
      chave: "email",
      href: `mailto:${coletivo.email}`,
      texto: coletivo.email,
      Icone: Mail,
      externo: false,
    },
    site && { chave: "site", href: site, texto: textoDoSite(site), Icone: Globe, externo: true },
  ].filter((botao): botao is BotaoDeContato => Boolean(botao));

  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold text-azul">{coletivo.nome}</h1>

        {coletivo.bairro && (
          <p className="text-texto/75">
            <Link
              href={`/coletivos?bairro=${encodeURIComponent(coletivo.bairro)}`}
              className="inline-flex items-center gap-1.5 hover:underline"
            >
              <MapPin aria-hidden className="size-4 shrink-0 text-dourado-escuro" />
              {coletivo.bairro}
            </Link>
          </p>
        )}

        {coletivo.categorias.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {coletivo.categorias.map((categoria) => (
              <li key={categoria.id}>
                <Badge asChild variant="secondary">
                  <Link href={`/coletivos?categoria=${categoria.id}`}>{categoria.nome}</Link>
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </header>

      {coletivo.descricao && (
        // `whitespace-pre-line` preserva as quebras que a equipe digitou no
        // Admin. Sem isso, um texto com parágrafos vira um bloco único.
        <section className="whitespace-pre-line text-lg leading-relaxed text-texto">
          {coletivo.descricao}
        </section>
      )}

      {temContato && (
        <section className="space-y-4 rounded-xl border border-dourado-200 bg-white p-5">
          <h2 className="text-lg font-bold">Fale com o coletivo</h2>

          {botoes.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {botoes.map(({ chave, href, texto, Icone, externo }, indice) => (
                <li key={chave} className="max-w-full">
                  {/* `<a>` comum, e não `Link`: os três levam para fora do
                      site. O botão quebra linha para um e-mail longo não
                      criar rolagem horizontal no celular. */}
                  <Button
                    asChild
                    variant={indice === 0 ? "default" : "outline"}
                    className="h-auto py-2 text-left break-all whitespace-normal"
                  >
                    <a
                      href={href}
                      {...(externo && { target: "_blank", rel: "noopener noreferrer" })}
                    >
                      <Icone aria-hidden className="size-5" />
                      {texto}
                      {externo && <> <span className="sr-only">(abre em nova aba)</span></>}
                    </a>
                  </Button>
                </li>
              ))}
            </ul>
          )}

          {coletivo.telefone && (
            <div className="flex flex-wrap items-center gap-3 rounded-lg bg-azul-50 px-3 py-2">
              <Phone aria-hidden className="size-5 shrink-0 text-azul" />
              {/* Texto, e não link `tel:`: o campo aceita formato livre, e
                  montar o link exigiria adivinhar DDI e DDD. Errar o número
                  é pior do que não ter o atalho de discagem. O "Telefone:"
                  fica fora do `select-all`, senão iria junto na cópia. */}
              <p>
                <span className="sr-only">Telefone: </span>
                <span className="font-semibold text-azul-900 tabular-nums select-all">
                  {coletivo.telefone}
                </span>
              </p>
              <BotaoCopiar texto={coletivo.telefone} rotulo="telefone" />
            </div>
          )}
        </section>
      )}

      <p>
        <Link href="/coletivos" className="text-azul hover:underline">
          ← Ver todos os coletivos
        </Link>
      </p>
    </article>
  );
}
