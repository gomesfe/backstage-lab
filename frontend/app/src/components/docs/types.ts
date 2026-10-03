export type TipoEntidade = 'Component' | 'System' | 'API';

export type Documento = {
  nome: string;
  /** Âncora da entidade na tela de entidade (`/entidade#<ancora>`). */
  ancora: string;
  descricao: string;
  tipo: TipoEntidade;
  /** spec.type: service, website, openapi… */
  subtipo: string;
  dono: string;
  cicloDeVida: string;
  tags: string[];
  /** Favorito de partida, até a pessoa marcar os seus. */
  favorito: boolean;
};

export type Filtros = {
  busca: string;
  soFavoritos: boolean;
  tipo: string;
  dono: string;
  cicloDeVida: string;
};
