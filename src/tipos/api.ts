/**
 * O contrato da API pública, traduzido para TypeScript.
 *
 * Fonte da verdade: a seção "API pública" do `README.md` de `ecosol-backend`,
 * verificada contra as respostas reais do servidor local antes de escrever
 * este arquivo. Em caso de divergência, vale o backend — ele tem testes.
 *
 * Este módulo é a linha de frente da promessa de privacidade do projeto no
 * frontend. O backend garante que dado pessoal não sai na resposta; o que
 * estes tipos garantem é que o frontend não **invente** um dado que a resposta
 * não trouxe. Por isso cada campo opcional carrega o porquê de ser opcional:
 * sem a explicação, o próximo desenvolvedor "conserta" o `?` para `| null` e
 * reabre um vazamento que ninguém vai notar em revisão.
 */

/** Envelope de paginação do DRF, comum às três listagens. */
export interface Pagina<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/** Categoria como ela aparece aninhada em um coletivo. */
export interface CategoriaResumo {
  id: number;
  nome: string;
  slug: string;
}

/** Coletivo como ele aparece aninhado em outro recurso — o cartão de visita. */
export interface ColetivoResumo {
  id: number;
  nome: string;
  slug: string;
}

export interface Coletivo {
  id: number;
  nome: string;
  slug: string;
  descricao: string;
  bairro: string;
  site: string;
  categorias: CategoriaResumo[];
  criado_em: string;
  atualizado_em: string;

  // Opcionais por OMISSÃO, não por nulidade.
  //
  // Sem o consentimento correspondente, o backend REMOVE a chave do JSON —
  // não devolve `null`, não devolve string vazia. Verificado na resposta real:
  // um coletivo sem consentimento não traz `telefone` em lugar nenhum do corpo.
  //
  // `?: string` é o que obriga o código a checar a existência antes de
  // renderizar. Trocar por `string | null` faria o compilador aceitar o acesso
  // direto, e o rótulo apareceria na tela com nada ao lado — exatamente o
  // rastro que a omissão no backend existe para não deixar.
  telefone?: string;
  email?: string;
  instagram?: string;
}

/** Imagem da galeria de um evento. `imagem` é URL absoluta. */
export interface ImagemEvento {
  id: number;
  imagem: string;
  legenda: string;
  ordem: number;
}

export interface Evento {
  id: number;
  titulo: string;
  slug: string;
  descricao: string;
  /** ISO 8601 com fuso: `2026-08-15T18:00:00-03:00`. Data-HORA, não data. */
  data_inicio: string;
  /** Ausência legítima: evento sem fim declarado. A chave vem, valendo `null`. */
  data_fim: string | null;
  local: string;
  bairro: string;
  link: string;
  imagens: ImagemEvento[];
  criado_em: string;
  atualizado_em: string;
}

export type TipoPonto = "orgao_es" | "loja_fisica" | "feira_arariboia";

export interface PontoDeInteresse {
  id: number;
  nome: string;
  tipo: TipoPonto;
  /** Rótulo em português, pronto. Não reimplementar a tradução no frontend. */
  tipo_display: string;
  descricao: string;
  /** Número, não string — pronto para o Leaflet, com as seis casas do cadastro. */
  latitude: number;
  longitude: number;
  endereco: string;
  imagem_capa: string | null;

  // `null` em DOIS casos: o ponto não tem coletivo vinculado, OU o coletivo
  // vinculado foi tirado do ar pela equipe. Os dois são indistinguíveis DE
  // PROPÓSITO — é assim que a chave de visibilidade do Coletivo continua
  // valendo por esta porta lateral.
  //
  // Não tentar separá-los, e não exibir "coletivo indisponível": qualquer
  // texto que apareça só no segundo caso denuncia justamente o que se quis
  // esconder. Quando é `null`, o frontend simplesmente não mostra vínculo.
  coletivo: ColetivoResumo | null;

  criado_em: string;
  atualizado_em: string;
}
