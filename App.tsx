
import { useEffect, useState } from 'react';
import {Alert,SafeAreaView,StyleSheet,Text,TouchableOpacity,View,} from 'react-native';

import CadastroCachorro from './src/screens/CadastroCachorro';
import ListaCachorros from './src/screens/ListaCachorros';
import { cachorroRepository } from './src/repositories/CachorroRepository';
import type { Cachorro } from './src/types/Cachorro';

type Tela = 'inicio' | 'cadastro' | 'lista';

export default function App() {
  const [tela, setTela] = useState<Tela>('inicio');
  const [cachorros, setCachorros] = useState<Cachorro[]>([]);
  const [carregando, setCarregando] = useState(true);

  async function carregarCachorros() {
    try {
      const registros = await cachorroRepository.listar();
      setCachorros(registros);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar os registros.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarCachorros();
  }, []);

  async function salvarCachorro(cachorro: Cachorro) {
    await cachorroRepository.adicionar(cachorro);
    await carregarCachorros();
    setTela('lista');
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cabecalho}>
        <Text style={styles.logo}>🐾 Achou Pet</Text>
        <Text style={styles.frase}>
          Ajudando os cachorros a encontrarem um lar.
        </Text>
      </View>

      <View style={styles.navegacao}>
        <TouchableOpacity
          style={styles.botaoNav}
          onPress={() => setTela('inicio')}
        >
          <Text style={styles.textoNav}>Início</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botaoNav}
          onPress={() => setTela('cadastro')}
        >
          <Text style={styles.textoNav}>Cadastrar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botaoNav}
          onPress={() => setTela('lista')}
        >
          <Text style={styles.textoNav}>Registros</Text>
        </TouchableOpacity>
      </View>

      {tela === 'inicio' && (
        <View style={styles.conteudoInicio}>
          <Text style={styles.titulo}>
            Bem-vindo ao Achou Pet!
          </Text>

          <Text style={styles.descricao}>
            Encontrou um cachorro na rua? Registre uma foto,
            informe onde ele está e ajude outras pessoas a
            encontrá-lo.
          </Text>

          <TouchableOpacity
            style={styles.botaoPrincipal}
            onPress={() => setTela('cadastro')}
          >
            <Text style={styles.textoBotao}>
              + Cadastrar cachorro
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botaoSecundario}
            onPress={() => setTela('lista')}
          >
            <Text style={styles.textoSecundario}>
              Ver cachorros cadastrados
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {tela === 'cadastro' && (
        <CadastroCachorro onSalvar={salvarCachorro} />
      )}

      {tela === 'lista' && (
        carregando ? (
          <View style={styles.centralizado}>
            <Text>Carregando registros...</Text>
          </View>
        ) : (
          <ListaCachorros cachorros={cachorros} />
        )
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F0',
  },
  cabecalho: {
    backgroundColor: '#2E7D32',
    padding: 20,
    alignItems: 'center',
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  frase: {
    color: '#FFFFFF',
    marginTop: 6,
    textAlign: 'center',
  },
  navegacao: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#E8F0E8',
    paddingVertical: 12,
  },
  botaoNav: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  textoNav: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  conteudoInicio: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 16,
    textAlign: 'center',
  },
  descricao: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444444',
    textAlign: 'center',
    marginBottom: 28,
  },
  botaoPrincipal: {
    backgroundColor: '#2E7D32',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  textoBotao: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  botaoSecundario: {
    borderWidth: 1,
    borderColor: '#2E7D32',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  textoSecundario: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: 'bold',
  },
  centralizado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
