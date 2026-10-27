
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import CapturaFoto from '../components/CapturaFoto';
import { useLocalizacao } from '../hooks/useLocalizacao';
import type { Cachorro } from '../types/Cachorro';

interface CadastroCachorroProps {
  onSalvar: (cachorro: Cachorro) => Promise<void>;
}

export default function CadastroCachorro({
  onSalvar,
}: CadastroCachorroProps) {
  const [descricao, setDescricao] = useState('');
  const [local, setLocal] = useState('');
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const {
    latitude,
    longitude,
    carregando,
    mensagem,
    obterLocalizacao,
  } = useLocalizacao();

  async function salvarCadastro() {
    if (!descricao.trim()) {
      Alert.alert('Faltou uma informação 💜', 'Descreva o cachorrinho.');
      return;
    }

    if (!fotoUri && (latitude === null || longitude === null)) {
      Alert.alert(
        'Registro incompleto 🐾',
        'Tire uma foto ou registre a localização pelo GPS.'
      );
      return;
    }

    const cachorro: Cachorro = {
    id: `${Date.now()}`,
    descricao: descricao.trim(),
    local: local.trim(),
    fotoUri,
    latitude,
    longitude,
    dataHora: new Date().toISOString(),
    favorito: false,
    status: 'PROCURANDO',
    avistamentos: [],
    };

    try {
      setSalvando(true);
      await onSalvar(cachorro);

      setDescricao('');
      setLocal('');
      setFotoUri(null);
    } catch (erro) {
      Alert.alert(
        'Não foi possível salvar 💜',
        erro instanceof Error ? erro.message : 'Tente novamente.'
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.conteudo}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.topo}>
        <Text style={styles.emoji}>🐶</Text>
        <Text style={styles.titulo}>Novo registro</Text>
        <Text style={styles.subtitulo}>
          Vamos ajudar esse amiguinho?
        </Text>
      </View>

      <View style={styles.cartao}>
        <Text style={styles.label}>💜 Descrição do cachorro *</Text>
        <TextInput
          style={[styles.input, styles.inputMultilinha]}
          value={descricao}
          onChangeText={setDescricao}
          placeholder="Ex.: cachorrinho caramelo, com coleira azul..."
          placeholderTextColor="#A596B4"
          multiline
          textAlignVertical="top"
        />

        <Text style={styles.label}>📍 Local onde foi encontrado</Text>
        <TextInput
          style={[styles.input, styles.inputMultilinhaLocal]}
          value={local}
          onChangeText={setLocal}
          placeholder="Ex.: Rua das Flores, perto da praça..."
          placeholderTextColor="#A596B4"
          multiline
          textAlignVertical="top"
        />

        <Text style={styles.ajuda}>
          Escreva um endereço ou ponto de referência público.
        </Text>

        <Text style={styles.label}>📸 Foto do cachorrinho</Text>
        <CapturaFoto onFotoCapturada={setFotoUri} />

        <Text style={styles.label}>🗺️ Localização pelo GPS</Text>
        <TouchableOpacity
          style={styles.botaoGPS}
          onPress={obterLocalizacao}
          disabled={carregando}
          activeOpacity={0.8}
        >
          {carregando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.textoBotao}>
              ♡ Registrar localização atual
            </Text>
          )}
        </TouchableOpacity>

        {!!mensagem && (
          <Text style={styles.mensagem}>{mensagem}</Text>
        )}

        {latitude !== null && longitude !== null && (
          <View style={styles.coordenadasBox}>
            <Text style={styles.coordenadas}>
              Latitude: {latitude.toFixed(5)}{' \n'}
              Longitude: {longitude.toFixed(5)}
            </Text>
          </View>
        )}

        <Text style={styles.observacao}>
          * A descrição é obrigatória. Para salvar, registre uma foto ou
          obtenha a localização pelo GPS. O campo de local escrito é opcional.
        </Text>

        <TouchableOpacity
          style={[styles.botaoSalvar, salvando && styles.desabilitado]}
          onPress={salvarCadastro}
          disabled={salvando}
          activeOpacity={0.8}
        >
          <Text style={styles.textoBotao}>
            {salvando ? 'Salvando...' : '♡ Salvar registro'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF7FF',
  },
  conteudo: {
    padding: 18,
    paddingBottom: 35,
  },
  topo: {
    alignItems: 'center',
    marginVertical: 12,
  },
  emoji: {
    fontSize: 46,
  },
  titulo: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#7041A6',
    marginTop: 5,
  },
  subtitulo: {
    fontSize: 14,
    color: '#8B78A0',
    marginTop: 6,
  },
  cartao: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 17,
    borderWidth: 1,
    borderColor: '#E8D8FA',
  },
  label: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#7041A6',
    marginTop: 17,
    marginBottom: 9,
  },
  input: {
    backgroundColor: '#FBF8FF',
    borderWidth: 1,
    borderColor: '#DCC8F1',
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    color: '#44354F',
  },
  inputMultilinha: {
    minHeight: 100,
  },
  inputMultilinhaLocal: {
    minHeight: 65,
  },
  ajuda: {
    color: '#897A98',
    fontSize: 12,
    marginTop: 7,
    lineHeight: 18,
  },
  botaoGPS: {
    backgroundColor: '#9B72CF',
    padding: 15,
    borderRadius: 14,
    alignItems: 'center',
  },
  textoBotao: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  mensagem: {
    marginTop: 10,
    color: '#7041A6',
    fontSize: 13,
  },
  coordenadasBox: {
    backgroundColor: '#F3EAFD',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  coordenadas: {
    color: '#7041A6',
    fontSize: 13,
    lineHeight: 20,
  },
  observacao: {
    marginTop: 18,
    color: '#897A98',
    fontSize: 12,
    lineHeight: 18,
  },
  botaoSalvar: {
    marginTop: 18,
    backgroundColor: '#7041A6',
    padding: 16,
    borderRadius: 15,
    alignItems: 'center',
  },
  desabilitado: {
    opacity: 0.6,
  },
});
