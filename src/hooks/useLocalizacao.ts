import { useState } from 'react';
import * as Location from 'expo-location';

export function useLocalizacao() {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState('');

  async function obterLocalizacao() {
    setCarregando(true);
    setMensagem('');

    let temporizador: ReturnType<typeof setTimeout> | undefined;

    try {
      const permissao =
        await Location.requestForegroundPermissionsAsync();

      if (!permissao.granted) {
        setMensagem('Permissão de localização negada.');
        return;
      }

      const posicao = await Promise.race([
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        }),
        new Promise<never>((_, reject) => {
          temporizador = setTimeout(
            () => reject(new Error('timeout')),
            20000
          );
        }),
      ]);

      setLatitude(posicao.coords.latitude);
      setLongitude(posicao.coords.longitude);
      setMensagem('Localização registrada com sucesso!');
    } catch {
      setMensagem(
        'Não foi possível obter o GPS em 20 segundos. Verifique se a localização está ativada.'
      );
    } finally {
      if (temporizador) clearTimeout(temporizador);
      setCarregando(false);
    }
  }

  return {
    latitude,
    longitude,
    carregando,
    mensagem,
    obterLocalizacao,
  };
}
