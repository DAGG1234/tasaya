import axios from 'axios';

export interface UsdtResult {
  rate: number;
  updatedAt: string;
  isOffline: boolean;
}

const USDT_CACHE_KEY = 'usdt_cache';
// Usamos el endpoint público compatible con CORS para el dólar paralelo / monitor / binance en Venezuela
const USDT_API_URL = 'https://ve.dolarapi.com/v1/dolares/paralelo'; 

export async function getUsdtRate(): Promise<UsdtResult> {
  try {
    const response = await axios.get<any>(USDT_API_URL);
    const data = response.data;

    const rawPrice = data?.promedio || data?.precio || data?.valor;
    const rate = Number(rawPrice);

    if (isNaN(rate) || rate <= 0) {
      throw new Error('No se pudo obtener la tasa USDT/Paralelo.');
    }

    const result: UsdtResult = {
      rate,
      updatedAt: data.fechaActualizacion || new Date().toISOString(),
      isOffline: false,
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(USDT_CACHE_KEY, JSON.stringify(result));
    }

    return result;
  } catch (error) {
    console.warn('Error al consultar USDT. Usando caché local...', error);

    if (typeof window !== 'undefined') {
      const cachedData = localStorage.getItem(USDT_CACHE_KEY);
      if (cachedData) {
        const parsed: UsdtResult = JSON.parse(cachedData);
        return { ...parsed, isOffline: true };
      }
    }

    // Valor de respaldo por defecto si falla la red y no hay caché
    return {
      rate: 38.00,
      updatedAt: new Date().toISOString(),
      isOffline: true,
    };
  }
}