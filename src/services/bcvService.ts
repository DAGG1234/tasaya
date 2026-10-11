export interface BcvResult {
  rate: number;
  updatedAt: string;
  isOffline: boolean;
}

const LOCAL_STORAGE_BCV_KEY = 'bcv_cache';

export const getBcvRate = async (): Promise<BcvResult | null> => {
  try {
    const res = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

    const data = await res.json();
    let rawValue = data.promedio || data.price || data.precio || data.value;

    if (typeof rawValue === 'string') {
      rawValue = rawValue.replace(',', '.');
    }

    const rate = Number(rawValue);
    if (!isNaN(rate) && rate > 0) {
      const result: BcvResult = {
        rate,
        updatedAt: data.fechaActualizacion || new Date().toISOString(),
        isOffline: false,
      };
      localStorage.setItem(LOCAL_STORAGE_BCV_KEY, JSON.stringify(result));
      return result;
    }
    throw new Error('Estructura de respuesta inválida para BCV Dólar');
  } catch (error) {
    console.warn('Error al consultar la API de BCV Dólar, intentando caché:', error);

    const cached = localStorage.getItem(LOCAL_STORAGE_BCV_KEY);
    if (cached) {
      try {
        const parsed: BcvResult = JSON.parse(cached);
        if (parsed && typeof parsed.rate === 'number' && parsed.rate > 0) {
          return {
            ...parsed,
            isOffline: true,
          };
        }
      } catch (e) {
        console.error('Error al parsear el caché de BCV:', e);
      }
    }

    return null;
  }
};