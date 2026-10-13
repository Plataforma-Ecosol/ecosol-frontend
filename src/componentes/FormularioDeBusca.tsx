"use client";

import { Search } from "lucide-react";
import Form from "next/form";
import { useEffect, useRef, type ChangeEvent } from "react";

import { Input } from "@/componentes/ui/input";
import { primeiro, todos, type ParametrosDaRota } from "@/lib/consulta";

/** Quanto tempo depois da última tecla a busca sai sozinha. */
const ESPERA = 400;

/** Uma letra só traz quase tudo e não ajuda ninguém: a busca espera a segunda. */
const MINIMO_DE_LETRAS = 2;

/**
 * Busca textual da listagem, que busca sozinha enquanto a pessoa digita.
 *
 * **Continua sendo navegação, e não `fetch` no navegador.** O `<Form>` do
 * Next é um `<form>` GET: enviar troca o `?q=` da URL e o servidor renderiza
 * o resultado, como antes. A página continua indexável, o resultado continua
 * compartilhável, o botão "voltar" continua funcionando e o backend continua
 * sem CORS. Sem JavaScript, é um formulário comum, enviado com Enter.
 *
 * O JavaScript só acrescenta o envio automático, e com três freios para não
 * pesar com uma rede grande:
 *
 * 1. Espera a pessoa parar de digitar (`ESPERA`). "alimentação" vira uma
 *    busca, e não onze.
 * 2. Não busca com uma letra só (`MINIMO_DE_LETRAS`). Apagar tudo busca, para
 *    a lista voltar inteira.
 * 3. `replace`, e não `push`: cada pausa na digitação não vira uma entrada no
 *    histórico, e o "voltar" sai da busca de uma vez.
 *
 * O resto vem do Next: uma busca nova descarta a navegação anterior, e o
 * `fetch` da listagem tem cache por URL (`lib/api.ts`). O campo é componente
 * de cliente montado na mesma posição da página, então não perde o foco nem
 * o texto quando o resultado chega.
 *
 * Os filtros ativos viajam em campos ocultos. Sem eles, buscar dentro de uma
 * categoria apagaria a categoria, o que faria o resultado crescer no exato
 * momento em que a pessoa tentou restringi-lo.
 *
 * **Sem botão Buscar.** Com o envio automático ele não faz falta, e o Enter
 * continua enviando na hora: formulário com um campo de texto só é enviado
 * pelo Enter mesmo sem botão (o "envio implícito" do HTML), com ou sem
 * JavaScript. No celular, `enterKeyHint="search"` põe a tecla "Buscar" no
 * próprio teclado.
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
  const formulario = useRef<HTMLFormElement>(null);
  const campo = useRef<HTMLInputElement>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout>>(undefined);

  const busca = primeiro(parametros.q) ?? "";
  const ocultos = Object.entries(parametros)
    .filter(([chave]) => chave !== "q" && chave !== "page")
    .flatMap(([chave, valor]) => todos(valor).map((item) => [chave, item] as const));

  // "Voltar" e "avançar" trocam o `q` da URL sem passar pelo campo. Com a
  // pessoa digitando, o campo é dela e não se mexe.
  useEffect(() => {
    if (campo.current && document.activeElement !== campo.current) {
      campo.current.value = busca;
    }
  }, [busca]);

  useEffect(() => () => clearTimeout(temporizador.current), []);

  function aoDigitar(evento: ChangeEvent<HTMLInputElement>) {
    clearTimeout(temporizador.current);
    const texto = evento.currentTarget.value.trim();
    if (texto === busca.trim()) return;
    if (texto.length > 0 && texto.length < MINIMO_DE_LETRAS) return;
    temporizador.current = setTimeout(() => formulario.current?.requestSubmit(), ESPERA);
  }

  return (
    // `action=""` é a própria rota. `role="search"` marca a região para quem
    // navega por pontos de referência no leitor de tela.
    <Form
      ref={formulario}
      action=""
      replace
      scroll={false}
      onSubmit={() => clearTimeout(temporizador.current)}
      role="search"
    >
      {ocultos.map(([chave, valor]) => (
        <input key={`${chave}-${valor}`} type="hidden" name={chave} value={valor} />
      ))}

      <label htmlFor="q" className="sr-only">
        {rotulo}
      </label>
      <div className="relative">
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-azul-500"
        />
        {/* Borda `azul-500`, e não mais clara: o contorno é o que mostra onde
            o campo está, e o WCAG pede 3:1 para isso (dá 3,6:1 sobre branco).
            Placeholder em `texto/60` pelo mesmo motivo: 4,6:1. */}
        <Input
          ref={campo}
          id="q"
          name="q"
          type="search"
          defaultValue={busca}
          placeholder={placeholder}
          enterKeyHint="search"
          onChange={aoDigitar}
          className="h-11 rounded-lg border-azul-500 bg-white pl-10 text-base placeholder:text-texto/60 focus-visible:border-azul"
        />
      </div>
    </Form>
  );
}
