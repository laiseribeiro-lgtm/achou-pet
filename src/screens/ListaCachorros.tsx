
import { useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import type { Avistamento, Cachorro } from '../types/Cachorro';

type Filtro = 'TODOS' | 'FAVORITOS' | 'FOTOS' | 'GPS';

interface Props {
  cachorros: Cachorro[];
  onExcluir: (id: string) => Promise<void>;
  onAlternarFavorito: (id: string, favorito: boolean) => Promise<void>;
  onAtualizarStatus: (
    id: string,
    status: 'PROCURANDO' | 'ENCONTRADO'
  ) => Promise<void>;
  onAdicionarAvistamento: (
    id: string,
    avistamento: Avistamento
  ) => Promise<void>;
}

export default function ListaCachorros({
  cachorros,
  onExcluir,
  onAlternarFavorito,
  onAtualizarStatus,
  onAdicionarAvistamento,
}: Props) {
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('TODOS');
  const [mostrarResolvidos, setMostrarResolvidos] = useState(false);
  const [cachorroSelecionado, setCachorroSelecionado] =
    useState<Cachorro | null>(null);
  const [novoLocal, setNovoLocal] = useState('');
  const [fotoNova, setFotoNova] = useState<string | null>(null);
  const [abrirCamera, setAbrirCamera] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const cameraRef = useRef<CameraView>(null);
  const [permissaoCamera, solicitarPermissaoCamera] =
    useCameraPermissions();

  const listaFiltrada = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR');

    return cachorros.filter((cachorro) => {
      const status = cachorro.status ?? 'PROCURANDO';

      if (!mostrarResolvidos && status === 'ENCONTRADO') return false;
      if (mostrarResolvidos && status !== 'ENCONTRADO') return false;

      const correspondeBusca =
        cachorro.descricao.toLocaleLowerCase('pt-BR').includes(termo) ||
        (cachorro.local ?? '').toLocaleLowerCase('pt-BR').includes(termo) ||
        (cachorro.avistamentos ?? []).some((avistamento) =>
          avistamento.local.toLocaleLowerCase('pt-BR').includes(termo)
        );

      if (!correspondeBusca) return false;
      if (filtro === 'FAVORITOS' && !cachorro.favorito) return false;
      if (filtro === 'FOTOS' && !cachorro.fotoUri) return false;
      if (
        filtro === 'GPS' &&
        (cachorro.latitude === null || cachorro.longitude === null)
      ) return false;

      return true;
    });
  }, [cachorros, busca, filtro, mostrarResolvidos]);

  function confirmarEncontrado(cachorro: Cachorro) {
    Alert.alert(
      'Cachorro encontrado? 🐾',
      'Este registro sairá da lista de procurados. Você poderá reabri-lo depois.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sim, foi encontrado!',
          onPress: () => {
            void onAtualizarStatus(cachorro.id, 'ENCONTRADO').catch(() =>
              Alert.alert('Erro', 'Não foi possível atualizar o cadastro.')
            );
          },
        },
      ]
    );
  }

  function confirmarReabertura(cachorro: Cachorro) {
    Alert.alert(
      'Reabrir caso?',
      'O cachorro voltará para a lista de procurados.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reabrir',
          onPress: () => {
            void onAtualizarStatus(cachorro.id, 'PROCURANDO').catch(() =>
              Alert.alert('Erro', 'Não foi possível reabrir o caso.')
            );
          },
        },
      ]
    );
  }

  function confirmarExclusao(cachorro: Cachorro) {
    Alert.alert(
      'Excluir cadastro?',
      'Esta ação removerá o registro e seu histórico deste aparelho.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            void onExcluir(cachorro.id).catch(() =>
              Alert.alert('Erro', 'Não foi possível excluir o cadastro.')
            );
          },
        },
      ]
    );
  }

  function abrirFormularioAvistamento(cachorro: Cachorro) {
    setCachorroSelecionado(cachorro);
    setNovoLocal('');
    setFotoNova(null);
    setAbrirCamera(false);
  }

  async function tirarFoto() {
    try {
      const foto = await cameraRef.current?.takePictureAsync({
        quality: 0.7,
      });

      if (foto?.uri) {
        setFotoNova(foto.uri);
        setAbrirCamera(false);
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível tirar a foto.');
    }
  }

  async function salvarAvistamento() {
    if (!cachorroSelecionado) return;

    if (!novoLocal.trim()) {
      Alert.alert('Informe o local', 'Digite onde o cachorro foi visto.');
      return;
    }

    const avistamento: Avistamento = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      local: novoLocal.trim(),
      fotoUri: fotoNova,
      latitude: null,
      longitude: null,
      dataHora: new Date().toISOString(),
    };

    setSalvando(true);

    try {
      await onAdicionarAvistamento(cachorroSelecionado.id, avistamento);
      setCachorroSelecionado(null);
      setNovoLocal('');
      setFotoNova(null);
      setAbrirCamera(false);
      Alert.alert(
        'Avistamento salvo! 💜',
        'O novo local foi registrado e o caso voltou à lista de procurados.'
      );
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar o avistamento.');
    } finally {
      setSalvando(false);
    }
  }

  async function alternarCamera() {
    if (!permissaoCamera?.granted) {
      const resultado = await solicitarPermissaoCamera();

      if (!resultado.granted) {
        Alert.alert(
          'Permissão necessária',
          'Permita o acesso à câmera para tirar uma foto.'
        );
        return;
      }
    }

    setAbrirCamera(true);
  }

  return (
    <ScrollView
      style={styles.tela}
      contentContainerStyle={styles.conteudo}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.titulo}>
        {mostrarResolvidos ? '🐾 Casos encontrados' : '🐶 Cachorros procurados'}
      </Text>

      <Text style={styles.subtitulo}>
        {mostrarResolvidos
          ? 'Consulte os registros que foram marcados como encontrados.'
          : 'Ajude a encontrar os tutores e mantenha os locais atualizados.'}
      </Text>

      <TouchableOpacity
        style={styles.alternarLista}
        onPress={() => {
          setMostrarResolvidos(!mostrarResolvidos);
          setCachorroSelecionado(null);
        }}
      >
        <Text style={styles.alternarListaTexto}>
          {mostrarResolvidos
            ? '← Voltar aos procurados'
            : '✓ Ver casos encontrados'}
        </Text>
      </TouchableOpacity>

      <TextInput
        style={styles.busca}
        placeholder="🔎 Buscar por descrição ou local..."
        placeholderTextColor="#917DA5"
        value={busca}
        onChangeText={setBusca}
      />

      <View style={styles.filtros}>
        {([
          ['TODOS', 'Todos'],
          ['FAVORITOS', '♥ Favoritos'],
          ['FOTOS', 'Com foto'],
          ['GPS', 'Com GPS'],
        ] as [Filtro, string][]).map(([valor, nome]) => (
          <TouchableOpacity
            key={valor}
            style={[
              styles.botaoFiltro,
              filtro === valor && styles.filtroAtivo,
            ]}
            onPress={() => setFiltro(valor)}
          >
            <Text
              style={[
                styles.textoFiltro,
                filtro === valor && styles.textoFiltroAtivo,
              ]}
            >
              {nome}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.contagem}>
        {listaFiltrada.length}{' '}
        {listaFiltrada.length === 1 ? 'cadastro' : 'cadastros'}
      </Text>

      {listaFiltrada.length === 0 && (
        <View style={styles.vazio}>
          <Text style={styles.emoji}>🐾</Text>
          <Text style={styles.nome}>Nenhum registro encontrado</Text>
          <Text style={styles.informacao}>
            Experimente outra busca ou consulte a outra lista.
          </Text>
        </View>
      )}

      {listaFiltrada.map((cachorro) => (
        <View key={cachorro.id} style={styles.cartao}>
          {cachorro.fotoUri ? (
            <Image source={{ uri: cachorro.fotoUri }} style={styles.foto} />
          ) : (
            <View style={styles.semFoto}>
              <Text style={styles.emoji}>🐕</Text>
              <Text style={styles.informacao}>Sem foto</Text>
            </View>
          )}

          <View style={styles.detalhes}>
            <Text style={styles.nome}>{cachorro.descricao}</Text>

            <Text style={styles.informacao}>
              📍 Local mais recente: {cachorro.local || 'Não informado'}
            </Text>

            <Text style={styles.informacao}>
              📅 Último registro:{' '}
              {new Date(cachorro.dataHora).toLocaleString('pt-BR')}
            </Text>

            <Text style={styles.informacao}>
              📸 {cachorro.avistamentos?.length ?? 0} novo(s) avistamento(s)
            </Text>

            {!!cachorro.avistamentos?.length && (
              <View style={styles.historico}>
                <Text style={styles.tituloHistorico}>Histórico de locais</Text>
                {[...cachorro.avistamentos].reverse().map((item) => (
                  <View key={item.id} style={styles.itemHistorico}>
                    {item.fotoUri ? (
                      <Image
                        source={{ uri: item.fotoUri }}
                        style={styles.fotoHistorico}
                      />
                    ) : null}
                    <View style={styles.textoHistorico}>
                      <Text style={styles.informacao}>📍 {item.local}</Text>
                      <Text style={styles.dataHistorico}>
                        {new Date(item.dataHora).toLocaleString('pt-BR')}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.acoes}>
              <TouchableOpacity
                style={styles.botaoFavorito}
                onPress={() =>
                  void onAlternarFavorito(
                    cachorro.id,
                    !cachorro.favorito
                  ).catch(() =>
                    Alert.alert('Erro', 'Não foi possível salvar o favorito.')
                  )
                }
              >
                <Text style={styles.textoBotao}>
                  {cachorro.favorito ? '♥ Favoritado' : '♡ Favoritar'}
                </Text>
              </TouchableOpacity>
            </View>

            {!mostrarResolvidos ? (
              <>
                <TouchableOpacity
                  style={styles.botaoAvistamento}
                  onPress={() => abrirFormularioAvistamento(cachorro)}
                >
                  <Text style={styles.textoBotaoBranco}>
                    📸 Avistado novamente
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.botaoEncontrado}
                  onPress={() => confirmarEncontrado(cachorro)}
                >
                  <Text style={styles.textoBotaoBranco}>
                    🐾 Cachorro encontrado!
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.botaoReabrir}
                onPress={() => confirmarReabertura(cachorro)}
              >
                <Text style={styles.textoBotaoBranco}>
                  🔄 Reabrir caso
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.botaoExcluir}
              onPress={() => confirmarExclusao(cachorro)}
            >
              <Text style={styles.textoExcluir}>Excluir cadastro</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {cachorroSelecionado && (
        <View style={styles.fundoFormulario}>
          <View style={styles.formulario}>
            <Text style={styles.tituloFormulario}>
              📸 Novo avistamento
            </Text>

            <Text style={styles.informacao}>
              Cachorro: {cachorroSelecionado.descricao}
            </Text>

            <Text style={styles.rotulo}>Onde ele apareceu agora?</Text>
            <TextInput
              style={styles.campo}
              placeholder="Rua, bairro ou ponto de referência"
              placeholderTextColor="#917DA5"
              value={novoLocal}
              onChangeText={setNovoLocal}
              multiline
            />

            {abrirCamera ? (
              <View style={styles.areaCamera}>
                <CameraView
                  ref={cameraRef}
                  style={styles.camera}
                  facing="back"
                />
                <TouchableOpacity
                  style={styles.botaoAvistamento}
                  onPress={() => void tirarFoto()}
                >
                  <Text style={styles.textoBotaoBranco}>Tirar foto</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.botaoFavorito}
                onPress={() => void alternarCamera()}
              >
                <Text style={styles.textoBotao}>
                  {fotoNova ? '📷 Tirar outra foto' : '📷 Abrir câmera'}
                </Text>
              </TouchableOpacity>
            )}

            {fotoNova ? (
              <Image source={{ uri: fotoNova }} style={styles.fotoNova} />
            ) : null}

            <TouchableOpacity
              style={[
                styles.botaoAvistamento,
                salvando && styles.desabilitado,
              ]}
              disabled={salvando}
              onPress={() => void salvarAvistamento()}
            >
              <Text style={styles.textoBotaoBranco}>
                {salvando ? 'Salvando...' : 'Salvar avistamento'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botaoCancelar}
              onPress={() => {
                setCachorroSelecionado(null);
                setAbrirCamera(false);
              }}
            >
              <Text style={styles.textoBotao}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#FBF8FF' },
  conteudo: { padding: 16, paddingBottom: 35 },
  titulo: { fontSize: 23, fontWeight: '900', color: '#63358F' },
  subtitulo: { color: '#786783', lineHeight: 20, marginTop: 6, marginBottom: 14 },
  alternarLista: {
    backgroundColor: '#EDE1FA',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  alternarListaTexto: { color: '#7041A6', fontWeight: '800' },
  busca: {
    backgroundColor: '#FFFFFF', borderColor: '#DCC9F2', borderWidth: 1,
    borderRadius: 14, padding: 13, color: '#42265B', marginBottom: 12,
  },
  filtros: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  botaoFiltro: {
    backgroundColor: '#F0E6FA', borderRadius: 18,
    borderWidth: 1, borderColor: '#DCC9F2', padding: 10,
  },
  filtroAtivo: { backgroundColor: '#7041A6', borderColor: '#7041A6' },
  textoFiltro: { color: '#63358F', fontSize: 12, fontWeight: '700' },
  textoFiltroAtivo: { color: '#FFFFFF' },
  contagem: { color: '#806B92', marginVertical: 14 },
  cartao: {
    backgroundColor: '#FFFFFF', borderRadius: 19,
    borderWidth: 1, borderColor: '#E8DDF4',
    marginBottom: 16, overflow: 'hidden', elevation: 2,
  },
  foto: { width: '100%', height: 190, backgroundColor: '#F0E6FA' },
  semFoto: {
    height: 100, backgroundColor: '#F0E6FA',
    alignItems: 'center', justifyContent: 'center',
  },
  detalhes: { padding: 14 },
  nome: { color: '#63358F', fontSize: 17, fontWeight: '800', marginBottom: 8 },
  informacao: { color: '#6F607B', fontSize: 13, lineHeight: 19, marginBottom: 6 },
  emoji: { fontSize: 34, marginBottom: 6 },
  acoes: { flexDirection: 'row', marginTop: 8, marginBottom: 8 },
  botaoFavorito: {
    backgroundColor: '#F0E6FA', padding: 12,
    borderRadius: 12, alignItems: 'center',
  },
  textoBotao: { color: '#7041A6', fontWeight: '800' },
  botaoAvistamento: {
    backgroundColor: '#7041A6', padding: 13,
    borderRadius: 12, alignItems: 'center', marginTop: 8,
  },
  botaoEncontrado: {
    backgroundColor: '#39856B', padding: 13,
    borderRadius: 12, alignItems: 'center', marginTop: 8,
  },
  botaoReabrir: {
    backgroundColor: '#8B5BC0', padding: 13,
    borderRadius: 12, alignItems: 'center', marginTop: 8,
  },
  textoBotaoBranco: { color: '#FFFFFF', fontWeight: '800' },
  botaoExcluir: { padding: 12, alignItems: 'center', marginTop: 4 },
  textoExcluir: { color: '#A13B68', fontWeight: '700' },
  historico: {
    backgroundColor: '#FBF8FF', padding: 10,
    borderRadius: 12, marginTop: 8, marginBottom: 6,
  },
  tituloHistorico: { color: '#63358F', fontWeight: '800', marginBottom: 8 },
  itemHistorico: { flexDirection: 'row', gap: 9, marginBottom: 8 },
  fotoHistorico: { width: 58, height: 58, borderRadius: 9 },
  textoHistorico: { flex: 1, justifyContent: 'center' },
  dataHistorico: { color: '#917DA5', fontSize: 11 },
  vazio: {
    backgroundColor: '#F3EBFB', borderRadius: 18,
    padding: 24, alignItems: 'center', marginTop: 10,
  },
  fundoFormulario: {
    backgroundColor: '#FBF8FF', borderWidth: 1,
    borderColor: '#DCC9F2', borderRadius: 20,
    padding: 15, marginTop: 12,
  },
  formulario: { gap: 10 },
  tituloFormulario: { fontSize: 20, fontWeight: '900', color: '#63358F' },
  rotulo: { color: '#63358F', fontWeight: '800', marginTop: 4 },
  campo: {
    backgroundColor: '#FFFFFF', borderWidth: 1,
    borderColor: '#DCC9F2', borderRadius: 12,
    padding: 12, color: '#42265B', minHeight: 55,
  },
  areaCamera: { gap: 8 },
  camera: { height: 280, borderRadius: 14, overflow: 'hidden' },
  fotoNova: {
    width: '100%', height: 200, borderRadius: 14, marginTop: 8,
  },
  botaoCancelar: {
    backgroundColor: '#F0E6FA', padding: 12,
    borderRadius: 12, alignItems: 'center',
  },
  desabilitado: { opacity: 0.6 },
});
