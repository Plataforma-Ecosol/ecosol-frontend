/**
 * Formatação de data no fuso de Niterói.
 *
 * Estes testes travam o bug mais insidioso de renderização no servidor com
 * data: o fuso herdado. Na máquina de quem desenvolve, servidor e navegador
 * estão em `America/Sao_Paulo`, e um código sem `timeZone` declarado passa em
 * tudo — para só em produção, com o servidor em UTC, anunciar o evento das 18h
 * como 21h.
 *
 * Por isso os casos usam entradas em UTC (`Z`) e em `-03:00` de propósito: as
 * duas precisam produzir a mesma hora local quando representam o mesmo
 * instante.
 */
import { describe, expect, it } from "vitest";

import {
  formatarDataCurta,
  formatarDia,
  formatarHorario,
  formatarQuando,
  partesDaData,
} from "@/lib/datas";

describe("formatarQuando", () => {
  it("sem data de fim, mostra só o início", () => {
    expect(formatarQuando("2026-08-15T18:00:00-03:00", null)).toBe(
      "15 de agosto de 2026, 18h",
    );
  });

  it("com fim no mesmo dia, não repete a data", () => {
    expect(
      formatarQuando("2026-08-15T18:00:00-03:00", "2026-08-15T21:00:00-03:00"),
    ).toBe("15 de agosto de 2026, das 18h às 21h");
  });

  it("com fim em outro dia, mostra as duas datas", () => {
    // A feira de três dias — o caso que o filtro `proximos` do backend existe
    // para não perder, e que a agenda precisa descrever por inteiro.
    expect(
      formatarQuando("2026-08-15T09:00:00-03:00", "2026-08-17T18:00:00-03:00"),
    ).toBe("De 15 de agosto de 2026, 9h a 17 de agosto de 2026, 18h");
  });

  it("mostra os minutos só quando existem", () => {
    expect(formatarQuando("2026-08-15T18:30:00-03:00", null)).toBe(
      "15 de agosto de 2026, 18h30",
    );
  });

  it("não escreve zero à esquerda na hora", () => {
    // O `Intl` devolve `09` para alinhar tabela; ninguém diz "zero nove horas".
    expect(formatarQuando("2026-08-15T09:00:00-03:00", null)).toBe(
      "15 de agosto de 2026, 9h",
    );
    expect(formatarQuando("2026-08-15T08:15:00-03:00", null)).toBe(
      "15 de agosto de 2026, 8h15",
    );
  });

  it("converte para o fuso de São Paulo, venha o instante como vier", () => {
    // O MESMO instante, escrito de duas formas. Se o código herdasse o fuso do
    // ambiente, o primeiro apareceria como 21h num servidor em UTC.
    const emUtc = formatarQuando("2026-08-15T21:00:00Z", null);
    const emSaoPaulo = formatarQuando("2026-08-15T18:00:00-03:00", null);

    expect(emUtc).toBe("15 de agosto de 2026, 18h");
    expect(emUtc).toBe(emSaoPaulo);
  });

  it("decide o 'mesmo dia' pelo calendário de Niterói, não pelo de UTC", () => {
    // Das 20h às 22h do dia 15 em Niterói é, em UTC, das 23h do dia 15 às 1h
    // do dia 16. Comparar os dias em UTC quebraria o evento em dois.
    expect(
      formatarQuando("2026-08-15T20:00:00-03:00", "2026-08-15T22:00:00-03:00"),
    ).toBe("15 de agosto de 2026, das 20h às 22h");
  });

  it("devolve o valor cru se a data for impossível de ler", () => {
    // Um registro estranho não pode derrubar a agenda inteira.
    expect(formatarQuando("nao é uma data", null)).toBe("nao é uma data");
  });
});

describe("formatarDataCurta", () => {
  it("encurta para o cartão da listagem", () => {
    expect(formatarDataCurta("2026-08-15T18:00:00-03:00")).toBe("15 de ago., 18h");
  });
});

describe("formatarDia", () => {
  it("mostra só o dia, por extenso e no fuso de Niterói", () => {
    expect(formatarDia("2026-10-21T01:30:00Z")).toBe("20 de outubro de 2026");
  });

  it("devolve o valor cru se a data for impossível de ler", () => {
    expect(formatarDia("nao é uma data")).toBe("nao é uma data");
  });
});

describe("formatarHorario", () => {
  it("sem fim, mostra só o início", () => {
    expect(formatarHorario("2026-10-20T14:00:00-03:00", null)).toBe("14h");
  });

  it("com fim no mesmo dia, mostra o intervalo", () => {
    expect(
      formatarHorario("2026-10-20T14:00:00-03:00", "2026-10-20T17:30:00-03:00"),
    ).toBe("14h às 17h30");
  });

  it("com fim em outro dia, mostra só o início", () => {
    // "Das 9h às 18h" num evento de três dias mentiria sobre a duração.
    expect(
      formatarHorario("2026-10-20T09:00:00-03:00", "2026-10-22T18:00:00-03:00"),
    ).toBe("9h");
  });

  it("devolve vazio para data impossível de ler", () => {
    expect(formatarHorario("nao é uma data", null)).toBe("");
  });
});

describe("partesDaData", () => {
  it("separa mês, dia e dia da semana, sem ponto e em maiúsculas", () => {
    expect(partesDaData("2026-08-15T18:00:00-03:00")).toEqual({
      mes: "AGO",
      dia: "15",
      diaDaSemana: "SÁB",
    });
  });

  it("usa o dia de Niterói quando o instante já virou o dia em UTC", () => {
    // 1h30 do dia 21 em UTC é 22h30 do dia 20 em Niterói. Com o fuso de quem
    // executa (UTC no servidor), o cartão mostraria quarta, 21.
    expect(partesDaData("2026-10-21T01:30:00Z")).toEqual({
      mes: "OUT",
      dia: "20",
      diaDaSemana: "TER",
    });
  });

  it("devolve null para data impossível de ler", () => {
    expect(partesDaData("nao é uma data")).toBeNull();
  });
});
