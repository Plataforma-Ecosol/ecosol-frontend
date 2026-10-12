/**
 * Os números da rede na abertura da home.
 *
 * Vêm do `count` das listagens da API, que só conta registros ativos: nenhum
 * número escrito à mão. Componente puro, que recebe os três totais, para ser
 * testável sem simular a API.
 *
 * **Zero não aparece.** "0 próximos eventos" passa a ideia de rede parada.
 * Item com zero some; com os três zerados, o bloco inteiro some.
 */
export function NumerosDaRede({
  coletivos,
  pontos,
  eventos,
}: {
  coletivos: number;
  pontos: number;
  eventos: number;
}) {
  const itens = [
    { total: coletivos, singular: "coletivo", plural: "coletivos" },
    { total: pontos, singular: "ponto no mapa", plural: "pontos no mapa" },
    { total: eventos, singular: "próximo evento", plural: "próximos eventos" },
  ].filter(({ total }) => total > 0);

  if (itens.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-x-8 gap-y-3">
      {itens.map(({ total, singular, plural }) => (
        // `<strong>` e rótulo no mesmo `<li>`: o leitor de tela lê "7 coletivos".
        <li key={plural} className="text-sm text-texto/70">
          <strong className="mr-1.5 font-titulo text-3xl text-azul tabular-nums">
            {total.toLocaleString("pt-BR")}
          </strong>
          {total === 1 ? singular : plural}
        </li>
      ))}
    </ul>
  );
}
