import axios from 'axios';

export interface BcvResult {
  rate: number;
  updatedAt: string;
  isOffline: boolean;
}

const BCV_CACHE_KEY = 'bcv_cache';
// Endpoint directo y oficial de DolarApi para Venezuela
const API_URL = 'https://ve.dolarapi.com/v1/dolares/oficial';

/**
 * Consulta la tasa de cambio oficial del BCV.
 * En caso de fallo de red, recupera el último valor guardado en localStorage.
 */
export async function getBcvRate(): Promise<BcvResult> {
  try {
    const response = await axios.get<any>(API_URL);
    const data = response.data;

    // DolarApi /v1/dolares/oficial devuelve directamente un objeto con la propiedad 'promedio' o 'precio'
    const rawPrice = data?.promedio ?? data?.precio ?? data?.valor;
    const rate = Number(rawPrice);

    if (isNaN(rate) || rate <= 0) {
      throw new Error('La respuesta de la API no contiene un valor numérico válido para el BCV.');
    }

    const result: BcvResult = {
      rate,
      updatedAt: data?.fechaActualizacion || new Date().toISOString(),
      isOffline: false,
    };

    // Guardar en caché local
    if (typeof window !== 'undefined') {
      localStorage.setItem(BCV_CACHE_KEY, JSON.stringify(result));
    }

    return result;
  } catch (error) {
    console.warn('Error al consultar BCV. Usando caché local...', error);

    if (typeof window !== 'undefined') {
      const cachedData = localStorage.getItem(BCV_CACHE_KEY);
      if (cachedData) {
        const parsed: BcvResult = JSON.parse(cachedData);
        return {
          ...parsed,
          isOffline: true,
        };
      }
    }

    // Respaldo de emergencia si no hay red ni caché previa
    return {
      rate: 36.50,
      updatedAt: new Date().toISOString(),
      isOffline: true,
    };
  }
}