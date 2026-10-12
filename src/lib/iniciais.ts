/**
 * Palavras de ligação que não entram nas iniciais: "Mãos de Barro" vira "MB",
 * e não "MD".
 */
const PALAVRAS_DE_LIGACAO = new Set(["de", "da", "do", "das", "dos", "e"]);

/** Primeiro caractere que seja letra ou número. Acento fica; símbolo, não. */
const LETRA_OU_NUMERO = /[\p{L}\p{N}]/u;

/**
 * Iniciais do nome de um coletivo, para o cartão sem foto.
 *
 * Duas no máximo, das duas primeiras palavras que não sejam de ligação. Nome
 * de uma palavra só dá uma letra. Nome só com símbolos devolve string vazia, e
 * o bloco aparece só com a cor.
 *
 * `toLocaleUpperCase("pt-BR")`, e não `toUpperCase()`, para a regra de
 * maiúsculas ser a do português independente do idioma da máquina.
 */
export function iniciaisDoNome(nome: string): string {
  return nome
    .split(/\s+/)
    .filter((palavra) => palavra && !PALAVRAS_DE_LIGACAO.has(palavra.toLowerCase()))
    .map((palavra) => palavra.match(LETRA_OU_NUMERO)?.[0])
    .filter((letra): letra is string => Boolean(letra))
    .slice(0, 2)
    .join("")
    .toLocaleUpperCase("pt-BR");
}
