
export type StatusCachorro = 'PROCURANDO' | 'ENCONTRADO';

export interface Avistamento {
  id: string;
  local: string;
  fotoUri: string | null;
  latitude: number | null;
  longitude: number | null;
  dataHora: string;
}

export interface Cachorro {
  id: string;
  descricao: string;
  local?: string;
  fotoUri: string | null;
  latitude: number | null;
  longitude: number | null;
  dataHora: string;
  favorito?: boolean;
  status?: StatusCachorro;
  avistamentos?: Avistamento[];
}
