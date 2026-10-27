import {Alert,FlatList,Image,StyleSheet,Text,TouchableOpacity,View,} from 'react-native';
import type { Cachorro } from '../types/Cachorro';

interface ListaCachorrosProps {
  cachorros: Cachorro[];
  onExcluir: (id: string) => Promise<void>;
}

export default function ListaCachorros({
  cachorros,
  onExcluir,
}: ListaCachorrosProps) {
  function confirmarExclusao(cachorro: Cachorro) {
    Alert.alert(
      'Excluir registro',
      'Tem certeza de que deseja excluir este cachorro?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await onExcluir(cachorro.id);
              Alert.alert(
                'Registro excluído',
                'O cadastro foi removido.'
              );
            } catch {
              Alert.alert(
                'Erro',
                'Não foi possível excluir o registro.'
              );
            }
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>
        Cachorros encontrados 🐾
      </Text>

      <Text style={styles.subtitulo}>
        Veja os registros feitos pela comunidade.
      </Text>

      <FlatList
        data={cachorros}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          cachorros.length === 0
            ? styles.listaVazia
            : styles.lista
        }
        ListEmptyComponent={
          <View style={styles.vazio}>
            <Text style={styles.icone}>🐕</Text>
            <Text style={styles.mensagem}>
              Nenhum cachorro cadastrado ainda.
            </Text>
            <Text style={styles.detalhe}>
              Quando alguém registrar um cachorro,
              ele aparecerá aqui.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.fotoUri ? (
              <Image
                source={{ uri: item.fotoUri }}
                style={styles.foto}
              />
            ) : (
              <View style={styles.semFoto}>
                <Text style={styles.iconePequeno}>🐶</Text>
                <Text>Sem foto</Text>
              </View>
            )}

            <View style={styles.informacoes}>
              <Text style={styles.descricao}>
                {item.descricao}
              </Text>

              <Text style={styles.data}>
                📅 {new Date(item.dataHora).toLocaleString('pt-BR')}
              </Text>

              {item.latitude !== null &&
                item.longitude !== null && (
                  <Text style={styles.localizacao}>
                    📍 {item.latitude.toFixed(5)},{' '}
                    {item.longitude.toFixed(5)}
                  </Text>
                )}

              <TouchableOpacity
                style={styles.botaoExcluir}
                onPress={() => confirmarExclusao(item)}
              >
                <Text style={styles.textoExcluir}>
                  🗑️ Excluir registro
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F0',
    padding: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 15,
    color: '#666666',
    marginBottom: 20,
  },
  lista: {
    paddingBottom: 20,
  },
  listaVazia: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  vazio: {
    alignItems: 'center',
    padding: 24,
  },
  icone: {
    fontSize: 56,
    marginBottom: 12,
  },
  mensagem: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#444444',
    textAlign: 'center',
  },
  detalhe: {
    fontSize: 14,
    color: '#777777',
    textAlign: 'center',
    marginTop: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    flexDirection: 'row',
    gap: 12,
    elevation: 2,
  },
  foto: {
    width: 100,
    height: 110,
    borderRadius: 8,
  },
  semFoto: {
    width: 100,
    height: 110,
    backgroundColor: '#E8F0E8',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconePequeno: {
    fontSize: 32,
    marginBottom: 4,
  },
  informacoes: {
    flex: 1,
    justifyContent: 'center',
    gap: 8,
  },
  descricao: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  data: {
    fontSize: 12,
    color: '#666666',
  },
  localizacao: {
    fontSize: 12,
    color: '#2E7D32',
  },
  botaoExcluir: {
    backgroundColor: '#FCE8E6',
    padding: 9,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  textoExcluir: {
    color: '#B3261E',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
