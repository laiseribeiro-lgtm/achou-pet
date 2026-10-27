import { useRef, useState } from 'react';
import {Alert,Image,StyleSheet,Text,TouchableOpacity,View,} from 'react-native';
import {CameraView,useCameraPermissions,} from 'expo-camera';

interface CapturaFotoProps {
  onFotoCapturada: (uri: string) => void;
}

export default function CapturaFoto({
  onFotoCapturada,
}: CapturaFotoProps) {
  const [permissao, solicitarPermissao] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [cameraAberta, setCameraAberta] = useState(false);
  const [fotoUri, setFotoUri] = useState<string | null>(null);

  async function abrirCamera() {
    if (!permissao?.granted) {
      const resultado = await solicitarPermissao();

      if (!resultado.granted) {
        Alert.alert(
          'Precisamos de permissão 💜',
          'Autorize o uso da câmera para fotografar o cachorrinho.'
        );
        return;
      }
    }

    setCameraAberta(true);
  }

  async function tirarFoto() {
    try {
      const foto = await cameraRef.current?.takePictureAsync({
        quality: 0.7,
      });

      if (foto?.uri) {
        setFotoUri(foto.uri);
        onFotoCapturada(foto.uri);
        setCameraAberta(false);
      }
    } catch {
      Alert.alert('Ops!', 'Não foi possível tirar a foto. Tente novamente.');
    }
  }

  if (cameraAberta) {
    return (
      <View style={styles.container}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
        />

        <TouchableOpacity
          style={styles.botao}
          onPress={tirarFoto}
          activeOpacity={0.8}
        >
          <Text style={styles.textoBotao}>📸 Tirar foto</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botaoCancelar}
          onPress={() => setCameraAberta(false)}
        >
          <Text style={styles.textoCancelar}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {fotoUri ? (
        <Image source={{ uri: fotoUri }} style={styles.preview} />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.icone}>🐶</Text>
          <Text style={styles.textoAjuda}>Uma fotinho dele aqui!</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.botao}
        onPress={abrirCamera}
        activeOpacity={0.8}
      >
        <Text style={styles.textoBotao}>
          📷 {fotoUri ? 'Tirar outra foto' : 'Abrir câmera'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 10,
  },
  camera: {
    width: '100%',
    height: 300,
    borderRadius: 16,
    overflow: 'hidden',
  },
  preview: {
    width: '100%',
    height: 210,
    borderRadius: 16,
    resizeMode: 'cover',
    backgroundColor: '#F0E5FF',
  },
  placeholder: {
    height: 160,
    backgroundColor: '#F2E8FF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2D0F7',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  icone: {
    fontSize: 43,
  },
  textoAjuda: {
    fontSize: 14,
    color: '#80679A',
  },
  botao: {
    backgroundColor: '#9B72CF',
    padding: 14,
    borderRadius: 13,
    alignItems: 'center',
  },
  textoBotao: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  botaoCancelar: {
    backgroundColor: '#F0E5FF',
    padding: 12,
    borderRadius: 13,
    alignItems: 'center',
  },
  textoCancelar: {
    color: '#7041A6',
    fontWeight: 'bold',
  },
});
