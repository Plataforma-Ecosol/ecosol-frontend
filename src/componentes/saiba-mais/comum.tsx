/**
 * Peças usadas por mais de um bloco do "Saiba mais".
 *
 * Vieram da antiga `app/saiba-mais/page.tsx` sem mudança, quando a página se
 * dividiu em subgrupos (ver `docs/PRD/PRD_Saiba_Mais_Rotas_e_Indice_v1.md`).
 */
import type { LucideIcon } from "lucide-react";

export const NOVA_ABA = { target: "_blank", rel: "noopener noreferrer" } as const;

/**
 * Avisa o leitor de tela antes de a aba mudar debaixo dele. O espaço fica fora
 * do `<span>`: dentro dele, o cálculo do nome acessível o descarta e o leitor
 * ouve "Facebook(abre em nova aba)".
 */
export const AvisoDeNovaAba = () => (
  <>
    {" "}
    <span className="sr-only">(abre em nova aba)</span>
  </>
);

export type BotaoDeContato = {
  chave: string;
  href: string;
  texto: string;
  Icone: LucideIcon;
  externo: boolean;
};
