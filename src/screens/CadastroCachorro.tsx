import { useState } from 'react';
import {Alert,ScrollView,StyleSheet,Text,TextInput,TouchableOpacity,View,ActivityIndicator,} from 'react-native';

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
      Alert.alert(
        'Campo obrigatório',
        'Escreva uma descrição do cachorro.'
      );
      return;
    }

    if (
      !fotoUri &&
      (latitude === null || longitude === null)
    ) {
      Alert.alert(
        'Registro incompleto',
        'Tire uma foto ou registre a localização do cachorro.'
      );
      return;
    }

    const cachorro: Cachorro = {
      id: `${Date.now()}`,
      descricao: descricao.trim(),
      fotoUri,
      latitude,
      longitude,
      dataHora: new Date().toISOString(),
    };

    try {
      setSalvando(true);
      await onSalvar(cachorro);

      Alert.alert(
        'Sucesso!',
        'O cachorro foi cadastrado.'
      );

      setDescricao('');
      setFotoUri(null);
    } catch (erro) {
      Alert.alert(
        'Não foi possível salvar',
        erro instanceof Error
          ? erro.message
          : 'Tente novamente.'
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
      <Text style={styles.titulo}>
        Cadastrar cachorro 🐾
      </Text>

      <Text style={styles.subtitulo}>
        Registre as informações para ajudar a comunidade.
      </Text>

      <Text style={styles.label}>Descrição *</Text>

      <TextInput
        style={styles.input}
        value={descricao}
        onChangeText={setDescricao}
        placeholder="Ex.: cachorro caramelo, encontrado perto da praça..."
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      <Text style={styles.label}>Foto do cachorro</Text>

      <CapturaFoto
        onFotoCapturada={(uri) => setFotoUri(uri)}
      />

      <Text style={styles.label}>Localização</Text>

      <TouchableOpacity
        style={styles.botaoLocalizacao}
        onPress={obterLocalizacao}
        disabled={carregando}
      >
        {carregando ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.textoBotao}>
            📍 Registrar localização atual
          </Text>
        )}
      </TouchableOpacity>

      {mensagem ? (
        <Text style={styles.mensagem}>{mensagem}</Text>
      ) : null}

      {latitude !== null && longitude !== null && (
        <Text style={styles.coordenadas}>
          Latitude: {latitude.toFixed(5)}{"\n"}
          Longitude: {longitude.toFixed(5)}
        </Text>
      )}

      <Text style={styles.observacao}>
        * Preencha a descrição e registre pelo menos uma
        foto ou a localização.
      </Text>

      <TouchableOpacity
        style={[
          styles.botaoSalvar,
          salvando && styles.botaoDesabilitado,
        ]}
        onPress={salvarCadastro}
        disabled={salvando}
      >
        <Text style={styles.textoBotao}>
          {salvando ? 'Salvando...' : 'Salvar cadastro'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F0',
  },
  conteudo: {
    padding: 20,
    paddingBottom: 40,
  },
  titulo: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 15,
    color: '#666666',
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 18,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 10,
    padding: 14,
    minHeight: 110,
    fontSize: 15,
  },
  botaoLocalizacao: {
    backgroundColor: '#558B2F',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  botao: {
    backgroundColor: '#2E7D32',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  textoBotao: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  mensagem: {
    marginTop: 10,
    color: '#2E7D32',
  },
  coordenadas: {
    marginTop: 8,
    color: '#444444',
    fontSize: 13,
  },
  observacao: {
    marginTop: 20,
    color: '#666666',
    fontSize: 13,
    lineHeight: 19,
  },
  botaoSalvar: {
    marginTop: 18,
    backgroundColor: '#2E7D32',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  botaoDesabilitado: {
    opacity: 0.6,
  },
});
