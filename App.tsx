
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import CadastroCachorro from './src/screens/CadastroCachorro';
import ListaCachorros from './src/screens/ListaCachorros';
import { cachorroRepository } from './src/repositories/CachorroRepository';
import type { Avistamento, Cachorro } from './src/types/Cachorro';

type Tela = 'inicio' | 'cadastro' | 'lista';

export default function App() {
  const [tela, setTela] = useState<Tela>('inicio');
  const [cachorros, setCachorros] = useState<Cachorro[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregarCachorros = useCallback(async () => {
    try {
      const dados = await cachorroRepository.listar();
      setCachorros(dados);
    } catch {
      Alert.alert('Ops! 💜', 'Não foi possível carregar os registros.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregarCachorros();
  }, [carregarCachorros]);

  async function salvarCachorro(cachorro: Cachorro) {
    try {
      await cachorroRepository.adicionar(cachorro);
      await carregarCachorros();
      setTela('lista');
      Alert.alert('Cadastro realizado!', 'O cachorrinho foi registrado. 💜');
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar o cadastro.');
    }
  }

  async function excluirCachorro(id: string) {
    await cachorroRepository.excluir(id);
    await carregarCachorros();
  }

  async function alternarFavorito(id: string, favorito: boolean) {
    await cachorroRepository.atualizarFavorito(id, favorito);
    await carregarCachorros();
  }

  async function atualizarStatus(
    id: string,
    status: 'PROCURANDO' | 'ENCONTRADO'
  ) {
    await cachorroRepository.atualizarStatus(id, status);
    await carregarCachorros();
  }

  async function adicionarAvistamento(
    id: string,
    avistamento: Avistamento
  ) {
    await cachorroRepository.adicionarAvistamento(id, avistamento);
    await carregarCachorros();
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cabecalho}>
        <Text style={styles.logo}>🐾 Achou Pet</Text>
        <Text style={styles.slogan}>
          Pequenos gestos, grandes reencontros 💜
        </Text>
      </View>

      <View style={styles.navegacao}>
        <TouchableOpacity
          style={[styles.itemNav, tela === 'inicio' && styles.ativo]}
          onPress={() => setTela('inicio')}
        >
          <Text style={styles.icone}>🏠</Text>
          <Text style={styles.textoNav}>Início</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.itemNav, tela === 'cadastro' && styles.ativo]}
          onPress={() => setTela('cadastro')}
        >
          <Text style={styles.icone}>📸</Text>
          <Text style={styles.textoNav}>Cadastrar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.itemNav, tela === 'lista' && styles.ativo]}
          onPress={() => setTela('lista')}
        >
          <Text style={styles.icone}>🐶</Text>
          <Text style={styles.textoNav}>Procurados</Text>
        </TouchableOpacity>
      </View>

      {carregando ? (
        <View style={styles.carregando}>
          <ActivityIndicator size="large" color="#7041A6" />
          <Text style={styles.textoCarregando}>
            Preparando o Achou Pet... 💜
          </Text>
        </View>
      ) : (
        <View style={styles.conteudo}>
          {tela === 'inicio' && (
            <View style={styles.inicio}>
              <Text style={styles.ilustracao}>🐕💜</Text>
              <Text style={styles.tituloInicio}>
                Todo cachorro merece voltar para casa!
              </Text>
              <Text style={styles.descricao}>
                Registre cachorros encontrados, compartilhe novos locais e
                ajude a aproximá-los de seus tutores.
              </Text>

              <View style={styles.cartao}>
                <Text style={styles.cartaoTitulo}>🐾 Como ajudar?</Text>
                <Text style={styles.descricaoCartao}>
                  • Cadastre um cachorro encontrado.
                  {'\n'}• Avise quando ele for encontrado pelo tutor.
                  {'\n'}• Registre novas fotos e locais se ele aparecer novamente.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.botaoPrincipal}
                onPress={() => setTela('cadastro')}
              >
                <Text style={styles.textoBotaoPrincipal}>
                  + Cadastrar cachorro
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.botaoSecundario}
                onPress={() => setTela('lista')}
              >
                <Text style={styles.textoBotaoSecundario}>
                  🐶 Ver cachorros procurados
                </Text>
              </TouchableOpacity>

              <Text style={styles.rodape}>
                Feito com carinho pelos animais 🐾
              </Text>
            </View>
          )}

          {tela === 'cadastro' && (
            <CadastroCachorro onSalvar={salvarCachorro} />
          )}

          {tela === 'lista' && (
            <ListaCachorros
              cachorros={cachorros}
              onExcluir={excluirCachorro}
              onAlternarFavorito={alternarFavorito}
              onAtualizarStatus={atualizarStatus}
              onAdicionarAvistamento={adicionarAvistamento}
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF8FF',
  },
  cabecalho: {
    backgroundColor: '#7041A6',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
    alignItems: 'center',
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  logo: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  slogan: {
    fontSize: 12,
    color: '#F0E6FA',
    marginTop: 5,
    textAlign: 'center',
  },
  navegacao: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F0E6FA',
    padding: 7,
    marginHorizontal: 12,
    marginTop: 10,
    borderRadius: 15,
  },
  itemNav: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
  },
  ativo: {
    backgroundColor: '#FFFFFF',
  },
  icone: {
    fontSize: 19,
  },
  textoNav: {
    color: '#7041A6',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 3,
  },
  conteudo: {
    flex: 1,
  },
  inicio: {
    flex: 1,
    padding: 22,
    justifyContent: 'center',
  },
  ilustracao: {
    fontSize: 65,
    textAlign: 'center',
    marginBottom: 14,
  },
  tituloInicio: {
    fontSize: 24,
    fontWeight: '900',
    color: '#63358F',
    textAlign: 'center',
    marginBottom: 12,
  },
  descricao: {
    fontSize: 14,
    lineHeight: 22,
    color: '#786783',
    textAlign: 'center',
    marginBottom: 18,
  },
  cartao: {
    backgroundColor: '#F0E6FA',
    padding: 15,
    borderRadius: 17,
    marginBottom: 18,
  },
  cartaoTitulo: {
    color: '#63358F',
    fontWeight: '900',
    fontSize: 16,
    marginBottom: 8,
  },
  descricaoCartao: {
    color: '#6F607B',
    fontSize: 13,
    lineHeight: 22,
  },
  botaoPrincipal: {
    backgroundColor: '#7041A6',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  textoBotaoPrincipal: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  botaoSecundario: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DCC9F2',
    borderWidth: 1,
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  textoBotaoSecundario: {
    color: '#7041A6',
    fontWeight: '800',
  },
  rodape: {
    textAlign: 'center',
    color: '#917DA5',
    fontSize: 12,
    marginTop: 20,
  },
  carregando: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  textoCarregando: {
    color: '#7041A6',
  },
});
