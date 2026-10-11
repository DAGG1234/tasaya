export interface UsdtResult {
  rate: number;
  updatedAt: string;
  isOffline: boolean;
}

const LOCAL_STORAGE_USDT_KEY = 'usdt_cache';

export const getUsdtRate = async (): Promise<UsdtResult | null> => {
  // Opción 1: CriptoYa (Binance P2P real VES)
  try {
    const res = await fetch('https://criptoya.com/api/binancep2p/usdt/ves/1');
    if (res.ok) {
      const data = await res.json();
      let rawValue = data.ask || data.bid || data.price;
      if (typeof rawValue === 'string') rawValue = rawValue.replace(',', '.');
      const rate = Number(rawValue);

      if (!isNaN(rate) && rate > 0) {
        const result: UsdtResult = {
          rate,
          updatedAt: new Date().toISOString(),
          isOffline: false,
        };
        localStorage.setItem(LOCAL_STORAGE_USDT_KEY, JSON.stringify(result));
        return result;
      }
    }
  } catch (err) {
    console.warn('Falló CriptoYa, intentando opción de respaldo DolarApi Cripto...', err);
  }

  // Opción 2: DolarApi Cripto
  try {
    const res = await fetch('https://ve.dolarapi.com/v1/dolares/cripto');
    if (res.ok) {
      const data = await res.json();
      let rawValue = data.promedio || data.price || data.precio || data.value;
      if (typeof rawValue === 'string') rawValue = rawValue.replace(',', '.');
      const rate = Number(rawValue);

      if (!isNaN(rate) && rate > 0) {
        const result: UsdtResult = {
          rate,
          updatedAt: data.fechaActualizacion || new Date().toISOString(),
          isOffline: false,
        };
        localStorage.setItem(LOCAL_STORAGE_USDT_KEY, JSON.stringify(result));
        return result;
      }
    }
  } catch (err) {
    console.warn('Falló DolarApi Cripto, verificando caché en localStorage...', err);
  }

  // Opción 3: Lectura de caché offline
  const cached = localStorage.getItem(LOCAL_STORAGE_USDT_KEY);
  if (cached) {
    try {
      const parsed: UsdtResult = JSON.parse(cached);
      if (parsed && typeof parsed.rate === 'number' && parsed.rate > 0) {
        return {
          ...parsed,
          isOffline: true,
        };
      }
    } catch (e) {
      console.error('Error al parsear el caché de USDT:', e);
    }
  }

  return null;
};