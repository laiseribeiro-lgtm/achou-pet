import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Cachorro } from '../types/Cachorro';

const CHAVE_ARMAZENAMENTO = '@AchouPet:cachorros';

export class CachorroRepository {
  async listar(): Promise<Cachorro[]> {
    try {
      const dados = await AsyncStorage.getItem(
        CHAVE_ARMAZENAMENTO
      );

      if (!dados) {
        return [];
      }

      return JSON.parse(dados) as Cachorro[];
    } catch {
      throw new Error(
        'Não foi possível carregar os cachorros salvos.'
      );
    }
  }

  async adicionar(cachorro: Cachorro): Promise<Cachorro> {
    if (!cachorro.descricao.trim()) {
      throw new Error('Escreva uma descrição do cachorro.');
    }

    if (
      !cachorro.fotoUri &&
      (cachorro.latitude === null ||
        cachorro.longitude === null)
    ) {
      throw new Error(
        'Registre uma foto ou obtenha a localização do cachorro.'
      );
    }

    try {
      const cachorros = await this.listar();

      cachorros.push(cachorro);

      await AsyncStorage.setItem(
        CHAVE_ARMAZENAMENTO,
        JSON.stringify(cachorros)
      );

      return cachorro;
    } catch {
      throw new Error(
        'Não foi possível salvar o cadastro no celular.'
      );
    }
  }

  async excluir(id: string): Promise<void> {
    try {
      const cachorros = await this.listar();

      const atualizados = cachorros.filter(
        (cachorro) => cachorro.id !== id
      );

      await AsyncStorage.setItem(
        CHAVE_ARMAZENAMENTO,
        JSON.stringify(atualizados)
      );
    } catch {
      throw new Error(
        'Não foi possível excluir o registro.'
      );
    }
  }
}

export const cachorroRepository = new CachorroRepository();
