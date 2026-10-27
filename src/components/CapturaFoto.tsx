import { useRef, useState } from 'react';
import {Alert,Image,StyleSheet,Text,TouchableOpacity,View,} from 'react-native';
import {CameraView,useCameraPermissions,} from 'expo-camera';

interface CapturaFotoProps {
  onFotoCapturada: (uri: string) => void;
}

export default function CapturaFoto({
  onFotoCapturada,
}: CapturaFotoProps) {
  const [permissao, solicitarPermissao] =
    useCameraPermissions();

  const cameraRef = useRef<CameraView>(null);
  const [cameraAberta, setCameraAberta] = useState(false);
  const [fotoUri, setFotoUri] = useState<string | null>(null);

  async function abrirCamera() {
    if (!permissao?.granted) {
      const resultado = await solicitarPermissao();

      if (!resultado.granted) {
        Alert.alert(
          'Permissão necessária',
          'Precisamos da sua permissão para tirar a foto do cachorro.'
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
      Alert.alert(
        'Erro',
        'Não foi possível tirar a foto. Tente novamente.'
      );
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
        >
          <Text style={styles.textoBotao}>
            📸 Tirar foto
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {fotoUri ? (
        <Image
          source={{ uri: fotoUri }}
          style={styles.preview}
        />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.icone}>🐕</Text>
          <Text style={styles.textoAjuda}>
            Nenhuma foto registrada
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.botao}
        onPress={abrirCamera}
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
    gap: 12,
  },
  camera: {
    width: '100%',
    height: 350,
    borderRadius: 12,
    overflow: 'hidden',
  },
  preview: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  placeholder: {
    height: 160,
    backgroundColor: '#E8F0E8',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  icone: {
    fontSize: 42,
  },
  textoAjuda: {
    fontSize: 14,
    color: '#555555',
  },
  botao: {
    backgroundColor: '#2E7D32',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  textoBotao: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
