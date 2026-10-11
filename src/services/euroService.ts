export interface EuroResult {
  rate: number;
  updatedAt: string;
  isOffline: boolean;
}

const LOCAL_STORAGE_EURO_KEY = 'euro_cache';

export const getEuroRate = async (): Promise<EuroResult | null> => {
  try {
    const res = await fetch('https://ve.dolarapi.com/v1/euros/oficial');
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

    const data = await res.json();
    let rawValue = data.promedio || data.price || data.precio || data.value;

    if (typeof rawValue === 'string') {
      rawValue = rawValue.replace(',', '.');
    }

    const rate = Number(rawValue);
    if (!isNaN(rate) && rate > 0) {
      const result: EuroResult = {
        rate,
        updatedAt: data.fechaActualizacion || new Date().toISOString(),
        isOffline: false,
      };
      localStorage.setItem(LOCAL_STORAGE_EURO_KEY, JSON.stringify(result));
      return result;
    }
    throw new Error('Estructura de respuesta inválida para Euro BCV');
  } catch (error) {
    console.warn('Error al consultar la API de Euro BCV, intentando caché:', error);

    const cached = localStorage.getItem(LOCAL_STORAGE_EURO_KEY);
    if (cached) {
      try {
        const parsed: EuroResult = JSON.parse(cached);
        if (parsed && typeof parsed.rate === 'number' && parsed.rate > 0) {
          return {
            ...parsed,
            isOffline: true,
          };
        }
      } catch (e) {
        console.error('Error al parsear el caché de Euro:', e);
      }
    }

    return null;
  }
};