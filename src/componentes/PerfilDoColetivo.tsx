import Link from "next/link";

import { arrobaDoInstagram, urlDoInstagram, urlDoSite } from "@/lib/contatos";
import type { Coletivo } from "@/tipos/api";

/**
 * O perfil público de um coletivo.
 *
 * **Este é o único lugar do frontend onde contato aparece.** E cada um só
 * aparece se a chave existir na resposta — o backend a remove quando não há
 * consentimento, e é essa ausência que o `&&` abaixo respeita.
 *
 * Repare que o rótulo vive DENTRO da condição, sempre. Escrever
 * `<dt>Telefone</dt>` fora dela produziria o rótulo com nada ao lado, o que
 * denuncia que existe um telefone cadastrado e escondido — exatamente o que a
 * omissão de chave no backend existe para impedir. É a diferença entre "não
 * há telefone público" e "há um telefone que você não pode ver".
 *
 * Componente separado da página, e não JSX solto dentro dela, para que a suíte
 * possa renderizá-lo com um coletivo forjado e conferir o que sai — sem
 * precisar de servidor, rede ou banco.
 */
export function PerfilDoColetivo({ coletivo }: { coletivo: Coletivo }) {
  const site = urlDoSite(coletivo.site);
  const instagram = coletivo.instagram ? urlDoInstagram(coletivo.instagram) : undefined;

  const temContato = Boolean(coletivo.telefone || coletivo.email || instagram || site);

  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold text-emerald-900">{coletivo.nome}</h1>

        {coletivo.bairro && (
          <p className="text-stone-600">
            <Link
              href={`/coletivos?bairro=${encodeURIComponent(coletivo.bairro)}`}
              className="hover:underline"
            >
              {coletivo.bairro}
            </Link>
          </p>
        )}

        {coletivo.categorias.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {coletivo.categorias.map((categoria) => (
              <li key={categoria.id}>
                <Link
                  href={`/coletivos?categoria=${categoria.id}`}
                  className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-900 hover:bg-emerald-100"
                >
                  {categoria.nome}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </header>

      {coletivo.descricao && (
        // `whitespace-pre-line` preserva as quebras que a equipe digitou no
        // Admin. Sem isso, um texto com parágrafos vira um bloco único.
        <section className="whitespace-pre-line text-lg leading-relaxed text-stone-800">
          {coletivo.descricao}
        </section>
      )}

      {temContato && (
        <section className="rounded border border-stone-200 bg-white p-4">
          <h2 className="text-lg font-medium">Contato</h2>

          <dl className="mt-3 space-y-2">
            {coletivo.telefone && (
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-medium">Telefone:</dt>
                {/* Texto, e não link `tel:`: o campo aceita formato livre, e
                    montar o link exigiria adivinhar DDI e DDD. Errar o número
                    é pior do que não ter o atalho de discagem. */}
                <dd>{coletivo.telefone}</dd>
              </div>
            )}

            {coletivo.email && (
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-medium">E-mail:</dt>
                <dd>
                  <a
                    href={`mailto:${coletivo.email}`}
                    className="text-emerald-800 hover:underline"
                  >
                    {coletivo.email}
                  </a>
                </dd>
              </div>
            )}

            {instagram && coletivo.instagram && (
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-medium">Instagram:</dt>
                <dd>
                  <a
                    href={instagram}
                    rel="noopener noreferrer"
                    target="_blank"
                    className="text-emerald-800 hover:underline"
                  >
                    {arrobaDoInstagram(coletivo.instagram)}
                  </a>
                </dd>
              </div>
            )}

            {site && (
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-medium">Site:</dt>
                <dd>
                  <a
                    href={site}
                    rel="noopener noreferrer"
                    target="_blank"
                    className="break-all text-emerald-800 hover:underline"
                  >
                    {coletivo.site}
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </section>
      )}

      <p>
        <Link href="/coletivos" className="text-emerald-800 hover:underline">
          ← Ver todos os coletivos
        </Link>
      </p>
    </article>
  );
}
