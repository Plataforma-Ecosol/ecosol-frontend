"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { Button } from "@/componentes/ui/button";

/** Por quanto tempo "Copiado" (ou o erro) fica no botão antes de voltar. */
const DURACAO_DO_AVISO = 2000;

type Estado = "pronto" | "copiado" | "erro";

/** Se a API de cópia existe neste navegador. Não muda depois de carregar. */
function consegueCopiar() {
  return window.isSecureContext && typeof navigator.clipboard?.writeText === "function";
}

const nadaParaObservar = () => () => {};

/**
 * Copia um contato para a área de transferência.
 *
 * **Só aparece quando o navegador consegue copiar.** A API de cópia exige
 * contexto seguro (HTTPS ou `localhost`): acessando o servidor de
 * desenvolvimento pelo IP da rede, ou sem JavaScript, ela não existe. Em vez
 * de um botão que não faz nada, nenhum botão — e o texto ao lado continua
 * selecionável. O servidor não sabe o que o navegador tem, então ele (e o
 * primeiro render do navegador, que precisa ser igual) não desenha nada; a
 * conferência vale a partir do render seguinte.
 *
 * Copia o texto exatamente como foi cadastrado, sem formatar nem limpar: o
 * campo aceita formato livre, e "consertar" um telefone exigiria adivinhar
 * DDI e DDD — o mesmo motivo de ele não virar link `tel:`.
 *
 * O aviso fica no próprio botão, sem toast (que pediria mais uma biblioteca).
 * Para o leitor de tela, um `role="status"` à parte: só trocar o texto do
 * botão nem sempre é anunciado.
 */
export function BotaoCopiar({ texto, rotulo }: { texto: string; rotulo: string }) {
  const disponivel = useSyncExternalStore(nadaParaObservar, consegueCopiar, () => false);
  const [estado, setEstado] = useState<Estado>("pronto");
  const temporizador = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(temporizador.current), []);

  if (!disponivel) return null;

  async function copiar() {
    clearTimeout(temporizador.current);
    try {
      await navigator.clipboard.writeText(texto);
      setEstado("copiado");
    } catch {
      setEstado("erro");
    }
    temporizador.current = setTimeout(() => setEstado("pronto"), DURACAO_DO_AVISO);
  }

  const nome = rotulo.charAt(0).toUpperCase() + rotulo.slice(1);

  return (
    <>
      <Button type="button" variant="outline" size="sm" className="ml-auto" onClick={copiar}>
        {estado === "copiado" ? <Check aria-hidden /> : <Copy aria-hidden />}
        {estado === "copiado" ? "Copiado" : estado === "erro" ? "Não deu para copiar" : "Copiar"}
      </Button>
      <span role="status" className="sr-only">
        {estado === "copiado"
          ? `${nome} copiado`
          : estado === "erro"
            ? `Não foi possível copiar o ${rotulo}`
            : ""}
      </span>
    </>
  );
}
