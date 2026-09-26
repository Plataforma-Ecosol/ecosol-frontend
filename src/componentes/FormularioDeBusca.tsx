import { primeiro, type ParametrosDaRota } from "@/lib/consulta";

/**
 * Busca textual da listagem.
 *
 * `<form method="get">` puro, sem `"use client"` e sem JavaScript: enviar o
 * formulário é navegação, o servidor re-renderiza e a URL passa a conter a
 * busca. Isso mantém a página indexável, o resultado compartilhável e o botão
 * "voltar" funcionando — e é o que dispensa CORS no backend.
 *
 * Os filtros ativos viajam em campos ocultos. Sem eles, buscar dentro de uma
 * categoria apagaria a categoria, o que faria o resultado crescer no exato
 * momento em que a pessoa tentou restringi-lo.
 *
 * `page` NÃO é preservado, de propósito: uma busca nova começa da primeira
 * página. Preservá-la levaria à página 7 de um resultado que agora tem duas.
 */
export function FormularioDeBusca({
  parametros,
  rotulo,
  placeholder,
}: {
  parametros: ParametrosDaRota;
  rotulo: string;
  placeholder: string;
}) {
  const ocultos = Object.entries(parametros).filter(
    ([chave]) => chave !== "q" && chave !== "page",
  );

  return (
    <form method="get" className="flex flex-wrap gap-2">
      {ocultos.map(([chave, valor]) => (
        <input key={chave} type="hidden" name={chave} value={primeiro(valor) ?? ""} />
      ))}

      <label htmlFor="q" className="sr-only">
        {rotulo}
      </label>
      <input
        id="q"
        name="q"
        type="search"
        defaultValue={primeiro(parametros.q) ?? ""}
        placeholder={placeholder}
        className="min-w-0 flex-1 rounded border border-stone-300 bg-white px-3 py-2"
      />

      <button
        type="submit"
        className="rounded bg-emerald-800 px-4 py-2 text-white hover:bg-emerald-900"
      >
        Buscar
      </button>
    </form>
  );
}
