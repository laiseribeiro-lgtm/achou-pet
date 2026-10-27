
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Avistamento, Cachorro, StatusCachorro } from '../types/Cachorro';

const CHAVE = '@AchouPet:cachorros';

class CachorroRepository {
  async listar(): Promise<Cachorro[]> {
    const dados = await AsyncStorage.getItem(CHAVE);

    if (!dados) return [];

    const registros = JSON.parse(dados) as Cachorro[];

    return registros.map((cachorro) => ({
      ...cachorro,
      favorito: cachorro.favorito ?? false,
      status: cachorro.status ?? 'PROCURANDO',
      avistamentos: cachorro.avistamentos ?? [],
      local: cachorro.local ?? '',
    }));
  }

  async adicionar(cachorro: Cachorro): Promise<void> {
    const cachorros = await this.listar();

    cachorros.unshift({
      ...cachorro,
      favorito: cachorro.favorito ?? false,
      status: cachorro.status ?? 'PROCURANDO',
      avistamentos: cachorro.avistamentos ?? [],
    });

    await this.salvar(cachorros);
  }

  async excluir(id: string): Promise<void> {
    const cachorros = await this.listar();
    await this.salvar(cachorros.filter((item) => item.id !== id));
  }

  async atualizarFavorito(id: string, favorito: boolean): Promise<void> {
    const cachorros = await this.listar();

    await this.salvar(
      cachorros.map((item) =>
        item.id === id ? { ...item, favorito } : item
      )
    );
  }

  async atualizarStatus(
    id: string,
    status: StatusCachorro
  ): Promise<void> {
    const cachorros = await this.listar();

    await this.salvar(
      cachorros.map((item) =>
        item.id === id ? { ...item, status } : item
      )
    );
  }

  async adicionarAvistamento(
    id: string,
    avistamento: Avistamento
  ): Promise<void> {
    if (!avistamento.local.trim()) {
      throw new Error('Informe o local do novo avistamento.');
    }

    const cachorros = await this.listar();
    const indice = cachorros.findIndex((item) => item.id === id);

    if (indice === -1) {
      throw new Error('Cachorro não encontrado.');
    }

    const cachorro = cachorros[indice];

    cachorros[indice] = {
      ...cachorro,
      local: avistamento.local,
      latitude: avistamento.latitude,
      longitude: avistamento.longitude,
      fotoUri: avistamento.fotoUri ?? cachorro.fotoUri,
      dataHora: avistamento.dataHora,
      status: 'PROCURANDO',
      avistamentos: [
        ...(cachorro.avistamentos ?? []),
        avistamento,
      ],
    };

    await this.salvar(cachorros);
  }

  private async salvar(cachorros: Cachorro[]): Promise<void> {
    await AsyncStorage.setItem(CHAVE, JSON.stringify(cachorros));
  }
}

export const cachorroRepository = new CachorroRepository();
