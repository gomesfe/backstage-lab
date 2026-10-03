/** Uma entidade do catálogo, já no formato que as tabelas mostram. */
export type Entidade = {
  /** `kind:namespace/nome` — a chave da linha e dos favoritos. */
  ref: string;
  /** Component, System, Resource, Group ou API. */
  tipo: string;
  nome: string;
  namespace: string;
  descricao: string;
  /** spec.type: service, website, openapi, sqs… */
  subtipo: string;
  dono: string;
  ciclo: string;
  tags: string[];
  temDocs: boolean;
};

export type Coluna =
  | 'nome'
  | 'descricao'
  | 'tipo'
  | 'subtipo'
  | 'dono'
  | 'ciclo'
  | 'tags';

export type Filtros = {
  busca: string;
  soFavoritos: boolean;
  tipo: string;
  dono: string;
  ciclo: string;
  tag: string;
};
