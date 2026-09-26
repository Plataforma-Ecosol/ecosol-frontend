/**
 * Formatação de data e hora para leitura humana, em português.
 *
 * **O fuso é sempre declarado, nunca herdado.** `toLocaleString()` sem
 * `timeZone` usa o fuso de quem executa — e quem executa aqui é o servidor de
 * renderização, que em produção roda em UTC. O resultado seria um evento das
 * 18h anunciado como 21h, e um erro de hidratação quando o navegador (no fuso
 * de Niterói) recalculasse a mesma data. É o bug clássico de SSR com data, e
 * ele não aparece na máquina de quem desenvolve, porque ali servidor e
 * navegador estão no mesmo fuso.
 */

/** O fuso do projeto. Toda a rede está em Niterói; não há evento em outro. */
const FUSO = "America/Sao_Paulo";

const DATA_LONGA = new Intl.DateTimeFormat("pt-BR", {
  timeZone: FUSO,
  day: "numeric",
  month: "long",
  year: "numeric",
});

const DATA_CURTA = new Intl.DateTimeFormat("pt-BR", {
  timeZone: FUSO,
  day: "2-digit",
  month: "short",
});

const HORA = new Intl.DateTimeFormat("pt-BR", {
  timeZone: FUSO,
  hour: "2-digit",
  minute: "2-digit",
});

/** O dia civil em São Paulo, como `2026-08-15`, para comparar duas datas. */
const DIA_ISO = new Intl.DateTimeFormat("en-CA", {
  timeZone: FUSO,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function paraData(iso: string): Date | null {
  const data = new Date(iso);
  return Number.isNaN(data.getTime()) ? null : data;
}

/**
 * `18:00` vira `18h`; `18:30` vira `18h30`; `09:00` vira `9h`.
 *
 * O zero à esquerda cai porque ninguém diz "zero nove horas" — o `Intl`
 * devolve `09` para manter o alinhamento de tabela, que aqui não interessa.
 */
function hora(data: Date): string {
  const [hh, mm] = HORA.format(data).split(":");
  const horas = String(Number(hh));
  return mm === "00" ? `${horas}h` : `${horas}h${mm}`;
}

/**
 * A frase que descreve quando o evento acontece.
 *
 * Três formas, conforme o que o cadastro tem — a agenda fica legível em vez de
 * repetir a mesma data duas vezes:
 *
 * - sem fim ............: `15 de agosto de 2026, 18h`
 * - fim no mesmo dia ...: `15 de agosto de 2026, das 18h às 21h`
 * - fim em outro dia ...: `De 15 de agosto de 2026, 18h a 17 de agosto de 2026, 21h`
 */
export function formatarQuando(inicio: string, fim: string | null): string {
  const dataInicio = paraData(inicio);
  // Contrato garante ISO 8601, e o backend tem teste para isso. O resguardo
  // existe porque um único registro estranho não pode derrubar a agenda
  // inteira — melhor mostrar o valor cru do que uma página de erro.
  if (!dataInicio) return inicio;

  const dataFim = fim ? paraData(fim) : null;

  if (!dataFim) return `${DATA_LONGA.format(dataInicio)}, ${hora(dataInicio)}`;

  if (DIA_ISO.format(dataInicio) === DIA_ISO.format(dataFim)) {
    return `${DATA_LONGA.format(dataInicio)}, das ${hora(dataInicio)} às ${hora(dataFim)}`;
  }

  return (
    `De ${DATA_LONGA.format(dataInicio)}, ${hora(dataInicio)}` +
    ` a ${DATA_LONGA.format(dataFim)}, ${hora(dataFim)}`
  );
}

/** Versão compacta para o cartão da listagem: `15 de ago., 18h`. */
export function formatarDataCurta(iso: string): string {
  const data = paraData(iso);
  if (!data) return iso;
  return `${DATA_CURTA.format(data)}, ${hora(data)}`;
}
