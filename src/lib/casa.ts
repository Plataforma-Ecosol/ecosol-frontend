/**
 * Dados institucionais da Casa Paul Singer, para a página "Saiba mais".
 *
 * **Só canais institucionais.** Telefone, e-mail e redes da Casa — nunca o
 * celular ou o e-mail pessoal de quem atende, nem o nome de alguém da equipe.
 * Se a Casa só tiver um número pessoal para passar, o campo fica de fora.
 *
 * **Campo não confirmado fica ausente**, nunca com texto provisório: a página
 * esconde o que não existe, e "a definir" na tela é pior do que nada. O
 * `casa.test.ts` guarda essa regra.
 *
 * Os nomes dos campos são os do futuro endpoint `GET /api/institucional/` (ver
 * `docs/PRD/PRD_Pagina_Saiba_Mais_e_Contato_da_Casa_v1.md`). Quando os dados
 * passarem a vir do Admin, a página troca a origem e o resto fica igual.
 */

export type Casa = {
  nome: string;
  subtitulo?: string;
  quem_somos?: string;
  sobre_a_rede?: string;
  /** Para exibir: "(21) 2222-3333". */
  telefone?: string;
  /** Para o link `tel:`, no formato internacional: "+552122223333". */
  telefone_discagem?: string;
  /** Só dígitos, com DDI: "5521999990000". */
  whatsapp?: string;
  email?: string;
  /** URL ou @; o texto do botão sai de `arrobaDoInstagram`. */
  instagram?: string;
  /** URL completa da página. */
  facebook?: string;
  /** Texto único, com bairro, cidade e CEP. */
  endereco?: string;
  /** Quebras de linha viram linhas na tela. */
  horario_atendimento?: string;
};

/** Confirmados com a Casa Azul em 13/10/2026. */
export const CASA: Casa = {
  nome: "Casa da Economia Solidária Paul Singer",
  // Os dois textos são os rascunhos do PRD, publicados antes da aprovação da
  // Casa Azul por decisão do Jean (13/10). Se a Casa pedir mudança, é aqui.
  quem_somos:
    "A Casa da Economia Solidária Paul Singer é o Centro Público de Referência " +
    "em Economia Solidária de Niterói. É aqui que coletivos, feiras e " +
    "empreendimentos da economia solidária da cidade encontram apoio, formação " +
    "e espaço para se organizar.\n\n" +
    "A Casa mantém esta plataforma para que qualquer pessoa conheça os coletivos " +
    "da rede, acompanhe a agenda de eventos e saiba onde encontrar a economia " +
    "solidária em Niterói.",
  sobre_a_rede:
    "A Rede de Economia Solidária de Niterói reúne coletivos que trabalham de " +
    "forma autogestionária, com decisões compartilhadas e renda dividida de " +
    "forma justa. Nesta plataforma você encontra esses coletivos, a agenda de " +
    "feiras e eventos e os pontos da economia solidária na cidade.",
  telefone: "(21) 2717-8350",
  telefone_discagem: "+552127178350",
  email: "coordenaecosol@gmail.com",
  instagram: "https://www.instagram.com/casapaulsinger/",
  // Sem o `?locale=pt_BR` do link recebido: ele só força o idioma da interface
  // do Facebook para quem clica.
  facebook: "https://www.facebook.com/economiasolidaria.niteroirj/",
  endereco: "Av. Ernani do Amaral Peixoto, 901 - Centro, Niterói - RJ, 24020-075",
  // Duas linhas para a exceção dos cadastros não se perder no meio da frase.
  horario_atendimento:
    "Segunda a sexta-feira, das 10h às 16h\nPara cadastros, até as 17h",
};

/**
 * O link "Ver no mapa": uma busca do endereço no Google Maps.
 *
 * Só um link, sem script nem chave de API — o Google só fica sabendo da visita
 * se a pessoa clicar. No celular, abre o aplicativo de mapas.
 */
export function urlDoMapa(endereco: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`;
}

/** O link de conversa do WhatsApp. O `wa.me` só aceita dígitos. */
export function urlDoWhatsapp(numero: string): string {
  return `https://wa.me/${numero.replace(/\D/g, "")}`;
}
